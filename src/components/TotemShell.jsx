import { useEffect, useState } from 'react'
import s from './TotemShell.module.css'

function useClock() {
  const fmt = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 30_000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function TotemShell({ children }) {
  const time = useClock()

  return (
    <div className={s.shell}>
      <div className={s.totem}>
        {/* Status bar */}
        <div className={s.statusBar}>
          <span>{time}</span>
          <span className={s.brand}>lululemon · AI STUDIO</span>
        </div>

        {/* Screen area */}
        <div className={s.screen}>
          {children}
        </div>

        {/* Home indicator */}
        <div className={s.homeBar} />
      </div>
    </div>
  )
}
