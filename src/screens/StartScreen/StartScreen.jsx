import { SCREENS } from '../../constants'
import useTotemStore from '../../store/useTotemStore'
import s from './StartScreen.module.css'

export default function StartScreen() {
  const goTo = useTotemStore(state => state.goTo)

  return (
    <button
      type="button"
      className={s.root}
      onClick={() => goTo(SCREENS.ENTRY_REGISTER)}
      aria-label="Continuar al registro"
    >
      <img className={s.background} src="/INICIO.png" alt="Bienvenida" />
    </button>
  )
}
