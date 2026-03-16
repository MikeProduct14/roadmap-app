# Roadmap App

Личный roadmap с эпиками, задачами, подзадачами, артефактами и гант-диаграммой.

## Стек
- **React 18 + Vite** — быстрая разработка
- **localStorage** — хранение данных в браузере (без бэкенда)
- **nginx** — деплой на сервер

---

## Разработка локально

```bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# → http://localhost:5173
```

---

## Деплой на сервер

### 1. Собери проект
```bash
npm run build
# Создаст папку dist/
```

### 2. Загрузи файлы на сервер
```bash
# Через scp
scp -r dist/* user@yourserver.com:/var/www/roadmap-app/

# Или через rsync
rsync -avz dist/ user@yourserver.com:/var/www/roadmap-app/
```

### 3. Настрой nginx
```bash
# Скопируй конфиг
sudo cp nginx.conf /etc/nginx/sites-available/roadmap
sudo ln -s /etc/nginx/sites-available/roadmap /etc/nginx/sites-enabled/

# Отредактируй server_name в конфиге
sudo nano /etc/nginx/sites-available/roadmap

# Создай папку и дай права
sudo mkdir -p /var/www/roadmap-app
sudo chown -R www-data:www-data /var/www/roadmap-app

# Перезапусти nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 4. SSL (опционально, через Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

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
