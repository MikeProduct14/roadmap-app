import { useState, useMemo } from 'react'
import { STATUS_LABELS, PRIO_LABELS, SPRINTS } from '../../services/store.js'
import MultiSelect from '../common/MultiSelect.jsx'
import { PRIO_COLORS, STATUS_BG, STATUS_TX, SEL_STYLE } from '../../utils/constants.js'
import { sortTasks } from '../../utils/sortTasks.js'

const SEL = SEL_STYLE

const SORT_OPTIONS = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'name_asc', label: 'Название ↑' },
  { value: 'name_desc', label: 'Название ↓' },
  { value: 'priority_asc', label: 'Приоритет ↑' },
  { value: 'priority_desc', label: 'Приоритет ↓' },
  { value: 'deadline_asc', label: 'Дедлайн ↑' },
  { value: 'deadline_desc', label: 'Дедлайн ↓' },
  { value: 'sp_asc', label: 'SP ↑' },
  { value: 'sp_desc', label: 'SP ↓' },
]

const s = {
  container: { padding: '0 0 2rem' },
  board: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 },
  column: {
    minWidth: 260,
    flex: '1 1 260px',
    background: 'var(--bg)',
    border: '1px solid var(--bd)',
    borderRadius: 10,
    padding: '12px',
    maxWidth: 340,
  },
  columnHeader: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--tx)',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnCount: {
    fontSize: 11,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 99,
    background: 'var(--bg2)',
    color: 'var(--tx3)',
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--bd)',
    borderRadius: 8,
    padding: '11px',
    marginBottom: 8,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--tx)',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    fontSize: 11,
    color: 'var(--tx3)',
  },
  epicBadge: {
    fontSize: 10,
    padding: '2px 7px',
    borderRadius: 4,
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  prioDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  assignee: {
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    background: 'var(--bg3)',
    color: 'var(--tx2)',
    whiteSpace: 'nowrap',
  },
  tag: {
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    background: 'var(--bg3)',
    color: 'var(--tx3)',
    fontWeight: 500,
  },
  emptyColumn: {
    fontSize: 12,
    color: 'var(--tx3)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px 10px',
  },
}

