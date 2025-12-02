План улучшения проекта Lumi Todo
ЗАДАЧА 1: Удалить русские комментарии из production кода
Сложность: Простая | Время: 15 мин
Файлы для правки:

src/App.tsx (строки 53-56, 61-62)
src/components/layout/ProfileSettings.tsx (строки 69-71, 145-149, 155-156, 171-174, 186-187)
src/components/layout/TaskDetailsPopup.tsx (строки 23-26, 47-49)
src/components/common/A11yFocusWrapper.tsx (строка 48)
src/components/landing/HeroSection.tsx (строки 12-13, 28-31)

Действия:

Найти все комментарии на кириллице через regex //.\*[а-яА-ЯёЁ]
Удалить их полностью или заменить на английские эквиваленты
Особое внимание на ProfileSettings.tsx — там больше всего

ЗАДАЧА 2: Вынести магические числа в константы
Сложность: Простая | Время: 20 мин
Создать файл: src/lib/constants/index.ts
Константы для вынесения:

5 _ 1024 _ 1024 → MAX_AVATAR_SIZE_BYTES = 5242880
5 _ 1024 _ 1024 \* 1024 → MAX_STORAGE_LIMIT_BYTES = 5368709120
500 (delay в App.tsx) → PROFILE_CREATION_DELAY_MS = 500
90 (storage percentage) → STORAGE_WARNING_THRESHOLD = 90

Файлы для обновления:

src/lib/api/profile.api.ts (строки 72, 123)
src/App.tsx (строка 54)
src/components/layout/ProfileSettings.tsx (строки 207, 238)

Действия:

Создать файл констант с экспортом всех значений
Импортировать в нужных файлах
Заменить hardcoded значения на константы

ЗАДАЧА 3: Исправить типы в realtimeService
Сложность: Простая | Время: 10 мин
Файл: src/lib/realtime/realtimeService.ts
Проблема:

Метод subscribeToTasks возвращает channel: RealtimeChannel
Метод unsubscribe принимает key: string
В useRealtimeTasks.ts передается channel как строка

Действия:

Изменить сигнатуру unsubscribe(key: string) → unsubscribe(key: string | RealtimeChannel)
Добавить проверку типа внутри метода:

Если RealtimeChannel → вызвать supabase.removeChannel(key)
Если string → искать в Map и вызывать callback

Обновить useRealtimeTasks.ts для передачи channel напрямую

ЗАДАЧА 4: Добавить недостающие aria-label
Сложность: Простая | Время: 15 мин
Файлы:

src/components/landing/Header.tsx (строки 56, 64, 88)
src/components/layout/CalendarDropdown.tsx (строки 82, 95)
src/components/common/AdvancedFilter.tsx (строка 83)

Действия:

Найти все <button> без aria-label через поиск по паттерну <button[^>]_onClick[^>]_>(?!.\*aria-label)
Добавить aria-label={t('...')} с соответствующими ключами перевода
Добавить недостающие ключи в en.json и ru.json:

common.toggleLanguage
common.selectMonth
common.selectYear

ЗАДАЧА 5: Убрать delay из profile creation
Сложность: Простая | Время: 10 мин
Файл: src/App.tsx (строки 53-55)
Действия:

Удалить строки с await new Promise((resolve) => setTimeout(resolve, 500));
Оставить только прямой вызов await profileAPI.getProfile(user.id)
Добавить обработку ошибки PGRST116 (profile not found) если нужно
Убрать комментарий о "задержке для уверенности"

ЗАДАЧА 6: Улучшить sanitizeInput через DOMPurify
Сложность: Средняя | Время: 25 мин
Файл: src/lib/security/securityUtils.ts
Действия:

Установить DOMPurify: npm install dompurify @types/dompurify
Импортировать: import DOMPurify from 'dompurify'
Заменить текущую regex-based логику на:

DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })

Оставить текущую функцию как fallback если DOMPurify не загружен
Добавить unit тесты для новой функции в src/lib/security/**tests**/securityUtils.test.ts

ЗАДАЧА 7: Централизовать Supabase моки
Сложность: Средняя | Время: 30 мин
Проблема:

Моки в src/test/supabaseMock.ts
Дубликат в src/lib/**mocks**/supabase.ts

Действия:

Удалить src/lib/**mocks**/supabase.ts
Переместить src/test/supabaseMock.ts → src/**mocks**/supabase.ts
Обновить импорты в src/test/setup.ts:

Изменить путь с ./supabaseMock на ../**mocks**/supabase

