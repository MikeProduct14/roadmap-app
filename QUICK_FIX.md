# 🔧 Быстрое исправление ошибки авторизации

## Проблема
При входе на сайт появляется ошибка: **"Не удается получить доступ к сайту"** с кодом `ERR_CONNECTION_CLOSED`

## Причина
Приложение не может подключиться к Supabase, потому что переменные окружения не настроены в GitHub.

## ✅ Решение (3 шага)

### Шаг 1: Добавь секреты в GitHub

1. Открой https://github.com/твой-username/roadmap-app/settings/secrets/actions
2. Нажми **"New repository secret"**
3. Добавь первый секрет:
   - Name: `VITE_SUPABASE_URL`
   - Value: скопируй из Supabase Dashboard → Settings → API → Project URL
   
4. Нажми **"New repository secret"** снова
5. Добавь второй секрет:
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: скопируй из Supabase Dashboard → Settings → API → Project API keys → anon public

### Шаг 2: Настрой Redirect URLs в Supabase

1. Открой Supabase Dashboard → Authentication → URL Configuration
2. В поле **"Redirect URLs"** добавь:
   ```
   https://твой-username.github.io/roadmap-app/
   ```
3. В поле **"Site URL"** укажи:
   ```
   https://твой-username.github.io/roadmap-app/
   ```
4. Сохрани изменения

### Шаг 3: Передеплой приложение

Сделай любое изменение и запуш:

```bash
git add .
git commit -m "Fix: Add Supabase configuration"
git push
```

Или просто запусти workflow вручную:
1. Открой https://github.com/твой-username/roadmap-app/actions
2. Выбери "Deploy to GitHub Pages"
3. Нажми "Run workflow"

## 🎉 Готово!

Подожди 2-3 минуты пока GitHub Actions соберёт и задеплоит приложение. После этого авторизация заработает!

## 🔍 Проверка

Открой сайт и нажми F12 (консоль браузера):
- ✅ Если ошибок нет — всё работает!
- ❌ Если видишь "Supabase не настроен" — проверь, что секреты добавлены правильно

---

Подробная документация: [GITHUB_PAGES_FIX.md](GITHUB_PAGES_FIX.md)
