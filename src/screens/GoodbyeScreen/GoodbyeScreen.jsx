import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import useTotemStore from '../../store/useTotemStore'
import { getOutfitsForRegistration } from '../../constants'
import { saveSession, uploadPhoto } from '../../firebase/config'
import { useBrandFrame } from '../../hooks/useBrandFrame'
import s from './GoodbyeScreen.module.css'

const uploadJobs = new Map()
const sessionSaveJobs = new Map()

function ensureUpload(captureId, dataURL) {
  if (!uploadJobs.has(captureId)) {
    uploadJobs.set(captureId, uploadPhoto(dataURL, captureId))
  }

  return uploadJobs.get(captureId)
}

function ensureSessionSaved(captureId, payload) {
  if (!sessionSaveJobs.has(captureId)) {
    sessionSaveJobs.set(captureId, saveSession(payload))
  }

  return sessionSaveJobs.get(captureId)
}

export default function GoodbyeScreen() {
  const {
    capturedFrame,
    generatedFrame,
    captureId,
    capturedPhotoURL,
    setCapturedPhotoURL,
    registration,
    selectedOutfitIndex,
    reset,
  } = useTotemStore()

  const outfits = getOutfitsForRegistration(registration)
  const safeIdx = Math.min(selectedOutfitIndex, outfits.length - 1)
  const outfit = outfits[safeIdx] ?? outfits[0]

  const { applyFrame } = useBrandFrame()
  const [photoReady, setPhotoReady] = useState(false)
  const [photoForUpload, setPhotoForUpload] = useState(null)
  const [status, setStatus] = useState(capturedPhotoURL ? 'ready' : capturedFrame ? 'processing' : 'missing')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  const fallbackCaptureIdRef = useRef(null)
  if (!fallbackCaptureIdRef.current) {
    fallbackCaptureIdRef.current = `capture-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }

  const activeCaptureId = captureId || fallbackCaptureIdRef.current

  useEffect(() => {
    let cancelled = false
    const sourcePhoto = generatedFrame || capturedFrame

    if (!sourcePhoto) {
      setPhotoReady(false)
      setPhotoForUpload(null)

      if (!capturedPhotoURL) {
        setStatus('missing')
        setErrorMessage('No encontramos una foto para generar el QR.')
      }

      return undefined
    }

    async function preparePhoto() {
      setPhotoReady(false)
      setErrorMessage('')
      setStatus(current => (current === 'ready' ? current : 'processing'))

      try {
        const framedPhoto = await applyFrame(sourcePhoto)
        if (cancelled) return
        setPhotoForUpload(framedPhoto || sourcePhoto)
      } catch (err) {
        console.warn('[Goodbye] applyFrame:', err)
        if (cancelled) return
        setPhotoForUpload(sourcePhoto)
      } finally {
        if (!cancelled) setPhotoReady(true)
      }
    }

    preparePhoto()

    return () => {
      cancelled = true
    }
  }, [applyFrame, capturedFrame, capturedPhotoURL, generatedFrame])

  useEffect(() => {
    let cancelled = false

    if (capturedPhotoURL) {
      setStatus('ready')
      return undefined
    }

    if (!photoReady || !photoForUpload) return undefined

    async function persistPhoto() {
      setErrorMessage('')
      setStatus('uploading')

      const url = await ensureUpload(activeCaptureId, photoForUpload)
      if (cancelled) return

      if (!url) {
        setStatus('error')
        setErrorMessage('No se pudo subir la foto a Firebase Storage. Revisa las reglas del bucket y vuelve a intentarlo.')
        return
      }

      setCapturedPhotoURL(url)
      setStatus('ready')
    }

    persistPhoto()

    return () => {
      cancelled = true
    }
  }, [activeCaptureId, capturedPhotoURL, photoForUpload, photoReady, retryCount, setCapturedPhotoURL])

  useEffect(() => {
    if (!capturedPhotoURL) return

    void ensureSessionSaved(activeCaptureId, {
      name: registration.name,
      email: registration.email,
      gender: registration.gender,
      position: registration.position,
      acceptsMarketing: registration.acceptsMarketing,
      outfitName: outfit?.name,
      photoURL: capturedPhotoURL,
    })
  }, [
    activeCaptureId,
    capturedPhotoURL,
    outfit?.name,
    registration.acceptsMarketing,
    registration.email,
    registration.gender,
    registration.name,
    registration.position,
  ])

  const isBusy = status === 'processing' || status === 'uploading'
  const qrReady = Boolean(capturedPhotoURL)
  const statusLabel = status === 'processing'
    ? 'Preparando tu foto final...'
    : status === 'uploading'
      ? 'Guardando tu foto y generando el QR...'
      : qrReady
        ? 'Tu QR ya esta listo para descargar.'
        : errorMessage

  function handleRetry() {
    if (!photoForUpload) return

    uploadJobs.delete(activeCaptureId)
    sessionSaveJobs.delete(activeCaptureId)
    setCapturedPhotoURL(null)
    setErrorMessage('')
    setStatus('processing')
    setRetryCount(count => count + 1)
  }

  return (
    <div className={s.root}>
      <main className={s.qrStage} aria-live="polite">
        <div className={s.qrWrap}>
          {isBusy && (
            <div className={s.loadingState}>
              <div className={s.spinner} />
              <p className={s.stateText}>{statusLabel}</p>
            </div>
          )}

          {!isBusy && qrReady && (
            <div className={s.qrCard}>
              <QRCodeSVG
                className={s.qrCode}
                value={capturedPhotoURL}
                size={256}
                bgColor="#FFFFFF"
                fgColor="#111111"
                level="Q"
                includeMargin
              />
            </div>
          )}

          {!isBusy && !qrReady && (
            <div className={s.errorState}>
              <p className={s.stateText}>{statusLabel || 'No pudimos generar el QR.'}</p>
              {photoForUpload && (
                <button type="button" className={s.retryButton} onClick={handleRetry}>
                  REINTENTAR QR
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <button type="button" className={s.finishButton} onClick={reset}>
        FINALIZAR
      </button>
    </div>
  )
}
