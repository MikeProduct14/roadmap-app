import { PRIO_LABELS } from '../../services/store.js'

const PRIO_COLORS = { critical: '#E24B4A', high: '#EF9F27', medium: '#378ADD', low: '#888780' }

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

export default PrioLabel
