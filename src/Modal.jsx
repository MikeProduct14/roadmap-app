import React, { useState, useEffect } from 'react'
import { SPRINTS, EPIC_COLORS, STATUS_LABELS, PRIO_LABELS, EFFORT_LABELS, SPHERE_LABELS, ART_TYPES } from './store.js'

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, zIndex: 300 },
  modal: { background: 'var(--bg)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 520, maxHeight: '85vh', overflowY: 'auto', padding: '20px 22px', position: 'relative' },
  h: { fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--tx)' },
  label: { display: 'block', fontSize: 11, color: 'var(--tx2)', marginBottom: 3, fontWeight: 500 },
  input: { width: '100%', fontSize: 13, padding: '6px 10px', borderRadius: 6, border: '0.5px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)' },
  row: { marginBottom: 10 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, paddingTop: 12, borderTop: '0.5px solid var(--bd)' },
  btn: { fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '0.5px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', cursor: 'pointer', fontFamily: 'inherit' },
  btnPrimary: { fontSize: 12, padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
  closeX: { position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', fontSize: 18, color: 'var(--tx3)', cursor: 'pointer', lineHeight: 1 },
  artRow: { display: 'flex', gap: 5, alignItems: 'center', marginBottom: 5 },
  artRm: { background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: 15, padding: '0 2px' },
  addArt: { fontSize: 11, color: 'var(--tx2)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'inherit' },
  deleteBtn: { fontSize: 12, padding: '6px 14px', borderRadius: 6, border: '0.5px solid #E24B4A', background: 'transparent', color: '#E24B4A', cursor: 'pointer', fontFamily: 'inherit', marginRight: 'auto' },
}

function Field({ label, children }) {
  return <div style={s.row}><label style={s.label}>{label}</label>{children}</div>
}

function Sel({ id, value, onChange, options }) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} style={s.input}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function ArtifactEditor({ arts, onChange }) {
  const add = () => onChange([...arts, { type: 'link', name: '', url: '' }])
  const rm = i => onChange(arts.filter((_, j) => j !== i))
  const upd = (i, field, val) => onChange(arts.map((a, j) => j === i ? { ...a, [field]: val } : a))

  return (
    <div style={s.row}>
      <label style={s.label}>Артефакты (PDF, DOCX, ссылки)</label>
      {arts.map((a, i) => (
        <div key={i} style={s.artRow}>
          <select value={a.type} onChange={e => upd(i, 'type', e.target.value)} style={{ ...s.input, width: 65, fontSize: 11, padding: '5px 4px' }}>
            {ART_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <input value={a.name} onChange={e => upd(i, 'name', e.target.value)} placeholder="Название" style={{ ...s.input, flex: 1, fontSize: 11 }} />
          <input value={a.url || ''} onChange={e => upd(i, 'url', e.target.value)} placeholder="Ссылка (опц.)" style={{ ...s.input, flex: 1, fontSize: 11 }} />
          <button style={s.artRm} onClick={() => rm(i)}>×</button>
        </div>
      ))}
      <button style={s.addArt} onClick={add}>+ Добавить артефакт</button>
    </div>
  )
}

export default function Modal({ mode, ctx, onSave, onDelete, onClose }) {
  const isEpic = mode === 'epic' || mode === 'epic-edit'
  const isEdit = mode === 'epic-edit' || mode === 'task-edit'

  const [form, setForm] = useState(() => {
    if (isEpic) {
      return ctx && mode === 'epic-edit'
        ? { name: ctx.name, color: ctx.color, sprint: ctx.sprint, startW: ctx.startW, durW: ctx.durW }
        : { name: '', color: EPIC_COLORS[0], sprint: 'Sprint 1', startW: 0, durW: 2 }
    } else {
      return ctx && mode === 'task-edit'
        ? { name: ctx.name, status: ctx.status, priority: ctx.priority, sprint: ctx.sprint, effort: ctx.effort, deadline: ctx.deadline || '', notes: ctx.notes || '', artifacts: JSON.parse(JSON.stringify(ctx.artifacts || [])) }
        : { name: '', status: 'backlog', priority: 'medium', sprint: ctx?.sprint || 'Sprint 1', effort: 'M', deadline: '', notes: '', artifacts: [] }
    }
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <button style={s.closeX} onClick={onClose}>×</button>
        <div style={s.h}>{mode === 'epic' ? 'Новый эпик' : mode === 'epic-edit' ? 'Редактировать эпик' : mode === 'task-edit' ? 'Редактировать задачу' : 'Новая задача'}</div>

        <Field label="Название">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Название..." style={s.input} autoFocus />
        </Field>

        {isEpic ? (
          <>
            <div style={s.grid2}>
              <Field label="Спринт"><Sel value={form.sprint} onChange={v => set('sprint', v)} options={SPRINTS.map(s => [s, s])} /></Field>
              <Field label="Цвет">
                <select value={form.color} onChange={e => set('color', e.target.value)} style={s.input}>
                  {EPIC_COLORS.map(c => <option key={c} value={c} style={{ background: c, color: '#fff' }}>{c}</option>)}
                </select>
              </Field>
              <Field label="Начало (неделя от старта)">
                <input type="number" min={0} max={15} value={form.startW} onChange={e => set('startW', +e.target.value)} style={s.input} />
              </Field>
              <Field label="Длительность (нед.)">
                <input type="number" min={1} max={16} value={form.durW} onChange={e => set('durW', +e.target.value)} style={s.input} />
              </Field>
            </div>
          </>
        ) : (
          <>
            <div style={s.grid2}>
              <Field label="Статус"><Sel value={form.status} onChange={v => set('status', v)} options={Object.entries(STATUS_LABELS)} /></Field>
              <Field label="Приоритет"><Sel value={form.priority} onChange={v => set('priority', v)} options={Object.entries(PRIO_LABELS)} /></Field>
              <Field label="Спринт"><Sel value={form.sprint} onChange={v => set('sprint', v)} options={SPRINTS.map(s => [s, s])} /></Field>
              <Field label="Усилие"><Sel value={form.effort} onChange={v => set('effort', v)} options={Object.entries(EFFORT_LABELS)} /></Field>
            </div>
            <Field label="Дедлайн"><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} style={s.input} /></Field>
            <Field label="Заметки"><textarea value={form.notes} onChange={e => set('notes', e.target.value)} style={{ ...s.input, minHeight: 56, resize: 'vertical' }} /></Field>
            <ArtifactEditor arts={form.artifacts} onChange={v => set('artifacts', v)} />
          </>
        )}

        <div style={s.footer}>
          {isEdit && onDelete && <button style={s.deleteBtn} onClick={onDelete}>Удалить</button>}
          <button style={s.btn} onClick={onClose}>Отмена</button>
          <button style={s.btnPrimary} onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}
