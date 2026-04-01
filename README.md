# Roadmap App

Личный roadmap с эпиками, задачами, подзадачами, артефактами и гант-диаграммой.

## Стек
- **React 18 + Vite** — быстрая разработка
- **Supabase** — база данных PostgreSQL + OAuth авторизация
- **localStorage** — локальный fallback (работает без интернета)

---

## 🚀 Быстрый старт

### Вариант 1: Без авторизации (только localStorage)

```bash
npm install
npm run dev
```

Данные сохраняются только в браузере.

### Вариант 2: С авторизацией и облачной БД

1. Следуй инструкции в **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
2. Создай `.env` файл с ключами Supabase
3. Запусти проект:

```bash
npm install
npm run dev
```

Данные синхронизируются между устройствами!

---

## Деплой на GitHub Pages

Подробная инструкция в **[DEPLOY.md](./DEPLOY.md)**

⚠️ **Важно!** Если используешь Supabase:

1. **Добавь секреты в GitHub** (Settings → Secrets and variables → Actions):
   - `VITE_SUPABASE_URL` - URL вашего Supabase проекта
   - `VITE_SUPABASE_ANON_KEY` - Anon/Public ключ

2. **Настрой Redirect URLs в Supabase** (Authentication → URL Configuration):
   - Добавь `https://ваш-username.github.io/roadmap-app/` в Redirect URLs
   - Установи тот же URL как Site URL

3. **Настрой OAuth провайдеры** (Google, GitHub):
   - Обнови Authorized redirect URIs на `https://ваш-проект.supabase.co/auth/v1/callback`

Если при авторизации возникает ошибка `ERR_CONNECTION_CLOSED`, см. **[GITHUB_PAGES_FIX.md](./GITHUB_PAGES_FIX.md)**

### Keep-Alive для Supabase

Настроены автоматические пинги через GitHub Actions, чтобы проект не засыпал:
- 🔄 Пинг каждые 3 дня
- 🏥 Health check каждую неделю

Подробнее: **[KEEP_ALIVE.md](./KEEP_ALIVE.md)**

---

## Вайбкодинг — как дорабатывать

Проект организован по модульной структуре:

### Структура проекта

```
src/
├── components/
│   ├── common/          # Переиспользуемые компоненты
│   │   └── MultiSelect.jsx
│   ├── views/           # Основные представления (будет добавлено)
│   └── layout/          # Layout компоненты (будет добавлено)
├── hooks/               # Custom React hooks
│   └── useCollapsed.js  # Управление collapsed состоянием
├── utils/               # Утилиты и вспомогательные функции
│   ├── constants.js     # Константы (цвета, стили)
│   ├── sortTasks.js     # Сортировка задач
│   └── validation.js    # Валидация данных
├── services/            # Сервисы (будет добавлено)
├── tests/               # Тесты
├── App.jsx              # Главный компонент
├── Auth.jsx             # Авторизация
├── store.js             # Управление состоянием
├── supabase.js          # Supabase клиент
└── Modal.jsx            # Модальное окно
```

### Основные файлы

| Файл | Что делает |
|------|-----------|
| `store.js` | Данные, localStorage, константы |
| `App.jsx` | Главный компонент, состояние |
| `EpicsView.jsx` | Таблица эпиков и задач |
| `ScrumbanView.jsx` | Scrumban доска |
| `GanttView.jsx` | Гант-диаграмма |
| `Modal.jsx` | Форма создания/редактирования |
| `utils/validation.js` | Валидация задач |
| `hooks/useCollapsed.js` | Персистентное состояние |

### Инструменты разработки

```bash
# Запуск тестов
npm test

# Проверка кода (ESLint)
npm run lint

# Автоисправление проблем
npm run lint:fix

# Форматирование кода (Prettier)
npm run format

# Проверка форматирования
npm run format:check
```

### Примеры запросов к Claude для доработки:
- *"Добавь колонку Сфера в таблицу задач"*
- *"Сделай drag-and-drop между спринтами"*
- *"Подключи Supabase вместо localStorage"*
- *"Добавь экспорт задач в CSV"*
- *"Добавь вид Kanban по статусам"*

---

## Структура данных

```js
// Эпик
{ id, name, color, sprint, startW, durW }

// Задача
{ id, epicId, parentId, name, status, priority, sprint, effort, deadline, notes, artifacts }

// Артефакт
{ type: 'pdf'|'doc'|'link', name, url }
```
