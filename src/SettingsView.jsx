import React, { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS, EFFORT_LABELS } from './store.js'

const s = {
  container: { padding: '0 0 2rem' },
  section: { marginBottom: '2rem', border: '1px solid var(--bd)', borderRadius: 10, padding: '20px 24px', background: 'var(--bg)' },
  h: { fontSize: 16, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', fontSize: 14, padding: '9px 12px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)' },
  row: { marginBottom: 14 },
  listItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', background: 'var(--bg2)', borderRadius: 7, border: '1px solid var(--bd)' },
  removeBtn: { background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: 18, padding: '4px 8px', minWidth: 32, minHeight: 32 },
  addBtn: { fontSize: 13, padding: '7px 14px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', cursor: 'pointer', fontWeight: 500, marginTop: 8 },
  saveBtn: { fontSize: 13, padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 },
  toggle: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  checkbox: { width: 18, height: 18, cursor: 'pointer' },
}

function Field({ label, children }) {
  return <div style={s.row}><label style={s.label}>{label}</label>{children}</div>
}

function EditableList({ label, items, onChange, placeholder }) {
  const [newItem, setNewItem] = useState('')

  const add = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    if (items.includes(trimmed)) {
      alert('Этот элемент уже существует')
      return
    }
    onChange([...items, trimmed])
    setNewItem('')
  }

  const remove = (item) => {
    if (!confirm(`Удалить "${item}"?`)) return
    onChange(items.filter(i => i !== item))
  }

  return (
    <Field label={label}>
      {items.map(item => (
        <div key={item} style={s.listItem}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--tx)' }}>{item}</span>
          <button style={s.removeBtn} onClick={() => remove(item)} title="Удалить">×</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input 
          value={newItem} 
          onChange={e => setNewItem(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder} 
          style={{ ...s.input, flex: 1 }} 
        />
        <button style={s.addBtn} onClick={add}>Добавить</button>
      </div>
    </Field>
  )
}

export default function SettingsView({ settings, onSave }) {
  const [form, setForm] = useState({
    projectName: settings.projectName || 'Roadmap',
    teamMembers: [...(settings.teamMembers || ['Не назначен'])],
    statuses: [...(settings.statuses || ['backlog', 'ready', 'wip', 'done', 'frozen'])],
    priorities: [...(settings.priorities || ['critical', 'high', 'medium', 'low'])],
    efforts: [...(settings.efforts || ['S', 'M', 'L', 'XL'])],
    useStoryPoints: settings.useStoryPoints !== undefined ? settings.useStoryPoints : true,
  })

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = () => {
    if (!form.projectName.trim()) {
      alert('Название проекта не может быть пустым')
      return
    }
    if (form.teamMembers.length === 0) {
      alert('Добавьте хотя бы одного члена команды')
      return
    }
    onSave(form)
    alert('Настройки сохранены!')
  }

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Настройки проекта</span>
        <button style={s.saveBtn} onClick={handleSave}>Сохранить</button>
      </div>

      <div style={s.section}>
        <div style={s.h}>Основные настройки</div>
        <Field label="Название проекта">
          <input 
            value={form.projectName} 
            onChange={e => set('projectName', e.target.value)} 
            placeholder="Roadmap" 
            style={s.input} 
          />
        </Field>
        <div style={s.toggle}>
          <input 
            type="checkbox" 
            checked={form.useStoryPoints} 
            onChange={e => set('useStoryPoints', e.target.checked)} 
            style={s.checkbox}
            id="useStoryPoints"
          />
          <label htmlFor="useStoryPoints" style={{ fontSize: 13, color: 'var(--tx)', cursor: 'pointer' }}>
            Использовать Story Points (иначе часы)
          </label>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.h}>Команда</div>
        <EditableList 
          label="Члены команды" 
          items={form.teamMembers} 
          onChange={v => set('teamMembers', v)} 
          placeholder="Имя члена команды"
        />
      </div>

      <div style={s.section}>
        <div style={s.h}>Опции полей</div>
        <EditableList 
          label={`Статусы (текущие: ${form.statuses.map(s => STATUS_LABELS[s] || s).join(', ')})`}
          items={form.statuses} 
          onChange={v => set('statuses', v)} 
          placeholder="Новый статус (например: review)"
        />
        <EditableList 
          label={`Приоритеты (текущие: ${form.priorities.map(p => PRIO_LABELS[p] || p).join(', ')})`}
          items={form.priorities} 
          onChange={v => set('priorities', v)} 
          placeholder="Новый приоритет (например: urgent)"
        />
        <EditableList 
          label={`Усилия (текущие: ${form.efforts.join(', ')})`}
          items={form.efforts} 
          onChange={v => set('efforts', v)} 
          placeholder="Новое усилие (например: XXL)"
        />
      </div>
    </div>
  )
}
