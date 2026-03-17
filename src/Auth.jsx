import React, { useState, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from './supabase.js'

const inp = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--bd2)', borderRadius: 7,
  background: 'var(--bg2)', color: 'var(--tx)'
}

async function checkProfile(userId) {
  const { data } = await supabase.from('profiles').select('phone,role').eq('id', userId).single()
  return data && data.phone && data.role
}

function ProfileForm({ user, onComplete }) {
  const [form, setForm] = useState({
    email: user.email || '',
    phone: '',
    role: '',
    name: user.user_metadata?.full_name || user.user_metadata?.name || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim() || !form.role.trim()) {
      alert('Заполните обязательные поля: телефон и должность')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: form.email,
      phone: form.phone.trim(),
      role: form.role.trim(),
      name: form.name.trim() || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      updated_at: new Date().toISOString()
    })
    if (error) {
      alert('Ошибка сохранения профиля: ' + error.message)
      setLoading(false)
      return
    }
    onComplete()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg)', padding: 40, borderRadius: 12, maxWidth: 450, width: '90%' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: 'var(--tx)' }}>Завершите регистрацию</h2>
        <p style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 24 }}>Заполните профиль для продолжения</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 }}>Email</label>
            <input type="email" value={form.email} disabled style={{ ...inp, opacity: 0.6 }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 }}>Телефон <span style={{ color: '#E24B4A' }}>*</span></label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (999) 123-45-67" required style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 }}>Должность/Роль <span style={{ color: '#E24B4A' }}>*</span></label>
            <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Product Manager, Developer, Designer..." required style={inp} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 }}>Имя (опционально)</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, border: 'none', background: 'var(--tx)', color: 'var(--bg)', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Сохранение...' : 'Продолжить'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Auth({ onAuth }) {
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // БАГ 4 FIX: флаг чтобы не делать двойную проверку профиля
  const profileChecked = useRef(false)

  const handleSession = async (sess) => {
    if (!sess) return
    // БАГ 4 FIX: проверяем профиль только один раз за сессию
    if (profileChecked.current) return
    profileChecked.current = true
    setSession(sess)
    const hasProfile = await checkProfile(sess.user.id)
    if (!hasProfile) {
      setNeedsProfile(true)
    } else {
      onAuth(sess.user)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handleSession(session)
      else {
        profileChecked.current = false
        setSession(null)
        setNeedsProfile(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // БАГ 3 FIX: правильный redirectTo с учётом base path GitHub Pages
  const getRedirectUrl = () => {
    const base = window.location.origin
    const path = window.location.pathname.replace(/\/$/, '')
    // Если деплой на GitHub Pages — путь будет /roadmap-app
    return `${base}${path}/`
  }

  const signInWithGoogle = async () => {
    if (!supabase) return
    setLoading(true) // БАГ 9 FIX: не сбрасываем loading — редирект уйдёт со страницы
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getRedirectUrl() }
    })
    if (error) {
      alert('Ошибка входа: ' + error.message)
      setLoading(false)
    }
  }

  const signInWithGithub = async () => {
    if (!supabase) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: getRedirectUrl() }
    })
    if (error) {
      alert('Ошибка входа: ' + error.message)
      setLoading(false)
    }
  }

  // БАГ 2 FIX: после email signup не блокируем UI — показываем сообщение и даём войти
  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!supabase || !email || !password) return
    setLoading(true)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert('Ошибка регистрации: ' + error.message)
      } else if (data.session) {
        // Email confirmation отключён — сразу получаем сессию
        await handleSession(data.session)
      } else {
        // Email confirmation включён
        alert('Письмо отправлено! Подтвердите email и войдите.')
        setMode('signin')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert('Ошибка входа: ' + error.message)
    }

    setLoading(false)
  }

  const signOut = async () => {
    if (!supabase) return
    profileChecked.current = false
    await supabase.auth.signOut()
    setSession(null)
    setNeedsProfile(false)
    onAuth(null)
  }

  // БАГ 8 FIX: передаём актуальный user из session
  if (session && needsProfile) {
    return <ProfileForm user={session.user} onComplete={() => {
      setNeedsProfile(false)
      onAuth(session.user)
    }} />
  }

  if (session) {
    const meta = session.user.user_metadata || {}
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'var(--bg2)', borderRadius: 8, fontSize: 13 }}>
        {meta.avatar_url && <img src={meta.avatar_url} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
        <span style={{ color: 'var(--tx2)' }}>{meta.full_name || meta.name || session.user.email}</span>
        <button onClick={signOut} style={{ padding: '4px 12px', fontSize: 12, border: '1px solid var(--bd)', background: 'transparent', color: 'var(--tx2)', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
          Выйти
        </button>
      </div>
    )
  }

  const oauthBtnBase = { padding: '12px 24px', fontSize: 14, fontWeight: 500, borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--bg)', padding: 40, borderRadius: 12, maxWidth: 420, width: '90%', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12, color: 'var(--tx)' }}>Roadmap App</h2>
        <p style={{ fontSize: 14, color: 'var(--tx2)', marginBottom: 32 }}>
          {mode === 'signup' ? 'Создайте аккаунт' : 'Войдите, чтобы сохранить данные в облаке'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button onClick={signInWithGoogle} disabled={loading} style={{ ...oauthBtnBase, border: '1px solid var(--bd)', background: 'white', color: '#333' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {loading ? 'Перенаправление...' : 'Войти через Google'}
          </button>
          <button onClick={signInWithGithub} disabled={loading} style={{ ...oauthBtnBase, border: '1px solid var(--bd)', background: '#24292e', color: 'white' }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            {loading ? 'Перенаправление...' : 'Войти через GitHub'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: 'var(--tx3)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
          <span>или</span>
          <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
        </div>

        <form onSubmit={handleEmailAuth} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 12 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={inp} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль (минимум 6 символов)" required minLength={6} style={inp} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, border: 'none', background: 'var(--tx)', color: 'var(--bg)', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 12, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Загрузка...' : mode === 'signup' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', color: 'var(--tx2)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
          {mode === 'signin' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
      </div>
    </div>
  )
}
