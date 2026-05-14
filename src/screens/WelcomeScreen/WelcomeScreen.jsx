import { motion } from 'framer-motion'
import useTotemStore from '../../store/useTotemStore'
import { SCREENS } from '../../constants'
import s from './WelcomeScreen.module.css'

const OPTIONS = [
  { id: 'female', label: 'Dama', image: '/Dama.png' },
  { id: 'male', label: 'Caballero', image: '/Caballero.png' },
]

export default function WelcomeScreen() {
  const registration = useTotemStore(state => state.registration)
  const setRegistration = useTotemStore(state => state.setRegistration)
  const setSelectedOutfitIndex = useTotemStore(state => state.setSelectedOutfitIndex)
  const goTo = useTotemStore(state => state.goTo)

  const handleStart = () => {
    if (!registration.gender) return
    setSelectedOutfitIndex(0)
    goTo(SCREENS.EXPERIENCE)
  }

  return (
    <div className={s.root}>
      <div className={s.background} />

      <div className={s.content}>
        <div className={s.options}>
          {OPTIONS.map((option, index) => {
            const active = registration.gender === option.id

            return (
              <motion.button
                key={option.id}
                type="button"
                className={s.optionCard}
                onClick={() => setRegistration({ gender: option.id })}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * index }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={`${s.optionImageWrap} ${active ? s.optionImageWrapActive : ''}`}>
                  <img
                    className={s.optionImage}
                    src={option.image}
                    alt={option.label}
                  />
                </span>
              </motion.button>
            )
          })}
        </div>

        <div className={s.startButtonWrap}>
          <motion.button
            type="button"
            className={`${s.startButton} ${!registration.gender ? s.startButtonDisabled : ''}`}
            onClick={handleStart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18 }}
            whileTap={registration.gender ? { scale: 0.98 } : undefined}
            aria-label="Iniciar experiencia"
          >
            <img src="/Boton_Inicio.png" alt="" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
