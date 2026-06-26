'use client'
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = (localStorage.getItem('theme') ?? 'dark') as Theme
    apply(saved)
  }, [])

  function apply(t: Theme) {
    setTheme(t)
    localStorage.setItem('theme', t)
    document.documentElement.classList.toggle('theme-light', t === 'light')
  }

  return { theme, toggle: () => apply(theme === 'dark' ? 'light' : 'dark') }
}
