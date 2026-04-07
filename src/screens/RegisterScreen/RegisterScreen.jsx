import { useState } from 'react'
import { motion } from 'framer-motion'
import useTotemStore from '../../store/useTotemStore'
import { SCREENS } from '../../constants'
import TopBar from '../../components/TopBar'

export default function RegisterScreen() {
  const { registration, setRegistration, goTo } = useTotemStore()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!registration.name.trim())                e.name   = 'Ingresa tu nombre'
    if (!/\S+@\S+\.\S+/.test(registration.email)) e.email  = 'Email inválido'
    if (!registration.gender)                     e.gender = 'Selecciona tu género'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const field = {
    display:'flex', flexDirection:'column', gap:6,
  }
  const label = {
    fontSize:9, letterSpacing:3, color:'#999', textTransform:'uppercase', fontWeight:500,
  }
  const input = (hasError) => ({
    background:'#f7f7f7',
    border: hasError ? '1.5px solid #E31836' : '1px solid #e0e0e0',
    borderRadius:8, padding:'14px 16px',
    fontSize:16, color:'#111', outline:'none',
    fontFamily:'Inter, system-ui',
  })
  const errorStyle = { fontSize:11, color:'#E31836', letterSpacing:0.5 }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#fff' }}>
      <TopBar
        variant="light"
        onBack={() => goTo(SCREENS.WELCOME)}
        step={1} totalSteps={2}
      />

      <div style={{
        flex:1, display:'flex', flexDirection:'column',
        padding:'28px 28px 0', gap:24, overflowY:'auto',
      }}>

        <motion.div
          initial={{ opacity:0, y:-12 }}
          animate={{ opacity:1, y:0 }}
        >
          <p style={{ fontSize:10, color:'#E31836', letterSpacing:3, textTransform:'uppercase', marginBottom:6 }}>
            REGISTRO
          </p>
          <h1 style={{
            fontFamily:"'Bebas Neue','Arial Narrow',sans-serif",
            fontSize:36, letterSpacing:3, color:'#111', lineHeight:1.1,
          }}>
            CUÉNTANOS<br/>QUIÉN ERES
          </h1>
        </motion.div>

        <motion.div
          style={{ display:'flex', flexDirection:'column', gap:18 }}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.15 }}
        >
          {/* Name */}
          <div style={field}>
            <label style={label}>NOMBRE</label>
            <input
              style={input(errors.name)}
              type="text"
              placeholder="Tu nombre"
              value={registration.name}
              onChange={e => { setRegistration({ name: e.target.value }); setErrors(er => ({ ...er, name:'' })) }}
            />
            {errors.name && <span style={errorStyle}>{errors.name}</span>}
          </div>

          {/* Email */}
          <div style={field}>
            <label style={label}>EMAIL</label>
            <input
              style={input(errors.email)}
              type="email"
              placeholder="tu@email.com"
              value={registration.email}
              onChange={e => { setRegistration({ email: e.target.value }); setErrors(er => ({ ...er, email:'' })) }}
            />
            {errors.email && <span style={errorStyle}>{errors.email}</span>}
          </div>

          {/* Gender */}
          <div style={field}>
            <label style={label}>SOY</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { value:'female', label:'Mujer',  icon:'♀' },
                { value:'male',   label:'Hombre', icon:'♂' },
              ].map(opt => {
                const active = registration.gender === opt.value
                return (
                  <button key={opt.value}
                    onClick={() => { setRegistration({ gender: opt.value }); setErrors(er => ({ ...er, gender:'' })) }}
                    style={{
                      padding:'20px 12px',
                      background: active ? '#fff0f3' : '#f7f7f7',
                      border: active ? '2px solid #E31836' : '1px solid #e0e0e0',
                      borderRadius:10, cursor:'pointer',
                      display:'flex', flexDirection:'column', alignItems:'center', gap:8,
                      transition:'all .15s',
                      position:'relative', overflow:'hidden',
                    }}>
                    {active && (
                      <div style={{
                        position:'absolute', top:0, left:0, right:0, height:3,
                        background:'#E31836',
                      }}/>
                    )}
                    <span style={{ fontSize:24, color: active ? '#E31836' : '#aaa' }}>{opt.icon}</span>
                    <span style={{ fontSize:13, fontWeight:600, color: active ? '#E31836' : '#111', letterSpacing:1 }}>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
            {errors.gender && <span style={errorStyle}>{errors.gender}</span>}
          </div>

          {/* Marketing opt-in */}
          <button
            onClick={() => setRegistration({ acceptsMarketing: !registration.acceptsMarketing })}
            style={{
              display:'flex', alignItems:'flex-start', gap:12,
              background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:0,
            }}
          >
            <div style={{
              width:20, height:20, borderRadius:4, flexShrink:0, marginTop:1,
              background: registration.acceptsMarketing ? '#E31836' : '#f0f0f0',
              border: registration.acceptsMarketing ? '2px solid #E31836' : '1px solid #ddd',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {registration.acceptsMarketing && (
                <span style={{ fontSize:11, color:'#fff', fontWeight:700 }}>✓</span>
              )}
            </div>
            <span style={{ fontSize:12, color:'#777', lineHeight:1.5 }}>
              Quiero recibir novedades y ofertas de lululemon
            </span>
          </button>
        </motion.div>
      </div>

      {/* CTA */}
      <div style={{ padding:'20px 28px 24px', flexShrink:0 }}>
        <motion.button
          onClick={() => validate() && goTo(SCREENS.EXPERIENCE)}
          style={{
            width:'100%', background:'#E31836', color:'#fff',
            border:'none', padding:'17px 0', borderRadius:4,
            fontSize:14, fontWeight:600, letterSpacing:4, textTransform:'uppercase',
          }}
          whileTap={{ scale:0.97 }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
        >
          SIGUIENTE →
        </motion.button>
        <p style={{ fontSize:10, color:'#ccc', textAlign:'center', marginTop:10, letterSpacing:0.5 }}>
          Tus datos solo se usan para esta experiencia
        </p>
      </div>
    </div>
  )
}
