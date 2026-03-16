# Инструкция по деплою на GitHub Pages

## Шаг 1: Создай новый репозиторий на GitHub

1. Зайди на https://github.com/new
2. Назови репозиторий `roadmap-app` (или любое другое имя)
3. Оставь репозиторий публичным (Public)
4. НЕ добавляй README, .gitignore или лицензию (они уже есть в проекте)
5. Нажми "Create repository"

## Шаг 2: Загрузи код в репозиторий

Выполни команды в терминале из папки проекта:

```bash
# Инициализируй git (если еще не сделано)
git init

# Добавь все файлы
git add .

# Сделай первый коммит
git commit -m "Initial commit: Roadmap app"

# Добавь удаленный репозиторий (замени YOUR_USERNAME на свой username)
git remote add origin https://github.com/YOUR_USERNAME/roadmap-app.git

# Отправь код на GitHub
git branch -M main
git push -u origin main
```

## Шаг 3: Настрой GitHub Pages

1. Зайди в свой репозиторий на GitHub
2. Перейди в **Settings** → **Pages**
3. В разделе **Source** выбери:
   - Source: **GitHub Actions**
4. Сохрани настройки

## Шаг 4: Запусти деплой

После push в main ветку автоматически запустится GitHub Actions:

1. Перейди во вкладку **Actions** в репозитории
2. Дождись завершения workflow "Deploy to GitHub Pages" (зеленая галочка)
3. Твой сайт будет доступен по адресу:
   ```
   https://YOUR_USERNAME.github.io/roadmap-app/
   ```

## Важно: Обнови base в vite.config.js

Если твой репозиторий называется НЕ `roadmap-app`, обнови `vite.config.js`:

```js
base: process.env.NODE_ENV === 'production' ? '/ИМЯ_ТВОЕГО_РЕПОЗИТОРИЯ/' : '/',
```

## Обновление сайта

Каждый раз когда ты делаешь push в main, сайт автоматически обновится:

```bash
git add .
git commit -m "Описание изменений"
git push
```

## Локальная разработка

```bash
# Установи зависимости (первый раз)
npm install

# Запусти dev-сервер
npm run dev
```

Сайт откроется на http://localhost:5173

## Проверка перед деплоем

```bash
# Собери проект локально
npm run build

# Проверь сборку
npm run preview
```

---

Готово! Теперь у тебя есть автоматический деплой на GitHub Pages 🚀
