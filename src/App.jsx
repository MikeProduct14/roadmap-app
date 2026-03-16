import React, { useState, useCallback } from 'react'
import { loadState, saveState } from './store.js'
import Modal from './Modal.jsx'
import EpicsView from './EpicsView.jsx'
import GanttView from './GanttView.jsx'

const TABS = [
  { id: 'epics', label: 'Эпики и задачи' },
  { id: 'gantt', label: 'Гант' },
]

function useStore() {
  const [state, setState] = useState(() => loadState())

  const update = useCallback(updater => {
    setState(prev => {
      const next = updater(prev)
      saveState(next)
      return next
    })
  }, [])

  return { state, update }
}

export default function App() {
  const { state, update } = useStore()
  const { epics, tasks, nextEpicId, nextTaskId } = state

  const [tab, setTab] = useState('epics')
  const [modal, setModal] = useState(null) // { mode, ctx }

  const closeModal = () => setModal(null)

  const handleSave = form => {
    const { mode, ctx } = modal

    if (mode === 'epic') {
      update(s => ({ ...s, epics: [...s.epics, { id: `e${s.nextEpicId}`, ...form }], nextEpicId: s.nextEpicId + 1 }))
    } else if (mode === 'epic-edit') {
      update(s => ({ ...s, epics: s.epics.map(e => e.id === ctx.id ? { ...e, ...form } : e) }))
    } else if (mode === 'task') {
      update(s => ({
        ...s,
        tasks: [...s.tasks, { id: `t${s.nextTaskId}`, epicId: ctx.epicId, parentId: ctx.parentId || null, ...form }],
        nextTaskId: s.nextTaskId + 1
      }))
    } else if (mode === 'task-edit') {
      update(s => ({ ...s, tasks: s.tasks.map(t => t.id === ctx.id ? { ...t, ...form } : t) }))
    }

    closeModal()
  }

  const handleDelete = () => {
    const { mode, ctx } = modal
    if (mode === 'epic-edit') {
      update(s => ({
        ...s,
        epics: s.epics.filter(e => e.id !== ctx.id),
        tasks: s.tasks.filter(t => t.epicId !== ctx.id)
      }))
    } else if (mode === 'task-edit') {
      update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== ctx.id && t.parentId !== ctx.id) }))
    }
    closeModal()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--tx)' }}>Roadmap</h1>
        <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
          {epics.length} эпиков · {tasks.length} задач
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '0.5px solid var(--bd)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 16px', fontSize: 13, border: 'none', background: 'none',
              color: tab === t.id ? 'var(--tx)' : 'var(--tx2)',
              fontWeight: tab === t.id ? 600 : 400,
              borderBottom: tab === t.id ? '2px solid var(--tx)' : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer', fontFamily: 'inherit'
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Views */}
      {tab === 'epics' && (
        <EpicsView
          epics={epics}
          tasks={tasks}
          onAddEpic={() => setModal({ mode: 'epic', ctx: null })}
          onEditEpic={ep => setModal({ mode: 'epic-edit', ctx: ep })}
          onAddTask={ep => setModal({ mode: 'task', ctx: { epicId: ep?.id || epics[0]?.id, parentId: null, sprint: ep?.sprint || 'Sprint 1' } })}
          onEditTask={t => setModal({ mode: 'task-edit', ctx: t })}
          onAddSub={t => setModal({ mode: 'task', ctx: { epicId: t.epicId, parentId: t.id, sprint: t.sprint } })}
        />
      )}
      {tab === 'gantt' && (
        <GanttView epics={epics} tasks={tasks} />
      )}

      {/* Modal */}
      {modal && (
        <Modal
          mode={modal.mode}
          ctx={modal.ctx}
          onSave={handleSave}
          onDelete={modal.mode === 'epic-edit' || modal.mode === 'task-edit' ? handleDelete : null}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
