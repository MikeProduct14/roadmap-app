# Implementation Plan: Technical Refactoring

## Overview

Технический рефакторинг roadmap-app для приведения проекта в здоровое состояние. Рефакторинг разбит на 7 фаз: настройка инструментов, исправление критических ошибок, извлечение компонентов, реорганизация структуры, добавление обработки ошибок, извлечение утилит, и финальное форматирование.

## Tasks

- [x] 1. Фаза 1: Настройка инструментов разработки
  - [x] 1.1 Установить ESLint и Prettier зависимости
    - Выполнить: `npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh prettier`
    - _Requirements: 2.1, 2.2_
  
  - [x] 1.2 Создать конфигурацию ESLint (.eslintrc.cjs)
    - Создать файл .eslintrc.cjs в корне проекта
    - Настроить правила для React 18.3 и JSX
    - Отключить prop-types валидацию
    - _Requirements: 2.1_
  
  - [x] 1.3 Создать конфигурацию Prettier (.prettierrc)
    - Создать файл .prettierrc в корне проекта
    - Настроить: no semicolons, single quotes, 2 spaces, 100 chars line length
    - _Requirements: 2.2, 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [x] 1.4 Добавить npm скрипты для линтинга и форматирования
    - Добавить в package.json: "lint", "lint:fix", "format", "format:check"
    - _Requirements: 2.3, 2.4_

- [x] 2. Фаза 2: Исправление критических синтаксических ошибок
  - [x] 2.1 Исправить дублирующиеся константы в EpicsView.jsx
    - Удалить дублирующиеся объявления PRIO_ORDER (строки 4-5)
    - Удалить дублирующиеся объявления SEL_STYLE (строки 9-10, 111-113)
    - Удалить дублирующиеся объявления SORT_OPTIONS
    - _Requirements: 1.1, 1.3_
  
  - [x] 2.2 Проверить отсутствие синтаксических ошибок
    - Запустить getDiagnostics для EpicsView.jsx
    - Убедиться что возвращается 0 ошибок
    - _Requirements: 1.1, 1.2_
  
  - [x] 2.3 Запустить существующие тесты для проверки функциональности
    - Выполнить: `npm test`
    - Убедиться что все 72 теста проходят
    - _Requirements: 1.4, 7.1_

- [x] 3. Checkpoint - Убедиться что базовые исправления работают
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Фаза 3: Извлечение переиспользуемых компонентов
  - [x] 4.1 Создать структуру папок для компонентов
    - Создать директории: src/components/common/, src/components/views/, src/components/layout/
    - _Requirements: 4.1_
  
  - [x] 4.2 Извлечь компонент MultiSelect
    - Создать src/components/common/MultiSelect.jsx
    - Извлечь логику из ScrumbanView.jsx
    - Реализовать интерфейс: label, options, selected, onChange
    - Добавить управление состоянием открытия/закрытия
    - Добавить обработку кликов вне компонента
    - _Requirements: 3.1, 3.6_
  
  - [x] 4.3 Извлечь компонент Badge
    - Создать src/components/common/Badge.jsx
    - Извлечь логику отображения бейджей из EpicsView.jsx
    - Поддержать различные цвета и стили
    - _Requirements: 3.2_
  
  - [x] 4.4 Извлечь компонент PrioLabel
    - Создать src/components/common/PrioLabel.jsx
    - Извлечь логику отображения приоритетов из EpicsView.jsx
    - Использовать PRIO_COLORS для цветов
    - _Requirements: 3.3_
  
  - [x] 4.5 Извлечь компонент ArtIcon
    - Создать src/components/common/ArtIcon.jsx
    - Извлечь логику отображения иконок артефактов
    - _Requirements: 3.4_
  
  - [x] 4.6 Обновить импорты в ScrumbanView.jsx
    - Импортировать MultiSelect из components/common/
    - Заменить inline компонент на импортированный
    - _Requirements: 3.5, 3.7_
  
  - [x] 4.7 Обновить импорты в EpicsView.jsx
    - Импортировать Badge, PrioLabel, ArtIcon из components/common/
    - Заменить inline компоненты на импортированные
    - _Requirements: 3.5, 3.7_
  
  - [x]* 4.8 Написать unit тесты для MultiSelect
    - Тестировать рендеринг с различными props
    - Тестировать открытие/закрытие dropdown
    - Тестировать выбор опций и вызов onChange
    - _Requirements: 14.1_

