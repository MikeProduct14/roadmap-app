import React, { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS, SPRINTS } from './store.js'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }
const STATUS_BG = { backlog: '#F1EFE8', ready: '#FAEEDA', wip: '#E6F1FB', done: '#EAF3DE', frozen: '#FCEBEB' }
const STATUS_TX = { backlog: '#5F5E5A', ready: '#854F0B', wip: '#185FA5', done: '#3B6D11', frozen: '#A32D2D' }
const ART_COLORS = { pdf: { bg: '#FCEBEB', tx: '#A32D2D' }, doc: { bg: '#E6F1FB', tx: '#185FA5' }, link: { bg: '#EAF3DE', tx: '#3B6D11' } }

function Badge({ status, statusLabels }) {
  const label = (statusLabels && statusLabels[status]) || STATUS_LABELS[status] || status
  return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: STATUS_BG[status] || '#F1EFE8', color: STATUS_TX[status] || '#5F5E5A', fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
}

function PrioDot({ priority, priorityLabels }) {
  const label = (priorityLabels && priorityLabels[priority]) || PRIO_LABELS[priority] || priority
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: PRIO_COLORS[priority] || '#888780', display: 'inline-block', flexShrink: 0 }} title={label} />
}

function ArtIcon({ type }) {
  const c = ART_COLORS[type] || ART_COLORS.link
  return <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: c.bg, color: c.tx, fontWeight: 700 }}>{type.toUpperCase()}</span>
}

function TaskRow({ task, isSub, onEdit, onAddSub, onDragStart, onDragOver, onDrop, isDragging, isDragOver, statusLabels, priorityLabels, useStoryPoints, subTasks, collapsedTasks, onToggleSubtasks }) {
  const [isHovering, setIsHovering] = React.useState(false)
  
  // Check if deadline is overdue
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()
  
  // Check if task needs estimation
  const needsEstimation = (task.storyPoints === 0 || task.storyPoints === undefined) && (task.estimateHours === 0 || task.estimateHours === undefined)
  
  const hasSubtasks = subTasks && subTasks.length > 0
  const isCollapsed = collapsedTasks && collapsedTasks[task.id]

  return (
    <tr 
      style={{ 
        borderBottom: '0.5px solid var(--bd)',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        background: isDragOver ? 'rgba(55, 138, 221, 0.1)' : (isHovering ? 'var(--bg2)' : 'transparent'),
        transition: 'all 0.2s ease',
        transform: isDragging ? 'scale(1.03) rotate(2deg)' : 'scale(1)',
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
      }}
      draggable={true}
      onDragStart={(e) => onDragStart(e, task)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, task)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      data-task-id={task.id}
    >
      <td style={{ padding: '10px 16px', width: '32%' }}>
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
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                flex: 1,
                fontWeight: 500,
                lineHeight: 1.4
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
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {hasSubtasks && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleSubtasks(task.id); }} 
                    style={{ 
                      fontSize: 10, 
                      padding: '3px 8px', 
                      borderRadius: 4, 
                      border: '1px solid var(--bd2)', 
                      background: 'transparent', 
                      color: 'var(--tx3)', 
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isCollapsed ? `▶ ${subTasks.length} подзадач` : `▼ ${subTasks.length} подзадач`}
                  </button>
                )}
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
                    whiteSpace: 'nowrap'
                  }}
                >
                  + подзадача
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 16px', width: '11%' }}><Badge status={task.status} statusLabels={statusLabels} /></td>
      <td style={{ padding: '10px 16px', width: '7%' }}><PrioDot priority={task.priority} priorityLabels={priorityLabels} /></td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--tx2)', width: '11%' }}>{task.assignee || 'Не назначен'}</td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--tx2)', width: '10%' }}>{task.sprint}</td>
      <td style={{ padding: '10px 16px', width: '7%' }}>
        <span style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, background: 'var(--bg2)', color: 'var(--tx3)', fontWeight: 500 }}>{task.effort}</span>
      </td>
      <td style={{ padding: '10px 16px', width: '10%' }}>
        {needsEstimation ? (
          <span style={{ fontSize: 10, padding: '3px 7px', borderRadius: 5, background: '#FCEBEB', color: '#A32D2D', fontWeight: 500 }}>Ожидает оценки</span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--tx2)' }}>
            {useStoryPoints ? `${task.storyPoints} SP` : `${task.estimateHours} ч`}
          </span>
        )}
      </td>
      <td style={{ padding: '10px 16px', fontSize: 11, color: isOverdue ? '#E24B4A' : 'var(--tx3)', width: '12%', fontWeight: isOverdue ? 600 : 400 }}>
        {task.deadline || '—'}
        {isOverdue && ' ⚠️'}
      </td>
    </tr>
  )
}

