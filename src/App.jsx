import { AnimatePresence } from 'framer-motion'
import useTotemStore from './store/useTotemStore'
import { SCREENS } from './constants'

import WelcomeScreen      from './screens/WelcomeScreen/WelcomeScreen'
import PositionScreen     from './screens/PositionScreen/PositionScreen'
import SelectionScreen    from './screens/SelectionScreen/SelectionScreen'
import RegisterScreen     from './screens/RegisterScreen/RegisterScreen'
import ExperienceScreen   from './screens/ExperienceScreen/ExperienceScreen'
import ResultScreen       from './screens/ResultScreen/ResultScreen'
import GoodbyeScreen      from './screens/GoodbyeScreen/GoodbyeScreen'

const MAP = {
  [SCREENS.WELCOME]:    WelcomeScreen,
  [SCREENS.POSITION]:   PositionScreen,
  [SCREENS.SELECTION]:  SelectionScreen,
  [SCREENS.REGISTER]:   RegisterScreen,
  [SCREENS.EXPERIENCE]: ExperienceScreen,
  [SCREENS.RESULT]:     ResultScreen,
  [SCREENS.GOODBYE]:    GoodbyeScreen,
}

export default function App() {
  const screen = useTotemStore(s => s.screen)
  const Screen = MAP[screen] ?? WelcomeScreen

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      width:'100vw', height:'100vh', background:'#000',
    }}>
      <div style={{
        width:'min(100vw, calc(100vh * 9 / 16))',
        height:'min(100vh, calc(100vw * 16 / 9))',
        aspectRatio:'9 / 16',
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
      </div>
    </div>
  )
}
