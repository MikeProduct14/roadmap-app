import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock supabase before importing store
vi.mock('../supabase.js', () => ({
  isSupabaseConfigured: () => false,
  supabase: null,
}))

import {
  loadState,
  saveState,
  saveStateWithoutTimestamp,
  STATUS_LABELS,
  PRIO_LABELS,
  EFFORT_LABELS,
  DEFAULT_STATUSES,
  DEFAULT_PRIORITIES,
  DEFAULT_EFFORTS,
  DEFAULT_TEAM_MEMBERS,
  SPRINTS,
  STORY_POINTS,
} from '../store.js'

beforeEach(() => {
  localStorage.clear()
})

// ─── loadState ───────────────────────────────────────────────

describe('loadState', () => {
  it('returns seed data when localStorage is empty', () => {
    const state = loadState()
    expect(state.epics.length).toBeGreaterThan(0)
    expect(state.tasks.length).toBeGreaterThan(0)
    expect(state.nextEpicId).toBeGreaterThanOrEqual(1)
    expect(state.nextTaskId).toBeGreaterThanOrEqual(1)
  })

  it('returns saved epics from localStorage', () => {
    const epics = [{ id: 'e1', name: 'Test Epic', color: '#fff', sprint: 'Sprint 1' }]
    localStorage.setItem('rm_epics', JSON.stringify(epics))
    const state = loadState()
    expect(state.epics).toEqual(epics)
  })

  it('returns saved tasks from localStorage', () => {
    const tasks = [{ id: 't1', epicId: 'e1', name: 'Test Task', status: 'backlog' }]
    localStorage.setItem('rm_tasks', JSON.stringify(tasks))
    const state = loadState()
    expect(state.tasks).toEqual(tasks)
  })

  it('returns default settings when none saved', () => {
    const state = loadState()
    expect(state.settings).toHaveProperty('projectName')
    expect(state.settings).toHaveProperty('statuses')
    expect(state.settings).toHaveProperty('priorities')
    expect(state.settings).toHaveProperty('statusLabels')
    expect(state.settings).toHaveProperty('priorityLabels')
    expect(state.settings).toHaveProperty('effortLabels')
  })

  it('returns saved settings from localStorage', () => {
    const settings = { projectName: 'My Project', statuses: ['backlog', 'done'] }
    localStorage.setItem('rm_settings', JSON.stringify(settings))
    const state = loadState()
    expect(state.settings.projectName).toBe('My Project')
  })

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('rm_epics', 'not-valid-json{{{')
    expect(() => loadState()).not.toThrow()
    const state = loadState()
    expect(Array.isArray(state.epics)).toBe(true)
  })
})

// ─── saveState ───────────────────────────────────────────────

describe('saveState', () => {
  it('saves epics to localStorage', () => {
    const state = { epics: [{ id: 'e1', name: 'Epic' }], tasks: [], nextEpicId: 2, nextTaskId: 1, settings: {} }
    saveState(state)
    expect(JSON.parse(localStorage.getItem('rm_epics'))).toEqual(state.epics)
  })

  it('saves tasks to localStorage', () => {
    const state = { epics: [], tasks: [{ id: 't1', name: 'Task' }], nextEpicId: 1, nextTaskId: 2, settings: {} }
    saveState(state)
    expect(JSON.parse(localStorage.getItem('rm_tasks'))).toEqual(state.tasks)
  })

  it('saves nextEpicId and nextTaskId', () => {
    const state = { epics: [], tasks: [], nextEpicId: 7, nextTaskId: 42, settings: {} }
    saveState(state)
    expect(JSON.parse(localStorage.getItem('rm_neid'))).toBe(7)
    expect(JSON.parse(localStorage.getItem('rm_ntid'))).toBe(42)
  })

  it('writes rm_updated_at timestamp', () => {
    const before = Date.now()
    saveState({ epics: [], tasks: [], nextEpicId: 1, nextTaskId: 1, settings: {} })
    const raw = localStorage.getItem('rm_updated_at')
    expect(raw).toBeTruthy()
    // localStorage stores JSON.stringify'd value, so parse it
    const ts = JSON.parse(raw)
    const tsMs = new Date(ts).getTime()
    expect(tsMs).toBeGreaterThanOrEqual(before)
    expect(tsMs).toBeLessThanOrEqual(Date.now() + 10)
  })

  it('round-trips: save then load returns same data', () => {
    const original = loadState()
    original.epics.push({ id: 'e99', name: 'New Epic', color: '#000', sprint: 'Sprint 1' })
    original.nextEpicId = 100
    saveState(original)
    const loaded = loadState()
    expect(loaded.epics.find(e => e.id === 'e99')).toBeTruthy()
    expect(loaded.nextEpicId).toBe(100)
  })
})

// ─── saveStateWithoutTimestamp ────────────────────────────────

describe('saveStateWithoutTimestamp', () => {
  it('saves data but does NOT update rm_updated_at', () => {
    const existingTs = '2020-01-01T00:00:00.000Z'
    localStorage.setItem('rm_updated_at', existingTs)

    saveStateWithoutTimestamp({ epics: [], tasks: [], nextEpicId: 1, nextTaskId: 1, settings: {} })

    expect(localStorage.getItem('rm_updated_at')).toBe(existingTs)
  })

  it('saves epics without touching timestamp', () => {
    const epics = [{ id: 'e5', name: 'Cloud Epic' }]
    saveStateWithoutTimestamp({ epics, tasks: [], nextEpicId: 6, nextTaskId: 1, settings: {} })
    expect(JSON.parse(localStorage.getItem('rm_epics'))).toEqual(epics)
  })
})

// ─── Constants ───────────────────────────────────────────────

describe('constants', () => {
  it('STATUS_LABELS has all default statuses', () => {
    DEFAULT_STATUSES.forEach(s => {
      expect(STATUS_LABELS).toHaveProperty(s)
      expect(typeof STATUS_LABELS[s]).toBe('string')
    })
  })

  it('PRIO_LABELS has all default priorities', () => {
    DEFAULT_PRIORITIES.forEach(p => {
      expect(PRIO_LABELS).toHaveProperty(p)
    })
  })

  it('EFFORT_LABELS has all default efforts', () => {
    DEFAULT_EFFORTS.forEach(e => {
      expect(EFFORT_LABELS).toHaveProperty(e)
    })
  })

  it('SPRINTS is non-empty array of strings', () => {
    expect(Array.isArray(SPRINTS)).toBe(true)
    expect(SPRINTS.length).toBeGreaterThan(0)
    SPRINTS.forEach(s => expect(typeof s).toBe('string'))
  })

  it('STORY_POINTS contains 0 and fibonacci-like values', () => {
    expect(STORY_POINTS).toContain(0)
    expect(STORY_POINTS).toContain(1)
    expect(STORY_POINTS).toContain(5)
    expect(STORY_POINTS).toContain(13)
  })

  it('DEFAULT_TEAM_MEMBERS includes "Не назначен"', () => {
    expect(DEFAULT_TEAM_MEMBERS).toContain('Не назначен')
  })
})