Обновить vi.mock('../src/lib/supabase') во всех тестах на правильный путь
Добавить в package.json:

json "jest": {
"moduleNameMapper": {
"^@/lib/supabase$": "<rootDir>/src/**mocks**/supabase.ts"
}
}

ЗАДАЧА 8: Добавить missing translations
Сложность: Средняя | Время: 20 мин
Файлы: src/i18n/locales/en.json, src/i18n/locales/ru.json
Недостающие ключи:

common.toggleLanguage
common.selectMonth
common.selectYear
common.russian
common.english
common.online
common.offline
common.installApp
common.installAppDescription
common.installing
common.install
common.apply
todo.advancedFilters
todo.status
todo.allProjects
todo.saveFilterPlaceholder
todo.saveFilter
todo.savedFilters
todo.ascending
todo.descending
todo.markAsIncomplete
todo.markAsComplete
todo.editTaskName
todo.moreOptions
todo.closeModal

Действия:

Найти все t('...') вызовы без соответствующих ключей через grep
Добавить ключи в оба файла с переводами
Заменить hardcoded строки на t() вызовы где нужно

ЗАДАЧА 9: Включить realtime обратно
Сложность: Средняя | Время: 30 мин
Файл: src/pages/TodoDashboard.tsx (строка 35)
Действия:

Раскомментировать useRealtimeTasks(user?.id || '');
Проверить что useRealtimeTasks правильно использует обновленный realtimeService.unsubscribe()
Добавить обработку ошибок подключения:

Если подписка failed → показать toast уведомление
Добавить retry logic (3 попытки с exponential backoff)

Добавить cleanup в useEffect dependencies:

typescript return () => {
if (channel) realtimeService.unsubscribe(channel);
};

Протестировать в двух табах браузера одновременно

ЗАДАЧА 10: Добавить reconnection logic для realtime
Сложность: Средняя | Время: 40 мин
Файл: src/lib/realtime/realtimeService.ts
Действия:

Добавить поле reconnectAttempts: Map<string, number> в класс
Добавить метод reconnect(channelKey: string, maxAttempts = 3):

Проверить текущее количество попыток
Если < maxAttempts → переподключиться с delay Math.pow(2, attempts) \* 1000
Если >= maxAttempts → emit error event

Обновить subscribeToTasks и subscribeToProjects:

Добавить обработчик SUBSCRIPTION_ERROR события
Вызывать reconnect() при ошибке

Добавить метод resetReconnectAttempts(channelKey: string) при успешном подключении
Добавить unit тесты для reconnection logic

ЗАДАЧА 11: Добавить request cancellation в API
Сложность: Средняя | Время: 45 мин
Файлы:

src/lib/api/tasks.api.ts
src/lib/api/projects.api.ts
src/lib/api/profile.api.ts

Действия:

Создать src/lib/api/abortController.ts:

Singleton для хранения активных controllers
Методы create(key), abort(key), cleanup(key)

Обновить каждый API метод:

Создать AbortController в начале
Передать signal в Supabase запросы (если поддерживается)
Cleanup controller в finally блоке

Обновить React Query хуки:

Добавить onSettled для cleanup
Abort запрос при unmount компонента

Пример структуры:

typescript const controller = abortControllerService.create('tasks-getAll');
try {
const { data } = await supabase.from('tasks').select('\*').abortSignal(controller.signal);
return data;
} finally {
abortControllerService.cleanup('tasks-getAll');
}

ЗАДАЧА 12: Разбить TodoDashboard на подкомпоненты
Сложность: Средняя | Время: 60 мин
Файл: src/pages/TodoDashboard.tsx (700+ строк)
Новые файлы:

src/components/dashboard/Sidebar.tsx (строки 160-213)
src/components/dashboard/ProjectsList.tsx (строки 215-240)
src/components/dashboard/TasksHeader.tsx (строки 245-285)
src/components/dashboard/TasksList.tsx (строки 287-330)
src/components/dashboard/UserMenu.tsx (строки 65-120)

Действия:

Создать папку src/components/dashboard/
Вынести каждый раздел в отдельный компонент
Передать необходимые props (callbacks, состояния)
Использовать React.memo для каждого компонента
Обновить imports в TodoDashboard.tsx
Убедиться что все callbacks остаются memoized

ЗАДАЧА 13: Добавить виртуализацию списков
Сложность: Сложная | Время: 90 мин
Установка: npm install react-window @types/react-window
Файлы для обновления:

src/pages/TodoDashboard.tsx (список задач)
src/pages/ProjectView.tsx (список задач в проекте)

Действия:

