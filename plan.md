Промпт для создания Modern TODO App с Supabase Auth
🎯 Цель проекта
Создать минималистичный, но стильный TODO-лист с авторизацией через Supabase, профилем пользователя, темной/светлой темой и мультиязычностью (EN/RU).

📦 Стек технологий

- React 18
- Vite
- Tailwind CSS 3.4 (важно: не выше, из-за PostCSS)
- Zustand (управление состоянием)
- Supabase Client (@supabase/supabase-js)
- lucide-react (иконки)

🗂️ Структура проекта
src/
├── components/
│ ├── Auth/
│ │ ├── LoginForm.jsx
│ │ └── SignUpForm.jsx
│ ├── Profile/
│ │ ├── ProfileHeader.jsx
│ │ └── ProfileEdit.jsx
│ ├── Tasks/
│ │ ├── TaskItem.jsx
│ │ ├── TaskList.jsx
│ │ ├── TaskInput.jsx
│ │ └── TaskFilters.jsx
│ ├── UI/
│ │ ├── ThemeToggle.jsx
│ │ └── LanguageSwitcher.jsx
│ └── Layout/
│ └── AppLayout.jsx
├── store/
│ ├── authStore.js (Zustand)
│ ├── taskStore.js (Zustand)
│ └── uiStore.js (Zustand - theme, language)
├── lib/
│ ├── supabase.js
│ └── translations.js
├── hooks/
│ ├── useAuth.js
│ └── useTasks.js
├── App.jsx
└── main.jsx

🎨 Дизайн-система (гибрид 3 стилей)

1. Нео-брутализм

Жирные черные обводки (border-2, border-black)
Контрастные тени (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)])
Яркие акцентные цвета (#FF6B6B, #4ECDC4, #FFE66D)

2. Бенто-дизайн

Закругленные углы (rounded-2xl, rounded-3xl)
Мягкие градиенты (bg-gradient-to-br)
Карточки с паддингом (p-6, p-8)

3. Иммерсивные 3D + микроанимации

transform: translateY() на hover
transition-all duration-300 ease-out
Subtle scale effects: hover:scale-[1.02]
Glassmorphism: backdrop-blur-md bg-white/80

🎨 Цветовая палитра
Светлая тема (основная)
cssbackground: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
card-bg: white
text-primary: #1a202c
text-secondary: #718096
border: #e2e8f0
accent-primary: #667eea
accent-secondary: #f6ad55
Темная тема
cssbackground: #0f172a
card-bg: #1e293b
text-primary: #f1f5f9
text-secondary: #94a3b8
border: #334155
accent-primary: #818cf8
accent-secondary: #fbbf24

📊 Supabase: Структура БД
Таблица: profiles
sqlCREATE TABLE profiles (
id UUID REFERENCES auth.users PRIMARY KEY,
username TEXT UNIQUE,
email TEXT,
avatar_url TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);
Таблица: tasks
sqlCREATE TABLE tasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID REFERENCES auth.users NOT NULL,
text TEXT NOT NULL,
completed BOOLEAN DEFAULT FALSE,
priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
Row Level Security (RLS)
sqlALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

🔧 Zustand Store: Примеры
authStore.js
javascriptimport { create } from 'zustand';

export const useAuthStore = create((set) => ({
user: null,
profile: null,
isLoading: true,

setUser: (user) => set({ user }),
setProfile: (profile) => set({ profile }),
setLoading: (isLoading) => set({ isLoading }),

signOut: async () => {
// Supabase signOut
set({ user: null, profile: null });
}
}));
taskStore.js
javascriptimport { create } from 'zustand';

export const useTaskStore = create((set) => ({
tasks: [],
filter: 'all', // 'all' | 'active' | 'completed' | 'high'
searchQuery: '',

setTasks: (tasks) => set({ tasks }),
setFilter: (filter) => set({ filter }),
setSearchQuery: (searchQuery) => set({ searchQuery }),

addTask: async (taskData) => {
// Supabase insert
set((state) => ({ tasks: [newTask, ...state.tasks] }));
},

toggleTask: (id) => set((state) => ({
tasks: state.tasks.map(t =>
t.id === id ? { ...t, completed: !t.completed } : t
)
})),

updateTask: async (id, updates) => {
// Supabase update
},

deleteTask: async (id) => {
// Supabase delete
}
}));
uiStore.js
javascriptimport { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
persist(
(set) => ({
theme: 'light', // 'light' | 'dark'
language: 'en', // 'en' | 'ru'

      toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
      })),

      setLanguage: (language) => set({ language })
    }),
    { name: 'ui-settings' }

)
);

