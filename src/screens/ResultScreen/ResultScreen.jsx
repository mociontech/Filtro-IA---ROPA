import { useEffect, useState } from 'react'
import useTotemStore from '../../store/useTotemStore'
import { getOutfitsForRegistration, SCREENS } from '../../constants'
import { useDecartImageEdit } from '../../hooks/useDecartImageEdit'
import s from './ResultScreen.module.css'

export default function ResultScreen() {
  const capturedFrame = useTotemStore(s => s.capturedFrame)
  const generatedFrame = useTotemStore(s => s.generatedFrame)
  const registration = useTotemStore(s => s.registration)
  const selectedOutfitIndex = useTotemStore(s => s.selectedOutfitIndex)
  const setGeneratedFrame = useTotemStore(s => s.setGeneratedFrame)
  const goTo = useTotemStore(s => s.goTo)
  const { transformPhoto } = useDecartImageEdit()

  const outfits = getOutfitsForRegistration(registration)
  const safeIdx = Math.min(selectedOutfitIndex, outfits.length - 1)
  const outfit = outfits[safeIdx] ?? outfits[0]

  const [photo, setPhoto] = useState(generatedFrame || null)
  const [isPreparing, setIsPreparing] = useState(Boolean(capturedFrame))
  const [statusMessage, setStatusMessage] = useState(capturedFrame ? 'GENERANDO TU UNIFORME...' : '')

  useEffect(() => {
    let cancelled = false

    if (!capturedFrame) {
      setPhoto(null)
      setIsPreparing(false)
      setStatusMessage('')
      return undefined
    }

    async function preparePhoto() {
      setIsPreparing(true)
      setStatusMessage('GENERANDO TU UNIFORME...')

      try {
        const transformedPhoto = generatedFrame || await transformPhoto(capturedFrame, outfit?.prompt)
        if (cancelled) return

        if (transformedPhoto && !generatedFrame) {
          setGeneratedFrame(transformedPhoto)
        }

        setPhoto(transformedPhoto || capturedFrame)
        setStatusMessage('')
      } catch (err) {
        console.warn('[Result] transformPhoto:', err)
        if (cancelled) return
        setPhoto(capturedFrame)
        setStatusMessage('NO PUDIMOS GENERAR EL UNIFORME. MOSTRAMOS LA FOTO ORIGINAL.')
      } finally {
        if (!cancelled) setIsPreparing(false)
      }
    }

    preparePhoto()

    return () => {
      cancelled = true
    }
  }, [capturedFrame, generatedFrame, outfit?.prompt, setGeneratedFrame, transformPhoto])

  return (
    <div className={s.root}>
      {photo ? (
        <img
          src={photo}
          alt="Resultado final"
          className={s.photo}
        />
      ) : (
        <div className={s.loadingState}>
          <div className={s.spinner} />
          {statusMessage && <p className={s.statusText}>{statusMessage}</p>}
        </div>
      )}

      {photo && statusMessage && !isPreparing && (
        <div className={s.notice}>
          <p className={s.noticeText}>{statusMessage}</p>
        </div>
      )}

      <button
        type="button"
        className={s.continueButton}
        onClick={() => goTo(SCREENS.GOODBYE)}
        disabled={isPreparing}
      >
        {isPreparing ? 'GENERANDO...' : 'CONTINUAR'}
      </button>
    </div>
  )
}
