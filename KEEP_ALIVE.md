# 🔄 Keep-Alive для Supabase проекта

## Проблема

Supabase проекты на бесплатном тарифе засыпают после периода неактивности (обычно 7 дней). При первом запросе после "сна" проект просыпается, но это занимает время (cold start).

## Решение

Настроены автоматические пинги через GitHub Actions, которые поддерживают проект активным.

## 📋 Настроенные Workflows

### 1. Keep Supabase Alive (`.github/workflows/keep-alive.yml`)

**Расписание:** Каждые 3 дня в 8:00 UTC (11:00 МСК)

**Что делает:**
- Пингует Supabase REST API
- Проверяет доступность таблицы profiles
- Предотвращает засыпание проекта

**Запуск вручную:**
```bash
# Через GitHub UI
https://github.com/MikeProduct14/roadmap-app/actions/workflows/keep-alive.yml

# Или через GitHub CLI
gh workflow run keep-alive.yml
```

### 2. Health Check (`.github/workflows/health-check.yml`)

**Расписание:** Каждый понедельник в 9:00 UTC

**Что делает:**
- Проверяет здоровье REST API
- Проверяет Auth сервис
- Отчитывается о статусе

**Запуск вручную:**
```bash
# Через GitHub UI
https://github.com/MikeProduct14/roadmap-app/actions/workflows/health-check.yml

# Или через GitHub CLI
gh workflow run health-check.yml
```

## ⚙️ Настройка

### Требования

Для работы workflows нужны секреты в GitHub:
- `VITE_SUPABASE_ANON_KEY` - уже должен быть настроен

Если секрет не добавлен, следуйте инструкции из [QUICK_FIX.md](QUICK_FIX.md)

### Проверка работы

1. Откройте: https://github.com/MikeProduct14/roadmap-app/actions
2. Найдите workflows "Keep Supabase Alive" и "Health Check"
3. Запустите вручную через "Run workflow"
4. Проверьте логи выполнения

## 📊 Мониторинг

### Просмотр истории пингов

```bash
# Через GitHub CLI
gh run list --workflow=keep-alive.yml --limit 10
```

### Проверка последнего запуска

```bash
gh run view --workflow=keep-alive.yml
```

## 🔧 Настройка расписания

Если хотите изменить частоту пингов, отредактируйте cron в `.github/workflows/keep-alive.yml`:

```yaml
schedule:
  - cron: '0 8 */3 * *'  # Каждые 3 дня
  # - cron: '0 8 */2 * *'  # Каждые 2 дня
  # - cron: '0 8 * * *'    # Каждый день
  # - cron: '0 */12 * * *' # Каждые 12 часов
```

**Формат cron:**
```
┌───────────── минута (0 - 59)
│ ┌───────────── час (0 - 23)
│ │ ┌───────────── день месяца (1 - 31)
│ │ │ ┌───────────── месяц (1 - 12)
│ │ │ │ ┌───────────── день недели (0 - 6) (воскресенье - 0)
│ │ │ │ │
* * * * *
```

## 🌐 Альтернативные решения

Если GitHub Actions не подходит, можно использовать:

### 1. Cron-job.org
- Бесплатный внешний планировщик
- URL: `https://giawwwkckdwsyvujbgjm.supabase.co/rest/v1/`
- Добавьте header: `apikey: ваш_anon_key`

### 2. Uptime Robot
- Мониторинг с пингом каждые 5 минут
- Бесплатный тариф: до 50 мониторов
- URL: https://uptimerobot.com

### 3. Render Cron Jobs
- Если деплоите на Render
- Настраивается в render.yaml

## ⚠️ Важно

- GitHub Actions workflows могут быть отключены, если репозиторий неактивен 60 дней
- Чтобы избежать этого, делайте коммиты или запускайте workflows вручную
- Supabase может изменить политику засыпания проектов

## 🎯 Рекомендации

1. **Для активных проектов:** Keep-alive каждые 3 дня достаточно
2. **Для редко используемых:** Можно увеличить до 5-6 дней
3. **Для критичных:** Добавьте внешний мониторинг (Uptime Robot)

---

**Статус:** ✅ Настроено и готово к работе

**Следующий пинг:** Проверьте в Actions → Keep Supabase Alive