Импортировать FixedSizeList из react-window
Обернуть .map((task) => <TaskItem...>) в FixedSizeList:

height={600} (высота контейнера)
itemCount={filteredTasks.length}
itemSize={80} (высота одного TaskItem)
width="100%"

Создать render function для FixedSizeList:

typescript const Row = ({ index, style }) => {
const task = filteredTasks[index];
return <div style={style}><TaskItem task={task} ... /></div>;
};

Добавить dynamic height calculation если задачи разной высоты:

Использовать VariableSizeList вместо FixedSizeList
Добавить getItemSize={(index) => heights[index]}

Тестировать на списке 1000+ задач

ЗАДАЧА 14: Добавить prefers-reduced-motion support
Сложность: Средняя | Время: 30 мин
Файлы:

src/styles/globals.css (уже есть media query, но не применяется)
src/components/landing/HeroSection.tsx (Framer Motion)
src/components/landing/MarketProblems.tsx (Framer Motion)
src/components/landing/SolutionBenefits.tsx (Framer Motion)
src/components/auth/AuthModal.tsx (Framer Motion)

Действия:

Создать хук src/hooks/useReducedMotion.ts:

Проверять window.matchMedia('(prefers-reduced-motion: reduce)').matches
Возвращать boolean

Обновить все Framer Motion компоненты:

Использовать const reducedMotion = useReducedMotion()
Если true → отключить animations через initial={false} или убрать motion.\*

Обновить CSS анимации:

В globals.css убедиться что media query работает
Добавить animation: none !important для всех классов с animation

ЗАДАЧА 15: Добавить JSDoc для публичных API
Сложность: Средняя | Время: 60 мин
Файлы:

src/lib/api/tasks.api.ts
src/lib/api/projects.api.ts
src/lib/api/profile.api.ts
src/hooks/queries/_.ts
src/hooks/mutations/_.ts

Шаблон JSDoc:
typescript/\*\*

- Fetches all tasks for a specific user
- @param userId - The unique identifier of the user
- @param projectId - Optional project ID to filter tasks
- @returns Promise resolving to array of tasks
- @throws {AppError} When the API request fails
- @example
- const tasks = await tasksAPI.getAll('user123', 'project456');
  \*/
  Действия:

Добавить JSDoc для каждого экспортируемого метода в API слоях
Описать параметры, return types, возможные ошибки
Добавить примеры использования для сложных методов
Документировать React hooks с описанием возвращаемых значений
Убедиться что VSCode показывает tooltip с документацией

ЗАДАЧА 16: Добавить retry logic для API запросов
Сложность: Сложная | Время: 75 мин
Файл: src/lib/query/queryClient.ts
Действия:

Обновить defaultOptions.queries.retry:

Изменить с 3 на функцию (failureCount, error) => boolean
Retry только для network errors и 5xx ошибок
Не retry для 4xx ошибок

Обновить retryDelay:

Текущая: Math.min(1000 _ 2 \*\* attemptIndex, 30000)
Добавить jitter: delay _ (0.5 + Math.random() \* 0.5)

Добавить retry логику для mutations:

По умолчанию не retry mutations
Добавить опциональный retryable: true meta для безопасных mutations

Создать utility src/lib/utils/retryPolicy.ts:

Функции shouldRetry(error), getRetryDelay(attempt)

Добавить тесты для retry logic

ЗАДАЧА 17: Добавить image lazy loading
Сложность: Средняя | Время: 40 мин
Файлы:

src/components/landing/HeroSection.tsx
src/components/landing/MarketProblems.tsx
src/components/landing/SolutionBenefits.tsx
src/components/layout/ProfileSettings.tsx

Действия:

Добавить loading="lazy" ко всем <img> тегам
Использовать Intersection Observer для critical images:

Создать хук src/hooks/useLazyImage.ts
Загружать placeholder пока image не в viewport

Добавить blur placeholder для hero image:

Создать tiny base64 blur версию
Показывать пока оригинал грузится

Для avatar images добавить fallback:

Показывать инициалы если avatar не загрузился

Обновить HeroSection.tsx:

Использовать новый useLazyImage hook
Убрать существующий isLoading state

ЗАДАЧА 18: Написать E2E тесты для критических флоу
Сложность: Сложная | Время: 120 мин
Установка: npm install -D @playwright/test
Создать файлы:

playwright.config.ts (конфигурация)
e2e/auth.spec.ts (регистрация, вход, выход)
e2e/tasks.spec.ts (CRUD операций с задачами)
e2e/projects.spec.ts (создание проекта, добавление задач)
e2e/profile.spec.ts (обновление профиля, загрузка аватара)

