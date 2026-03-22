import { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS, SPRINTS } from '../../services/store.js'
import TaskRow from './TaskRow.jsx'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }

// Static colors for known statuses; custom statuses get a neutral style
const STATUS_BG = {
  backlog: '#F1EFE8',
  ready: '#FAEEDA',
  wip: '#E6F1FB',
  done: '#EAF3DE',
  frozen: '#FCEBEB',
}
const STATUS_TX = {
  backlog: '#5F5E5A',
  ready: '#854F0B',
  wip: '#185FA5',
  done: '#3B6D11',
  frozen: '#A32D2D',
}

const SEL_STYLE = {
  fontSize: 12,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--bd2)',
  background: 'var(--bg2)',
  color: 'var(--tx2)',
  cursor: 'pointer',
}

function Badge({ status, statusLabels }) {
  const label = (statusLabels && statusLabels[status]) || STATUS_LABELS[status] || status
  const bg = STATUS_BG[status] || '#F1EFE8'
  const tx = STATUS_TX[status] || '#5F5E5A'
  return (
    <span
      style={{
        fontSize: 11,
        padding: '3px 8px',
        borderRadius: 99,
        background: bg,
        color: tx,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function PrioLabel({ priority, priorityLabels }) {
  const label = (priorityLabels && priorityLabels[priority]) || PRIO_LABELS[priority] || priority
  const color = PRIO_COLORS[priority] || '#888780'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: 11, color: 'var(--tx2)', whiteSpace: 'nowrap' }}>{label}</span>
    </span>
  )
}

// Persist collapsed state to localStorage
function useCollapsed(key) {
  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}')
    } catch {
      return {}
    }
  })
  const toggle = id =>
    setState(c => {
      const next = { ...c, [id]: !c[id] }
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {}
      return next
    })
  return [state, toggle]
}

