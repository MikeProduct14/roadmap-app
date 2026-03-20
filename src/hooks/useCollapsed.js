import { useState } from 'react'

export function useCollapsed(storageKey) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to load collapsed state:', error)
      return {}
    }
  })

  const toggle = id => {
    setState(current => {
      const next = { ...current, [id]: !current[id] }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch (error) {
        console.error('Failed to save collapsed state:', error)
      }
      return next
    })
  }

  return [state, toggle]
}
