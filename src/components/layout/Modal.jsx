import { useState, useEffect, useRef, useCallback } from 'react'
import {
  SPRINTS,
  EPIC_COLORS,
  STATUS_LABELS,
  PRIO_LABELS,
  EFFORT_LABELS,
  ART_TYPES,
} from '../../services/store.js'
import { validateTask, showValidationErrors } from '../../utils/validation.js'

const ALLOWED_EXT = ['.pdf', '.docx', '.md', '.xls', '.xlsx']

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 40,
    zIndex: 300,
  },
  modal: {
    background: 'var(--bg)',
    border: '0.5px solid var(--bd2)',
    borderRadius: 'var(--radius)',
    width: '100%',
    maxWidth: 580,
    maxHeight: '85vh',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  modalContent: { overflowY: 'auto', padding: '24px 26px', flex: 1 },
  h: { fontSize: 17, fontWeight: 600, marginBottom: 4, color: 'var(--tx)' },
  autoSaveHint: { fontSize: 11, color: 'var(--tx3)', marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: 'var(--tx2)', marginBottom: 6, fontWeight: 500 },
  input: {
    width: '100%',
    fontSize: 14,
    padding: '9px 12px',
    borderRadius: 7,
    border: '1px solid var(--bd2)',
    background: 'var(--bg2)',
    color: 'var(--tx)',
  },
  inputError: {
    width: '100%',
    fontSize: 14,
    padding: '9px 12px',
    borderRadius: 7,
    border: '1px solid #E24B4A',
    background: 'var(--bg2)',
    color: 'var(--tx)',
  },
  row: { marginBottom: 14 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '12px 26px',
    background: 'var(--bg)',
    borderTop: '1px solid var(--bd)',
    flexShrink: 0,
    borderRadius: '0 0 var(--radius) var(--radius)',
  },
  btn: {
    fontSize: 13,
    padding: '8px 16px',
    borderRadius: 7,
    border: '1px solid var(--bd2)',
    background: 'var(--bg2)',
    color: 'var(--tx)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  },
  btnPrimary: {
    fontSize: 13,
    padding: '8px 16px',
    borderRadius: 7,
    border: 'none',
    background: 'var(--tx)',
    color: 'var(--bg)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
  },
  closeX: {
    position: 'absolute',
    right: 16,
    top: 16,
    background: 'none',
    border: 'none',
    fontSize: 22,
    color: 'var(--tx3)',
    cursor: 'pointer',
    lineHeight: 1,
    padding: 4,
    zIndex: 1,
  },
  artRow: { display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 },
  artRm: {
    background: 'none',
    border: 'none',
    color: 'var(--tx3)',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 6px',
    minWidth: 32,
    minHeight: 32,
  },
  addArt: {
    fontSize: 12,
    color: 'var(--tx2)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    fontFamily: 'inherit',
    padding: '6px 0',
    marginTop: 4,
  },
  deleteBtn: {
    fontSize: 13,
    padding: '8px 16px',
    borderRadius: 7,
    border: '1px solid #E24B4A',
    background: 'transparent',
    color: '#E24B4A',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginRight: 'auto',
    fontWeight: 500,
  },
  commentBox: {
    background: 'var(--bg2)',
    padding: 12,
    borderRadius: 7,
    marginBottom: 8,
    border: '1px solid var(--bd)',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentDate: { fontSize: 11, color: 'var(--tx3)' },
  commentText: { fontSize: 13, color: 'var(--tx)', lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  addCommentBtn: {
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid var(--bd2)',
    background: 'var(--bg2)',
    color: 'var(--tx2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 6,
  },
  timeLogRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12 },
  timeLogBox: {
    background: 'var(--bg2)',
    padding: 10,
    borderRadius: 7,
    marginBottom: 6,
    border: '1px solid var(--bd)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addTimeBtn: {
    fontSize: 12,
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid var(--bd2)',
    background: 'var(--bg2)',
    color: 'var(--tx2)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 6,
  },
  fileAttachBtn: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 5,
    border: '1px dashed var(--bd2)',
    background: 'transparent',
    color: 'var(--tx3)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginLeft: 6,
  },
  attachedFile: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 5,
    background: 'var(--bg2)',
    border: '1px solid var(--bd)',
    color: 'var(--tx2)',
    marginRight: 6,
    marginTop: 4,
  },
}

