import { supabase, isSupabaseConfigured } from './supabase.js'
import { withErrorHandling } from '../utils/errorHandler.js'
import { validateTask, showValidationErrors } from '../utils/validation.js'

// Initial seed data
const SEED_EPICS = [
  {
    id: 'e1',
    name: 'Личный сайт / портфолио',
    color: '#378ADD',
    sprint: 'Sprint 1',
    startW: 0,
    durW: 3,
  },
  { id: 'e2', name: 'Контент-машина', color: '#1D9E75', sprint: 'Sprint 1', startW: 1, durW: 4 },
  { id: 'e3', name: 'Курс вайбкодинга', color: '#D85A30', sprint: 'Sprint 2', startW: 4, durW: 6 },
  {
    id: 'e4',
    name: 'MVP трекер привычек',
    color: '#534AB7',
    sprint: 'Sprint 3',
    startW: 8,
    durW: 5,
  },
]

const SEED_TASKS = [
  {
    id: 't1',
    epicId: 'e1',
    parentId: null,
    name: 'Figma макет главной',
    status: 'done',
    priority: 'high',
    sprint: 'Sprint 1',
    effort: 'M',
    storyPoints: 5,
    estimateHours: 4,
    deadline: '2026-03-18',
    description: '',
    comments: [],
    artifacts: [{ type: 'link', name: 'Figma', url: 'https://figma.com' }],
    assignee: 'Мария',
    timeLog: [],
  },
  {
    id: 't2',
    epicId: 'e1',
    parentId: 't1',
    name: 'Утвердить с ментором',
    status: 'done',
    priority: 'medium',
    sprint: 'Sprint 1',
    effort: 'S',
    storyPoints: 1,
    estimateHours: 1,
    deadline: '2026-03-19',
    description: '',
    comments: [],
    artifacts: [],
    assignee: 'Иван',
    timeLog: [],
  },
  {
    id: 't3',
    epicId: 'e1',
    parentId: null,
    name: 'Верстка React + Vite',
    status: 'wip',
    priority: 'critical',
    sprint: 'Sprint 1',
    effort: 'L',
    storyPoints: 8,
    estimateHours: 16,
    deadline: '2026-03-28',
    description: '',
    comments: [],
    artifacts: [{ type: 'doc', name: 'Бриф.docx', url: '' }],
    assignee: 'Алексей',
    timeLog: [{ date: '2026-03-16', hours: 4, comment: 'Настройка проекта' }],
  },
  {
    id: 't4',
    epicId: 'e1',
    parentId: 't3',
    name: 'Компонент Hero секции',
    status: 'wip',
    priority: 'high',
    sprint: 'Sprint 1',
    effort: 'S',
    storyPoints: 3,
    estimateHours: 3,
    deadline: '2026-03-22',
    description: '',
    comments: [],
    artifacts: [],
    assignee: 'Алексей',
    timeLog: [],
  },
  {
    id: 't5',
    epicId: 'e1',
    parentId: 't3',
    name: 'Компонент кейсов',
    status: 'ready',
    priority: 'medium',
    sprint: 'Sprint 1',
    effort: 'M',
    storyPoints: 5,
    estimateHours: 6,
    deadline: '2026-03-26',
    description: '',
    comments: [],
    artifacts: [],
    assignee: 'Не назначен',
    timeLog: [],
  },
  {
    id: 't6',
    epicId: 'e2',
    parentId: null,
    name: 'Контент-план апрель',
    status: 'wip',
    priority: 'high',
    sprint: 'Sprint 1',
    effort: 'M',
    storyPoints: 5,
    estimateHours: 5,
    deadline: '2026-03-25',
    description: '',
    comments: [],
    artifacts: [{ type: 'doc', name: 'КП_апрель.docx', url: '' }],
    assignee: 'Мария',
    timeLog: [],
  },
  {
    id: 't7',
    epicId: 'e2',
    parentId: 't6',
    name: 'Темы для Reels',
    status: 'ready',
    priority: 'medium',
    sprint: 'Sprint 1',
    effort: 'S',
    storyPoints: 2,
    estimateHours: 2,
    deadline: '2026-03-23',
    description: '',
    comments: [],
    artifacts: [],
    assignee: 'Мария',
    timeLog: [],
  },
  {
    id: 't8',
    epicId: 'e3',
    parentId: null,
    name: 'Программа курса',
    status: 'backlog',
    priority: 'high',
    sprint: 'Sprint 2',
    effort: 'L',
    storyPoints: 13,
    estimateHours: 20,
    deadline: '2026-04-15',
    description: '',
    comments: [],
    artifacts: [{ type: 'pdf', name: 'Программа.pdf', url: '' }],
    assignee: 'Не назначен',
    timeLog: [],
  },
  {
    id: 't9',
    epicId: 'e4',
    parentId: null,
    name: 'PRD трекера',
    status: 'backlog',
    priority: 'medium',
    sprint: 'Sprint 3',
    effort: 'M',
    storyPoints: 5,
    estimateHours: 8,
    deadline: '2026-05-10',
    description: '',
    comments: [],
    artifacts: [],
    assignee: 'Не назначен',
    timeLog: [],
  },
]

