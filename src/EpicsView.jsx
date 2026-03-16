import React, { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS } from './store.js'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }
const STATUS_BG = { backlog: '#F1EFE8', ready: '#FAEEDA', wip: '#E6F1FB', done: '#EAF3DE', frozen: '#FCEBEB' }
const STATUS_TX = { backlog: '#5F5E5A', ready: '#854F0B', wip: '#185FA5', done: '#3B6D11', frozen: '#A32D2D' }
const ART_COLORS = { pdf: { bg: '#FCEBEB', tx: '#A32D2D' }, doc: { bg: '#E6F1FB', tx: '#185FA5' }, link: { bg: '#EAF3DE', tx: '#3B6D11' } }

function Badge({ status }) {
  return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: STATUS_BG[status], color: STATUS_TX[status], fontWeight: 500, whiteSpace: 'nowrap' }}>{STATUS_LABELS[status]}</span>
}

function PrioDot({ priority }) {
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIO_COLORS[priority], display: 'inline-block', flexShrink: 0 }} title={PRIO_LABELS[priority]} />
}

function ArtIcon({ type }) {
  const c = ART_COLORS[type] || ART_COLORS.link
  return <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: c.bg, color: c.tx, fontWeight: 700 }}>{type.toUpperCase()}</span>
}

function TaskRow({ task, isSub, onEdit, onAddSub, onDragStart, onDragOver, onDrop, isDragging }) {
  return (
    <tr 
      style={{ 
        borderBottom: '0.5px solid var(--bd)',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task)}
    >
      <td style={{ padding: '10px 16px', paddingLeft: isSub ? 40 : 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }} onClick={() => onEdit(task)}>
          {isSub && <span style={{ fontSize: 11, color: 'var(--tx3)' }}>↳</span>}
          <span style={{ fontSize: 14, color: 'var(--tx)' }}>{task.name}</span>
          {task.artifacts?.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--tx3)' }} title={task.artifacts.map(a => a.name).join(', ')}>
              📎{task.artifacts.length}
            </span>
          )}
          {task.comments?.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--tx3)' }} title={`${task.comments.length} комментариев`}>
              💬{task.comments.length}
            </span>
          )}
        </div>
        {task.artifacts?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginTop: 5, paddingLeft: isSub ? 18 : 0, flexWrap: 'wrap' }}>
            {task.artifacts.map((a, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx2)' }}>
                <ArtIcon type={a.type} />
                {a.url ? <a href={a.url} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', textDecoration: 'none' }}>{a.name}</a> : <span>{a.name}</span>}
              </span>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: '10px 16px' }}><Badge status={task.status} /></td>
      <td style={{ padding: '10px 16px' }}><PrioDot priority={task.priority} /></td>
      <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--tx2)' }}>{task.sprint}</td>
      <td style={{ padding: '10px 16px' }}>
        <span style={{ fontSize: 11, padding: '3px 7px', borderRadius: 5, background: 'var(--bg2)', color: 'var(--tx3)', fontWeight: 500 }}>{task.effort}</span>
      </td>
      <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--tx3)' }}>{task.deadline || '—'}</td>
      {!isSub && (
        <td style={{ padding: '10px 16px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddSub(task); }} 
            style={{ 
              fontSize: 12, 
              padding: '4px 10px', 
              borderRadius: 5, 
              border: '1px solid var(--bd2)', 
              background: 'transparent', 
              color: 'var(--tx2)', 
              cursor: 'pointer',
              minHeight: 28
            }}
          >
            + подзадача
          </button>
        </td>
      )}
      {isSub && <td />}
    </tr>
  )
}

