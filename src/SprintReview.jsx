import React, { useState } from 'react'
import { SPRINTS, SPRINT_MESSAGES } from './store.js'

const s = {
  container: { padding: '0 0 2rem' },
  section: { marginBottom: '1.5rem', border: '1px solid var(--bd)', borderRadius: 10, padding: '20px 24px', background: 'var(--bg)' },
  h: { fontSize: 16, fontWeight: 600, color: 'var(--tx)', marginBottom: 16 },
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid var(--bd)' },
  metricLabel: { fontSize: 13, color: 'var(--tx2)' },
  metricValue: { fontSize: 18, fontWeight: 600, color: 'var(--tx)' },
  message: { fontSize: 15, color: 'var(--tx)', padding: '16px 20px', background: 'var(--bg2)', borderRadius: 8, marginTop: 16, textAlign: 'center', fontWeight: 500 },
  sprintSelect: { fontSize: 14, padding: '9px 12px', borderRadius: 7, border: '1px solid var(--bd2)', background: 'var(--bg2)', color: 'var(--tx)', marginBottom: 16 },
  historyItem: { padding: '12px 16px', background: 'var(--bg2)', borderRadius: 7, marginBottom: 10, border: '1px solid var(--bd)' },
  historyHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyTitle: { fontSize: 14, fontWeight: 600, color: 'var(--tx)' },
  historyDate: { fontSize: 11, color: 'var(--tx3)' },
  historyMetrics: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12, color: 'var(--tx2)' },
  saveBtn: { fontSize: 13, padding: '8px 16px', borderRadius: 7, border: 'none', background: 'var(--tx)', color: 'var(--bg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 },
}

function calculateMetrics(tasks, sprint) {
  const sprintTasks = tasks.filter(t => t.sprint === sprint)
  const completed = sprintTasks.filter(t => t.status === 'done')
  const overdue = sprintTasks.filter(t => t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date())
  
  const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const completedPoints = completed.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
  const totalHours = sprintTasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0)
  const loggedHours = sprintTasks.reduce((sum, t) => sum + (t.timeLog || []).reduce((s, log) => s + log.hours, 0), 0)
  
  const completionRate = sprintTasks.length ? Math.round(completed.length / sprintTasks.length * 100) : 0
  const velocity = completedPoints
  
  return {
    totalTasks: sprintTasks.length,
    completed: completed.length,
    completionRate,
    velocity,
    totalPoints,
    completedPoints,
    overdue: overdue.length,
    totalHours,
    loggedHours
  }
}

function getSprintMessage(metrics) {
  const { completionRate, overdue } = metrics
  
  let category
  if (completionRate >= 90 && overdue === 0) category = 'excellent'
  else if (completionRate >= 70 && overdue <= 1) category = 'good'
  else if (completionRate >= 50) category = 'bad'
  else category = 'terrible'
  
  const messages = SPRINT_MESSAGES[category]
  return messages[Math.floor(Math.random() * messages.length)]
}

export default function SprintReview({ tasks, settings, onSaveHistory }) {
  const [selectedSprint, setSelectedSprint] = useState('Sprint 1')
  
  const metrics = calculateMetrics(tasks, selectedSprint)
  const message = getSprintMessage(metrics)
  
  // Calculate average metrics from history
  const history = settings.sprintHistory || []
  const avgCompletion = history.length 
    ? Math.round(history.reduce((sum, h) => sum + h.completionRate, 0) / history.length)
    : 0
  const avgVelocity = history.length
    ? Math.round(history.reduce((sum, h) => sum + h.velocity, 0) / history.length)
    : 0

  const handleSaveToHistory = () => {
    if (!confirm(`Сохранить результаты спринта "${selectedSprint}" в историю?`)) return
    
    const historyEntry = {
      sprint: selectedSprint,
      date: new Date().toISOString(),
      ...metrics
    }
    
    onSaveHistory(historyEntry)
    alert('Спринт сохранен в историю!')
  }

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>Спринт-ревью</span>
      </div>

      <div style={s.section}>
        <div style={s.h}>Выберите спринт</div>
        <select 
          value={selectedSprint} 
          onChange={e => setSelectedSprint(e.target.value)} 
          style={s.sprintSelect}
        >
          {SPRINTS.filter(sp => sp !== 'Backlog').map(sp => (
            <option key={sp} value={sp}>{sp}</option>
          ))}
        </select>

        <div style={s.h}>Метрики спринта: {selectedSprint}</div>
        
        <div style={s.metricRow}>
          <span style={s.metricLabel}>Задач выполнено</span>
          <span style={s.metricValue}>{metrics.completed} / {metrics.totalTasks}</span>
        </div>
        
        <div style={s.metricRow}>
          <span style={s.metricLabel}>Процент завершения</span>
          <span style={s.metricValue}>{metrics.completionRate}%</span>
        </div>
        
        <div style={s.metricRow}>
          <span style={s.metricLabel}>Velocity (Story Points)</span>
          <span style={s.metricValue}>{metrics.completedPoints} / {metrics.totalPoints}</span>
        </div>
        
        <div style={s.metricRow}>
          <span style={s.metricLabel}>Просрочено задач</span>
          <span style={{ ...s.metricValue, color: metrics.overdue > 0 ? '#E24B4A' : 'var(--tx)' }}>{metrics.overdue}</span>
        </div>
        
        <div style={s.metricRow}>
          <span style={s.metricLabel}>Залогировано часов</span>
          <span style={s.metricValue}>{metrics.loggedHours} / {metrics.totalHours} ч</span>
        </div>

        <div style={s.message}>{message}</div>

        <button 
          style={{ ...s.saveBtn, marginTop: 16, width: '100%' }} 
          onClick={handleSaveToHistory}
        >
          Сохранить в историю
        </button>
      </div>

      {history.length > 0 && (
        <div style={s.section}>
          <div style={s.h}>История спринтов</div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={s.metricRow}>
              <span style={s.metricLabel}>Средний процент завершения</span>
              <span style={s.metricValue}>{avgCompletion}%</span>
            </div>
            <div style={s.metricRow}>
              <span style={s.metricLabel}>Средняя velocity</span>
              <span style={s.metricValue}>{avgVelocity} SP</span>
            </div>
          </div>

          {history.slice().reverse().map((h, i) => (
            <div key={i} style={s.historyItem}>
              <div style={s.historyHeader}>
                <span style={s.historyTitle}>{h.sprint}</span>
                <span style={s.historyDate}>{new Date(h.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div style={s.historyMetrics}>
                <div>Завершено: {h.completed}/{h.totalTasks}</div>
                <div>Velocity: {h.completedPoints} SP</div>
                <div>Просрочено: {h.overdue}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