function Field({ label, children }) {
  return (
    <div style={s.row}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

function Sel({ id, value, onChange, options }) {
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} style={s.input}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}

function ArtifactEditor({ arts, onChange }) {
  const add = () => onChange([...arts, { type: 'link', name: '', url: '' }])
  const rm = i => onChange(arts.filter((_, j) => j !== i))
  const upd = (i, field, val) =>
    onChange(arts.map((a, j) => (j === i ? { ...a, [field]: val } : a)))

  return (
    <div style={s.row}>
      <label style={s.label}>Артефакты (PDF, DOCX, ссылки)</label>
      {arts.map((a, i) => (
        <div key={i} style={s.artRow}>
          <select
            value={a.type}
            onChange={e => upd(i, 'type', e.target.value)}
            style={{ ...s.input, width: 70, fontSize: 12, padding: '7px 6px' }}
          >
            {ART_TYPES.map(t => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            value={a.name}
            onChange={e => upd(i, 'name', e.target.value)}
            placeholder="Название"
            style={{ ...s.input, flex: 1, fontSize: 12 }}
          />
          <input
            value={a.url || ''}
            onChange={e => upd(i, 'url', e.target.value)}
            placeholder="Ссылка (опц.)"
            style={{ ...s.input, flex: 1, fontSize: 12 }}
          />
          <button style={s.artRm} onClick={() => rm(i)} title="Удалить">
            ×
          </button>
        </div>
      ))}
      <button style={s.addArt} onClick={add}>
        + Добавить артефакт
      </button>
    </div>
  )
}

// Converts file to base64 data URL for storage
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function FileAttachment({ attachments, onChange }) {
  const fileInputRef = useRef(null)

  const handleFileSelect = async e => {
    const files = Array.from(e.target.files)
    const newAttachments = []
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!ALLOWED_EXT.includes(ext)) {
        alert(`Формат ${ext} не поддерживается. Разрешены: ${ALLOWED_EXT.join(', ')}`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой (макс. 5 МБ)`)
        continue
      }
      const dataUrl = await readFileAsDataURL(file)
      newAttachments.push({ name: file.name, size: file.size, type: ext.slice(1), dataUrl })
    }
    if (newAttachments.length > 0) {
      onChange([...attachments, ...newAttachments])
    }
    e.target.value = ''
  }

  const remove = i => onChange(attachments.filter((_, j) => j !== i))

  const formatSize = bytes =>
    bytes < 1024
      ? `${bytes} Б`
      : bytes < 1024 * 1024
        ? `${Math.round(bytes / 1024)} КБ`
        : `${(bytes / 1024 / 1024).toFixed(1)} МБ`

  return (
    <div style={s.row}>
      <label style={s.label}>Прикреплённые файлы (PDF, DOCX, MD, XLS, XLSX — до 5 МБ)</label>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginBottom: attachments.length ? 8 : 0,
        }}
      >
        {attachments.map((f, i) => (
          <span key={i} style={s.attachedFile}>
            📎 {f.name}
            <span style={{ color: 'var(--tx3)', marginLeft: 2 }}>({formatSize(f.size)})</span>
            {f.dataUrl && (
              <a
                href={f.dataUrl}
                download={f.name}
                style={{ color: 'var(--tx3)', marginLeft: 4, textDecoration: 'none' }}
                title="Скачать"
              >
                ↓
              </a>
            )}
            <button
              onClick={() => remove(i)}
              style={{ ...s.artRm, fontSize: 14, padding: '0 2px', minWidth: 18, minHeight: 18 }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.md,.xls,.xlsx"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <button style={s.addArt} onClick={() => fileInputRef.current?.click()}>
        📎 Прикрепить файл
      </button>
    </div>
  )
}

function CommentsSection({ comments, onChange }) {
  const [newComment, setNewComment] = useState('')
  const fileInputRef = useRef(null)

  const addComment = (attachedFiles = []) => {
    const trimmed = newComment.trim()
    if (!trimmed && attachedFiles.length === 0) return
    const updated = [...comments, { text: trimmed, date: new Date().toISOString(), files: attachedFiles }]
    onChange(updated)
    setNewComment('')
  }

  const handleFileAttach = async e => {
    const files = Array.from(e.target.files)
    const attached = []
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      if (!ALLOWED_EXT.includes(ext)) continue
      if (file.size > 5 * 1024 * 1024) {
        alert(`Файл ${file.name} слишком большой`)
        continue
      }
      const dataUrl = await readFileAsDataURL(file)
      attached.push({ name: file.name, size: file.size, dataUrl })
    }
    if (attached.length > 0) addComment(attached)
    e.target.value = ''
  }

  const removeComment = i => {
    if (!confirm('Удалить комментарий?')) return
    onChange(comments.filter((_, j) => j !== i))
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addComment()
  }

  const renderMarkdown = text => {
    if (!text) return ''
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(
        /`(.+?)`/g,
        '<code style="background: var(--bg3); padding: 2px 4px; border-radius: 3px; font-size: 12px;">$1</code>'
      )
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #378ADD; text-decoration: underline;">$1</a>'
      )
      .replace(/\n/g, '<br/>')
  }

  return (
    <div style={s.row}>
      <label style={s.label}>Комментарии (поддерживается Markdown)</label>
      {comments.map((c, i) => (
        <div key={i} style={s.commentBox}>
          <div style={s.commentHeader}>
            <span style={s.commentDate}>
              {new Date(c.date).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              style={{ ...s.artRm, fontSize: 16 }}
              onClick={() => removeComment(i)}
              title="Удалить"
            >
              ×
            </button>
          </div>
          {c.text && (
            <div
              style={s.commentText}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(c.text) }}
            />
          )}
          {c.files?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {c.files.map((f, fi) => (
                <a
                  key={fi}
                  href={f.dataUrl}
                  download={f.name}
                  style={{ ...s.attachedFile, textDecoration: 'none' }}
                >
                  📎 {f.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      <textarea
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Добавить комментарий... (Ctrl+Enter для отправки)&#10;Поддерживается: **жирный**, *курсив*, `код`, [ссылка](url)"
        style={{ ...s.input, minHeight: 60, resize: 'vertical', marginBottom: 6 }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button style={s.addCommentBtn} onClick={() => addComment()}>
          Добавить комментарий
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.md,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileAttach}
        />
        <button
          style={s.fileAttachBtn}
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить файл к комментарию"
        >
          📎 Файл
        </button>
      </div>
    </div>
  )
}

function TimeLogSection({ timeLog, onChange }) {
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    comment: '',
  })

  const addLog = () => {
    if (!newLog.hours || parseFloat(newLog.hours) <= 0) {
      alert('Укажите количество часов')
      return
    }
    onChange([...timeLog, { ...newLog, hours: parseFloat(newLog.hours) }])
    setNewLog({ date: new Date().toISOString().split('T')[0], hours: '', comment: '' })
  }

  const removeLog = i => {
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
          <button style={{ ...s.artRm, fontSize: 16 }} onClick={() => removeLog(i)} title="Удалить">
            ×
          </button>
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
      <button style={s.addTimeBtn} onClick={addLog}>
        + Добавить время
      </button>
    </div>
  )
}

export default function Modal({ mode, ctx, epics, settings, onSave, onDelete, onClose }) {
  const isEpic = mode === 'epic' || mode === 'epic-edit'
  const isEdit = mode === 'epic-edit' || mode === 'task-edit'
  const autoSaveTimer = useRef(null)
  const [savedAt, setSavedAt] = useState(null)

  const initForm = useCallback(() => {
    if (isEpic) {
      return ctx && mode === 'epic-edit'
        ? {
            name: ctx.name,
            color: ctx.color,
            sprint: ctx.sprint,
            startW: ctx.startW,
            durW: ctx.durW,
          }
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
            attachments: ctx.attachments || [],
            comments: ctx.comments || [],
            epicId: ctx.epicId,
            assignee: ctx.assignee || 'Не назначен',
            storyPoints: ctx.storyPoints || 0,
            estimateHours: ctx.estimateHours || 0,
            timeLog: ctx.timeLog || [],
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
            attachments: [],
            comments: [],
            epicId: ctx?.epicId || (epics && epics[0]?.id) || '',
            assignee: 'Не назначен',
            storyPoints: 0,
            estimateHours: 0,
            timeLog: [],
          }
    }
  }, []) // eslint-disable-line

  const [form, setForm] = useState(initForm)
  const [validationErrors, setValidationErrors] = useState([])

  // Auto-save on blur: debounce 800ms after last change
  const triggerAutoSave = useCallback(
    currentForm => {
      if (!isEdit || !currentForm.name?.trim()) return
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        onSave(currentForm, true)
        setSavedAt(new Date())
      }, 800)
    },
    [isEdit, onSave]
  )

  useEffect(() => () => clearTimeout(autoSaveTimer.current), [])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const set = (k, v) => {
    setForm(f => {
      const next = { ...f, [k]: v }
      // Clear validation errors when user starts typing
      if (validationErrors.length > 0) {
        setValidationErrors([])
      }
      triggerAutoSave(next)
      return next
    })
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Название не может быть пустым')
      return
    }

    // Validate task before saving (skip validation for epics)
    if (!isEpic) {
      const validation = validateTask(form)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        showValidationErrors(validation.errors)
        return
      }
    }

    clearTimeout(autoSaveTimer.current)
    onSave(form)
  }

  // For new tasks — no autosave, just regular save
  const isNewTask = !isEdit

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <button style={s.closeX} onClick={onClose}>
          ×
        </button>

        <div style={s.modalContent}>
          <div style={s.h}>
            {mode === 'epic'
              ? 'Новый эпик'
              : mode === 'epic-edit'
                ? 'Редактировать эпик'
                : mode === 'task-edit'
                  ? 'Редактировать задачу'
                  : 'Новая задача'}
          </div>
          {isEdit && (
            <div style={s.autoSaveHint}>
              {savedAt
                ? `✓ Сохранено в ${savedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                : 'Автосохранение при изменении полей'}
            </div>
          )}

          <Field label="Название">
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Название..."
              style={validationErrors.some(e => e.includes('Название')) ? s.inputError : s.input}
              autoFocus
            />
          </Field>

          {isEpic ? (
            <div style={s.grid2}>
              <Field label="Спринт">
                <Sel
                  value={form.sprint}
                  onChange={v => set('sprint', v)}
                  options={SPRINTS.map(s => [s, s])}
                />
              </Field>
              <Field label="Цвет">
                <select
                  value={form.color}
                  onChange={e => set('color', e.target.value)}
                  style={s.input}
                >
                  {EPIC_COLORS.map(c => (
                    <option key={c} value={c} style={{ background: c, color: '#fff' }}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Начало (неделя от старта)">
                <input
                  type="number"
                  min={0}
                  max={15}
                  value={form.startW}
                  onChange={e => set('startW', +e.target.value)}
                  style={s.input}
                />
              </Field>
              <Field label="Длительность (нед.)">
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={form.durW}
                  onChange={e => set('durW', +e.target.value)}
                  style={s.input}
                />
              </Field>
            </div>
          ) : (
            <>
              {!isEdit && (
                <Field label="Эпик">
                  <select
                    value={form.epicId}
                    onChange={e => set('epicId', e.target.value)}
                    style={s.input}
                  >
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
                  <Sel
                    value={form.status}
                    onChange={v => set('status', v)}
                    options={(() => {
                      const sl = { ...STATUS_LABELS, ...(settings?.statusLabels || {}) }
                      const sts = settings?.statuses || Object.keys(STATUS_LABELS)
                      sts.forEach(k => {
                        if (!sl[k]) sl[k] = k
                      })
                      return sts.map(st => [st, sl[st]])
                    })()}
                  />
                </Field>
                <Field label="Приоритет">
                  <Sel
                    value={form.priority}
                    onChange={v => set('priority', v)}
                    options={(() => {
                      const pl = { ...PRIO_LABELS, ...(settings?.priorityLabels || {}) }
                      const prs = settings?.priorities || Object.keys(PRIO_LABELS)
                      prs.forEach(k => {
                        if (!pl[k]) pl[k] = k
                      })
                      return prs.map(pr => [pr, pl[pr]])
                    })()}
                  />
                </Field>
                <Field label="Спринт">
                  <Sel
                    value={form.sprint}
                    onChange={v => set('sprint', v)}
                    options={SPRINTS.map(s => [s, s])}
                  />
                </Field>
                <Field label="Усилие">
                  <Sel
                    value={form.effort}
                    onChange={v => set('effort', v)}
                    options={(settings?.efforts || Object.keys(EFFORT_LABELS)).map(ef => [
                      ef,
                      (settings?.effortLabels || EFFORT_LABELS)[ef] || ef,
                    ])}
                  />
                </Field>
              </div>
              <div style={s.grid2}>
                <Field label="Ответственный">
                  <select
                    value={form.assignee}
                    onChange={e => set('assignee', e.target.value)}
                    style={s.input}
                  >
                    {(settings?.teamMembers || ['Не назначен']).map(member => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Дедлайн">
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={e => set('deadline', e.target.value)}
                    style={s.input}
                  />
                </Field>
              </div>
              <div style={s.grid2}>
                {settings?.useStoryPoints ? (
                  <Field label="Story Points">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.storyPoints}
                      onChange={e => set('storyPoints', +e.target.value)}
                      style={s.input}
                      placeholder="0"
                    />
                  </Field>
                ) : (
                  <Field label="Оценка (часы)">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.estimateHours}
                      onChange={e => set('estimateHours', +e.target.value)}
                      style={s.input}
                      placeholder="0"
                    />
                  </Field>
                )}
                <div />
              </div>
              <Field label="Описание">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  style={{
                    ...s.input,
                    minHeight: form.description.length > 100 ? 120 : 70,
                    resize: 'vertical',
                  }}
                  placeholder="Подробное описание задачи..."
                />
              </Field>
              <FileAttachment
                attachments={form.attachments || []}
                onChange={v => set('attachments', v)}
              />
              <ArtifactEditor arts={form.artifacts} onChange={v => set('artifacts', v)} />
              <TimeLogSection timeLog={form.timeLog} onChange={v => set('timeLog', v)} />
              <CommentsSection comments={form.comments} onChange={v => set('comments', v)} />
            </>
          )}
        </div>

        <div style={s.footer}>
          {isEdit && onDelete && (
            <button style={s.deleteBtn} onClick={onDelete}>
              Удалить
            </button>
          )}
          <button style={s.btn} onClick={onClose}>
            {isEdit ? 'Закрыть' : 'Отмена'}
          </button>
          {isNewTask && (
            <button style={s.btnPrimary} onClick={handleSave}>
              Сохранить
            </button>
          )}
          {isEdit && (
            <button style={s.btnPrimary} onClick={handleSave}>
              Сохранить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
