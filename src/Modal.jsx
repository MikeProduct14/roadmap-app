import React, { useState, useEffect } from 'react'
import { SPRINTS, EPIC_COLORS, STATUS_LABELS, PRIO_LABELS, EFFORT_LABELS, SPHERE_LABELS, ART_TYPES, STORY_POINTS } from './store.js'

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, zIndex: 300 },
  modal: { background: 'var(--bg)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--radius)', width: '100%', maxWidth: 560, maxHeight: '85vh', position: 'relative', display: 'flex', flexDirection: 'column' },
  modalContent: { overflowY: 'auto', padding: '24px 26px', flex: 1 },
  h: { fontSize: 17, fontWeight: 600, marginBottom: 20, color: 'var(--tx)' },
  label: { display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 },
  input: { width: '100%', fontSize: 14, padding: '9px 12px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)' },
  row: { marginBottom: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 26px', background: 'var(--bg)', borderTop: '1px solid var(--bd)', flexShrink: 0, borderRadius: '0 0 var(--radius) var(--radius)' },
  btn: { fontSize: 13, padding: '8px 16px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 },
  btnPrimary: { fontSize: 13, padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 },
  closeX: { position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', fontSize: 22, color: 'var(--tx3)', cursor: 'pointer', lineHeight: 1, padding: 4, zIndex: 1 },
  artRow: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 },
  artRm: { background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', fontSize: 18, padding: '4px 6px', minWidth: 32, minHeight: 32 },
  addArt: { fontSize: 12, color: 'var(--tx2)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, fontFamily: 'inherit', padding: '6px 0', marginTop: 4 },
  deleteBtn: { fontSize: 13, padding: '8px 16px', borderRadius: 7, border: '1px solid #E24B4A', background: 'transparent', color: '#E24B4A', cursor: 'pointer', fontFamily: 'inherit', marginRight: 'auto', fontWeight: 500 },
  commentBox: { background: 'var(--bg2)', padding: 12, borderRadius: 7, marginBottom: 8, border: '1px solid var(--bd)' },
  commentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  commentDate: { fontSize: 11, color: 'var(--tx3)' },
  commentText: { fontSize: 13, color: 'var(--tx)', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  addCommentBtn: { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx2)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 },
  timeLogRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12 },
  timeLogBox: { background: 'var(--bg2)', padding: 10, borderRadius: 7, marginBottom: 6, border: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  addTimeBtn: { fontSize: 12, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx2)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 6 },
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
          <select value={a.type} onChange={e => upd(i, 'type', e.target.value)} style={{ ...s.input, width: 70, fontSize: 12, padding: '7px 6px' }}>
            {ART_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <input value={a.name} onChange={e => upd(i, 'name', e.target.value)} placeholder="Название" style={{ ...s.input, flex: 1, fontSize: 12 }} />
          <input value={a.url || ''} onChange={e => upd(i, 'url', e.target.value)} placeholder="Ссылка (опц.)" style={{ ...s.input, flex: 1, fontSize: 12 }} />
          <button style={s.artRm} onClick={() => rm(i)} title="Удалить">×</button>
        </div>
      ))}
      <button style={s.addArt} onClick={add}>+ Добавить артефакт</button>
    </div>
  )
}

