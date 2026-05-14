import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import useTotemStore from './store/useTotemStore'
import { SCREENS } from './constants'
import DatahubLogPanel from './components/DatahubLogPanel'
import { getDatahubLogs, subscribeToDatahubLogs } from './services/datahub'

import StartScreen        from './screens/StartScreen/StartScreen'
import EntryRegisterScreen from './screens/EntryRegisterScreen/EntryRegisterScreen'
import WelcomeScreen      from './screens/WelcomeScreen/WelcomeScreen'
import RegisterScreen     from './screens/RegisterScreen/RegisterScreen'
import ExperienceScreen   from './screens/ExperienceScreen/ExperienceScreen'
import ResultScreen       from './screens/ResultScreen/ResultScreen'
import GoodbyeScreen      from './screens/GoodbyeScreen/GoodbyeScreen'

const MAP = {
  [SCREENS.START]:      StartScreen,
  [SCREENS.ENTRY_REGISTER]: EntryRegisterScreen,
  [SCREENS.WELCOME]:    WelcomeScreen,
  [SCREENS.REGISTER]:   RegisterScreen,
  [SCREENS.EXPERIENCE]: ExperienceScreen,
  [SCREENS.RESULT]:     ResultScreen,
  [SCREENS.GOODBYE]:    GoodbyeScreen,
}

export default function App() {
  const screen = useTotemStore(s => s.screen)
  const Screen = MAP[screen] ?? WelcomeScreen
  const [isLogVisible, setIsLogVisible] = useState(false)
  const [datahubLogs, setDatahubLogs] = useState(() => getDatahubLogs())

  useEffect(() => {
    const unsubscribe = subscribeToDatahubLogs(() => {
      setDatahubLogs([...getDatahubLogs()])
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key.toLowerCase() !== 'l') return

      event.preventDefault()
      setIsLogVisible(visible => !visible)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      width:'100vw', height:'100vh', background:'#000',
    }}>
      <div style={{
        width:'100vw',
        height:'100vh',
        position:'relative', overflow:'hidden',
        background:'#fff',
      }}>
        <AnimatePresence mode="wait">
          <div
            key={screen}
            style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column' }}
          >
            <Screen />
          </div>
        </AnimatePresence>
        <DatahubLogPanel logs={datahubLogs} visible={isLogVisible} />
      </div>
    </div>
  )
}