export default function EpicsView({
  epics,
  tasks,
  onAddEpic,
  onEditEpic,
  onAddTask,
  onEditTask,
  onAddSub,
  onReorderEpics,
  onReorderTasks,
  settings,
}) {
  const statusLabels = settings?.statusLabels || STATUS_LABELS
  const priorityLabels = settings?.priorityLabels || PRIO_LABELS

  const [collapsed, toggleCollapsed] = useCollapsed('rm_collapsed_epics')
  const [collapsedTasks, toggleCollapsedTask] = useCollapsed('rm_collapsed_tasks')

  const [draggedEpic, setDraggedEpic] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverTask, setDragOverTask] = useState(null)
  const [hoveringEpic, setHoveringEpic] = useState(null)

  // Filters
  const [sprintFilter, setSprintFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [prioFilter, setPrioFilter] = useState('all')

  const allStatuses = settings?.statuses || Object.keys(STATUS_LABELS)
  const allPriorities = settings?.priorities || Object.keys(PRIO_LABELS)
  const allAssignees = [...new Set(tasks.map(t => t.assignee).filter(Boolean))]

  // Task filter predicate
  const taskMatches = t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false
    if (prioFilter !== 'all' && t.priority !== prioFilter) return false
    return true
  }

  // Epic drag
  const handleEpicDragStart = (e, epic) => {
    setDraggedEpic(epic)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleEpicDragOver = e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  const handleEpicDrop = (e, targetEpic) => {
    e.preventDefault()
    if (!draggedEpic || draggedEpic.id === targetEpic.id) {
      setDraggedEpic(null)
      return
    }
    const from = epics.findIndex(ep => ep.id === draggedEpic.id)
    const to = epics.findIndex(ep => ep.id === targetEpic.id)
    if (from !== -1 && to !== -1) onReorderEpics(from, to)
    setDraggedEpic(null)
  }

  // Task drag — use dataTransfer to carry task id (avoids stale closure issues)
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    e.stopPropagation()
  }

  const handleTaskDragOver = (e, targetTask) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedTask) return
    if (
      draggedTask.epicId === targetTask.epicId &&
      draggedTask.parentId === targetTask.parentId &&
      draggedTask.id !== targetTask.id
    ) {
      e.dataTransfer.dropEffect = 'move'
      setDragOverTask(targetTask.id)
    } else {
      e.dataTransfer.dropEffect = 'none'
      setDragOverTask(null)
    }
  }

  const handleTaskDragEnd = () => {
    setDraggedTask(null)
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
    if (draggedTask.epicId === targetTask.epicId && draggedTask.parentId === targetTask.parentId) {
      const epicTasks = tasks.filter(
        t => t.epicId === targetTask.epicId && t.parentId === targetTask.parentId
      )
      const from = epicTasks.findIndex(t => t.id === draggedTask.id)
      const to = epicTasks.findIndex(t => t.id === targetTask.id)
      if (from !== -1 && to !== -1)
        onReorderTasks(draggedTask.epicId, draggedTask.parentId, from, to)
    }
    setDraggedTask(null)
  }

  const activeFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || prioFilter !== 'all'

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Эпики</span>

        <select
          value={sprintFilter}
          onChange={e => setSprintFilter(e.target.value)}
          style={SEL_STYLE}
        >
          <option value="all">Все спринты</option>
          {SPRINTS.map(sp => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={SEL_STYLE}
        >
          <option value="all">Все статусы</option>
          {allStatuses.map(st => (
            <option key={st} value={st}>
              {statusLabels[st] || st}
            </option>
          ))}
        </select>

        <select value={prioFilter} onChange={e => setPrioFilter(e.target.value)} style={SEL_STYLE}>
          <option value="all">Все приоритеты</option>
          {allPriorities.map(pr => (
            <option key={pr} value={pr}>
              {priorityLabels[pr] || pr}
            </option>
          ))}
        </select>

        <select
          value={assigneeFilter}
          onChange={e => setAssigneeFilter(e.target.value)}
          style={SEL_STYLE}
        >
          <option value="all">Все ответственные</option>
          {allAssignees.map(a => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        {activeFilters && (
          <button
            onClick={() => {
              setStatusFilter('all')
              setAssigneeFilter('all')
              setPrioFilter('all')
            }}
            style={{
              fontSize: 11,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid var(--bd2)',
              background: 'transparent',
              color: '#E24B4A',
              cursor: 'pointer',
            }}
          >
            × Сбросить
          </button>
        )}

        <button
          onClick={onAddEpic}
          style={{
            fontSize: 13,
            padding: '7px 14px',
            borderRadius: 7,
            border: '1px solid var(--bd2)',
            background: 'var(--bg2)',
            color: 'var(--tx)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          + Эпик
        </button>
        <button
          onClick={() => {
            if (epics.length === 0) {
              alert('Сначала создайте эпик')
              return
            }
            onAddTask()
          }}
          style={{
            fontSize: 13,
            padding: '7px 14px',
            borderRadius: 7,
            border: 'none',
            background: 'var(--tx)',
            color: 'var(--bg)',
            cursor: 'pointer',
            fontWeight: 600,
            opacity: epics.length === 0 ? 0.5 : 1,
          }}
        >
          + Задача
        </button>
      </div>

      {epics
        .filter(ep => sprintFilter === 'all' || ep.sprint === sprintFilter)
        .map(ep => {
          const rootTasks = tasks.filter(t => t.epicId === ep.id && !t.parentId)
          const allEpicTasks = tasks.filter(t => t.epicId === ep.id)
          const allDone = allEpicTasks.filter(t => t.status === 'done').length
          const prog = allEpicTasks.length ? Math.round((allDone / allEpicTasks.length) * 100) : 0
          const open = !collapsed[ep.id]
          const isHoveringEpic = hoveringEpic === ep.id

          // Apply task filters
          const visibleRootTasks = rootTasks.filter(t => {
            if (!taskMatches(t)) {
              // Show parent if any subtask matches
              const subs = tasks.filter(s => s.parentId === t.id)
              return subs.some(taskMatches)
            }
            return true
          })

          return (
            <div
              key={ep.id}
              style={{
                marginBottom: '1.2rem',
                border: '1px solid var(--bd)',
                borderRadius: 10,
                overflow: 'hidden',
                opacity: draggedEpic?.id === ep.id ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
              draggable
              onDragStart={e => handleEpicDragStart(e, ep)}
              onDragOver={handleEpicDragOver}
              onDrop={e => handleEpicDrop(e, ep)}
              onMouseEnter={() => setHoveringEpic(ep.id)}
              onMouseLeave={() => setHoveringEpic(null)}
            >
              {/* Epic header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--bg2)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleCollapsed(ep.id)}
              >
                <span
                  style={{
                    fontSize: 15,
                    color: 'var(--tx3)',
                    opacity: isHoveringEpic ? 0.8 : 0.25,
                    transition: 'opacity 0.15s',
                    userSelect: 'none',
                  }}
                >
                  ⋮⋮
                </span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: ep.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>
                  {ep.name}
                </span>
                <span style={{ fontSize: 12, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
                  {ep.sprint} · {allEpicTasks.length} задач
                </span>
                <div
                  style={{
                    width: 80,
                    height: 4,
                    background: 'var(--bd)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${prog}%`,
                      background: ep.color,
                      borderRadius: 2,
                      transition: 'width .3s',
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: 'var(--tx3)', minWidth: 30 }}>{prog}%</span>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onEditEpic(ep)
                  }}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: '1px solid var(--bd2)',
                    background: 'transparent',
                    color: 'var(--tx2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Изм.
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onAddTask(ep)
                  }}
                  style={{
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: '1px solid var(--bd2)',
                    background: 'transparent',
                    color: 'var(--tx2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + задача
                </button>
                <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{open ? '▲' : '▼'}</span>
              </div>

              {open && (
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      minWidth: 1050,
                      tableLayout: 'fixed',
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--bd)', background: 'var(--bg)' }}>
                        <th style={{ ...TH, width: '30%' }}>Задача</th>
                        <th style={{ ...TH, width: '12%' }}>Статус</th>
                        <th style={{ ...TH, width: '12%' }}>Приоритет</th>
                        <th style={{ ...TH, width: '11%' }}>Ответств.</th>
                        <th style={{ ...TH, width: '9%' }}>Спринт</th>
                        <th style={{ ...TH, width: '6%' }}>Усилие</th>
                        <th style={{ ...TH, width: '10%' }}>Оценка</th>
                        <th style={{ ...TH, width: '10%' }}>Дедлайн</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleRootTasks.map(t => {
                        const subTasks = tasks.filter(s => s.parentId === t.id)
                        const visibleSubs = subTasks.filter(taskMatches)
                        const isTaskCollapsed = collapsedTasks[t.id]
                        return (
                          <Fragment key={t.id}>
                            <TaskRow
                              task={t}
                              isSub={false}
                              onEdit={onEditTask}
                              onAddSub={onAddSub}
                              onDragStart={handleTaskDragStart}
                              onDragOver={e => handleTaskDragOver(e, t)}
                              onDrop={handleTaskDrop}
                              onDragEnd={handleTaskDragEnd}
                              isDragging={draggedTask?.id === t.id}
                              isDragOver={dragOverTask === t.id}
                              statusLabels={statusLabels}
                              priorityLabels={priorityLabels}
                              useStoryPoints={settings?.useStoryPoints}
                              subTasks={subTasks}
                              collapsedTasks={collapsedTasks}
                              onToggleSubtasks={toggleCollapsedTask}
                            />
                            {!isTaskCollapsed &&
                              visibleSubs.map(sub => (
                                <TaskRow
                                  key={sub.id}
                                  task={sub}
                                  isSub={true}
                                  onEdit={onEditTask}
                                  onAddSub={onAddSub}
                                  onDragStart={handleTaskDragStart}
                                  onDragOver={e => handleTaskDragOver(e, sub)}
                                  onDrop={handleTaskDrop}
                                  onDragEnd={handleTaskDragEnd}
                                  isDragging={draggedTask?.id === sub.id}
                                  isDragOver={dragOverTask === sub.id}
                                  statusLabels={statusLabels}
                                  priorityLabels={priorityLabels}
                                  useStoryPoints={settings?.useStoryPoints}
                                  collapsedTasks={collapsedTasks}
                                  onToggleSubtasks={toggleCollapsedTask}
                                />
                              ))}
                          </Fragment>
                        )
                      })}
                      {visibleRootTasks.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            style={{
                              padding: '14px 16px',
                              fontSize: 13,
                              color: 'var(--tx3)',
                              fontStyle: 'italic',
                            }}
                          >
                            {activeFilters
                              ? 'Нет задач по выбранным фильтрам'
                              : 'Нет задач — добавь первую'}
                          </td>
                        </tr>
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

const TH = {
  fontSize: 11,
  color: 'var(--tx3)',
  fontWeight: 600,
  padding: '7px 12px',
  textAlign: 'left',
  background: 'var(--bg)',
}
