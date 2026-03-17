# Настройка Supabase для Roadmap App

## Шаг 1: Создай проект в Supabase

Проект уже создан:
- **Project URL**: https://giawwwkckdwsyvujbgjm.supabase.co
- **Publishable Key**: sb_publishable_hu6OIKJwbutmo02TaCcCrg_F_6Uoe2hDirect

## Шаг 2: Создай таблицы в базе данных

1. В левом меню выбери **SQL Editor**
2. Нажми "New query"
3. Скопируй весь код из файла `supabase-setup.sql` и вставь в редактор
4. Нажми "Run" (или Ctrl+Enter)
5. Должно появиться сообщение "Success. No rows returned"

Этот скрипт создаст:
- Таблицу `profiles` для хранения профилей пользователей (email, телефон, должность, имя)
- Таблицу `roadmaps` для хранения данных roadmap
- Row Level Security (RLS) политики для безопасности
- Триггер для автоматического создания профиля при регистрации через OAuth

## Шаг 3: Настрой OAuth провайдеры

### Google OAuth

1. В левом меню выбери **Authentication** → **Providers**
2. Найди **Google** и нажми на него
3. Включи "Enable Sign in with Google"
4. Скопируй **Callback URL**: `https://giawwwkckdwsyvujbgjm.supabase.co/auth/v1/callback`

Настрой Google:
1. Зайди на https://console.cloud.google.com
2. Создай новый проект или выбери существующий
3. Перейди в **APIs & Services** → **Credentials**
4. Нажми **Create Credentials** → **OAuth client ID**
5. Если нужно, настрой OAuth consent screen:
   - User Type: External
   - App name: Roadmap App
   - User support email: твой email
   - Developer contact: твой email
   - Сохрани
6. Создай OAuth client ID:
   - Application type: **Web application**
   - Name: Roadmap App
   - Authorized redirect URIs: `https://giawwwkckdwsyvujbgjm.supabase.co/auth/v1/callback`
   - Нажми "Create"
7. Скопируй **Client ID** и **Client Secret**
8. Вернись в Supabase и вставь их в настройки Google провайдера
9. Нажми "Save"

### GitHub OAuth

1. В Supabase: **Authentication** → **Providers** → **GitHub**
2. Включи "Enable Sign in with GitHub"
3. Callback URL: `https://giawwwkckdwsyvujbgjm.supabase.co/auth/v1/callback`

Настрой GitHub:
1. Зайди на https://github.com/settings/developers
2. Нажми **New OAuth App**
3. Заполни:
   - Application name: Roadmap App
   - Homepage URL: https://mikeproduct14.github.io/roadmap-app/
   - Authorization callback URL: `https://giawwwkckdwsyvujbgjm.supabase.co/auth/v1/callback`
4. Нажми "Register application"
5. Скопируй **Client ID**
6. Нажми "Generate a new client secret" и скопируй **Client Secret**
7. Вернись в Supabase и вставь их в настройки GitHub провайдера
8. Нажми "Save"

## Шаг 4: Настрой Email/Password авторизацию

Email/Password авторизация работает по умолчанию. Настройки:

1. **Authentication** → **Settings**
2. Можно отключить "Enable email confirmations" для тестирования
3. Настрой email templates в **Authentication** → **Email Templates**

## Шаг 5: Настрой локальный проект

Файл `.env` уже создан с правильными значениями:
```bash
VITE_SUPABASE_URL=https://giawwwkckdwsyvujbgjm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_hu6OIKJwbutmo02TaCcCrg_F_6Uoe2hDirect
```

Перезапусти dev-сервер:
```bash
npm run dev
```

## Шаг 6: Тестируй локально

1. Открой http://localhost:5173
2. Должен появиться экран авторизации с тремя вариантами:
   - Войти через Google
   - Войти через GitHub
   - Войти/Зарегистрироваться через Email
3. После первого входа через OAuth заполни профиль:
   - Телефон (обязательно)
   - Должность/Роль (обязательно)
   - Имя (опционально)
4. Создай эпик или задачу
5. Проверь в Supabase:
   - **Table Editor** → **profiles** - должен быть твой профиль
   - **Table Editor** → **roadmaps** - должна появиться запись с данными

