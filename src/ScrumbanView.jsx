import React, { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS, SPRINTS } from './store.js'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }
const STATUS_BG = { backlog: '#F1EFE8', ready: '#FAEEDA', wip: '#E6F1FB', done: '#EAF3DE', frozen: '#FCEBEB' }
const STATUS_TX = { backlog: '#5F5E5A', ready: '#854F0B', wip: '#185FA5', done: '#3B6D11', frozen: '#A32D2D' }

const s = {
  container: { padding: '0 0 2rem' },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem', flexWrap: 'wrap' },
  sprintSelect: { fontSize: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx2)', cursor: 'pointer' },
  board: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 },
  column: { minWidth: 280, flex: '1 1 280px', background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 10, padding: '12px', maxWidth: 350 },
  columnHeader: { fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  columnCount: { fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 99, background: 'var(--bg2)', color: 'var(--tx3)' },
  card: { background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 8, padding: '12px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s ease' },
  cardHover: { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 6, lineHeight: 1.4 },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11, color: 'var(--tx3)' },
  epicBadge: { fontSize: 10, padding: '3px 8px', borderRadius: 5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' },
  prioDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  assignee: { fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--tx2)', whiteSpace: 'nowrap' },
  effort: { fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg3)', color: 'var(--tx3)', fontWeight: 500 },
  emptyColumn: { fontSize: 12, color: 'var(--tx3)', fontStyle: 'italic', textAlign: 'center', padding: '20px 10px' },
}

function TaskCard({ task, epic, onClick, priorityLabels }) {
  const [isHovering, setIsHovering] = useState(false)
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()
  const prioLabel = (priorityLabels && priorityLabels[task.priority]) || PRIO_LABELS[task.priority] || task.priority

  return (
    <div 
      style={{ 
        ...s.card, 
        ...(isHovering ? s.cardHover : {}),
        borderLeft: `3px solid ${epic?.color || '#888780'}`
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div style={s.cardTitle}>{task.name}</div>
      <div style={s.cardMeta}>
        {epic && (
          <span style={{ ...s.epicBadge, background: epic.color }}>
            {epic.name}
          </span>
        )}
        <span style={{ ...s.prioDot, background: PRIO_COLORS[task.priority] || '#888780' }} title={prioLabel} />
        {task.assignee && task.assignee !== 'Не назначен' && (
          <span style={s.assignee}>{task.assignee}</span>
        )}
        <span style={s.effort}>{task.effort}</span>
        {task.storyPoints > 0 && (
          <span style={s.effort}>{task.storyPoints} SP</span>
        )}
        {task.deadline && (
          <span style={{ color: isOverdue ? '#E24B4A' : 'var(--tx3)', fontWeight: isOverdue ? 600 : 400 }}>
            {task.deadline}
            {isOverdue && ' ⚠️'}
          </span>
        )}
        {task.comments?.length > 0 && (
          <span>💬 {task.comments.length}</span>
        )}
        {task.artifacts?.length > 0 && (
          <span>📎 {task.artifacts.length}</span>
        )}
      </div>
    </div>
  )
}

function Column({ status, tasks, epics, onTaskClick, statusLabel, priorityLabels }) {
  return (
    <div style={s.column}>
      <div style={s.columnHeader}>
        <span>{statusLabel}</span>
        <span style={s.columnCount}>{tasks.length}</span>
      </div>
      {tasks.length === 0 ? (
        <div style={s.emptyColumn}>Нет задач</div>
      ) : (
        tasks.map(task => {
          const epic = epics.find(e => e.id === task.epicId)
          return (
            <TaskCard 
              key={task.id} 
              task={task} 
              epic={epic}
              priorityLabels={priorityLabels}
              onClick={() => onTaskClick(task)}
            />
          )
        })
      )}
    </div>
  )
}

export default function ScrumbanView({ epics, tasks, onEditTask, settings }) {
  const statusLabels = settings?.statusLabels || STATUS_LABELS
  const priorityLabels = settings?.priorityLabels || PRIO_LABELS
  const [sprintFilter, setSprintFilter] = useState('Sprint 1')

  // Filter tasks by sprint and exclude subtasks
  const filteredTasks = tasks.filter(t => 
    (sprintFilter === 'all' || t.sprint === sprintFilter) && !t.parentId
  )

  // Group tasks by status
  const statuses = ['backlog', 'ready', 'wip', 'done', 'frozen']
  const tasksByStatus = statuses.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(t => t.status === status)
    return acc
  }, {})

  // Calculate sprint metrics
  const totalTasks = filteredTasks.length
  const wipTasks = tasksByStatus.wip.length
  const doneTasks = tasksByStatus.done.length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div style={s.container}>
      <div style={s.header}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>
          Scrumban
        </span>
        
        <select 
          value={sprintFilter} 
          onChange={e => setSprintFilter(e.target.value)}
          style={s.sprintSelect}
        >
          <option value="all">Все спринты</option>
          {SPRINTS.filter(sp => sp !== 'Backlog').map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>
      </div>

      {/* Sprint metrics */}
      {sprintFilter !== 'all' && (
        <div style={{ 
          background: 'var(--bg)', 
          border: '1px solid var(--bd)', 
          borderRadius: 10, 
          padding: '16px 20px', 
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>Спринт</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>{sprintFilter}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>WIP лимит</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: wipTasks > 3 ? '#E24B4A' : 'var(--tx)' }}>
              {wipTasks} {wipTasks > 3 && '⚠️'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>Прогресс</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)' }}>{progress}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 6 }}>
              {doneTasks} из {totalTasks} готово
            </div>
            <div style={{ 
              height: 6, 
              background: 'var(--bd)', 
              borderRadius: 3, 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                width: `${progress}%`, 
                background: progress >= 70 ? '#3B6D11' : progress >= 40 ? '#EF9F27' : '#E24B4A',
                transition: 'width 0.3s ease',
                borderRadius: 3
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Kanban board */}
      <div style={s.board}>
        {statuses.map(status => (
          <Column 
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            epics={epics}
            onTaskClick={onEditTask}
            statusLabel={statusLabels[status] || status}
            priorityLabels={priorityLabels}
          />
        ))}
      </div>
    </div>
  )
}