function TaskCard({ task, epic, onClick, priorityLabels }) {
  const [hover, setHover] = useState(false)
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()
  const prioLabel =
    (priorityLabels && priorityLabels[task.priority]) || PRIO_LABELS[task.priority] || task.priority
  const prioColor = PRIO_COLORS[task.priority] || '#888780'

  return (
    <div
      style={{
        ...s.card,
        borderLeft: `3px solid ${epic?.color || '#888780'}`,
        ...(hover
          ? { transform: 'translateY(-1px)', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }
          : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={s.cardTitle}>{task.name}</div>
      <div style={s.cardMeta}>
        {epic && <span style={{ ...s.epicBadge, background: epic.color }}>{epic.name}</span>}
        <span style={{ ...s.prioDot, background: prioColor }} title={prioLabel} />
        <span style={{ fontSize: 10, color: prioColor, fontWeight: 500 }}>{prioLabel}</span>
        {task.assignee && task.assignee !== 'Не назначен' && (
          <span style={s.assignee}>{task.assignee}</span>
        )}
        <span style={s.tag}>{task.effort}</span>
        {task.storyPoints > 0 && <span style={s.tag}>{task.storyPoints} SP</span>}
        {task.estimateHours > 0 && !task.storyPoints && (
          <span style={s.tag}>{task.estimateHours} ч</span>
        )}
        {task.deadline && (
          <span
            style={{
              color: isOverdue ? '#E24B4A' : 'var(--tx3)',
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {task.deadline}
            {isOverdue && ' ⚠️'}
          </span>
        )}
        {task.comments?.length > 0 && <span>💬{task.comments.length}</span>}
        {task.artifacts?.length > 0 && <span>📎{task.artifacts.length}</span>}
      </div>
    </div>
  )
}

function Column({ status, tasks, epics, onTaskClick, statusLabel, priorityLabels, sort }) {
  const bg = STATUS_BG[status] || '#F1EFE8'
  const tx = STATUS_TX[status] || '#5F5E5A'

  // Memoize sorted tasks to avoid unnecessary recalculations
  const sorted = useMemo(() => sortTasks(tasks, sort), [tasks, sort])

  return (
    <div style={s.column}>
      <div style={s.columnHeader}>
        <span
          style={{ padding: '2px 8px', borderRadius: 99, background: bg, color: tx, fontSize: 12 }}
        >
          {statusLabel}
        </span>
        <span style={s.columnCount}>{tasks.length}</span>
      </div>
      {sorted.length === 0 ? (
        <div style={s.emptyColumn}>Нет задач</div>
      ) : (
        sorted.map(task => {
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
  const allStatuses = settings?.statuses || Object.keys(STATUS_LABELS)
  const allPriorities = settings?.priorities || Object.keys(PRIO_LABELS)
  const statusLabels = { ...STATUS_LABELS, ...(settings?.statusLabels || {}) }
  allStatuses.forEach(k => {
    if (!statusLabels[k]) statusLabels[k] = k
  })
  const priorityLabels = { ...PRIO_LABELS, ...(settings?.priorityLabels || {}) }
  allPriorities.forEach(k => {
    if (!priorityLabels[k]) priorityLabels[k] = k
  })
  const allAssignees = [
    ...new Set(tasks.map(t => t.assignee).filter(a => a && a !== 'Не назначен')),
  ]

  const [sprintFilter, setSprintFilter] = useState('Sprint 1')
  const [assigneeFilter, setAssigneeFilter] = useState([]) // массив
  const [prioFilter, setPrioFilter] = useState([]) // массив
  const [sort, setSort] = useState('default')

  // Memoize filtered tasks to avoid unnecessary recalculations
  const baseTasks = useMemo(() => {
    return tasks.filter(
      t =>
        (sprintFilter === 'all' || t.sprint === sprintFilter) &&
        !t.parentId &&
        (assigneeFilter.length === 0 || assigneeFilter.includes(t.assignee)) &&
        (prioFilter.length === 0 || prioFilter.includes(t.priority))
    )
  }, [tasks, sprintFilter, assigneeFilter, prioFilter])

  // Memoize tasks grouped by status
  const tasksByStatus = useMemo(() => {
    return allStatuses.reduce((acc, st) => {
      acc[st] = baseTasks.filter(t => t.status === st)
      return acc
    }, {})
  }, [baseTasks, allStatuses])

  const knownSet = new Set(allStatuses)
  const uncategorized = baseTasks.filter(t => !knownSet.has(t.status))

  const totalTasks = baseTasks.length
  const doneStatus = allStatuses.find(s => s === 'done') || allStatuses[allStatuses.length - 1]
  const wipStatus = allStatuses.find(s => s === 'wip') || allStatuses[2]
  const doneTasks = (tasksByStatus[doneStatus] || []).length
  const wipTasks = (tasksByStatus[wipStatus] || []).length
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  const activeFilters = assigneeFilter.length > 0 || prioFilter.length > 0

  return (
    <div style={s.container}>
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
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Scrumban</span>

        <select value={sprintFilter} onChange={e => setSprintFilter(e.target.value)} style={SEL}>
          <option value="all">Все спринты</option>
          {SPRINTS.filter(sp => sp !== 'Backlog').map(sp => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>

        <MultiSelect
          label="Приоритет"
          options={allPriorities.map(pr => ({ value: pr, label: priorityLabels[pr] || pr }))}
          selected={prioFilter}
          onChange={setPrioFilter}
        />

        <MultiSelect
          label="Ответственный"
          options={allAssignees.map(a => ({ value: a, label: a }))}
          selected={assigneeFilter}
          onChange={setAssigneeFilter}
        />

        <select value={sort} onChange={e => setSort(e.target.value)} style={SEL}>
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {activeFilters && (
          <button
            onClick={() => {
              setAssigneeFilter([])
              setPrioFilter([])
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
      </div>

      {/* Sprint metrics */}
      {sprintFilter !== 'all' && (
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--bd)',
            borderRadius: 10,
            padding: '14px 20px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 3 }}>Спринт</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{sprintFilter}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 3 }}>WIP</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: wipTasks > 3 ? '#E24B4A' : 'var(--tx)',
              }}
            >
              {wipTasks}
              {wipTasks > 3 && ' ⚠️'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 3 }}>Прогресс</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{progress}%</div>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 5 }}>
              {doneTasks} из {totalTasks} готово
            </div>
            <div
              style={{ height: 5, background: 'var(--bd)', borderRadius: 3, overflow: 'hidden' }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: progress >= 70 ? '#3B6D11' : progress >= 40 ? '#EF9F27' : '#E24B4A',
                  transition: 'width 0.3s',
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Board */}
      <div style={s.board}>
        {allStatuses.map(status => (
          <Column
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            epics={epics}
            onTaskClick={onEditTask}
            statusLabel={statusLabels[status] || status}
            priorityLabels={priorityLabels}
            sort={sort}
          />
        ))}
        {uncategorized.length > 0 && (
          <Column
            status="__other__"
            tasks={uncategorized}
            epics={epics}
            onTaskClick={onEditTask}
            statusLabel="Прочие"
            priorityLabels={priorityLabels}
            sort={sort}
          />
        )}
      </div>
    </div>
  )
}
