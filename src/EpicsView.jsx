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
  const [isHovering, setIsHovering] = React.useState(false)
  
  // Check if deadline is overdue
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()

  return (
    <tr 
      style={{ 
        borderBottom: '0.5px solid var(--bd)',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        background: isHovering ? 'var(--bg2)' : 'transparent',
        transition: 'background 0.15s ease, opacity 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      data-task-id={task.id}
    >
      <td style={{ padding: '10px 16px', width: '35%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span 
            style={{ 
              fontSize: 14, 
              color: 'var(--tx3)', 
              cursor: 'grab',
              opacity: isHovering ? 1 : 0.3,
              transition: 'opacity 0.2s ease',
              userSelect: 'none',
              lineHeight: 1,
              flexShrink: 0
            }}
            title="Перетащите для изменения порядка"
          >
            ⋮⋮
          </span>
          <div style={{ flex: 1, cursor: 'pointer', paddingLeft: isSub ? 24 : 0 }} onClick={() => onEdit(task)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: task.description ? 4 : 0 }}>
              {isSub && <span style={{ fontSize: 10, color: 'var(--tx3)' }}>↳</span>}
              <span style={{ 
                fontSize: 13, 
                color: 'var(--tx)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                flex: 1,
                fontWeight: 500
              }}>{task.name}</span>
              {task.artifacts?.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }} title={task.artifacts.map(a => a.name).join(', ')}>
                  📎{task.artifacts.length}
                </span>
              )}
              {task.comments?.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }} title={`${task.comments.length} комментариев`}>
                  💬{task.comments.length}
                </span>
              )}
            </div>
            {task.description && (
              <div style={{ 
                fontSize: 11, 
                color: 'var(--tx3)', 
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4
              }}>
                {task.description}
              </div>
            )}
            {task.artifacts?.length > 0 && (
              <div style={{ display: 'flex', gap: 5, marginTop: 5, paddingLeft: 0, flexWrap: 'wrap' }}>
                {task.artifacts.map((a, i) => (
                  <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--tx2)' }}>
                    <ArtIcon type={a.type} />
                    {a.url ? <a href={a.url} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', textDecoration: 'none' }}>{a.name}</a> : <span>{a.name}</span>}
                  </span>
                ))}
              </div>
            )}
            {!isSub && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAddSub(task); }} 
                style={{ 
                  fontSize: 10, 
                  padding: '3px 8px', 
                  borderRadius: 4, 
                  border: '1px solid var(--bd2)', 
                  background: 'transparent', 
                  color: 'var(--tx3)', 
                  cursor: 'pointer',
                  marginTop: 6,
                  whiteSpace: 'nowrap'
                }}
              >
                + подзадача
              </button>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 16px', width: '12%' }}><Badge status={task.status} /></td>
      <td style={{ padding: '10px 16px', width: '8%' }}><PrioDot priority={task.priority} /></td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--tx2)', width: '12%' }}>{task.assignee || 'Не назначен'}</td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--tx2)', width: '11%' }}>{task.sprint}</td>
      <td style={{ padding: '10px 16px', width: '8%' }}>
        <span style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, background: 'var(--bg2)', color: 'var(--tx3)', fontWeight: 500 }}>{task.effort}</span>
      </td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: isOverdue ? '#E24B4A' : 'var(--tx3)', width: '14%', fontWeight: isOverdue ? 600 : 400 }}>
        {task.deadline || '—'}
        {isOverdue && ' ⚠️'}
      </td>
    </tr>
  )
}

