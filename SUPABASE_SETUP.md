# Настройка Supabase для Roadmap App

## Шаг 1: Создай проект в Supabase

1. Зайди на https://supabase.com
2. Нажми "Start your project" или "New Project"
3. Войди через GitHub (если еще не вошел)
4. Создай новую организацию (если нужно)
5. Создай новый проект:
   - **Name**: roadmap-app (или любое имя)
   - **Database Password**: придумай надежный пароль (сохрани его!)
   - **Region**: выбери ближайший регион (например, Europe West)
   - Нажми "Create new project"
6. Подожди 1-2 минуты, пока проект создается

## Шаг 2: Создай таблицу в базе данных

1. В левом меню выбери **SQL Editor**
2. Нажми "New query"
3. Скопируй весь код из файла `supabase-setup.sql` и вставь в редактор
4. Нажми "Run" (или Ctrl+Enter)
5. Должно появиться сообщение "Success. No rows returned"

## Шаг 3: Настрой OAuth провайдеры

### Google OAuth

1. В левом меню выбери **Authentication** → **Providers**
2. Найди **Google** и нажми на него
3. Включи "Enable Sign in with Google"
4. Скопируй **Callback URL** (понадобится для Google Console)

Теперь настрой Google:
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
   - Authorized redirect URIs: вставь Callback URL из Supabase
   - Нажми "Create"
7. Скопируй **Client ID** и **Client Secret**
8. Вернись в Supabase и вставь их в настройки Google провайдера
9. Нажми "Save"

### GitHub OAuth

1. В Supabase: **Authentication** → **Providers** → **GitHub**
2. Включи "Enable Sign in with GitHub"
3. Скопируй **Callback URL**

Настрой GitHub:
1. Зайди на https://github.com/settings/developers
2. Нажми **New OAuth App**
3. Заполни:
   - Application name: Roadmap App
   - Homepage URL: https://yourdomain.com (или http://localhost:5173 для теста)
   - Authorization callback URL: вставь Callback URL из Supabase
4. Нажми "Register application"
5. Скопируй **Client ID**
6. Нажми "Generate a new client secret" и скопируй **Client Secret**
7. Вернись в Supabase и вставь их в настройки GitHub провайдера
8. Нажми "Save"

## Шаг 4: Получи API ключи

1. В левом меню выбери **Project Settings** (иконка шестеренки внизу)
2. Перейди в **API**
3. Найди:
   - **Project URL** (например: https://xxxxx.supabase.co)
   - **anon public** ключ (длинная строка)
4. Скопируй оба значения

## Шаг 5: Настрой локальный проект

1. Создай файл `.env` в корне проекта:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=твой_anon_ключ
```

2. Замени значения на свои из Supabase

3. Перезапусти dev-сервер:
```bash
npm run dev
```

## Шаг 6: Тестируй локально

1. Открой http://localhost:5173
2. Должен появиться экран авторизации
3. Попробуй войти через Google или GitHub
4. После входа создай эпик или задачу
5. Проверь в Supabase: **Table Editor** → **roadmaps** - должна появиться запись

## Шаг 7: Деплой на GitHub Pages

1. Добавь секреты в GitHub:
   - Зайди в свой репозиторий на GitHub
   - **Settings** → **Secrets and variables** → **Actions**
   - Нажми "New repository secret"
   - Добавь два секрета:
     - Name: `VITE_SUPABASE_URL`, Value: твой URL
     - Name: `VITE_SUPABASE_ANON_KEY`, Value: твой ключ

2. Обнови `.github/workflows/deploy.yml` - добавь env переменные в шаг Build:
```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

3. Обнови redirect URLs в OAuth провайдерах:
   - Google Console: добавь `https://yourusername.github.io/roadmap-app/`
   - GitHub OAuth: добавь `https://yourusername.github.io/roadmap-app/`
   - Supabase: **Authentication** → **URL Configuration** → добавь в **Redirect URLs**:
     ```
     https://yourusername.github.io/roadmap-app/
     ```

4. Запуш изменения:
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

5. Дождись деплоя и проверь сайт!

## Проверка работы

✅ Локально работает авторизация
✅ Данные сохраняются в Supabase
✅ После перезагрузки данные загружаются
✅ На GitHub Pages работает авторизация
✅ Разные пользователи видят только свои данные

## Troubleshooting

**Ошибка "Invalid API key"**
- Проверь, что правильно скопировал URL и ключ
- Убедись, что в `.env` нет лишних пробелов
- Перезапусти dev-сервер

**Авторизация не работает**
- Проверь Callback URLs в OAuth провайдерах
- Убедись, что провайдеры включены в Supabase
- Проверь консоль браузера на ошибки

**Данные не сохраняются**
- Проверь, что таблица создана (Table Editor → roadmaps)
- Проверь RLS политики (должны быть включены)
- Посмотри Network tab в DevTools на ошибки

**На GitHub Pages не работает**
- Проверь, что секреты добавлены в GitHub
- Проверь, что redirect URLs обновлены для production домена
- Посмотри логи в Actions

---

Готово! Теперь у тебя полноценное приложение с авторизацией и облачной базой данных 🚀
