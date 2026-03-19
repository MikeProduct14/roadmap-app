import { PRIO_ORDER } from './constants'

export function sortTasks(tasks, sortOption) {
  if (sortOption === 'default') return tasks

  const sorted = [...tasks]
  sorted.sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '')
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '')
      case 'priority_asc':
        return (PRIO_ORDER[a.priority] ?? 99) - (PRIO_ORDER[b.priority] ?? 99)
      case 'priority_desc':
        return (PRIO_ORDER[b.priority] ?? 99) - (PRIO_ORDER[a.priority] ?? 99)
      case 'deadline_asc':
        return (a.deadline || '9999') < (b.deadline || '9999') ? -1 : 1
      case 'deadline_desc':
        return (a.deadline || '') > (b.deadline || '') ? -1 : 1
      case 'sp_asc':
        return (a.storyPoints || 0) - (b.storyPoints || 0)
      case 'sp_desc':
        return (b.storyPoints || 0) - (a.storyPoints || 0)
      default:
        return 0
    }
  })

  return sorted
}
