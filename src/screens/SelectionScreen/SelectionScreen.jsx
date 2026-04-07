import { motion as Motion } from 'framer-motion'
import useTotemStore from '../../store/useTotemStore'
import { getPublicLooksForPosition, SCREENS } from '../../constants'
import s from './SelectionScreen.module.css'

export default function SelectionScreen() {
  const registration = useTotemStore(state => state.registration)
  const setRegistration = useTotemStore(state => state.setRegistration)
  const setSelectedOutfitIndex = useTotemStore(state => state.setSelectedOutfitIndex)
  const goTo = useTotemStore(state => state.goTo)
  const publicLooks = getPublicLooksForPosition(registration.position)
  const options = [
    { id: 'female', label: 'Dama', image: publicLooks.mujer },
    { id: 'male', label: 'Caballero', image: publicLooks.hombre },
  ]

  function handleStart() {
    if (!registration.gender) return
    setSelectedOutfitIndex(0)
    goTo(SCREENS.EXPERIENCE)
  }

  return (
    <div className={s.root}>
      <div className={s.content}>
        <Motion.div
          className={s.header}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className={s.title}>Selecciona tu uniforme</h1>
          <p className={s.subtitle}>Elige el look con el que quieres salir a la cancha</p>
        </Motion.div>

        <div className={s.cards}>
          {options.map((option, index) => {
            const active = registration.gender === option.id

            return (
              <Motion.button
                key={option.id}
                type="button"
                className={`${s.card} ${active ? s.cardActive : ''}`}
                onClick={() => setRegistration({ gender: option.id })}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * index }}
                whileTap={{ scale: 0.985 }}
              >
                <img className={s.cardImage} src={option.image} alt={option.label} />
                <span className={s.cardLabel}>{option.label}</span>
              </Motion.button>
            )
          })}
        </div>

        <Motion.button
          type="button"
          className={`${s.startButton} ${!registration.gender ? s.startButtonDisabled : ''}`}
          onClick={handleStart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileTap={registration.gender ? { scale: 0.985 } : undefined}
          disabled={!registration.gender}
        >
          INICIAR
        </Motion.button>
      </div>
    </div>
  )
}
