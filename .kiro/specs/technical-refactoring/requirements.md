# Requirements Document

## Introduction

Данный документ описывает требования к техническому рефакторингу roadmap-app. Цель рефакторинга - привести проект в здоровое состояние путем исправления критических ошибок, улучшения структуры кода, добавления инструментов разработки и обеспечения поддерживаемости без потери существующей функциональности.

## Glossary

- **System**: roadmap-app - веб-приложение для управления задачами и эпиками
- **ESLint**: инструмент статического анализа кода для JavaScript/JSX
- **Prettier**: инструмент автоматического форматирования кода
- **Component**: React компонент - переиспользуемый элемент пользовательского интерфейса
- **View**: представление - страница или основной раздел приложения
- **Supabase**: облачный сервис для хранения данных
- **LocalStorage**: локальное хранилище браузера
- **Test_Suite**: набор из 72 существующих тестов
- **Diagnostic**: сообщение об ошибке или предупреждение от инструментов анализа кода
- **EpicsView**: компонент для отображения эпиков и связанных задач
- **MultiSelect**: компонент выпадающего списка с множественным выбором
- **Error_Handler**: утилита для обработки ошибок асинхронных операций

## Requirements

### Requirement 1: Исправление критических синтаксических ошибок

**User Story:** Как разработчик, я хочу чтобы все файлы проекта были синтаксически корректными, чтобы код можно было запускать и поддерживать.

#### Acceptance Criteria

1. WHEN getDiagnostics проверяет файл EpicsView.jsx, THE System SHALL return zero syntax errors
2. WHEN EpicsView.jsx загружается в браузере, THE System SHALL render without throwing exceptions
3. THE System SHALL remove all duplicate constant declarations from EpicsView.jsx
4. THE System SHALL preserve original functionality of EpicsView.jsx after fixes

### Requirement 2: Настройка инструментов разработки

**User Story:** Как разработчик, я хочу иметь настроенные линтер и форматтер, чтобы поддерживать единый стиль кода и автоматически находить ошибки.

#### Acceptance Criteria

1. THE System SHALL include ESLint configuration file (.eslintrc.cjs) in project root
2. THE System SHALL include Prettier configuration file (.prettierrc) in project root
3. THE System SHALL include npm script "lint" that runs ESLint on all source files
4. THE System SHALL include npm script "format" that runs Prettier on all source files
5. WHEN "npm run lint" is executed, THE System SHALL report code quality issues
6. WHEN "npm run format" is executed, THE System SHALL format all source files according to Prettier rules

### Requirement 3: Извлечение переиспользуемых компонентов

**User Story:** Как разработчик, я хочу извлечь дублирующиеся компоненты в отдельные файлы, чтобы уменьшить дублирование кода и упростить поддержку.

#### Acceptance Criteria

1. THE System SHALL extract MultiSelect component to src/components/common/MultiSelect.jsx
2. THE System SHALL extract Badge component to src/components/common/Badge.jsx
3. THE System SHALL extract PrioLabel component to src/components/common/PrioLabel.jsx
4. THE System SHALL extract ArtIcon component to src/components/common/ArtIcon.jsx
5. WHEN extracted components are imported in views, THE System SHALL render them correctly
6. WHEN MultiSelect receives props (label, options, selected, onChange), THE System SHALL display dropdown with correct options
7. WHEN user interacts with extracted components, THE System SHALL maintain original behavior

### Requirement 4: Реорганизация структуры проекта

**User Story:** Как разработчик, я хочу иметь логичную структуру папок, чтобы легко находить нужные файлы и понимать архитектуру проекта.

#### Acceptance Criteria

1. THE System SHALL organize components into folders: components/common/, components/views/, components/layout/
2. THE System SHALL organize business logic into folders: hooks/, utils/, services/
3. THE System SHALL move view components (EpicsView, ScrumbanView, GanttView, RetroView, SprintReview, SettingsView) to components/views/
4. THE System SHALL move Modal component to components/layout/
5. THE System SHALL move store.js and supabase.js to services/
6. THE System SHALL update all import statements to reflect new file locations
7. WHEN application starts after reorganization, THE System SHALL load without import errors

### Requirement 5: Извлечение констант и утилит

**User Story:** Как разработчик, я хочу вынести константы и вспомогательные функции в отдельные модули, чтобы избежать дублирования и упростить изменения.

#### Acceptance Criteria

1. THE System SHALL extract constants (PRIO_COLORS, PRIO_ORDER, STATUS_BG, STATUS_TX, SEL_STYLE) to src/utils/constants.js
2. THE System SHALL extract sortTasks function to src/utils/sortTasks.js
3. THE System SHALL extract useCollapsed hook to src/hooks/useCollapsed.js
4. WHEN sortTasks is called with tasks array and sort option, THE System SHALL return sorted array
5. WHEN useCollapsed hook is used, THE System SHALL persist collapsed state to localStorage
6. WHEN constants are imported from utils/constants.js, THE System SHALL provide correct values

### Requirement 6: Добавление обработки ошибок

**User Story:** Как пользователь, я хочу видеть понятные сообщения об ошибках вместо падения приложения, чтобы понимать что пошло не так и продолжать работу.

#### Acceptance Criteria

1. THE System SHALL create error handler utility (withErrorHandling) in src/utils/errorHandler.js
2. WHEN async operation fails, THE System SHALL catch error and log it to console
3. WHEN async operation fails, THE System SHALL display user-friendly error message
4. WHEN async operation fails, THE System SHALL return null instead of throwing exception
5. THE System SHALL wrap all Supabase operations with error handler
6. THE System SHALL wrap all localStorage operations with try-catch blocks
7. IF localStorage quota is exceeded, THEN THE System SHALL notify user about storage limit

