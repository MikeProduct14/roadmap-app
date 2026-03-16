import React, { useState, useCallback, useEffect } from 'react'
import { loadState, saveState, loadStateFromSupabase, saveStateToSupabase } from './store.js'
import { isSupabaseConfigured } from './supabase.js'
import Auth from './Auth.jsx'
import Modal from './Modal.jsx'
import EpicsView from './EpicsView.jsx'
import GanttView from './GanttView.jsx'
import SettingsView from './SettingsView.jsx'
import SprintReview from './SprintReview.jsx'
import RetroView from './RetroView.jsx'

const TABS = [
  { id: 'epics', label: '📋 Доска' },
  { id: 'gantt', label: '📊 Гант' },
  { id: 'sprint', label: '🎯 Ревью' },
  { id: 'retro', label: '🔄 Ретро' },
  { id: 'settings', label: '⚙️ Настройки' },
]

function useStore(user) {
  const [state, setState] = useState(() => loadState())
  const [loading, setLoading] = useState(true)

  // Load from Supabase when user logs in
  useEffect(() => {
    if (user && isSupabaseConfigured()) {
      loadStateFromSupabase(user.id).then(data => {
        if (data) {
          setState(data)
          saveState(data) // Sync to localStorage
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user])

  const update = useCallback(updater => {
    setState(prev => {
      const next = updater(prev)
      saveState(next) // Always save to localStorage
      if (user && isSupabaseConfigured()) {
        saveStateToSupabase(user.id, next) // Also save to Supabase
      }
      return next
    })
  }, [user])

  return { state, update, loading }
}

export default function App() {
  const [user, setUser] = useState(null)
  const { state, update, loading } = useStore(user)
  const { epics, tasks, nextEpicId, nextTaskId, settings } = state

  const [tab, setTab] = useState('epics')
  const [modal, setModal] = useState(null) // { mode, ctx }

  // Show auth screen if Supabase is configured but user is not logged in
  if (isSupabaseConfigured() && !user) {
    return <Auth onAuth={setUser} />
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        color: 'var(--tx2)'
      }}>
        Загрузка...
      </div>
    )
  }

  const closeModal = () => setModal(null)

  const handleSave = form => {
    const { mode, ctx } = modal

    if (mode === 'epic') {
      update(s => ({ ...s, epics: [...s.epics, { id: `e${s.nextEpicId}`, ...form }], nextEpicId: s.nextEpicId + 1 }))
    } else if (mode === 'epic-edit') {
      update(s => ({ ...s, epics: s.epics.map(e => e.id === ctx.id ? { ...e, ...form } : e) }))
    } else if (mode === 'task') {
      // Validate epicId exists
      if (!form.epicId || !epics.find(e => e.id === form.epicId)) {
        alert('Ошибка: не выбран эпик. Создайте эпик сначала.')
        return
      }
      // Filter out empty artifacts
      const cleanedArtifacts = (form.artifacts || []).filter(a => a.name.trim())
      update(s => ({
        ...s,
        tasks: [...s.tasks, { 
          id: `t${s.nextTaskId}`, 
          epicId: ctx.epicId, 
          parentId: ctx.parentId || null, 
          ...form,
          artifacts: cleanedArtifacts,
          comments: form.comments || [],
          assignee: form.assignee || 'Не назначен',
          storyPoints: form.storyPoints || 0,
          estimateHours: form.estimateHours || 0,
          timeLog: form.timeLog || []
        }],
        nextTaskId: s.nextTaskId + 1
      }))
    } else if (mode === 'task-edit') {
      // Filter out empty artifacts
      const cleanedArtifacts = (form.artifacts || []).filter(a => a.name.trim())
      update(s => ({ 
        ...s, 
        tasks: s.tasks.map(t => t.id === ctx.id ? { 
          ...t, 
          ...form,
          artifacts: cleanedArtifacts,
          comments: form.comments || [],
          assignee: form.assignee || 'Не назначен',
          storyPoints: form.storyPoints || 0,
          estimateHours: form.estimateHours || 0,
          timeLog: form.timeLog || [],
          // Remove old 'notes' field if exists
          notes: undefined
        } : t) 
      }))
    }

    closeModal()
  }

  const handleDelete = () => {
    const { mode, ctx } = modal
    
    if (!confirm('Вы уверены? Это действие нельзя отменить.')) {
      return
    }
    
    if (mode === 'epic-edit') {
      update(s => ({
        ...s,
        epics: s.epics.filter(e => e.id !== ctx.id),
        tasks: s.tasks.filter(t => t.epicId !== ctx.id)
      }))
    } else if (mode === 'task-edit') {
      // Recursively collect all child task IDs
      const collectChildIds = (taskId) => {
        const children = tasks.filter(t => t.parentId === taskId)
        const childIds = children.map(c => c.id)
        const grandChildIds = children.flatMap(c => collectChildIds(c.id))
        return [...childIds, ...grandChildIds]
      }
      
      const idsToDelete = [ctx.id, ...collectChildIds(ctx.id)]
      
      update(s => ({ 
        ...s, 
        tasks: s.tasks.filter(t => !idsToDelete.includes(t.id)) 
      }))
    }
    closeModal()
  }

  const handleReorderEpics = (fromIndex, toIndex) => {
    update(s => {
      const newEpics = [...s.epics]
      const [moved] = newEpics.splice(fromIndex, 1)
      newEpics.splice(toIndex, 0, moved)
      return { ...s, epics: newEpics }
    })
  }

  const handleReorderTasks = (epicId, parentId, fromIndex, toIndex) => {
    update(s => {
      const epicTasks = s.tasks.filter(t => t.epicId === epicId && t.parentId === parentId)
      const otherTasks = s.tasks.filter(t => t.epicId !== epicId || t.parentId !== parentId)
      
      const [moved] = epicTasks.splice(fromIndex, 1)
      epicTasks.splice(toIndex, 0, moved)
      
      return { ...s, tasks: [...otherTasks, ...epicTasks] }
    })
  }

  const handleSaveSettings = (newSettings) => {
    update(s => ({ ...s, settings: newSettings }))
  }

  const handleSaveSprintHistory = (historyEntry) => {
    update(s => ({
      ...s,
      settings: {
        ...s.settings,
        sprintHistory: [...(s.settings.sprintHistory || []), historyEntry]
      }
    }))
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--tx)' }}>{settings?.projectName || 'Roadmap'}</h1>
          <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
            {epics.length} эпиков · {tasks.length} задач
          </span>
        </div>
        {user && <Auth onAuth={setUser} />}
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
          onReorderEpics={handleReorderEpics}
          onReorderTasks={handleReorderTasks}
        />
      )}
      {tab === 'gantt' && (
        <GanttView epics={epics} tasks={tasks} />
      )}
      {tab === 'sprint' && (
        <SprintReview 
          tasks={tasks} 
          settings={settings}
          onSaveHistory={handleSaveSprintHistory}
        />
      )}
      {tab === 'settings' && (
        <SettingsView 
          settings={settings}
          onSave={handleSaveSettings}
        />
      )}
      {tab === 'retro' && (
        <RetroView />
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '3rem', 
        paddingBottom: '1rem', 
        textAlign: 'center', 
        fontSize: 11, 
        color: 'var(--tx3)',
        borderTop: '0.5px solid var(--bd)',
        marginLeft: '-1rem',
        marginRight: '-1rem',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}>
        Developed by{' '}
        <a 
          href="https://vibecodify.ru" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: 'var(--tx2)', textDecoration: 'none', fontWeight: 500 }}
        >
          vibecodify.ru
        </a>
        {' '}studio, founded by Mikhail Eroshnikin
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          mode={modal.mode}
          ctx={modal.ctx}
          epics={epics}
          settings={settings}
          onSave={handleSave}
          onDelete={modal.mode === 'epic-edit' || modal.mode === 'task-edit' ? handleDelete : null}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
