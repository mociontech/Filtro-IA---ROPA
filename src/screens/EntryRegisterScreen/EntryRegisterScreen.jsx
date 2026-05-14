import { useState } from 'react'
import { motion } from 'framer-motion'
import { SCREENS } from '../../constants'
import useTotemStore from '../../store/useTotemStore'
import s from './EntryRegisterScreen.module.css'

const FIELDS = [
  {
    key: 'name',
    type: 'text',
    src: '/Casilla_Nombre.png',
    label: 'Nombre',
  },
  {
    key: 'email',
    type: 'email',
    src: '/Casilla Correo.png',
    label: 'Correo',
  },
]

const KEY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['@', '.', 'ESPACIO', 'BORRAR', 'OK'],
]

export default function EntryRegisterScreen() {
  const registration = useTotemStore(state => state.registration)
  const setRegistration = useTotemStore(state => state.setRegistration)
  const goTo = useTotemStore(state => state.goTo)
  const [activeField, setActiveField] = useState(null)

  const updateActiveValue = key => {
    if (!activeField) return

    if (key === 'OK') {
      setActiveField(null)
      return
    }

    const currentValue = registration[activeField] ?? ''

    if (key === 'BORRAR') {
      setRegistration({ [activeField]: currentValue.slice(0, -1) })
      return
    }

    const nextCharacter = key === 'ESPACIO' ? ' ' : key
    const value = activeField === 'email'
      ? `${currentValue}${nextCharacter.toLowerCase()}`
      : `${currentValue}${nextCharacter}`

    setRegistration({ [activeField]: value })
  }

  return (
    <div className={s.root}>
      <img className={s.background} src="/Registro.png" alt="Registro" />

      <div className={s.fields}>
        {FIELDS.map((field, index) => (
          <motion.label
            key={field.key}
            className={s.field}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: index * 0.08 }}
          >
            <img src={field.src} alt="" />
            <input
              type={field.type}
              value={registration[field.key] ?? ''}
              placeholder={field.label}
              inputMode="none"
              onFocus={() => setActiveField(field.key)}
              onClick={() => setActiveField(field.key)}
              onChange={event => setRegistration({ [field.key]: event.target.value })}
              aria-label={field.label}
              autoComplete="off"
            />
          </motion.label>
        ))}
      </div>

      <div className={s.buttonWrap}>
        <motion.button
          type="button"
          className={s.button}
          onClick={() => goTo(SCREENS.WELCOME)}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Registrarse"
        >
          <img src="/btn_registrarse.png" alt="" />
        </motion.button>
      </div>

      {activeField && (
        <motion.div
          className={s.keyboard}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.22 }}
        >
          {KEY_ROWS.map((row, rowIndex) => (
            <div className={s.keyRow} key={rowIndex}>
              {row.map(key => (
                <button
                  type="button"
                  className={`${s.key} ${key.length > 1 ? s.keyWide : ''}`}
                  key={key}
                  onClick={() => updateActiveValue(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