Структура каждого теста:
typescripttest.describe('Task Management', () => {
test.beforeEach(async ({ page }) => {
// Setup: login, navigate
});

test('should create a new task', async ({ page }) => {
// 1. Ввести название задачи
// 2. Нажать Add
// 3. Проверить что задача появилась в списке
});

test('should mark task as completed', async ({ page }) => {
// 1. Кликнуть на checkbox
// 2. Проверить что задача зачеркнута
});
});
Действия:

Настроить Playwright config:

baseURL, testDir, timeout, retries
Browsers: chromium, firefox, webkit

Создать helpers e2e/helpers/auth.ts для mock login
Написать минимум 15 тестов:

5 для auth (login, signup, logout, password reset, OAuth)
5 для tasks (create, read, update, delete, toggle complete)
3 для projects (create, add task to project, delete project)
2 для profile (update name, upload avatar)

Добавить в CI/CD pipeline (GitHub Actions)
Добавить npm script: "test:e2e": "playwright test"

ЗАДАЧА 19: Увеличить unit test coverage до 60%
Сложность: Сложная | Время: 180 мин
Текущее покрытие: ~25%
Приоритетные файлы для тестирования:
Группа 1: Utilities (30 мин)

src/lib/utils/taskFilters.ts → taskFilters.test.ts
src/lib/utils/imageOptimizer.ts → imageOptimizer.test.ts
src/lib/accessibility/A11yUtils.ts → A11yUtils.test.ts

Группа 2: API Layer (45 мин)

src/lib/api/profile.api.ts → profile.api.test.ts
Тесты для всех методов: getProfile, updateProfile, uploadAvatar, getStorageStats

Группа 3: Hooks (60 мин)

src/hooks/queries/useProfile.ts → useProfile.test.ts
src/hooks/queries/useProjects.ts → useProjects.test.ts
src/hooks/mutations/useUpdateTask.ts → useUpdateTask.test.ts
src/hooks/mutations/useDeleteTask.ts → useDeleteTask.test.ts
src/hooks/useClickOutside.ts → useClickOutside.test.ts
src/hooks/useTheme.ts → useTheme.test.ts

Группа 4: Components (45 мин)

src/components/common/AdvancedFilter.tsx → AdvancedFilter.test.tsx
src/components/layout/TaskDetailsPopup.tsx → TaskDetailsPopup.test.tsx
src/components/common/EmptyState.tsx → EmptyState.test.tsx

Действия:

Установить coverage tool: npm install -D @vitest/coverage-v8
Обновить vitest.config.ts:

typescript test: {
coverage: {
provider: 'v8',
reporter: ['text', 'html', 'json'],
lines: 60,
functions: 60,
branches: 60,
statements: 60
}
}

Написать тесты для каждого файла выше
Добавить npm script: "test:coverage": "vitest run --coverage"
Добавить в CI/CD проверку минимального coverage

ЗАДАЧА 20: Оптимизировать bundle size
Сложность: Сложная | Время: 90 мин
Текущий размер: Неизвестен (нужно измерить)
Действия:
Анализ (15 мин):

Запустить npm run build
Открыть dist/stats.html (rollup-plugin-visualizer)
Найти самые большие chunks

Оптимизация imports (30 мин):

Заменить import { X } from 'lucide-react' на tree-shakeable imports
Проверить что Framer Motion импортируется правильно
Lazy load редко используемые компоненты:

ProfileSettings → lazy(() => import('./ProfileSettings'))
ProjectCreationPopup → lazy import
TaskDetailsPopup → lazy import

Code splitting (30 мин):

Обновить vite.config.ts manualChunks:

Разделить ui-vendor на lucide и framer-motion
Вынести @radix-ui в отдельный chunk

Добавить dynamic imports для landing компонентов:

HeroSection, MarketProblems, SolutionBenefits → lazy load

Tree shaking (15 мин):

Проверить что в production нет development кода
Убедиться что console.log удаляются (esbuild.pure)
Проверить что мертвый код удаляется

Измерения:

Целевой размер main bundle: < 200KB gzipped
Целевой размер vendor chunks: < 150KB каждый
Lighthouse score: > 90

Приоритизация по времени реализации
Быстрые победы (1-2 часа):

Задачи 1-5

Средние задачи (3-5 часов):

Задачи 6-11

Большие задачи (6-10 часов):

Задачи 12-17

Критические инвестиции (10+ часов):

Задачи 18-20

Общее время: ~22-26 часов чистой работы
