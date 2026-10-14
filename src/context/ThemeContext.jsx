import { useEffect, useState } from 'react'
import { ThemeContext } from './theme-context'
const STORAGE_KEY = 'fireutils:tema'

function temaInicial() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo === 'dark' || salvo === 'light') return salvo
  } catch { /* armazenamento indisponível */ }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(temaInicial)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* mantém só nesta sessão */ }
  }, [theme])

  const toggleTheme = () => setTheme(current => current === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div className="platform-theme w-screen h-screen flex overflow-hidden bg-bg text-ink" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
