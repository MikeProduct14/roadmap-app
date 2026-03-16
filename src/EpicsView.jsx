import React, { useState } from 'react'
import { STATUS_LABELS, PRIO_LABELS } from './store.js'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }
const STATUS_BG = { backlog: '#F1EFE8', ready: '#FAEEDA', wip: '#E6F1FB', done: '#EAF3DE', frozen: '#FCEBEB' }
const STATUS_TX = { backlog: '#5F5E5A', ready: '#854F0B', wip: '#185FA5', done: '#3B6D11', frozen: '#A32D2D' }
const ART_COLORS = { pdf: { bg: '#FCEBEB', tx: '#A32D2D' }, doc: { bg: '#E6F1FB', tx: '#185FA5' }, link: { bg: '#EAF3DE', tx: '#3B6D11' } }

function Badge({ status }) {
  return <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: STATUS_BG[status], color: STATUS_TX[status], fontWeight: 500, whiteSpace: 'nowrap' }}>{STATUS_LABELS[status]}</span>
}

function PrioDot({ priority }) {
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: PRIO_COLORS[priority], display: 'inline-block', flexShrink: 0 }} title={PRIO_LABELS[priority]} />
}

function ArtIcon({ type }) {
  const c = ART_COLORS[type] || ART_COLORS.link
  return <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: c.bg, color: c.tx, fontWeight: 700 }}>{type.toUpperCase()}</span>
}

function TaskRow({ task, isSub, onEdit, onAddSub }) {
  return (
    <tr style={{ borderBottom: '0.5px solid var(--bd)' }}>
      <td style={{ padding: '8px 14px', paddingLeft: isSub ? 36 : 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => onEdit(task)}>
          {isSub && <span style={{ fontSize: 10, color: 'var(--tx3)' }}>↳</span>}
          <span style={{ fontSize: 13, color: 'var(--tx)' }}>{task.name}</span>
          {task.artifacts?.length > 0 && (
            <span style={{ fontSize: 10, color: 'var(--tx3)' }} title={task.artifacts.map(a => a.name).join(', ')}>
              📎{task.artifacts.length}
            </span>
          )}
        </div>
        {task.artifacts?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, paddingLeft: isSub ? 16 : 0, flexWrap: 'wrap' }}>
            {task.artifacts.map((a, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--tx2)' }}>
                <ArtIcon type={a.type} />
                {a.url ? <a href={a.url} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', textDecoration: 'none' }}>{a.name}</a> : <span>{a.name}</span>}
              </span>
            ))}
          </div>
        )}
      </td>
      <td style={{ padding: '8px 14px' }}><Badge status={task.status} /></td>
      <td style={{ padding: '8px 14px' }}><PrioDot priority={task.priority} /></td>
      <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--tx2)' }}>{task.sprint}</td>
      <td style={{ padding: '8px 14px' }}>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg2)', color: 'var(--tx3)' }}>{task.effort}</span>
      </td>
      <td style={{ padding: '8px 14px', fontSize: 11, color: 'var(--tx3)' }}>{task.deadline || '—'}</td>
      {!isSub && (
        <td style={{ padding: '8px 14px' }}>
          <button onClick={() => onAddSub(task)} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: '0.5px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer' }}>+ подзадача</button>
        </td>
      )}
      {isSub && <td />}
    </tr>
  )
}

export default function EpicsView({ epics, tasks, onAddEpic, onEditEpic, onAddTask, onEditTask, onAddSub }) {
  const [collapsed, setCollapsed] = useState({})

  const toggle = id => setCollapsed(c => ({ ...c, [id]: !c[id] }))

  return (
    <div style={{ padding: '0 0 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Эпики</span>
        <button onClick={onAddEpic} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '0.5px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', cursor: 'pointer' }}>+ Эпик</button>
        <button onClick={onAddTask} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontWeight: 500 }}>+ Задача</button>
      </div>

      {epics.map(ep => {
        const rootTasks = tasks.filter(t => t.epicId === ep.id && !t.parentId)
        const allDone = tasks.filter(t => t.epicId === ep.id && !t.parentId && t.status === 'done').length
        const prog = rootTasks.length ? Math.round(allDone / rootTasks.length * 100) : 0
        const open = !collapsed[ep.id]

        return (
          <div key={ep.id} style={{ marginBottom: '1rem', border: '0.5px solid var(--bd)', borderRadius: 10, overflow: 'hidden' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--bg2)', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => toggle(ep.id)}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: ep.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{ep.name}</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{ep.sprint} · {rootTasks.length} задач</span>
              <div style={{ width: 80, height: 3, background: 'var(--bd)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${prog}%`, background: ep.color, borderRadius: 2, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 11, color: 'var(--tx3)', minWidth: 28 }}>{prog}%</span>
              <button
                onClick={e => { e.stopPropagation(); onEditEpic(ep) }}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '0.5px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer' }}
              >Изм.</button>
              <button
                onClick={e => { e.stopPropagation(); onAddTask(ep) }}
                style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '0.5px solid var(--bd2)', background: 'transparent', color: 'var(--tx2)', cursor: 'pointer' }}
              >+ задача</button>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{open ? '▲' : '▼'}</span>
            </div>

            {open && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr style={{ borderBottom: '0.5px solid var(--bd)', background: 'var(--bg)' }}>
                      {['Задача', 'Статус', 'Приоритет', 'Спринт', 'Усилие', 'Дедлайн', ''].map((h, i) => (
                        <th key={i} style={{ fontSize: 10, color: 'var(--tx3)', fontWeight: 500, padding: '6px 14px', textAlign: 'left' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rootTasks.map(t => (
                      <React.Fragment key={t.id}>
                        <TaskRow task={t} isSub={false} onEdit={onEditTask} onAddSub={onAddSub} />
                        {tasks.filter(s => s.parentId === t.id).map(sub => (
                          <TaskRow key={sub.id} task={sub} isSub={true} onEdit={onEditTask} onAddSub={onAddSub} />
                        ))}
                      </React.Fragment>
                    ))}
                    {rootTasks.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '12px 14px', fontSize: 13, color: 'var(--tx3)', fontStyle: 'italic' }}>Нет задач — добавь первую</td></tr>
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