### Requirement 7: Сохранение функциональности

**User Story:** Как пользователь, я хочу чтобы все существующие функции продолжали работать после рефакторинга, чтобы не потерять возможности приложения.

#### Acceptance Criteria

1. WHEN Test_Suite is executed after refactoring, THE System SHALL pass all 72 existing tests
2. WHEN user creates new task, THE System SHALL save it to storage (localStorage or Supabase)
3. WHEN user edits task, THE System SHALL update task data
4. WHEN user deletes task, THE System SHALL remove it from storage
5. WHEN user drags task between columns, THE System SHALL update task status
6. WHEN user filters tasks by priority, THE System SHALL display only matching tasks
7. WHEN user sorts tasks, THE System SHALL reorder tasks according to selected criterion
8. WHEN user collapses epic, THE System SHALL hide tasks and persist collapsed state

### Requirement 8: Валидация данных

**User Story:** Как пользователь, я хочу чтобы система проверяла корректность вводимых данных, чтобы избежать сохранения невалидных задач.

#### Acceptance Criteria

1. WHEN user attempts to save task without name, THE System SHALL prevent save and show validation error
2. WHEN user attempts to save task without epic, THE System SHALL prevent save and show validation error
3. WHEN user attempts to save task without status, THE System SHALL prevent save and show validation error
4. WHEN task data is valid, THE System SHALL allow save operation
5. THE System SHALL validate task data before any save operation

### Requirement 9: Производительность и оптимизация

**User Story:** Как пользователь, я хочу чтобы приложение работало быстро, чтобы эффективно управлять задачами.

#### Acceptance Criteria

1. WHEN tasks are filtered, THE System SHALL use memoization to avoid unnecessary recalculations
2. WHEN tasks are sorted, THE System SHALL use memoization to avoid unnecessary recalculations
3. WHEN component re-renders, THE System SHALL only recalculate values if dependencies changed
4. THE System SHALL not mutate original arrays during sort operations

### Requirement 10: Безопасность данных

**User Story:** Как пользователь, я хочу чтобы мои данные были защищены, чтобы другие пользователи не могли их видеть или изменять.

#### Acceptance Criteria

1. WHEN user accesses Supabase data, THE System SHALL enforce Row Level Security policies
2. WHEN user queries tasks, THE System SHALL return only tasks belonging to that user
3. THE System SHALL store Supabase credentials in environment variables
4. THE System SHALL not commit .env file to version control
5. THE System SHALL sanitize user input to prevent XSS attacks

### Requirement 11: Поддерживаемость кода

**User Story:** Как разработчик, я хочу чтобы код был читаемым и хорошо структурированным, чтобы легко вносить изменения и исправлять ошибки.

#### Acceptance Criteria

1. THE System SHALL limit component size to maximum 300 lines of code
2. THE System SHALL extract components exceeding 300 lines into smaller sub-components
3. THE System SHALL use consistent naming conventions for files and variables
4. THE System SHALL follow single responsibility principle for components and functions
5. WHEN ESLint runs, THE System SHALL report zero errors and zero warnings

### Requirement 12: Документация изменений

**User Story:** Как разработчик, я хочу иметь документацию по миграции, чтобы понимать какие изменения были внесены и как откатить их при необходимости.

#### Acceptance Criteria

1. THE System SHALL commit each refactoring phase separately to git
2. THE System SHALL include descriptive commit messages for each phase
3. THE System SHALL maintain backup of original src/ folder before refactoring
4. IF tests fail after any phase, THEN THE System SHALL allow rollback to previous commit
5. THE System SHALL document new folder structure in README.md

### Requirement 13: Offline работа

**User Story:** Как пользователь, я хочу чтобы приложение работало без интернета, чтобы управлять задачами в любых условиях.

#### Acceptance Criteria

1. WHEN Supabase connection fails, THE System SHALL fall back to localStorage
2. WHEN working offline, THE System SHALL save all changes to localStorage
3. WHEN connection is restored, THE System SHALL sync localStorage data with Supabase
4. WHEN sync fails, THE System SHALL notify user but keep local data intact
5. THE System SHALL not lose user data during connection failures

### Requirement 14: Тестирование компонентов

**User Story:** Как разработчик, я хочу иметь тесты для новых компонентов и утилит, чтобы гарантировать их корректную работу.

#### Acceptance Criteria

1. THE System SHALL include unit tests for MultiSelect component
2. THE System SHALL include unit tests for sortTasks utility
3. THE System SHALL include unit tests for withErrorHandling utility
4. THE System SHALL include unit tests for useCollapsed hook
5. WHEN tests are executed, THE System SHALL achieve minimum 80% code coverage for new utilities
6. THE System SHALL include integration tests for view components with store

### Requirement 15: Форматирование и стиль кода

**User Story:** Как разработчик, я хочу чтобы весь код был единообразно отформатирован, чтобы легко читать и понимать любую часть проекта.

#### Acceptance Criteria

1. THE System SHALL use 2 spaces for indentation
2. THE System SHALL use single quotes for strings
3. THE System SHALL not use semicolons at end of statements
4. THE System SHALL limit line length to 100 characters
5. THE System SHALL use arrow functions without parentheses for single parameter
6. WHEN Prettier runs, THE System SHALL format all files according to configuration
