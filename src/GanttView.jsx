import { useState } from 'react'
import { SPRINTS, GANTT_BASE, GANTT_WEEKS } from './store.js'

function weekLabel(i) {
  const d = new Date(GANTT_BASE)
  d.setDate(d.getDate() + i * 7)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function todayW() {
  const diff = (new Date() - GANTT_BASE) / (1000 * 60 * 60 * 24 * 7)
  return Math.max(0, Math.min(GANTT_WEEKS, diff))
}

function dateToWeek(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return (d - GANTT_BASE) / (1000 * 60 * 60 * 24 * 7)
}

const EFFORT_W = { S: 0.5, M: 1, L: 2, XL: 4 }

export default function GanttView({ epics, tasks }) {
  const [filter, setFilter] = useState('all')
  const todayX = todayW()
  const showEpics = filter === 'all' ? epics : epics.filter(e => e.sprint === filter)

  const cellW = `${100 / GANTT_WEEKS}%`

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Гант</span>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            fontSize: 12,
            padding: '5px 8px',
            borderRadius: 6,
            border: '0.5px solid var(--bd2)',
            background: 'var(--bg2)',
            color: 'var(--tx)',
            cursor: 'pointer',
          }}
        >
          <option value="all">Все спринты</option>
          {SPRINTS.filter(s => s !== 'Backlog').map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: 'auto', border: '0.5px solid var(--bd)', borderRadius: 10 }}>
        <div style={{ minWidth: 760 }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              borderBottom: '0.5px solid var(--bd)',
              background: 'var(--bg2)',
            }}
          >
            <div
              style={{
                width: 200,
                flexShrink: 0,
                padding: '7px 12px',
                fontSize: 10,
                color: 'var(--tx3)',
                fontWeight: 500,
              }}
            >
              Эпик / Задача
            </div>
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              {Array.from({ length: GANTT_WEEKS }, (_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    fontSize: 9,
                    color: 'var(--tx3)',
                    textAlign: 'center',
                    padding: '7px 2px',
                    borderLeft: '0.5px solid var(--bd)',
                  }}
                >
                  {weekLabel(i)}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {showEpics.map(ep => {
            const epicTasks = tasks.filter(t => t.epicId === ep.id && !t.parentId)
            const barL = ((ep.startW / GANTT_WEEKS) * 100).toFixed(2)
            const barW = ((ep.durW / GANTT_WEEKS) * 100).toFixed(2)

            return (
              <React.Fragment key={ep.id}>
                {/* Epic row */}
                <div
                  style={{
                    display: 'flex',
                    borderBottom: '0.5px solid var(--bd)',
                    background: 'var(--bg)',
                    minHeight: 36,
                  }}
                >
                  <div
                    style={{
                      width: 200,
                      flexShrink: 0,
                      padding: '4px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: ep.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--tx)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ep.name}
                    </span>
                  </div>
                  <div
                    style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}
                  >
                    {/* Grid cells */}
                    {Array.from({ length: GANTT_WEEKS }, (_, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${(i / GANTT_WEEKS) * 100}%`,
                          width: cellW,
                          borderLeft: '0.5px solid var(--bd)',
                        }}
                      />
                    ))}
                    {/* Today line */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(todayX / GANTT_WEEKS) * 100}%`,
                        width: 1.5,
                        background: '#E24B4A',
                        zIndex: 2,
                      }}
                    />
                    {/* Epic bar */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${barL}%`,
                        width: `${barW}%`,
                        top: 5,
                        height: 24,
                        borderRadius: 5,
                        background: ep.color,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 8,
                        overflow: 'hidden',
                        minWidth: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: '#fff',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ep.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Task rows */}
                {epicTasks.map(t => {
                  const wk = dateToWeek(t.deadline)
                  const ef = EFFORT_W[t.effort] || 1
                  const tEnd = wk !== null ? wk : ep.startW + ef + 1
                  const tStart = Math.max(0, tEnd - ef)
                  const tL = ((tStart / GANTT_WEEKS) * 100).toFixed(2)
                  const tW = Math.max((ef / GANTT_WEEKS) * 100, 1.5).toFixed(2)
                  const isDone = t.status === 'done'

                  return (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        borderBottom: '0.5px solid var(--bd)',
                        minHeight: 30,
                        background: 'var(--bg)',
                      }}
                    >
                      <div
                        style={{
                          width: 200,
                          flexShrink: 0,
                          padding: '4px 12px 4px 28px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--tx2)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.name}
                        </span>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {Array.from({ length: GANTT_WEEKS }, (_, i) => (
                          <div
                            key={i}
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: `${(i / GANTT_WEEKS) * 100}%`,
                              width: cellW,
                              borderLeft: '0.5px solid var(--bd)',
                            }}
                          />
                        ))}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: `${(todayX / GANTT_WEEKS) * 100}%`,
                            width: 1.5,
                            background: '#E24B4A',
                            zIndex: 2,
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            left: `${tL}%`,
                            width: `${tW}%`,
                            top: 7,
                            height: 16,
                            borderRadius: 3,
                            background: isDone ? '#639922' : ep.color,
                            zIndex: 1,
                            opacity: isDone ? 0.55 : 0.75,
                            minWidth: 4,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}

          {showEpics.length === 0 && (
            <div
              style={{
                padding: '24px 16px',
                fontSize: 13,
                color: 'var(--tx3)',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Нет эпиков для выбранного спринта
            </div>
          )}

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '10px 12px',
              borderTop: '0.5px solid var(--bd)',
              background: 'var(--bg2)',
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 3,
                  background: '#E24B4A',
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              />
              Сегодня
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 8,
                  background: '#378ADD',
                  display: 'inline-block',
                  borderRadius: 2,
                }}
              />
              Эпик
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--tx3)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 5,
                  background: '#639922',
                  display: 'inline-block',
                  borderRadius: 2,
                  opacity: 0.6,
                }}
              />
              Готово
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
