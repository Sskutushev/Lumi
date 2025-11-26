import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('light')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Получаем сохраненную тему или определяем по системным настройкам
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = storedTheme || systemTheme
    
    setTheme(initialTheme)
    setIsMounted(true) // Убедимся, что компонент смонтирован перед изменением DOM
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const root = window.document.documentElement
    
    // Удаляем старые классы темы
    root.classList.remove('light', 'dark')
    
    // Добавляем класс текущей темы
    root.classList.add(theme)
    
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', theme)
  }, [theme, isMounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light'
      return newTheme
    })
  }

  return { theme, toggleTheme, setTheme }
}