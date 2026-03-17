import { describe, it, expect } from 'vitest'

function addEpic(s, form) {
  return { ...s, epics: [...s.epics, { id: `e${s.nextEpicId}`, ...form }], nextEpicId: s.nextEpicId + 1 }
}
function editEpic(s, id, form) {
  return { ...s, epics: s.epics.map(e => e.id === id ? { ...e, ...form } : e) }
}
function deleteEpic(s, id) {
  return { ...s, epics: s.epics.filter(e => e.id !== id), tasks: s.tasks.filter(t => t.epicId !== id) }
}
function collectChildIds(tasks, id) {
  const ch = tasks.filter(t => t.parentId === id)
  return [...ch.map(c => c.id), ...ch.flatMap(c => collectChildIds(tasks, c.id))]
}
function addTask(s, ctx, form) {
  const arts = (form.artifacts || []).filter(a => a.name && a.name.trim())
  return {
    ...s,
    tasks: [...s.tasks, {
      id: `t${s.nextTaskId}`, epicId: ctx.epicId, parentId: ctx.parentId || null,
      ...form, artifacts: arts, comments: form.comments || [],
      assignee: form.assignee || 'Не назначен', storyPoints: form.storyPoints || 0, timeLog: form.timeLog || [],
    }],
    nextTaskId: s.nextTaskId + 1,
  }
}
function editTask(s, id, form) {
  const arts = (form.artifacts || []).filter(a => a.name && a.name.trim())
  return { ...s, tasks: s.tasks.map(t => t.id === id ? { ...t, ...form, artifacts: arts, comments: form.comments || [], timeLog: form.timeLog || [] } : t) }
}
function deleteTask(s, id) {
  const ids = [id, ...collectChildIds(s.tasks, id)]
  return { ...s, tasks: s.tasks.filter(t => !ids.includes(t.id)) }
}
function reorderEpics(epics, from, to) {
  const n = [...epics]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n
}
function reorderTasks(tasks, epicId, parentId, from, to) {
  const g = tasks.filter(t => t.epicId === epicId && t.parentId === parentId)
  const r = tasks.filter(t => t.epicId !== epicId || t.parentId !== parentId)
  const [m] = g.splice(from, 1); g.splice(to, 0, m); return [...r, ...g]
}
const calcProgress = (tasks, epicId) => {
  const all = tasks.filter(t => t.epicId === epicId)
  return all.length ? Math.round(all.filter(t => t.status === 'done').length / all.length * 100) : 0
}
const isOverdue = (t) => t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date()

const mk = () => ({
  epics: [
    { id: 'e1', name: 'Epic One', color: '#fff', sprint: 'Sprint 1' },
    { id: 'e2', name: 'Epic Two', color: '#000', sprint: 'Sprint 2' },
  ],
  tasks: [
    { id: 't1', epicId: 'e1', parentId: null, name: 'Task A', status: 'backlog', artifacts: [], comments: [], timeLog: [] },
    { id: 't2', epicId: 'e1', parentId: 't1', name: 'Sub A1', status: 'wip', artifacts: [], comments: [], timeLog: [] },
    { id: 't3', epicId: 'e1', parentId: 't1', name: 'Sub A2', status: 'done', artifacts: [], comments: [], timeLog: [] },
    { id: 't4', epicId: 'e2', parentId: null, name: 'Task B', status: 'ready', artifacts: [], comments: [], timeLog: [] },
  ],
  nextEpicId: 3, nextTaskId: 5, settings: {},
})

