import { motion } from 'framer-motion'
import useTotemStore from '../../store/useTotemStore'
import { SCREENS, EXPERIENCE_DURATION } from '../../constants'
import s from './InstructionsScreen.module.css'

const steps = [
  {
    number: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="6" stroke="#E31836" strokeWidth="1.5"/>
        <circle cx="14" cy="11" r="4" stroke="#E31836" strokeWidth="1.5"/>
        <path d="M6 24c0-4 3.6-7 8-7s8 3 8 7" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Párate frente a la cámara',
    desc:  'Asegúrate de que tu cuerpo sea visible de la cintura hacia arriba.',
  },
  {
    number: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 14h16M18 9l5 5-5 5M10 9L5 14l5 5" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Desliza para cambiar outfits',
    desc:  'Mueve tu mano o desliza la pantalla para ver 4 outfits diferentes según tu perfil.',
  },
  {
    number: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#E31836" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="4" fill="#E31836"/>
        <line x1="14" y1="2" x2="14" y2="6"  stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="14" y1="22" x2="14" y2="26" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="2"  y1="14" x2="6"  y2="14" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="22" y1="14" x2="26" y2="14" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Captura tu look favorito',
    desc:  'Cuando encuentres el outfit que más te guste, toca el botón para fotografiarte.',
  },
  {
    number: '04',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="8" y="4" width="12" height="16" rx="3" stroke="#E31836" strokeWidth="1.5"/>
        <path d="M11 20v3l6-3" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 10h6M11 13h4" stroke="#E31836" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Descarga via QR',
    desc:  'Escanea el código QR con tu celular para guardar la foto de tu nuevo look.',
  },
]

export default function InstructionsScreen() {
  const { registration, goTo } = useTotemStore()

  return (
    <div className={s.root}>

      <motion.div
        className={s.header}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className={s.back} onClick={() => goTo(SCREENS.REGISTER)}>←</button>
        <div>
          <p className={s.step}>PASO 2 DE 3</p>
          <h1 className={s.title}>
            HOLA, {registration.name.split(' ')[0].toUpperCase()} 👋
          </h1>
          <p className={s.subtitle}>Así funciona la experiencia</p>
        </div>
      </motion.div>

      <div className={s.steps}>
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className={s.stepCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
          >
            <div className={s.stepLeft}>
              <div className={s.stepNum}>{step.number}</div>
              {i < steps.length - 1 && <div className={s.connector} />}
            </div>
            <div className={s.stepContent}>
              <div className={s.stepIcon}>{step.icon}</div>
              <div>
                <p className={s.stepTitle}>{step.title}</p>
                <p className={s.stepDesc}>{step.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className={s.bottom}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className={s.timerNote}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E31836" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>La experiencia dura <strong>{EXPERIENCE_DURATION} segundos</strong></span>
        </div>

        <button
          className={s.cta}
          onClick={() => goTo(SCREENS.EXPERIENCE)}
        >
          ¡EMPEZAR!
        </button>
      </motion.div>

    </div>
  )
}
