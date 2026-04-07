import useTotemStore from '../../store/useTotemStore'
import { SCREENS } from '../../constants'
import s from './WelcomeScreen.module.css'

export default function WelcomeScreen() {
  const goTo = useTotemStore(state => state.goTo)
  const setRegistration = useTotemStore(state => state.setRegistration)

  function handleStart() {
    setRegistration({ gender: null })
    goTo(SCREENS.POSITION)
  }

  return (
    <div className={s.root}>
      <button
        type="button"
        className={s.startButton}
        onClick={handleStart}
        aria-label="Inicio"
      >
        <span className={s.srOnly}>Inicio</span>
      </button>
    </div>
  )
}