describe('addEpic', () => {
  it('adds with auto id', () => { const n = addEpic(mk(), { name: 'X' }); expect(n.epics[2].id).toBe('e3'); expect(n.nextEpicId).toBe(4) })
  it('does not mutate original', () => { const s = mk(); addEpic(s, {}); expect(s.epics).toHaveLength(2) })
})
describe('editEpic', () => {
  it('updates only target', () => {
    const n = editEpic(mk(), 'e1', { name: 'Updated' })
    expect(n.epics.find(e => e.id === 'e1').name).toBe('Updated')
    expect(n.epics.find(e => e.id === 'e2').name).toBe('Epic Two')
  })
})
describe('deleteEpic', () => {
  it('removes epic', () => { expect(deleteEpic(mk(), 'e1').epics).toHaveLength(1) })
  it('removes all its tasks', () => { expect(deleteEpic(mk(), 'e1').tasks.filter(t => t.epicId === 'e1')).toHaveLength(0) })
  it('keeps other epic tasks', () => { expect(deleteEpic(mk(), 'e1').tasks.find(t => t.id === 't4')).toBeTruthy() })
})
describe('addTask', () => {
  it('adds with auto id', () => { const n = addTask(mk(), { epicId: 'e1' }, { name: 'T' }); expect(n.tasks[4].id).toBe('t5'); expect(n.nextTaskId).toBe(6) })
  it('sets parentId', () => { expect(addTask(mk(), { epicId: 'e1', parentId: 't1' }, { name: 'S' }).tasks[4].parentId).toBe('t1') })
  it('defaults assignee', () => { expect(addTask(mk(), { epicId: 'e1' }, { name: 'T' }).tasks[4].assignee).toBe('Не назначен') })
  it('filters empty artifacts', () => {
    const n = addTask(mk(), { epicId: 'e1' }, { name: 'T', artifacts: [{ type: 'link', name: 'OK', url: '' }, { type: 'pdf', name: '', url: '' }] })
    expect(n.tasks[4].artifacts).toHaveLength(1)
  })
  it('inits empty comments and timeLog', () => {
    const t = addTask(mk(), { epicId: 'e1' }, { name: 'T' }).tasks[4]
    expect(t.comments).toEqual([]); expect(t.timeLog).toEqual([])
  })
})
describe('editTask', () => {
  it('updates only target', () => {
    const n = editTask(mk(), 't1', { name: 'Updated', status: 'done', artifacts: [], comments: [], timeLog: [] })
    expect(n.tasks.find(t => t.id === 't1').name).toBe('Updated')
    expect(n.tasks.find(t => t.id === 't2').name).toBe('Sub A1')
  })
})
describe('deleteTask', () => {
  it('removes task', () => { expect(deleteTask(mk(), 't4').tasks.find(t => t.id === 't4')).toBeUndefined() })
  it('removes children recursively', () => {
    const n = deleteTask(mk(), 't1')
    expect(n.tasks.find(t => t.id === 't1')).toBeUndefined()
    expect(n.tasks.find(t => t.id === 't2')).toBeUndefined()
    expect(n.tasks.find(t => t.id === 't3')).toBeUndefined()
  })
  it('keeps other epic tasks', () => { expect(deleteTask(mk(), 't1').tasks.find(t => t.id === 't4')).toBeTruthy() })
})
describe('collectChildIds', () => {
  it('empty for leaf', () => { expect(collectChildIds(mk().tasks, 't4')).toEqual([]) })
  it('returns direct children', () => { const ids = collectChildIds(mk().tasks, 't1'); expect(ids).toContain('t2'); expect(ids).toContain('t3') })
  it('returns grandchildren', () => {
    const tasks = [{ id: 't1', parentId: null }, { id: 't2', parentId: 't1' }, { id: 't3', parentId: 't2' }]
    expect(collectChildIds(tasks, 't1')).toContain('t3')
  })
})
describe('reorderEpics', () => {
  it('swaps two epics', () => { const n = reorderEpics(mk().epics, 0, 1); expect(n[0].id).toBe('e2'); expect(n[1].id).toBe('e1') })
  it('does not mutate original', () => { const e = mk().epics; reorderEpics(e, 0, 1); expect(e[0].id).toBe('e1') })
})
describe('reorderTasks', () => {
  it('reorders within same parent', () => {
    const n = reorderTasks(mk().tasks, 'e1', 't1', 0, 1)
    const ch = n.filter(t => t.epicId === 'e1' && t.parentId === 't1')
    expect(ch[0].id).toBe('t3'); expect(ch[1].id).toBe('t2')
  })
  it('keeps other epic tasks', () => { expect(reorderTasks(mk().tasks, 'e1', 't1', 0, 1).find(t => t.id === 't4')).toBeTruthy() })
})
describe('epic progress', () => {
  it('0% when none done', () => { expect(calcProgress([{ id: 't1', epicId: 'e1', status: 'wip' }], 'e1')).toBe(0) })
  it('100% when all done', () => { expect(calcProgress([{ id: 't1', epicId: 'e1', status: 'done' }, { id: 't2', epicId: 'e1', status: 'done' }], 'e1')).toBe(100) })
  it('50% when half done', () => { expect(calcProgress([{ id: 't1', epicId: 'e1', status: 'done' }, { id: 't2', epicId: 'e1', status: 'wip' }], 'e1')).toBe(50) })
  it('0% for empty epic', () => { expect(calcProgress([], 'e1')).toBe(0) })
})
describe('overdue detection', () => {
  it('past deadline non-done = overdue', () => { expect(isOverdue({ deadline: '2020-01-01', status: 'wip' })).toBeTruthy() })
  it('done task not overdue', () => { expect(isOverdue({ deadline: '2020-01-01', status: 'done' })).toBeFalsy() })
  it('future deadline not overdue', () => { expect(isOverdue({ deadline: '2099-01-01', status: 'wip' })).toBeFalsy() })
  it('no deadline not overdue', () => { expect(isOverdue({ deadline: '', status: 'wip' })).toBeFalsy() })
})
