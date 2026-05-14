import { useEffect, useRef, useState } from 'react'
import useTotemStore from '../../store/useTotemStore'
import { OUTFITS_WOMEN, OUTFITS_MEN, SCREENS } from '../../constants'
import { saveSession, uploadPhoto } from '../../firebase/config'
import { useBrandFrame } from '../../hooks/useBrandFrame'
import { sendExperienceData } from '../../services/datahub'

export default function ResultScreen() {
  const {
    capturedFrame, setCapturedPhotoURL,
    registration, selectedOutfitIndex, goTo, setCapturedFrame,
  } = useTotemStore()

  const outfits = registration.gender === 'male' ? OUTFITS_MEN : OUTFITS_WOMEN
  const safeIdx = Math.min(selectedOutfitIndex, outfits.length - 1)
  const outfit = outfits[safeIdx] ?? outfits[0]

  const { applyFrame } = useBrandFrame()
  const [framedPhoto, setFramedPhoto] = useState(null)
  const hasSentSession = useRef(false)

  useEffect(() => {
    if (!capturedFrame) return
    applyFrame(capturedFrame).then(f => setFramedPhoto(f))
  }, [capturedFrame]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!framedPhoto) return
    if (hasSentSession.current) return

    hasSentSession.current = true

    ;(async () => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const url = await uploadPhoto(framedPhoto, id)

      if (url) setCapturedPhotoURL(url)

      await saveSession({
        name: registration.name,
        email: registration.email,
        company: registration.company,
        gender: registration.gender,
        acceptsMarketing: registration.acceptsMarketing,
        outfitName: outfit?.name,
        photoURL: url,
      })

      await sendExperienceData({
        name: registration.name,
        email: registration.email,
        gender: registration.gender,
      })
    })()
  }, [framedPhoto]) // eslint-disable-line react-hooks/exhaustive-deps

  const photo = framedPhoto || capturedFrame

  const retakePhoto = () => {
    hasSentSession.current = false
    setFramedPhoto(null)
    setCapturedFrame(null)
    setCapturedPhotoURL(null)
    goTo(SCREENS.EXPERIENCE)
  }

  return (
    <div style={{ height:'100%', background:'#000' }}>
      <div style={{ position:'relative', height:'100%', overflow:'hidden', background:'#000' }}>
        {photo ? (
          <img
            src={photo}
            alt="Resultado final"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
        ) : (
          <div style={{
            height:'100%',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            background:'#000',
          }}>
            <div style={{
              width:44,
              height:44,
              border:'2px solid rgba(255,255,255,0.2)',
              borderTopColor:'#fff',
              borderRadius:'50%',
              animation:'spin .8s linear infinite',
            }}/>
          </div>
        )}

        <div style={{
          position:'absolute',
          left:'50%',
          bottom:'5.4%',
          transform:'translateX(-42%)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          gap:22,
          pointerEvents:'all',
        }}>
          <button
            type="button"
            aria-label="Repetir foto"
            onClick={retakePhoto}
            style={{
              width:'min(18vw, 92px)',
              background:'transparent',
              padding:0,
              lineHeight:0,
            }}
          >
            <img
              src="/Btn_Ant.png"
              alt=""
              style={{ width:'100%', height:'auto', display:'block' }}
            />
          </button>

          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => goTo(SCREENS.GOODBYE)}
            style={{
              width:'min(18vw, 92px)',
              background:'transparent',
              padding:0,
              lineHeight:0,
            }}
          >
            <img
              src="/Btn_Sig.png"
              alt=""
              style={{ width:'100%', height:'auto', display:'block' }}
            />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
