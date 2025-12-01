# Руководство по разработке

## Начало работы

### Установка зависимостей

```bash
npm install
```

### Переменные окружения

Создайте файл `.env.local` на основе `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_YM_COUNTER_ID=your_yandex_metrika_counter_id (опционально)
VITE_SENTRY_DSN=your_sentry_dsn (опционально)
```

### Запуск в режиме разработки

```bash
npm run dev
```

## Структура проекта

### Компоненты

- `src/components/common/` - переиспользуемые компоненты
- `src/components/layout/` - компоненты макета
- `src/components/auth/` - компоненты аутентификации
- `src/components/landing/` - компоненты лендинга

### Хуки

- `src/hooks/queries/` - React Query хуки для запросов
- `src/hooks/mutations/` - React Query хуки для мутаций
- `src/hooks/use*` - кастомные хуки

### API слой

- `src/lib/api/` - модули для взаимодействия с API
- `src/lib/query/` - конфигурация React Query
- `src/lib/errors/` - обработка ошибок
- `src/lib/security/` - утилиты безопасности
- `src/lib/realtime/` - работа с реалтайм обновлениями

## Процесс разработки

### Добавление новой функциональности

1. Создайте типы данных в `src/types/api.types.ts`
2. Реализуйте API слой в `src/lib/api/`
3. Создайте React Query хуки в `src/hooks/`
4. Разработайте компоненты в `src/components/`
5. Интегрируйте в страницы в `src/pages/`

### Тестирование

#### Unit тесты

```bash
npm run test
```

#### Тестирование компонентов

Используется React Testing Library:

- `src/**/__tests__/*` или `src/**/*test.*`

### Стили и форматирование

#### TypeScript

- Используется строгая типизация
- Все функции должны иметь определенные типы параметров и возвращаемых значений

#### Линтинг

```bash
npm run lint
```

#### Форматирование

```bash
npm run format
```

## Git Workflow

### Ветки

- `main` - основная ветка, сюда только через PR
- `feature/*` - для новой функциональности
- `bugfix/*` - для исправления багов
- `hotfix/*` - для критических исправлений

### Commit messages

Используем conventional commits:

- `feat:` - новая функциональность
- `fix:` - исправление багов
- `refactor:` - рефакторинг
- `docs:` - документация
- `test:` - тесты

Пример:

```
feat(auth): add social login with Google and GitHub
```

### Pull Requests

- Заголовок должен описывать изменения
- В описании укажите:
  - Что было изменено
  - Зачем были внесены изменения
  - Как протестировать изменения

## Качество кода

### Проверки

Перед созданием PR убедитесь, что:

- Все тесты проходят
- Код соответствует линтеру
- Типы описаны корректно
- Нет ошибок в консоли

### Код-ревью

- Проверьте производительность
- Оцените безопасность
- Убедитесь в доступности
- Проверьте покрытие тестами