// localStorage fallback
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded')
      alert('Недостаточно места для сохранения данных. Пожалуйста, очистите кэш браузера.')
    } else {
      console.error('Error saving to localStorage:', error)
    }
  }
}

// Supabase functions
async function _loadStateFromSupabase(userId) {
  if (!isSupabaseConfigured() || !supabase) return null

  const { data, error } = await supabase
    .from('roadmaps')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No data yet — вернём null, App подставит seed
    throw error
  }

  return {
    // БАГ 5 FIX: если данные есть но пустые — используем seed
    epics: data.epics?.length ? data.epics : SEED_EPICS,
    tasks: data.tasks?.length ? data.tasks : SEED_TASKS,
    nextEpicId: data.next_epic_id || 5,
    nextTaskId: data.next_task_id || 10,
    settings: data.settings || {
      projectName: 'Roadmap',
      teamMembers: DEFAULT_TEAM_MEMBERS,
      statuses: DEFAULT_STATUSES,
      priorities: DEFAULT_PRIORITIES,
      efforts: DEFAULT_EFFORTS,
      useStoryPoints: true,
      sprintHistory: [],
      statusLabels: { ...STATUS_LABELS },
      priorityLabels: { ...PRIO_LABELS },
      effortLabels: { ...EFFORT_LABELS },
    },
    _updatedAt: data.updated_at || null,
  }
}

export const loadStateFromSupabase = withErrorHandling(
  _loadStateFromSupabase,
  'Ошибка загрузки данных из Supabase',
  true
)

async function _saveStateToSupabase(userId, state) {
  if (!isSupabaseConfigured() || !supabase) return

  const payload = {
    epics: state.epics,
    tasks: state.tasks,
    next_epic_id: state.nextEpicId,
    next_task_id: state.nextTaskId,
    settings: state.settings,
    updated_at: new Date().toISOString(),
  }

  // Сначала проверяем — есть ли уже запись
  const { data: existing } = await supabase
    .from('roadmaps')
    .select('id')
    .eq('user_id', userId)
    .single()

  let error
  if (existing?.id) {
    // Запись есть — обновляем по id
    const res = await supabase.from('roadmaps').update(payload).eq('user_id', userId)
    error = res.error
  } else {
    // Записи нет — создаём
    const res = await supabase.from('roadmaps').insert({ user_id: userId, ...payload })
    error = res.error
  }

  if (error) {
    console.error('[supabase] save error:', error)
    throw error
  }
}

export const saveStateToSupabase = withErrorHandling(
  _saveStateToSupabase,
  'Ошибка сохранения данных в Supabase',
  true
)

export function loadState() {
  return {
    epics: load('rm_epics', SEED_EPICS),
    tasks: load('rm_tasks', SEED_TASKS),
    nextEpicId: load('rm_neid', 5),
    nextTaskId: load('rm_ntid', 10),
    settings: load('rm_settings', {
      projectName: 'Roadmap',
      teamMembers: DEFAULT_TEAM_MEMBERS,
      statuses: DEFAULT_STATUSES,
      priorities: DEFAULT_PRIORITIES,
      efforts: DEFAULT_EFFORTS,
      useStoryPoints: true,
      sprintHistory: [],
      // Храним labels для кастомных значений
      statusLabels: { ...STATUS_LABELS },
      priorityLabels: { ...PRIO_LABELS },
      effortLabels: { ...EFFORT_LABELS },
    }),
  }
}

