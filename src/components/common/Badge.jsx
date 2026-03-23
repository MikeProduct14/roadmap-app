import { STATUS_LABELS } from '../../services/store.js'

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

export default Badge