- [x] 5. Checkpoint - Проверить что извлеченные компоненты работают
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Фаза 4: Реорганизация структуры проекта
  - [ ] 6.1 Создать структуру папок для бизнес-логики
    - Создать директории: src/hooks/, src/utils/, src/services/
    - _Requirements: 4.2_
  
  - [ ] 6.2 Переместить view компоненты
    - Переместить EpicsView.jsx в src/components/views/
    - Переместить ScrumbanView.jsx в src/components/views/
    - Переместить GanttView.jsx в src/components/views/
    - Переместить RetroView.jsx в src/components/views/
    - Переместить SprintReview.jsx в src/components/views/
    - Переместить SettingsView.jsx в src/components/views/
    - _Requirements: 4.3_
  
  - [ ] 6.3 Переместить layout компоненты
    - Переместить Modal.jsx в src/components/layout/
    - _Requirements: 4.4_
  
  - [ ] 6.4 Переместить сервисы
    - Переместить store.js в src/services/
    - Переместить supabase.js в src/services/
    - _Requirements: 4.5_
  
  - [ ] 6.5 Обновить все импорты в App.jsx
    - Обновить импорты view компонентов на новые пути
    - Обновить импорт Modal на новый путь
    - Обновить импорт store на новый путь
    - _Requirements: 4.6_
  
  - [ ] 6.6 Обновить все импорты в view компонентах
    - Обновить импорты store и supabase на новые пути
    - Обновить импорты общих компонентов
    - _Requirements: 4.6_
  
  - [ ] 6.7 Обновить импорты в main.jsx и Auth.jsx
    - Обновить импорты на новые пути
    - _Requirements: 4.6_
  
  - [ ] 6.8 Проверить отсутствие ошибок импорта
    - Запустить приложение и проверить консоль
    - Убедиться что нет ошибок "module not found"
    - _Requirements: 4.7_

- [ ] 7. Checkpoint - Проверить что реорганизация не сломала функциональность
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Фаза 5: Добавление обработки ошибок
  - [ ] 8.1 Создать утилиту обработки ошибок
    - Создать src/utils/errorHandler.js
    - Реализовать функцию withErrorHandling(asyncFn, errorMessage)
    - Функция должна ловить ошибки, логировать их и показывать alert
    - Функция должна возвращать null при ошибке вместо throw
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 8.2 Обернуть Supabase операции обработчиком ошибок
    - Обернуть loadTasksFromSupabase в withErrorHandling
    - Обернуть saveTaskToSupabase в withErrorHandling
    - Обернуть deleteTaskFromSupabase в withErrorHandling
    - Обернуть syncWithSupabase в withErrorHandling
    - _Requirements: 6.5_
  
  - [ ] 8.3 Добавить обработку ошибок localStorage
    - Обернуть все localStorage.setItem в try-catch
    - Обернуть все localStorage.getItem в try-catch
    - Обработать QuotaExceededError с понятным сообщением
    - _Requirements: 6.6, 6.7_
  
  - [ ] 8.4 Реализовать fallback на localStorage при ошибках Supabase
    - При ошибке загрузки из Supabase использовать localStorage
    - При ошибке сохранения в Supabase сохранять в localStorage
    - Показывать пользователю что работа идет в offline режиме
    - _Requirements: 13.1, 13.2_
  
  - [ ] 8.5 Реализовать синхронизацию при восстановлении соединения
    - Создать функцию syncLocalToSupabase
    - При успешном подключении синхронизировать localStorage с Supabase
    - При ошибке синхронизации сохранять локальные данные
    - _Requirements: 13.3, 13.4, 13.5_
  
  - [ ]* 8.6 Написать unit тесты для withErrorHandling
    - Тестировать успешное выполнение async функции
    - Тестировать обработку ошибок
    - Тестировать что функция никогда не бросает исключения
    - _Requirements: 14.3_

- [ ] 9. Checkpoint - Проверить обработку ошибок
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Фаза 6: Извлечение констант и утилит
  - [ ] 10.1 Создать файл констант
    - Создать src/utils/constants.js
    - Извлечь PRIO_COLORS, PRIO_ORDER, STATUS_BG, STATUS_TX, SEL_STYLE
    - Экспортировать все константы
    - _Requirements: 5.1, 5.6_
  
  - [ ] 10.2 Обновить импорты констант во всех компонентах
    - Заменить локальные константы на импорты из utils/constants.js
    - Обновить EpicsView.jsx, ScrumbanView.jsx, GanttView.jsx
    - _Requirements: 5.6_
  
  - [ ] 10.3 Создать утилиту сортировки задач
    - Создать src/utils/sortTasks.js
    - Реализовать функцию sortTasks(tasks, sortOption)
    - Поддержать сортировку по: name, priority, deadline, storyPoints (asc/desc)
    - Не мутировать исходный массив
    - _Requirements: 5.2, 5.4, 9.4_
  
  - [ ] 10.4 Обновить использование sortTasks в компонентах
    - Заменить inline сортировку на вызов sortTasks
    - Обновить EpicsView.jsx и ScrumbanView.jsx
    - _Requirements: 5.4_
  
  - [ ] 10.5 Создать хук useCollapsed
    - Создать src/hooks/useCollapsed.js
    - Реализовать хук для управления collapsed состоянием
    - Сохранять состояние в localStorage
    - Восстанавливать состояние при монтировании
    - _Requirements: 5.3, 5.5_
  
  - [ ] 10.6 Использовать useCollapsed в EpicsView
    - Заменить локальное состояние на useCollapsed
    - Передать storageKey для персистентности
    - _Requirements: 5.5, 7.8_
  
  - [ ]* 10.7 Написать unit тесты для sortTasks
    - Тестировать что длина массива сохраняется
    - Тестировать что исходный массив не мутируется
    - Тестировать корректность сортировки для каждого критерия
    - _Requirements: 14.2_
  
  - [ ]* 10.8 Написать unit тесты для useCollapsed
    - Тестировать сохранение состояния в localStorage
    - Тестировать восстановление состояния при ремонтировании
    - Тестировать toggle функциональность
    - _Requirements: 14.4_