function CommentsSection({ comments, onChange }) {
  const [newComment, setNewComment] = useState('')

  const addComment = () => {
    const trimmed = newComment.trim()
    if (!trimmed) return
    onChange([...comments, { text: trimmed, date: new Date().toISOString() }])
    setNewComment('')
  }

  const removeComment = (i) => {
    if (!confirm('Удалить комментарий?')) return
    onChange(comments.filter((_, j) => j !== i))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      addComment()
    }
  }

  // Simple markdown renderer
  const renderMarkdown = (text) => {
    let html = text
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      // Code: `code`
      .replace(/`(.+?)`/g, '<code style="background: var(--bg3); padding: 2px 4px; border-radius: 3px; font-size: 12px;">$1</code>')
      // Links: [text](url)
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #378ADD; text-decoration: underline;">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br/>')
    
    return html
  }

  return (
    <div style={s.row}>
      <label style={s.label}>Комментарии (поддерживается Markdown)</label>
      {comments.map((c, i) => (
        <div key={i} style={s.commentBox}>
          <div style={s.commentHeader}>
            <span style={s.commentDate}>{new Date(c.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            <button style={{ ...s.artRm, fontSize: 16 }} onClick={() => removeComment(i)} title="Удалить">×</button>
          </div>
          <div 
            style={s.commentText} 
            dangerouslySetInnerHTML={{ __html: renderMarkdown(c.text) }}
          />
        </div>
      ))}
      <textarea 
        value={newComment} 
        onChange={e => setNewComment(e.target.value)} 
        onKeyDown={handleKeyDown}
        placeholder="Добавить комментарий... (Ctrl+Enter для отправки)&#10;Поддерживается: **жирный**, *курсив*, `код`, [ссылка](url)" 
        style={{ ...s.input, minHeight: 60, resize: 'vertical', marginBottom: 6 }} 
      />
      <button style={s.addCommentBtn} onClick={addComment}>Добавить комментарий</button>
    </div>
  )
}

function TimeLogSection({ timeLog, onChange }) {
  const [newLog, setNewLog] = useState({ date: new Date().toISOString().split('T')[0], hours: '', comment: '' })

  const addLog = () => {
    if (!newLog.hours || parseFloat(newLog.hours) <= 0) {
      alert('Укажите количество часов')
      return
    }
    onChange([...timeLog, { ...newLog, hours: parseFloat(newLog.hours) }])
    setNewLog({ date: new Date().toISOString().split('T')[0], hours: '', comment: '' })
  }

  const removeLog = (i) => {
    if (!confirm('Удалить запись времени?')) return
    onChange(timeLog.filter((_, j) => j !== i))
  }

  const totalHours = timeLog.reduce((sum, log) => sum + log.hours, 0)

  return (
    <div style={s.row}>
      <label style={s.label}>Логирование времени (всего: {totalHours} ч)</label>
      {timeLog.map((log, i) => (
        <div key={i} style={s.timeLogBox}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--tx)', marginBottom: 2 }}>
              <strong>{log.date}</strong> — {log.hours} ч
            </div>
            {log.comment && <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{log.comment}</div>}
          </div>
          <button style={{ ...s.artRm, fontSize: 16 }} onClick={() => removeLog(i)} title="Удалить">×</button>
        </div>
      ))}
      <div style={s.timeLogRow}>
        <input 
          type="date" 
          value={newLog.date} 
          onChange={e => setNewLog({ ...newLog, date: e.target.value })} 
          style={{ ...s.input, flex: 1 }} 
        />
        <input 
          type="number" 
          min="0.5" 
          step="0.5" 
          value={newLog.hours} 
          onChange={e => setNewLog({ ...newLog, hours: e.target.value })} 
          placeholder="Часы" 
          style={{ ...s.input, width: 80 }} 
        />
        <input 
          value={newLog.comment} 
          onChange={e => setNewLog({ ...newLog, comment: e.target.value })} 
          placeholder="Комментарий (опц.)" 
          style={{ ...s.input, flex: 2 }} 
        />
      </div>
      <button style={s.addTimeBtn} onClick={addLog}>+ Добавить время</button>
    </div>
  )
}

