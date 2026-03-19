import { useState, useRef, useEffect } from 'react'

const SEL_STYLE = {
  fontSize: 12,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid var(--bd2)',
  background: 'var(--bg2)',
  color: 'var(--tx2)',
  cursor: 'pointer',
}

export default function MultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const allSelected = selected.length === 0
  const displayLabel = allSelected ? label : `${label} (${selected.length})`

  function toggle(val) {
    if (selected.includes(val)) {
      onChange(selected.filter(v => v !== val))
    } else {
      onChange([...selected, val])
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...SEL_STYLE,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: !allSelected ? 'var(--bg3)' : 'var(--bg2)',
          border: !allSelected ? '1px solid var(--accent, #378ADD)' : '1px solid var(--bd2)',
          color: !allSelected ? 'var(--accent, #378ADD)' : 'var(--tx2)',
        }}
      >
        {displayLabel}
        <span style={{ fontSize: 9, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 100,
            marginTop: 4,
            background: 'var(--bg2)',
            border: '1px solid var(--bd2)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            minWidth: 180,
            padding: '6px 0',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: 12,
              cursor: 'pointer',
              color: allSelected ? 'var(--accent, #378ADD)' : 'var(--tx3)',
              fontWeight: allSelected ? 600 : 400,
            }}
            onClick={() => onChange([])}
          >
            ✓ Все
          </div>
          <div style={{ height: 1, background: 'var(--bd)', margin: '4px 0' }} />
          {options.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                color: 'var(--tx2)',
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                style={{ cursor: 'pointer', accentColor: 'var(--accent, #378ADD)' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