export default function EpicsView({ epics, tasks, onAddEpic, onEditEpic, onAddTask, onEditTask, onAddSub, onReorderEpics, onReorderTasks }) {
  const [collapsed, setCollapsed] = useState({})
  const [draggedEpic, setDraggedEpic] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [hoveringEpic, setHoveringEpic] = useState(null)

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
    e.stopPropagation()
    
    // Visual feedback: check if drop is allowed
    if (draggedTask) {
      const targetElement = e.currentTarget
      const targetTask = tasks.find(t => {
        // Find task by checking if element contains task data
        return targetElement.querySelector(`[data-task-id="${t.id}"]`) !== null
      })
      
      if (targetTask && draggedTask.epicId === targetTask.epicId && draggedTask.parentId === targetTask.parentId) {
        e.dataTransfer.dropEffect = 'move'
      } else {
        e.dataTransfer.dropEffect = 'none'
      }
    }
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
        <button 
          onClick={() => {
            if (epics.length === 0) {
              alert('Сначала создайте эпик')
              return
            }
            onAddTask()
          }} 
          style={{ fontSize: 13, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 600, opacity: epics.length === 0 ? 0.5 : 1 }}
        >
          + Задача
        </button>
      </div>

      {epics.map(ep => {
        const rootTasks = tasks.filter(t => t.epicId === ep.id && !t.parentId)
        const allEpicTasks = tasks.filter(t => t.epicId === ep.id)
        const allDone = allEpicTasks.filter(t => t.status === 'done').length
        const prog = allEpicTasks.length ? Math.round(allDone / allEpicTasks.length * 100) : 0
        const open = !collapsed[ep.id]
        const isHoveringEpic = hoveringEpic === ep.id

        return (
          <div 
            key={ep.id} 
            style={{ 
              marginBottom: '1.2rem', 
              border: '1px solid var(--bd)', 
              borderRadius: 10, 
              overflow: 'hidden',
              opacity: draggedEpic?.id === ep.id ? 0.4 : 1,
              transition: 'opacity 0.2s ease, transform 0.15s ease',
              transform: draggedEpic?.id === ep.id ? 'scale(1.02)' : 'scale(1)',
            }}
            draggable={true}
            onDragStart={(e) => handleEpicDragStart(e, ep)}
            onDragOver={handleEpicDragOver}
            onDrop={(e) => handleEpicDrop(e, ep)}
            onMouseEnter={() => setHoveringEpic(ep.id)}
            onMouseLeave={() => setHoveringEpic(null)}
          >
            <div
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '13px 16px', 
                background: 'var(--bg2)', 
                cursor: 'grab', 
                userSelect: 'none',
                transition: 'background 0.15s ease'
              }}
              onClick={() => toggle(ep.id)}
            >
              <span 
                style={{ 
                  fontSize: 16, 
                  color: 'var(--tx3)', 
                  cursor: 'grab',
                  opacity: isHoveringEpic ? 1 : 0.3,
                  transition: 'opacity 0.2s ease',
                  lineHeight: 1,
                  marginRight: -4
                }}
                title="Перетащите для изменения порядка"
              >
                ⋮⋮
              </span>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: ep.color, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{ep.name}</span>
              <span style={{ fontSize: 12, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>{ep.sprint} · {rootTasks.length} задач</span>
              <div style={{ width: 90, height: 4, background: 'var(--bd)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: ep.color, borderRadius: 2, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--tx3)', minWidth: 32 }}>{prog}%</span>
              <button
                onClick={e => { e.stopPropagation(); onEditEpic(ep) }}
                style={{ fontSize: 12, padding: '5px 10px', borderRadius: 5, border: '1px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer', minHeight: 30, whiteSpace: 'nowrap' }}
              >Изм.</button>
              <button
                onClick={e => { e.stopPropagation(); onAddTask(ep) }}
                style={{ fontSize: 12, padding: '5px 10px', borderRadius: 5, border: '1px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer', minHeight: 30, whiteSpace: 'nowrap' }}
              >+ задача</button>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{open ? '▲' : '▼'}</span>
            </div>

            {open && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900, tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '35%' }}>Задача</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '12%' }}>Статус</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '8%' }}>Приор.</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '12%' }}>Ответств.</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '11%' }}>Спринт</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '8%' }}>Усилие</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '14%' }}>Дедлайн</th>
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