export default function Modal({ mode, ctx, epics, settings, onSave, onDelete, onClose }) {
  const isEpic = mode === 'epic' || mode === 'epic-edit'
  const isEdit = mode === 'epic-edit' || mode === 'task-edit'

  const [form, setForm] = useState(() => {
    if (isEpic) {
      return ctx && mode === 'epic-edit'
        ? { name: ctx.name, color: ctx.color, sprint: ctx.sprint, startW: ctx.startW, durW: ctx.durW }
        : { name: '', color: EPIC_COLORS[0], sprint: 'Sprint 1', startW: 0, durW: 2 }
    } else {
      return ctx && mode === 'task-edit'
        ? { 
            name: ctx.name, 
            status: ctx.status, 
            priority: ctx.priority, 
            sprint: ctx.sprint, 
            effort: ctx.effort, 
            deadline: ctx.deadline || '', 
            description: ctx.description || ctx.notes || '', 
            artifacts: JSON.parse(JSON.stringify(ctx.artifacts || [])),
            comments: ctx.comments || [],
            epicId: ctx.epicId,
            assignee: ctx.assignee || 'Не назначен',
            storyPoints: ctx.storyPoints || 0,
            estimateHours: ctx.estimateHours || 0,
            timeLog: ctx.timeLog || []
          }
        : { 
            name: '', 
            status: 'backlog', 
            priority: 'medium', 
            sprint: ctx?.sprint || 'Sprint 1', 
            effort: 'M', 
            deadline: '', 
            description: '', 
            artifacts: [],
            comments: [],
            epicId: ctx?.epicId || (epics && epics[0]?.id) || '',
            assignee: 'Не назначен',
            storyPoints: 0,
            estimateHours: 0,
            timeLog: []
          }
    }
  })

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Название не может быть пустым')
      return
    }
    onSave(form)
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <button style={s.closeX} onClick={onClose}>×</button>
        
        <div style={s.modalContent}>
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
              {!isEdit && (
                <Field label="Эпик">
                  <select value={form.epicId} onChange={e => set('epicId', e.target.value)} style={s.input}>
                    {epics && epics.length > 0 ? (
                      epics.map(ep => (
                        <option key={ep.id} value={ep.id}>
                          {ep.name} ({ep.sprint})
                        </option>
                      ))
                    ) : (
                      <option value="">Нет доступных эпиков</option>
                    )}
                  </select>
                </Field>
              )}
              <div style={s.grid2}>
                <Field label="Статус">
                  <Sel value={form.status} onChange={v => set('status', v)} options={(settings?.statuses || Object.keys(STATUS_LABELS)).map(st => [st, STATUS_LABELS[st] || st])} />
                </Field>
                <Field label="Приоритет">
                  <Sel value={form.priority} onChange={v => set('priority', v)} options={(settings?.priorities || Object.keys(PRIO_LABELS)).map(pr => [pr, PRIO_LABELS[pr] || pr])} />
                </Field>
                <Field label="Спринт"><Sel value={form.sprint} onChange={v => set('sprint', v)} options={SPRINTS.map(s => [s, s])} /></Field>
                <Field label="Усилие">
                  <Sel value={form.effort} onChange={v => set('effort', v)} options={(settings?.efforts || Object.keys(EFFORT_LABELS)).map(ef => [ef, EFFORT_LABELS[ef] || ef])} />
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Ответственный">
                  <select value={form.assignee} onChange={e => set('assignee', e.target.value)} style={s.input}>
                    {(settings?.teamMembers || ['Не назначен']).map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Дедлайн"><input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} style={s.input} /></Field>
              </div>
              <div style={s.grid2}>
                {settings?.useStoryPoints ? (
                  <Field label="Story Points">
                    <select value={form.storyPoints} onChange={e => set('storyPoints', +e.target.value)} style={s.input}>
                      {STORY_POINTS.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                    </select>
                  </Field>
                ) : (
                  <Field label="Оценка (часы)">
                    <input type="number" min="0" step="0.5" value={form.estimateHours} onChange={e => set('estimateHours', +e.target.value)} style={s.input} />
                  </Field>
                )}
                <div />
              </div>
              <Field label="Описание">
                <textarea 
                  value={form.description} 
                  onChange={e => set('description', e.target.value)} 
                  style={{ ...s.input, minHeight: form.description.length > 100 ? 120 : 70, resize: 'vertical' }} 
                  placeholder="Подробное описание задачи..."
                />
              </Field>
              <ArtifactEditor arts={form.artifacts} onChange={v => set('artifacts', v)} />
              <TimeLogSection timeLog={form.timeLog} onChange={v => set('timeLog', v)} />
              <CommentsSection comments={form.comments} onChange={v => set('comments', v)} />
            </>
          )}
        </div>

        <div style={s.footer}>
          {isEdit && onDelete && <button style={s.deleteBtn} onClick={onDelete}>Удалить</button>}
          <button style={s.btn} onClick={onClose}>Отмена</button>
          <button style={s.btnPrimary} onClick={handleSave}>Сохранить</button>
        </div>
      </div>
    </div>
  )
}