- [ ] 11. Фаза 7: Добавление валидации данных
  - [ ] 11.1 Создать утилиту валидации задач
    - Создать src/utils/validation.js
    - Реализовать функцию validateTask(task)
    - Проверять наличие name, epicId, status
    - Возвращать массив ошибок или true
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 11.2 Добавить валидацию перед сохранением задачи
    - Вызывать validateTask перед saveTask в store.js
    - Показывать ошибки валидации пользователю
    - Предотвращать сохранение невалидных данных
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [ ] 11.3 Добавить валидацию в Modal компонент
    - Проверять данные формы перед отправкой
    - Подсвечивать поля с ошибками
    - Блокировать кнопку сохранения при невалидных данных
    - _Requirements: 8.4_

- [ ] 12. Фаза 8: Оптимизация производительности
  - [ ] 12.1 Добавить мемоизацию фильтрации задач
    - Использовать useMemo для filteredTasks в ScrumbanView
    - Зависимости: tasks, statusFilter, prioFilter, assigneeFilter
    - _Requirements: 9.1_
  
  - [ ] 12.2 Добавить мемоизацию сортировки задач
    - Использовать useMemo для sortedTasks в EpicsView и ScrumbanView
    - Зависимости: filteredTasks, sortOption
    - _Requirements: 9.2, 9.3_
  
  - [ ] 12.3 Разбить большие компоненты на подкомпоненты
    - Извлечь TaskRow из EpicsView (если компонент > 300 строк)
    - Извлечь EpicHeader из EpicsView (если компонент > 300 строк)
    - Извлечь TaskTable из ScrumbanView (если компонент > 300 строк)
    - _Requirements: 11.1, 11.2_

- [ ] 13. Checkpoint - Проверить оптимизации
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Фаза 9: Финальное форматирование и линтинг
  - [ ] 14.1 Запустить Prettier на всех файлах
    - Выполнить: `npm run format`
    - Убедиться что все файлы отформатированы
    - _Requirements: 2.6, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [ ] 14.2 Запустить ESLint и исправить все проблемы
    - Выполнить: `npm run lint:fix`
    - Вручную исправить оставшиеся проблемы
    - _Requirements: 2.5, 11.5_
  
  - [ ] 14.3 Проверить что нет ошибок и предупреждений
    - Выполнить: `npm run lint`
    - Убедиться что вывод показывает 0 errors, 0 warnings
    - _Requirements: 11.5_
  
  - [ ] 14.4 Проверить размер компонентов
    - Убедиться что все компоненты < 300 строк
    - При необходимости разбить большие компоненты
    - _Requirements: 11.1, 11.2_
  
  - [ ] 14.5 Проверить соглашения об именовании
    - Убедиться что файлы и переменные следуют единому стилю
    - Компоненты: PascalCase
    - Утилиты и хуки: camelCase
    - Константы: UPPER_SNAKE_CASE
    - _Requirements: 11.3_

- [ ] 15. Фаза 10: Финальная проверка и документация
  - [ ] 15.1 Запустить полный набор тестов
    - Выполнить: `npm test`
    - Убедиться что все 72 теста проходят
    - _Requirements: 7.1_
  
  - [ ] 15.2 Проверить все функции приложения вручную
    - Создание задачи
    - Редактирование задачи
    - Удаление задачи
    - Drag-and-drop между колонками
    - Фильтрация по приоритету
    - Сортировка задач
    - Сворачивание эпиков
    - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_
  
  - [ ] 15.3 Проверить работу в offline режиме
    - Отключить интернет
    - Создать/изменить задачи
    - Убедиться что данные сохраняются в localStorage
    - Включить интернет
    - Убедиться что данные синхронизируются с Supabase
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ] 15.4 Обновить README.md с новой структурой проекта
    - Документировать новую структуру папок
    - Добавить описание новых npm скриптов
    - Добавить инструкции по разработке
    - _Requirements: 12.5_
  
  - [ ] 15.5 Создать git коммиты для каждой фазы
    - Закоммитить каждую фазу отдельно с описательным сообщением
    - Формат: "refactor(phase-N): описание изменений"
    - _Requirements: 12.1, 12.2_
  
  - [ ]* 15.6 Написать integration тесты для view компонентов
    - Тестировать EpicsView с реальным store
    - Тестировать ScrumbanView с реальным store
    - Тестировать взаимодействие компонентов
    - _Requirements: 14.6_

- [ ] 16. Final Checkpoint - Убедиться что рефакторинг завершен
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Задачи помеченные `*` являются опциональными и могут быть пропущены для более быстрого MVP
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoint задачи обеспечивают инкрементальную валидацию
- Рефакторинг разбит на 10 фаз для управляемости
- Все 15 требований покрыты задачами реализации
- Существующие 72 теста должны проходить после каждой фазы