🌐 Translations (lib/translations.js)
javascriptexport const translations = {
en: {
app: {
title: 'My Tasks',
subtitle: 'Stay organized, stay productive'
},
auth: {
signIn: 'Sign In',
signUp: 'Sign Up',
email: 'Email address',
password: 'Password',
signOut: 'Sign Out',
alreadyHave: 'Already have an account?',
dontHave: "Don't have an account?"
},
tasks: {
new: 'What needs to be done?',
add: 'Add Task',
search: 'Search tasks...',
filters: {
all: 'All',
active: 'Active',
completed: 'Completed',
high: 'High Priority'
},
priority: {
low: 'Low',
medium: 'Medium',
high: 'High'
},
empty: 'No tasks yet. Create your first one!',
stats: {
total: 'tasks',
completed: 'completed'
}
},
profile: {
username: 'Username',
edit: 'Edit Profile',
save: 'Save',
cancel: 'Cancel'
},
actions: {
clearCompleted: 'Clear Completed',
clearAll: 'Delete All',
confirmDelete: 'Are you sure?'
}
},
ru: {
// ... аналогично
}
};

🎭 Ключевые компоненты: Примеры
ProfileHeader.jsx (с редактированием)
jsxexport const ProfileHeader = () => {
const { profile, updateProfile } = useAuthStore();
const [isEditing, setIsEditing] = useState(false);
const [tempName, setTempName] = useState(profile?.username || '');

const handleSave = async () => {
await updateProfile({ username: tempName });
setIsEditing(false);
};

return (

<div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
{/_ Аватар _/}
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
{profile?.username?.[0]?.toUpperCase() || 'U'}
</div>

      {/* Имя с редактированием */}
      {!isEditing ? (
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{profile?.username}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="px-2 py-1 border-2 border-purple-500 rounded-lg"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ID пользователя */}
      <span className="text-xs text-gray-500 ml-auto">
        ID: {profile?.id?.slice(0, 8)}...
      </span>
    </div>

);
};
TaskItem.jsx (с inline редактированием)
jsxexport const TaskItem = ({ task }) => {
const { toggleTask, updateTask, deleteTask } = useTaskStore();
const [isEditing, setIsEditing] = useState(false);
const [editText, setEditText] = useState(task.text);
const [editPriority, setEditPriority] = useState(task.priority);

const priorityColors = {
low: 'border-l-blue-500',
medium: 'border-l-yellow-500',
high: 'border-l-red-500'
};

const handleSave = async () => {
await updateTask(task.id, { text: editText, priority: editPriority });
setIsEditing(false);
};

return (

<div className={`      group relative p-4 bg-white rounded-xl border-l-4 ${priorityColors[task.priority]}
      hover:shadow-lg hover:scale-[1.02] transition-all duration-300
      ${task.completed ? 'opacity-60' : ''}
   `}>
<div className="flex items-start gap-3">
{/_ Чекбокс _/}
<input
type="checkbox"
checked={task.completed}
onChange={() => toggleTask(task.id)}
className="w-5 h-5 mt-1 cursor-pointer accent-purple-500"
/>

        {/* Контент задачи */}
        {!isEditing ? (
          <div className="flex-1">
            <p className={`text-base ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.text}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                {task.priority}
              </span>
              <span className="text-xs text-gray-400">
                {formatTime(task.created_at)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg"
            />
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        )}

        {/* Действия */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 hover:bg-red-100 rounded-lg transition text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>

);
};
LanguageSwitcher.jsx (круглая кнопка с флагом)
jsxexport const LanguageSwitcher = () => {
const { language, setLanguage } = useUIStore();

const flags = {
en: '🇬🇧',
ru: '🇷🇺'
};

return (
<button
onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
className="
w-10 h-10 rounded-full overflow-hidden
border-2 border-white shadow-lg
hover:scale-110 transition-transform duration-300
flex items-center justify-center text-2xl
"
title={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'} >
<span className="scale-150">{flags[language]}</span>
</button>
);
};
ThemeToggle.jsx
jsxexport const ThemeToggle = () => {
const { theme, toggleTheme } = useUIStore();

return (
<button
      onClick={toggleTheme}
      className="
        p-3 rounded-full bg-white/80 backdrop-blur-md
        border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:scale-110 transition-all duration-300
      "
    >
{theme === 'light' ? (
<Moon size={20} className="text-purple-600" />
) : (
<Sun size={20} className="text-yellow-500" />
)}
</button>
);
};

🎬 Анимации и микроинтеракции
Tailwind config (tailwind.config.js)
javascriptexport default {
theme: {
extend: {
animation: {
'slide-in': 'slideIn 0.3s ease-out',
'fade-in': 'fadeIn 0.2s ease-in',
'bounce-subtle': 'bounceSubtle 0.5s ease-in-out'
},
keyframes: {
slideIn: {
'0%': { opacity: 0, transform: 'translateY(-10px)' },
'100%': { opacity: 1, transform: 'translateY(0)' }
},
fadeIn: {
'0%': { opacity: 0 },
'100%': { opacity: 1 }
},
bounceSubtle: {
'0%, 100%': { transform: 'translateY(0)' },
'50%': { transform: 'translateY(-5px)' }
}
}
}
}
}
Применение в компонентах
jsx// Анимация появления задач

<div className="animate-slide-in">
  <TaskItem />
</div>

// Hover эффекты
<button className="
  transition-all duration-300 
  hover:scale-105 
  hover:shadow-xl
  active:scale-95
">

🚀 Дополнительные фичи (трендовые)

1. Drag & Drop для приоритетов
   bashnpm install @dnd-kit/core @dnd-kit/sortable
2. Клавиатурные шорткаты
   javascript// hooks/useKeyboardShortcuts.js
   useEffect(() => {
   const handleKeyPress = (e) => {
   if (e.ctrlKey && e.key === 'k') {
   e.preventDefault();
   // Открыть поиск
   }
   if (e.key === 'n' && e.ctrlKey) {
   e.preventDefault();
   // Новая задача
   }
   };

window.addEventListener('keydown', handleKeyPress);
return () => window.removeEventListener('keydown', handleKeyPress);
}, []); 3. Прогресс-бар выполнения
jsxconst completionRate = (completed / total) \* 100;

<div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
    style={{ width: `${completionRate}%` }}
  />
</div>
4. Toast уведомления
bashnpm install sonner
javascriptimport { toast } from 'sonner';

// При добавлении задачи
toast.success('Task added!', {
icon: '✅',
duration: 2000
});

📱 Адаптивность
Брейкпоинты
jsx<div className="
  grid grid-cols-1 
  sm:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
{/_ Бенто-сетка для фильтров _/}

</div>

<div className="
  fixed bottom-4 right-4 
  sm:top-4 sm:bottom-auto
  flex gap-2
">
  {/* Кнопки темы/языка */}
</div>

🔐 Supabase Setup (lib/supabase.js)
javascriptimport { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth helpers
export const signUp = async (email, password) => {
const { data, error } = await supabase.auth.signUp({
email,
password
});

if (!error && data.user) {
// Создаем профиль
await supabase.from('profiles').insert({
id: data.user.id,
username: email.split('@')[0],
email
});
}

return { data, error };
};

export const signIn = async (email, password) => {
return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
return await supabase.auth.signOut();
};

📋 Чеклист реализации

Настройка Vite + React + Tailwind 3.4
Интеграция Supabase (auth + database)
Создание таблиц и RLS политик
Zustand stores (auth, tasks, ui)
Компонент авторизации (LoginForm, SignUpForm)
ProfileHeader с inline редактированием
TaskItem с inline редактированием (карандаш → галочка/крестик)
TaskList с фильтрами (all, active, completed, high)
Поиск по задачам (debounced)
Переключатель темы (light/dark)
Переключатель языка (en/ru с флагами)
Анимации и микроинтеракции
Адаптивная верстка
Toast уведомления
Обработка ошибок
Loading states

🎨 Финальные штрихи

Плавные переходы между темами: используй transition-colors duration-300 на root элементе
Стикеры приоритета: яркие бейджи с эмодзи (🔥 high, ⚡ medium, 💧 low)
Пустое состояние: милая иллюстрация с призывом к действию
Конфетти при выполнении задачи: библиотека canvas-confetti
Звуковые эффекты (опционально): тихий клик при чекбоксе

Этот промпт дает полную архитектуру для реализации. Все компоненты модульные, легко расширяемые. Используй его как blueprint и дорабатывай детали в редакторе! 🚀
