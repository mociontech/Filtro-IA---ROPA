import useTotemStore from '../../store/useTotemStore'
import { SCREENS } from '../../constants'
import s from './PositionScreen.module.css'

const OPTIONS = [
  { id: 'goalkeeper', label: 'Arquero', className: s.goalkeeperButton },
  { id: 'forward', label: 'Delantero', className: s.forwardButton },
  { id: 'midfielder', label: 'Volante', className: s.midfielderButton },
]

export default function PositionScreen() {
  const goTo = useTotemStore(state => state.goTo)
  const setRegistration = useTotemStore(state => state.setRegistration)

  function handleSelect(position) {
    setRegistration({ position, gender: null })
    goTo(SCREENS.SELECTION)
  }

  return (
    <div className={s.root}>
      {OPTIONS.map(option => (
        <button
          key={option.id}
          type="button"
          className={`${s.hitButton} ${option.className}`}
          onClick={() => handleSelect(option.id)}
          aria-label={option.label}
        >
          <span className={s.srOnly}>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
