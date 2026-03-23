import { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS, EFFORT_LABELS } from '../../services/store.js'

const s = {
  container: { padding: '0 0 2rem' },
  section: {
    marginBottom: '2rem',
    border: '1px solid var(--bd)',
    borderRadius: 10,
    padding: '20px 24px',
    background: 'var(--bg)',
  },
  h: { fontSize: 16, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 },
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
  row: { marginBottom: 14 },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    padding: '8px 12px',
    background: 'var(--bg2)',
    borderRadius: 7,
    border: '1px solid var(--bd)',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--tx3)',
    cursor: 'pointer',
    fontSize: 18,
    padding: '4px 8px',
    minWidth: 32,
    minHeight: 32,
  },
  addBtn: {
    fontSize: 13,
    padding: '7px 14px',
    borderRadius: 7,
    border: '1px solid var(--bd2)',
    background: 'var(--bg2)',
    color: 'var(--tx)',
    cursor: 'pointer',
    fontWeight: 500,
    marginTop: 8,
  },
  saveBtn: {
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
  toggle: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
  checkbox: { width: 18, height: 18, cursor: 'pointer' },
  hint: { fontSize: 11, color: 'var(--tx3)', marginTop: 4 },
  keyBadge: {
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    background: 'var(--bg3)',
    color: 'var(--tx3)',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
}

// Редактируемый список с парами ключ → отображаемое название
function LabeledList({ label, hint, items, labels, onChange, keyPlaceholder, labelPlaceholder }) {
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')

  const add = () => {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, '_')
    const lbl = newLabel.trim()
    if (!key || !lbl) {
      alert('Заполните оба поля: ключ и название')
      return
    }
    if (items.includes(key)) {
      alert('Такой ключ уже существует')
      return
    }
    onChange([...items, key], { ...labels, [key]: lbl })
    setNewKey('')
    setNewLabel('')
  }

  const remove = key => {
    if (!confirm(`Удалить "${labels[key] || key}"?`)) return
    const newLabels = { ...labels }
    delete newLabels[key]
    onChange(
      items.filter(i => i !== key),
      newLabels
    )
  }

  const updateLabel = (key, val) => {
    onChange(items, { ...labels, [key]: val })
  }

  return (
    <div style={s.row}>
      <label style={s.label}>{label}</label>
      {hint && <div style={{ ...s.hint, marginBottom: 10 }}>{hint}</div>}
      {items.map(key => (
        <div key={key} style={s.listItem}>
          <span style={s.keyBadge}>{key}</span>
          <input
            value={labels[key] || key}
            onChange={e => updateLabel(key, e.target.value)}
            style={{ ...s.input, flex: 1, padding: '6px 10px', fontSize: 13 }}
          />
          <button style={s.removeBtn} onClick={() => remove(key)} title="Удалить">
            ×
          </button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={keyPlaceholder || 'ключ'}
          style={{ ...s.input, width: 120, flexShrink: 0 }}
        />
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={labelPlaceholder || 'Название'}
          style={{ ...s.input, flex: 1 }}
        />
        <button style={s.addBtn} onClick={add}>
          Добавить
        </button>
      </div>
    </div>
  )
}

// Простой список строк (для команды и усилий)
function SimpleList({ label, items, onChange, placeholder }) {
  const [newItem, setNewItem] = useState('')

  const add = () => {
    const trimmed = newItem.trim()
    if (!trimmed) return
    if (items.includes(trimmed)) {
      alert('Уже существует')
      return
    }
    onChange([...items, trimmed])
    setNewItem('')
  }

  const remove = item => {
    if (!confirm(`Удалить "${item}"?`)) return
    onChange(items.filter(i => i !== item))
  }

  return (
    <div style={s.row}>
      <label style={s.label}>{label}</label>
      {items.map(item => (
        <div key={item} style={s.listItem}>
          <span style={{ flex: 1, fontSize: 13, color: 'var(--tx)' }}>{item}</span>
          <button style={s.removeBtn} onClick={() => remove(item)} title="Удалить">
            ×
          </button>
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
        <button style={s.addBtn} onClick={add}>
          Добавить
        </button>
      </div>
    </div>
  )
}

export default function SettingsView({ settings, onSave }) {
  const [form, setForm] = useState({
    projectName: settings.projectName || 'Roadmap',
    teamMembers: [...(settings.teamMembers || ['Не назначен'])],
    statuses: [...(settings.statuses || Object.keys(STATUS_LABELS))],
    priorities: [...(settings.priorities || Object.keys(PRIO_LABELS))],
    efforts: [...(settings.efforts || Object.keys(EFFORT_LABELS))],
    useStoryPoints: settings.useStoryPoints !== undefined ? settings.useStoryPoints : true,
    sprintHistory: settings.sprintHistory || [],
    statusLabels: { ...STATUS_LABELS, ...(settings.statusLabels || {}) },
    priorityLabels: { ...PRIO_LABELS, ...(settings.priorityLabels || {}) },
    effortLabels: { ...EFFORT_LABELS, ...(settings.effortLabels || {}) },
  })

  const handleSave = () => {
    if (!form.projectName.trim()) {
      alert('Название проекта не может быть пустым')
      return
    }
    if (form.teamMembers.length === 0) {
      alert('Добавьте хотя бы одного члена команды')
      return
    }
    if (form.statuses.length === 0) {
      alert('Добавьте хотя бы один статус')
      return
    }
    if (form.priorities.length === 0) {
      alert('Добавьте хотя бы один приоритет')
      return
    }

    // Ensure every status/priority key has a label — fallback to key itself
    const statusLabels = { ...form.statusLabels }
    form.statuses.forEach(k => {
      if (!statusLabels[k]) statusLabels[k] = k
    })
    const priorityLabels = { ...form.priorityLabels }
    form.priorities.forEach(k => {
      if (!priorityLabels[k]) priorityLabels[k] = k
    })

    onSave({ ...form, statusLabels, priorityLabels })
    alert('Настройки сохранены!')
  }

  return (
    <div style={s.container}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Настройки проекта</span>
        <button style={s.saveBtn} onClick={handleSave}>
          Сохранить
        </button>
      </div>

      <div style={s.section}>
        <div style={s.h}>Основные</div>
        <div style={s.row}>
          <label style={s.label}>Название проекта</label>
          <input
            value={form.projectName}
            onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
            placeholder="Roadmap"
            style={s.input}
          />
        </div>
        <div style={s.toggle}>
          <input
            type="checkbox"
            checked={form.useStoryPoints}
            onChange={e => setForm(f => ({ ...f, useStoryPoints: e.target.checked }))}
            style={s.checkbox}
            id="useStoryPoints"
          />
          <label
            htmlFor="useStoryPoints"
            style={{ fontSize: 13, color: 'var(--tx)', cursor: 'pointer' }}
          >
            Использовать Story Points (иначе часы)
          </label>
        </div>
      </div>

      <div style={s.section}>
        <div style={s.h}>Команда</div>
        <SimpleList
          label="Члены команды"
          items={form.teamMembers}
          onChange={v => setForm(f => ({ ...f, teamMembers: v }))}
          placeholder="Имя члена команды"
        />
      </div>

      <div style={s.section}>
        <div style={s.h}>Статусы</div>
        <LabeledList
          label="Список статусов"
          hint="Ключ используется внутри системы, название отображается в интерфейсе"
          items={form.statuses}
          labels={form.statusLabels}
          onChange={(keys, lbls) => setForm(f => ({ ...f, statuses: keys, statusLabels: lbls }))}
          keyPlaceholder="review"
          labelPlaceholder="На ревью"
        />
      </div>

      <div style={s.section}>
        <div style={s.h}>Приоритеты</div>
        <LabeledList
          label="Список приоритетов"
          hint="Ключ используется внутри системы, название отображается в интерфейсе"
          items={form.priorities}
          labels={form.priorityLabels}
          onChange={(keys, lbls) =>
            setForm(f => ({ ...f, priorities: keys, priorityLabels: lbls }))
          }
          keyPlaceholder="blocker"
          labelPlaceholder="Блокер 🚨"
        />
      </div>

      <div style={s.section}>
        <div style={s.h}>Усилия</div>
        <SimpleList
          label="Размеры усилий"
          items={form.efforts}
          onChange={v => setForm(f => ({ ...f, efforts: v }))}
          placeholder="XXL"
        />
      </div>

      <div style={s.section}>
        <div style={s.h}>Управление данными</div>
        <div style={s.row}>
          <label style={s.label}>Восстановление seed данных</label>
          <div style={{ ...s.hint, marginBottom: 12 }}>
            Восстанавливает демо-данные (4 эпика и 9 задач). Текущие данные будут заменены.
          </div>
          <button
            style={{
              ...s.addBtn,
              background: '#EF9F27',
              color: 'white',
              border: 'none',
              fontWeight: 600,
            }}
            onClick={() => {
              if (
                !confirm(
                  'Вы уверены? Это заменит все текущие данные на демо-данные.\n\nЭто действие нельзя отменить!'
                )
              )
                return

              // Restore seed data
              const SEED_EPICS = [
                {
                  id: 'e1',
                  name: 'Личный сайт / портфолио',
                  color: '#378ADD',
                  sprint: 'Sprint 1',
                  startW: 0,
                  durW: 3,
                },
                {
                  id: 'e2',
                  name: 'Контент-машина',
                  color: '#1D9E75',
                  sprint: 'Sprint 1',
                  startW: 1,
                  durW: 4,
                },
                {
                  id: 'e3',
                  name: 'Курс вайбкодинга',
                  color: '#D85A30',
                  sprint: 'Sprint 2',
                  startW: 4,
                  durW: 6,
                },
                {
                  id: 'e4',
                  name: 'MVP трекер привычек',
                  color: '#534AB7',
                  sprint: 'Sprint 3',
                  startW: 8,
                  durW: 5,
                },
              ]

              const SEED_TASKS = [
                {
                  id: 't1',
                  epicId: 'e1',
                  parentId: null,
                  name: 'Figma макет главной',
                  status: 'done',
                  priority: 'high',
                  sprint: 'Sprint 1',
                  effort: 'M',
                  storyPoints: 5,
                  estimateHours: 4,
                  deadline: '2026-03-18',
                  description: '',
                  comments: [],
                  artifacts: [{ type: 'link', name: 'Figma', url: 'https://figma.com' }],
                  assignee: 'Мария',
                  timeLog: [],
                },
                {
                  id: 't2',
                  epicId: 'e1',
                  parentId: 't1',
                  name: 'Утвердить с ментором',
                  status: 'done',
                  priority: 'medium',
                  sprint: 'Sprint 1',
                  effort: 'S',
                  storyPoints: 1,
                  estimateHours: 1,
                  deadline: '2026-03-19',
                  description: '',
                  comments: [],
                  artifacts: [],
                  assignee: 'Иван',
                  timeLog: [],
                },
                {
                  id: 't3',
                  epicId: 'e1',
                  parentId: null,
                  name: 'Верстка React + Vite',
                  status: 'wip',
                  priority: 'critical',
                  sprint: 'Sprint 1',
                  effort: 'L',
                  storyPoints: 8,
                  estimateHours: 16,
                  deadline: '2026-03-28',
                  description: '',
                  comments: [],
                  artifacts: [{ type: 'doc', name: 'Бриф.docx', url: '' }],
                  assignee: 'Алексей',
                  timeLog: [{ date: '2026-03-16', hours: 4, comment: 'Настройка проекта' }],
                },
                {
                  id: 't4',
                  epicId: 'e1',
                  parentId: 't3',
                  name: 'Компонент Hero секции',
                  status: 'wip',
                  priority: 'high',
                  sprint: 'Sprint 1',
                  effort: 'S',
                  storyPoints: 3,
                  estimateHours: 3,
                  deadline: '2026-03-22',
                  description: '',
                  comments: [],
                  artifacts: [],
                  assignee: 'Алексей',
                  timeLog: [],
                },
                {
                  id: 't5',
                  epicId: 'e1',
                  parentId: 't3',
                  name: 'Компонент кейсов',
                  status: 'ready',
                  priority: 'medium',
                  sprint: 'Sprint 1',
                  effort: 'M',
                  storyPoints: 5,
                  estimateHours: 6,
                  deadline: '2026-03-26',
                  description: '',
                  comments: [],
                  artifacts: [],
                  assignee: 'Не назначен',
                  timeLog: [],
                },
                {
                  id: 't6',
                  epicId: 'e2',
                  parentId: null,
                  name: 'Контент-план апрель',
                  status: 'wip',
                  priority: 'high',
                  sprint: 'Sprint 1',
                  effort: 'M',
                  storyPoints: 5,
                  estimateHours: 5,
                  deadline: '2026-03-25',
                  description: '',
                  comments: [],
                  artifacts: [{ type: 'doc', name: 'КП_апрель.docx', url: '' }],
                  assignee: 'Мария',
                  timeLog: [],
                },
                {
                  id: 't7',
                  epicId: 'e2',
                  parentId: 't6',
                  name: 'Темы для Reels',
                  status: 'ready',
                  priority: 'medium',
                  sprint: 'Sprint 1',
                  effort: 'S',
                  storyPoints: 2,
                  estimateHours: 2,
                  deadline: '2026-03-23',
                  description: '',
                  comments: [],
                  artifacts: [],
                  assignee: 'Мария',
                  timeLog: [],
                },
                {
                  id: 't8',
                  epicId: 'e3',
                  parentId: null,
                  name: 'Программа курса',
                  status: 'backlog',
                  priority: 'high',
                  sprint: 'Sprint 2',
                  effort: 'L',
                  storyPoints: 13,
                  estimateHours: 20,
                  deadline: '2026-04-15',
                  description: '',
                  comments: [],
                  artifacts: [{ type: 'pdf', name: 'Программа.pdf', url: '' }],
                  assignee: 'Не назначен',
                  timeLog: [],
                },
                {
                  id: 't9',
                  epicId: 'e4',
                  parentId: null,
                  name: 'PRD трекера',
                  status: 'backlog',
                  priority: 'medium',
                  sprint: 'Sprint 3',
                  effort: 'M',
                  storyPoints: 5,
                  estimateHours: 8,
                  deadline: '2026-05-10',
                  description: '',
                  comments: [],
                  artifacts: [],
                  assignee: 'Не назначен',
                  timeLog: [],
                },
              ]

              try {
                localStorage.setItem('rm_epics', JSON.stringify(SEED_EPICS))
                localStorage.setItem('rm_tasks', JSON.stringify(SEED_TASKS))
                localStorage.setItem('rm_neid', '5')
                localStorage.setItem('rm_ntid', '10')
                alert('✅ Данные восстановлены! Страница будет перезагружена.')
                window.location.reload()
              } catch (error) {
                alert('❌ Ошибка восстановления данных: ' + error.message)
              }
            }}
          >
            🔄 Восстановить seed данные
          </button>
        </div>
      </div>
    </div>
  )
}
