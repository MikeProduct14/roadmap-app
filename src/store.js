import { supabase, isSupabaseConfigured } from './supabase.js'

// Initial seed data
const SEED_EPICS = [
  { id: 'e1', name: 'Личный сайт / портфолио', color: '#378ADD', sprint: 'Sprint 1', startW: 0, durW: 3 },
  { id: 'e2', name: 'Контент-машина', color: '#1D9E75', sprint: 'Sprint 1', startW: 1, durW: 4 },
  { id: 'e3', name: 'Курс вайбкодинга', color: '#D85A30', sprint: 'Sprint 2', startW: 4, durW: 6 },
  { id: 'e4', name: 'MVP трекер привычек', color: '#534AB7', sprint: 'Sprint 3', startW: 8, durW: 5 },
]

const SEED_TASKS = [
  { id: 't1', epicId: 'e1', parentId: null, name: 'Figma макет главной', status: 'done', priority: 'high', sprint: 'Sprint 1', effort: 'M', deadline: '2026-03-18', notes: '', artifacts: [{ type: 'link', name: 'Figma', url: 'https://figma.com' }] },
  { id: 't2', epicId: 'e1', parentId: 't1', name: 'Утвердить с ментором', status: 'done', priority: 'medium', sprint: 'Sprint 1', effort: 'S', deadline: '2026-03-19', notes: '', artifacts: [] },
  { id: 't3', epicId: 'e1', parentId: null, name: 'Верстка React + Vite', status: 'wip', priority: 'critical', sprint: 'Sprint 1', effort: 'L', deadline: '2026-03-28', notes: '', artifacts: [{ type: 'doc', name: 'Бриф.docx', url: '' }] },
  { id: 't4', epicId: 'e1', parentId: 't3', name: 'Компонент Hero секции', status: 'wip', priority: 'high', sprint: 'Sprint 1', effort: 'S', deadline: '2026-03-22', notes: '', artifacts: [] },
  { id: 't5', epicId: 'e1', parentId: 't3', name: 'Компонент кейсов', status: 'ready', priority: 'medium', sprint: 'Sprint 1', effort: 'M', deadline: '2026-03-26', notes: '', artifacts: [] },
  { id: 't6', epicId: 'e2', parentId: null, name: 'Контент-план апрель', status: 'wip', priority: 'high', sprint: 'Sprint 1', effort: 'M', deadline: '2026-03-25', notes: '', artifacts: [{ type: 'doc', name: 'КП_апрель.docx', url: '' }] },
  { id: 't7', epicId: 'e2', parentId: 't6', name: 'Темы для Reels', status: 'ready', priority: 'medium', sprint: 'Sprint 1', effort: 'S', deadline: '2026-03-23', notes: '', artifacts: [] },
  { id: 't8', epicId: 'e3', parentId: null, name: 'Программа курса', status: 'backlog', priority: 'high', sprint: 'Sprint 2', effort: 'L', deadline: '2026-04-15', notes: '', artifacts: [{ type: 'pdf', name: 'Программа.pdf', url: '' }] },
  { id: 't9', epicId: 'e4', parentId: null, name: 'PRD трекера', status: 'backlog', priority: 'medium', sprint: 'Sprint 3', effort: 'M', deadline: '2026-05-10', notes: '', artifacts: [] },
]

// localStorage fallback
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// Supabase functions
export async function loadStateFromSupabase(userId) {
  if (!isSupabaseConfigured()) return null

  try {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No data yet
      throw error
    }

    return {
      epics: data.epics || [],
      tasks: data.tasks || [],
      nextEpicId: data.next_epic_id || 1,
      nextTaskId: data.next_task_id || 1,
    }
  } catch (err) {
    console.error('Error loading from Supabase:', err)
    return null
  }
}

export async function saveStateToSupabase(userId, state) {
  if (!isSupabaseConfigured()) return

  try {
    const { error } = await supabase
      .from('roadmaps')
      .upsert({
        user_id: userId,
        epics: state.epics,
        tasks: state.tasks,
        next_epic_id: state.nextEpicId,
        next_task_id: state.nextTaskId,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (err) {
    console.error('Error saving to Supabase:', err)
  }
}

export function loadState() {
  return {
    epics: load('rm_epics', SEED_EPICS),
    tasks: load('rm_tasks', SEED_TASKS),
    nextEpicId: load('rm_neid', 5),
    nextTaskId: load('rm_ntid', 10),
  }
}

export function saveState(state) {
  save('rm_epics', state.epics)
  save('rm_tasks', state.tasks)
  save('rm_neid', state.nextEpicId)
  save('rm_ntid', state.nextTaskId)
}

export const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Backlog']
export const EPIC_COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#BA7517', '#534AB7', '#D4537E', '#639922', '#888780']

export const STATUS_LABELS = { backlog: 'Backlog', ready: 'К спринту', wip: 'В работе', done: 'Готово', frozen: 'Заморожено' }
export const PRIO_LABELS = { critical: 'Критичный', high: 'Высокий', medium: 'Средний', low: 'Низкий' }
export const EFFORT_LABELS = { S: 'S — 1-2 ч', M: 'M — полдня', L: 'L — 1-3 дня', XL: 'XL — неделя+' }
export const SPHERE_LABELS = ['Продукты', 'Личный бренд', 'Обучение', 'Вайбкодинг', 'Контент', 'Операционка']
export const ART_TYPES = ['pdf', 'doc', 'link']

export const GANTT_BASE = new Date('2026-03-10')
export const GANTT_WEEKS = 16