export default function EpicsView({ epics, tasks, onAddEpic, onEditEpic, onAddTask, onEditTask, onAddSub, onReorderEpics, onReorderTasks }) {
  const [collapsed, setCollapsed] = useState({})
  const [draggedEpic, setDraggedEpic] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  const handleEpicDragStart = (e, epic) => {
    setDraggedEpic(epic)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleEpicDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleEpicDrop = (e, targetEpic) => {
    e.preventDefault()
    if (!draggedEpic || draggedEpic.id === targetEpic.id) return
    
    const fromIndex = epics.findIndex(ep => ep.id === draggedEpic.id)
    const toIndex = epics.findIndex(ep => ep.id === targetEpic.id)
    
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorderEpics(fromIndex, toIndex)
    }
    setDraggedEpic(null)
  }

  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.stopPropagation()
  }

  const handleTaskDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.stopPropagation()
  }

  const handleTaskDrop = (e, targetTask) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedTask || draggedTask.id === targetTask.id) return
    
    // Only reorder tasks within the same epic and same parent level
    if (draggedTask.epicId === targetTask.epicId && draggedTask.parentId === targetTask.parentId) {
      const epicTasks = tasks.filter(t => t.epicId === targetTask.epicId && t.parentId === targetTask.parentId)
      const fromIndex = epicTasks.findIndex(t => t.id === draggedTask.id)
      const toIndex = epicTasks.findIndex(t => t.id === targetTask.id)
      
      if (fromIndex !== -1 && toIndex !== -1) {
        onReorderTasks(draggedTask.epicId, draggedTask.parentId, fromIndex, toIndex)
      }
    }
    setDraggedTask(null)
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Эпики</span>
        <button onClick={onAddEpic} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', cursor: 'pointer', fontWeight: 500 }}>+ Эпик</button>
        <button onClick={onAddTask} style={{ fontSize: 13, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 600 }}>+ Задача</button>
      </div>

      {epics.map(ep => {
        const rootTasks = tasks.filter(t => t.epicId === ep.id && !t.parentId)
        const allDone = tasks.filter(t => t.epicId === ep.id && !t.parentId && t.status === 'done').length
        const prog = rootTasks.length ? Math.round(allDone / rootTasks.length * 100) : 0
        const open = !collapsed[ep.id]

        return (
          <div 
            key={ep.id} 
            style={{ 
              marginBottom: '1.2rem', 
              border: '1px solid var(--bd)', 
              borderRadius: 10, 
              overflow: 'hidden',
              opacity: draggedEpic?.id === ep.id ? 0.5 : 1
            }}
            draggable={true}
            onDragStart={(e) => handleEpicDragStart(e, ep)}
            onDragOver={handleEpicDragOver}
            onDrop={(e) => handleEpicDrop(e, ep)}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'var(--bg2)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => toggle(ep.id)}
            >
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: ep.color, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{ep.name}</span>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{ep.sprint} · {rootTasks.length} задач</span>
              <div style={{ width: 90, height: 4, background: 'var(--bd)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: ep.color, borderRadius: 2, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--tx3)', minWidth: 32 }}>{prog}%</span>
              <button
                onClick={e => { e.stopPropagation(); onEditEpic(ep) }}
                style={{ fontSize: 12, padding: '5px 10px', borderRadius: 5, border: '1px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer', minHeight: 30 }}
              >Изм.</button>
              <button
                onClick={e => { e.stopPropagation(); onAddTask(ep) }}
                style={{ fontSize: 12, padding: '5px 10px', borderRadius: 5, border: '1px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer', minHeight: 30 }}
              >+ задача</button>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{open ? '▲' : '▼'}</span>
            </div>

            {open && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                      {['Задача', 'Статус', 'Приоритет', 'Спринт', 'Усилие', 'Дедлайн', ''].map((h, i) => (
                        <th key={i} style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rootTasks.map(t => (
                      <React.Fragment key={t.id}>
                        <TaskRow 
                          task={t} 
                          isSub={false} 
                          onEdit={onEditTask} 
                          onAddSub={onAddSub}
                          onDragStart={handleTaskDragStart}
                          onDragOver={handleTaskDragOver}
                          onDrop={handleTaskDrop}
                          isDragging={draggedTask?.id === t.id}
                        />
                        {tasks.filter(s => s.parentId === t.id).map(sub => (
                          <TaskRow 
                            key={sub.id} 
                            task={sub} 
                            isSub={true} 
                            onEdit={onEditTask} 
                            onAddSub={onAddSub}
                            onDragStart={handleTaskDragStart}
                            onDragOver={handleTaskDragOver}
                            onDrop={handleTaskDrop}
                            isDragging={draggedTask?.id === sub.id}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                    {rootTasks.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '14px 16px', fontSize: 14, color: 'var(--tx3)', fontStyle: 'italic' }}>Нет задач — добавь первую</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
