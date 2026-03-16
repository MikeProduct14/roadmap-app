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

Если используешь Supabase, не забудь:
1. Добавить секреты в GitHub (Settings → Secrets)
2. Обновить redirect URLs в OAuth провайдерах

---

## Вайбкодинг — как дорабатывать

Всё в папке `src/`:

| Файл | Что делает |
|------|-----------|
| `store.js` | Данные, localStorage, константы |
| `App.jsx` | Главный компонент, состояние |
| `EpicsView.jsx` | Таблица эпиков и задач |
| `GanttView.jsx` | Гант-диаграмма |
| `Modal.jsx` | Форма создания/редактирования |

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
