import { useState } from 'react'
import Badge from '../common/Badge.jsx'
import PrioLabel from '../common/PrioLabel.jsx'

function TaskRow({
  task,
  isSub,
  onEdit,
  onAddSub,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
  statusLabels,
  priorityLabels,
  useStoryPoints,
  subTasks,
  collapsedTasks,
  onToggleSubtasks,
}) {
  const [isHovering, setIsHovering] = useState(false)
  const isOverdue = task.deadline && task.status !== 'done' && new Date(task.deadline) < new Date()
  const needsEstimation =
    (!task.storyPoints || task.storyPoints === 0) &&
    (!task.estimateHours || task.estimateHours === 0)
  const hasSubtasks = subTasks && subTasks.length > 0
  const isCollapsed = collapsedTasks && collapsedTasks[task.id]

  return (
    <tr
      draggable
      onDragStart={e => onDragStart(e, task)}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, task)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        borderBottom: '0.5px solid var(--bd)',
        borderLeft: isDragOver ? '3px solid #378ADD' : '3px solid transparent',
        opacity: isDragging ? 0.4 : 1,
        background: isDragOver
          ? 'rgba(55,138,221,0.07)'
          : isHovering
            ? 'var(--bg2)'
            : 'transparent',
        transition: 'background 0.12s, border-left 0.12s, opacity 0.15s',
        cursor: 'grab',
      }}
      data-task-id={task.id}
    >
      <td style={{ padding: '10px 16px', width: '30%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          <span
            style={{
              fontSize: 13,
              color: 'var(--tx3)',
              cursor: 'grab',
              opacity: isHovering ? 0.8 : 0.2,
              transition: 'opacity 0.15s',
              userSelect: 'none',
              lineHeight: 1,
              flexShrink: 0,
              paddingTop: 2,
            }}
            title="Перетащить"
          >
            ⋮⋮
          </span>
          <div
            style={{ flex: 1, cursor: 'pointer', paddingLeft: isSub ? 20 : 0 }}
            onClick={() => onEdit(task)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isSub && <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }}>↳</span>}
              <span style={{ fontSize: 13, color: 'var(--tx)', fontWeight: 500, lineHeight: 1.4 }}>
                {task.name}
              </span>
              {task.artifacts?.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }}>
                  📎{task.artifacts.length}
                </span>
              )}
              {task.comments?.length > 0 && (
                <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }}>
                  💬{task.comments.length}
                </span>
              )}
            </div>
            {task.description && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--tx3)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {task.description}
              </div>
            )}
            {!isSub && (
              <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                {hasSubtasks && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onToggleSubtasks(task.id)
                    }}
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 4,
                      border: '1px solid var(--bd2)',
                      background: 'transparent',
                      color: 'var(--tx3)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isCollapsed ? `▶ ${subTasks.length}` : `▼ ${subTasks.length}`}
                  </button>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation()
                    onAddSub(task)
                  }}
                  style={{
                    fontSize: 10,
                    padding: '2px 7px',
                    borderRadius: 4,
                    border: '1px solid var(--bd2)',
                    background: 'transparent',
                    color: 'var(--tx3)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + подзадача
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 12px', width: '12%' }}>
        <Badge status={task.status} statusLabels={statusLabels} />
      </td>
      <td style={{ padding: '10px 12px', width: '12%' }}>
        <PrioLabel priority={task.priority} priorityLabels={priorityLabels} />
      </td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--tx2)', width: '11%' }}>
        {task.assignee || '—'}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--tx2)', width: '9%' }}>
        {task.sprint}
      </td>
      <td style={{ padding: '10px 12px', width: '6%' }}>
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--bg2)',
            color: 'var(--tx3)',
            fontWeight: 500,
          }}
        >
          {task.effort}
        </span>
      </td>
      <td style={{ padding: '10px 12px', width: '10%' }}>
        {needsEstimation ? (
          <span
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 4,
              background: '#FCEBEB',
              color: '#A32D2D',
              fontWeight: 500,
            }}
          >
            Ожидает оценки
          </span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--tx2)' }}>
            {useStoryPoints ? `${task.storyPoints} SP` : `${task.estimateHours} ч`}
          </span>
        )}
      </td>
      <td
        style={{
          padding: '10px 12px',
          fontSize: 11,
          color: isOverdue ? '#E24B4A' : 'var(--tx3)',
          width: '10%',
          fontWeight: isOverdue ? 600 : 400,
        }}
      >
        {task.deadline || '—'}
        {isOverdue && ' ⚠️'}
      </td>
    </tr>
  )
}

export default TaskRow