export default function EpicsView({ epics, tasks, onAddEpic, onEditEpic, onAddTask, onEditTask, onAddSub, onReorderEpics, onReorderTasks, settings }) {
  const statusLabels = settings?.statusLabels
  const priorityLabels = settings?.priorityLabels
  const [collapsed, setCollapsed] = useState({})
  const [collapsedTasks, setCollapsedTasks] = useState({})
  const [draggedEpic, setDraggedEpic] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverTask, setDragOverTask] = useState(null)
  const [hoveringEpic, setHoveringEpic] = useState(null)
  const [sprintFilter, setSprintFilter] = useState('all')

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }))
  const toggleSubtasks = id => setCollapsedTasks(c => ({ ...c, [id]: !c[id] }))

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

  const handleTaskDragOver = (e, targetTask) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedTask && targetTask) {
      // Allow drop only within same epic and same parent level
      if (draggedTask.epicId === targetTask.epicId && draggedTask.parentId === targetTask.parentId) {
        e.dataTransfer.dropEffect = 'move'
        setDragOverTask(targetTask.id)
      } else {
        e.dataTransfer.dropEffect = 'none'
        setDragOverTask(null)
      }
    }
  }
  
  const handleTaskDragLeave = () => {
    setDragOverTask(null)
  }

  const handleTaskDrop = (e, targetTask) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverTask(null)
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setDraggedTask(null)
      return
    }
    
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
        
        <select 
          value={sprintFilter} 
          onChange={e => setSprintFilter(e.target.value)}
          style={{ 
            fontSize: 12, 
            padding: '6px 10px', 
            borderRadius: 6, 
            border: '1px solid var(--bd2)', 
            background: 'var(--bg2)', 
            color: 'var(--tx2)',
            cursor: 'pointer'
          }}
        >
          <option value="all">Все спринты</option>
          {SPRINTS.map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>
        
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

      {epics.filter(ep => sprintFilter === 'all' || ep.sprint === sprintFilter).map(ep => {
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
              <span style={{ fontSize: 12, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>{ep.sprint} · {allEpicTasks.length} задач</span>
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
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100, tableLayout: 'fixed' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 10 }}>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '32%' }}>Задача</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '11%' }}>Статус</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '7%' }}>Приор.</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '11%' }}>Ответств.</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '10%' }}>Спринт</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '7%' }}>Усилие</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '10%' }}>Оценка</th>
                      <th style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600, padding: '8px 16px', textAlign: 'left', background: 'var(--bg)', width: '12%' }}>Дедлайн</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rootTasks.map(t => {
                      const subTasks = tasks.filter(s => s.parentId === t.id)
                      const isTaskCollapsed = collapsedTasks[t.id]
                      
                      return (
                        <React.Fragment key={t.id}>
                          <TaskRow 
                            task={t} 
                            isSub={false} 
                            onEdit={onEditTask} 
                            onAddSub={onAddSub}
                            onDragStart={handleTaskDragStart}
                            onDragOver={(e) => handleTaskDragOver(e, t)}
                            onDrop={handleTaskDrop}
                            isDragging={draggedTask?.id === t.id}
                            isDragOver={dragOverTask === t.id}
                            statusLabels={statusLabels}
                            priorityLabels={priorityLabels}
                            useStoryPoints={settings?.useStoryPoints}
                            subTasks={subTasks}
                            collapsedTasks={collapsedTasks}
                            onToggleSubtasks={toggleSubtasks}
                          />
                          {!isTaskCollapsed && subTasks.map(sub => (
                            <TaskRow 
                              key={sub.id} 
                              task={sub} 
                              isSub={true} 
                              onEdit={onEditTask} 
                              onAddSub={onAddSub}
                              onDragStart={handleTaskDragStart}
                              onDragOver={(e) => handleTaskDragOver(e, sub)}
                              onDrop={handleTaskDrop}
                              isDragging={draggedTask?.id === sub.id}
                              isDragOver={dragOverTask === sub.id}
                              statusLabels={statusLabels}
                              priorityLabels={priorityLabels}
                              useStoryPoints={settings?.useStoryPoints}
                              collapsedTasks={collapsedTasks}
                              onToggleSubtasks={toggleSubtasks}
                            />
                          ))}
                        </React.Fragment>
                      )
                    })}
                    {rootTasks.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: '14px 16px', fontSize: 14, color: 'var(--tx3)', fontStyle: 'italic' }}>Нет задач — добавь первую</td></tr>
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