export function saveState(state) {
  save('rm_epics', state.epics)
  save('rm_tasks', state.tasks)
  save('rm_neid', state.nextEpicId)
  save('rm_ntid', state.nextTaskId)
  save('rm_settings', state.settings)
  save('rm_updated_at', new Date().toISOString())
}

// Сохраняет данные в localStorage БЕЗ обновления временной метки
// Используется при загрузке из облака, чтобы не затирать метку локальных изменений
export function saveStateWithoutTimestamp(state) {
  save('rm_epics', state.epics)
  save('rm_tasks', state.tasks)
  save('rm_neid', state.nextEpicId)
  save('rm_ntid', state.nextTaskId)
  save('rm_settings', state.settings)
}

export const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Backlog']
export const EPIC_COLORS = [
  '#378ADD',
  '#1D9E75',
  '#D85A30',
  '#BA7517',
  '#534AB7',
  '#D4537E',
  '#639922',
  '#888780',
]

export const STATUS_LABELS = {
  backlog: 'Бэклог',
  ready: 'Готов к бою',
  wip: 'Варится',
  done: 'Зашито',
  frozen: 'Заморожено',
}
export const PRIO_LABELS = {
  critical: 'Горит 🔥',
  high: 'Важняк',
  medium: 'Норм',
  low: 'Когда-нибудь',
}
export const EFFORT_LABELS = {
  S: 'S — 1-2 ч',
  M: 'M — полдня',
  L: 'L — 1-3 дня',
  XL: 'XL — неделя+',
}
export const SPHERE_LABELS = [
  'Продукты',
  'Личный бренд',
  'Обучение',
  'Вайбкодинг',
  'Контент',
  'Операционка',
]
export const ART_TYPES = [
  'link',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'md',
  'zip',
  'rar',
  'jpg',
  'png',
  'svg',
  'figma',
  'miro',
  'notion',
  'gdoc',
  'gsheet',
]

// Editable options
export const DEFAULT_STATUSES = ['backlog', 'ready', 'wip', 'done', 'frozen']
export const DEFAULT_PRIORITIES = ['critical', 'high', 'medium', 'low']
export const DEFAULT_EFFORTS = ['S', 'M', 'L', 'XL']
export const DEFAULT_TEAM_MEMBERS = ['Не назначен', 'Иван', 'Мария', 'Алексей']

// Story points
export const STORY_POINTS = [0, 1, 2, 3, 5, 8, 13, 21]

// Funny messages for sprint review
export const SPRINT_MESSAGES = {
  excellent: [
    '🚀 Команда на огне! Так держать!',
    '⭐ Красавчики! Продакт доволен',
    '🎉 Идеальный спринт! Все счастливы',
    '💪 Мощно! Продолжаем в том же духе',
  ],
  good: [
    '👍 Неплохо, но можно лучше',
    '😊 Норм спринт, продакт спокоен',
    '✨ Хорошая работа, двигаемся дальше',
    '🎯 План выполнен, все довольны',
  ],
  bad: [
    '😅 Проджект нервничает, пошел пить магний',
    '😰 Магния уже не хватает...',
    '🤔 Продакт задумчиво смотрит на дедлайны',
    '😬 Напряженная атмосфера на стендапе',
  ],
  terrible: [
    '😡 Проджект злится, осматривает инвентарь для рукопрекладства',
    '🔥 Все горит! Срочно нужен ретро',
    '💀 Дедлайны плачут в углу',
    '⚠️ Код-ревью превратилось в терапию',
  ],
}

export const GANTT_BASE = new Date('2026-03-10')
export const GANTT_WEEKS = 16

// Validate task before saving
export function validateTaskBeforeSave(task) {
  const validation = validateTask(task)
  if (!validation.isValid) {
    showValidationErrors(validation.errors)
    return false
  }
  return true
}