## Шаг 7: Деплой на GitHub Pages

1. Добавь секреты в GitHub:
   - Зайди в репозиторий https://github.com/MikeProduct14/roadmap-app
   - **Settings** → **Secrets and variables** → **Actions**
   - Нажми "New repository secret"
   - Добавь два секрета:
     - Name: `VITE_SUPABASE_URL`
     - Value: `https://giawwwkckdwsyvujbgjm.supabase.co`
     - Name: `VITE_SUPABASE_ANON_KEY`
     - Value: `sb_publishable_hu6OIKJwbutmo02TaCcCrg_F_6Uoe2hDirect`

2. Обнови `.github/workflows/deploy.yml` - добавь env переменные в шаг Build:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

3. Обнови redirect URLs в OAuth провайдерах:
   - Google Console: добавь `https://mikeproduct14.github.io/roadmap-app/`
   - GitHub OAuth: обнови Homepage URL на `https://mikeproduct14.github.io/roadmap-app/`
   - Supabase: **Authentication** → **URL Configuration** → добавь в **Redirect URLs**:
     ```
     https://mikeproduct14.github.io/roadmap-app/
     http://localhost:5173
     ```

4. Запуш изменения:
```bash
git add .
git commit -m "Add Supabase integration with profiles"
git push
```

5. Дождись деплоя и проверь сайт!

## Как работает регистрация

### OAuth (Google/GitHub)
1. Пользователь нажимает "Войти через Google/GitHub"
2. Supabase перенаправляет на OAuth провайдер
3. После успешной авторизации создается пользователь в `auth.users`
4. Триггер автоматически создает запись в `profiles` с email и именем
5. Приложение проверяет профиль - если нет телефона/должности, показывает форму
6. Пользователь заполняет обязательные поля
7. Профиль обновляется, пользователь получает доступ к приложению

### Email/Password
1. Пользователь вводит email и пароль
2. При регистрации создается пользователь в `auth.users`
3. Отправляется письмо с подтверждением (если включено)
4. После подтверждения триггер создает профиль
5. Пользователь заполняет телефон и должность
6. Получает доступ к приложению

## Структура данных

### Таблица profiles
```sql
- id (UUID, primary key, ссылка на auth.users)
- email (TEXT)
- phone (TEXT) - обязательное
- role (TEXT) - обязательное (должность)
- name (TEXT) - опциональное
- avatar_url (TEXT) - из OAuth
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Таблица roadmaps
```sql
- id (UUID, primary key)
- user_id (UUID, ссылка на auth.users)
- epics (JSONB)
- tasks (JSONB)
- settings (JSONB)
- next_epic_id (INTEGER)
- next_task_id (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Проверка работы

✅ Локально работает авторизация (OAuth + Email)
✅ После первого входа запрашивается профиль
✅ Данные сохраняются в Supabase
✅ После перезагрузки данные загружаются
✅ На GitHub Pages работает авторизация
✅ Разные пользователи видят только свои данные
✅ RLS защищает данные пользователей

## Troubleshooting

**Ошибка "Invalid API key"**
- Проверь, что правильно скопировал URL и ключ
- Убедись, что в `.env` нет лишних пробелов
- Перезапусти dev-сервер

**Авторизация не работает**
- Проверь Callback URLs в OAuth провайдерах
- Убедись, что провайдеры включены в Supabase
- Проверь консоль браузера на ошибки

**Форма профиля не появляется**
- Проверь, что таблица `profiles` создана
- Проверь триггер `on_auth_user_created`
- Посмотри в Table Editor → profiles, есть ли запись

**Данные не сохраняются**
- Проверь, что таблица `roadmaps` создана
- Проверь RLS политики (должны быть включены)
- Посмотри Network tab в DevTools на ошибки

**На GitHub Pages не работает**
- Проверь, что секреты добавлены в GitHub
- Проверь, что redirect URLs обновлены для production домена
- Посмотри логи в Actions

---

Готово! Теперь у тебя полноценное приложение с авторизацией, профилями и облачной базой данных 🚀
