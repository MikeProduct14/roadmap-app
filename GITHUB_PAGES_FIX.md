# Исправление проблемы с авторизацией на GitHub Pages

## Проблема
При деплое на GitHub Pages возникает ошибка `ERR_CONNECTION_CLOSED` при попытке авторизации через Supabase.

## Причина
Переменные окружения `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` не настроены в GitHub Secrets, поэтому приложение пытается подключиться к Supabase с пустыми значениями.

## Решение

### Шаг 1: Добавь секреты в GitHub

1. Открой свой репозиторий на GitHub
2. Перейди в **Settings** → **Secrets and variables** → **Actions**
3. Нажми **New repository secret**
4. Добавь два секрета:

**Первый секрет:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://твой-проект.supabase.co` (скопируй из Supabase Dashboard → Settings → API)

**Второй секрет:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJ...` (скопируй anon/public key из Supabase Dashboard → Settings → API)

### Шаг 2: Настрой Redirect URLs в Supabase

1. Открой Supabase Dashboard
2. Перейди в **Authentication** → **URL Configuration**
3. Добавь в **Redirect URLs**:
   ```
   https://твой-username.github.io/roadmap-app/
   ```
4. Добавь в **Site URL**:
   ```
   https://твой-username.github.io/roadmap-app/
   ```

### Шаг 3: Передеплой приложение

После добавления секретов:

```bash
git add .
git commit -m "Fix: Supabase configuration and redirect URLs"
git push
```

GitHub Actions автоматически пересоберёт и задеплоит приложение с правильными переменными окружения.

## Что было исправлено в коде

1. **src/services/supabase.js**:
   - Добавлена детальная диагностика конфигурации
   - Улучшена обработка невалидных переменных окружения
   - Добавлены настройки auth для корректной работы с OAuth

2. **src/Auth.jsx**:
   - Исправлен redirect URL для корректной работы на GitHub Pages с base path

3. **.github/workflows/deploy.yml**:
   - Уже настроен правильно для передачи секретов при сборке

## Проверка

После деплоя открой консоль браузера (F12) на странице приложения. Если увидишь ошибку:
```
Supabase не настроен. Проверьте переменные окружения
```
Значит секреты не добавлены или добавлены неправильно.

## Локальная разработка

Для локальной разработки создай файл `.env` (не коммить в git!):

```env
VITE_SUPABASE_URL=https://твой-проект.supabase.co
VITE_SUPABASE_ANON_KEY=твой_anon_key
```
