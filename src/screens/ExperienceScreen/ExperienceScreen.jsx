import { useEffect, useRef, useState, useCallback, memo } from 'react'
import useTotemStore from '../../store/useTotemStore'
import { useCamera } from '../../hooks/useCamera'
import { useTimer } from '../../hooks/useTimer'
import { useCelebration } from '../../hooks/useCelebration'
import { useDecartAI } from '../../hooks/useDecartAI'
import {
  SCREENS,
  EXPERIENCE_DURATION,
  CAPTURE_COUNTDOWN_SECONDS,
  getOutfitsForRegistration,
} from '../../constants'

const layerStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
}

const VideoLayer = memo(function VideoLayer({ onReady, opacity = 1, mirror = true }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) onReady(ref.current)
  }, [onReady])

  return (
    <video
      ref={ref}
      style={{
        ...layerStyle,
        opacity,
        transform: mirror ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
      }}
      autoPlay
      muted
      playsInline
      draggable="false"
    />
  )
})

async function attachStream(el, stream) {
  if (!el || !stream || el.srcObject === stream) return
  el.srcObject = stream
  try {
    await el.play()
  } catch {
    // autoplay can fail transiently
  }
}

export default function ExperienceScreen() {
  const setSelectedOutfitIndex = useTotemStore(s => s.setSelectedOutfitIndex)
  const setCapturedFrame = useTotemStore(s => s.setCapturedFrame)
  const setGeneratedFrame = useTotemStore(s => s.setGeneratedFrame)
  const setCaptureId = useTotemStore(s => s.setCaptureId)
  const goTo = useTotemStore(s => s.goTo)
  const setVideoStream = useTotemStore(s => s.setVideoStream)
  const registration = useTotemStore(s => s.registration)
  const selectedOutfitIndex = useTotemStore(s => s.selectedOutfitIndex)
  const outfits = getOutfitsForRegistration(registration)
  const safeIdx = Math.min(selectedOutfitIndex, outfits.length - 1)
  const outfit = outfits[safeIdx] ?? outfits[0]

  const { start, stop, capture } = useCamera()
  const { trigger: celebrate } = useCelebration()
  const {
    connect,
    disconnect,
    outputStream,
    hasRemoteStream,
    connectStatus,
    lastError,
  } = useDecartAI()

  const rawVideoRef = useRef(null)
  const liveVideoRef = useRef(null)
  const sessionTimeoutRef = useRef(null)
  const connectTimeoutRef = useRef(null)
  const doCaptureRef = useRef(null)
  const finalizedRef = useRef(false)
  const timerStartedRef = useRef(false)

  const [camError, setCamError] = useState(false)

  const handleRawVideoReady = useCallback(el => {
    rawVideoRef.current = el
  }, [])

  const handleLiveVideoReady = useCallback(el => {
    liveVideoRef.current = el
  }, [])

  const celebRef = useRef(null)

  const { timeLeft, progress, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(
    EXPERIENCE_DURATION,
    () => {
      void doCaptureRef.current?.()
    },
  )
  const r = 22
  const circ = 2 * Math.PI * r

  const beginSessionTimer = useCallback(() => {
    if (timerStartedRef.current) return
    timerStartedRef.current = true
    startTimer()
    sessionTimeoutRef.current = setTimeout(() => {
      void doCaptureRef.current?.()
    }, (EXPERIENCE_DURATION + 1) * 1000)
  }, [startTimer])

  const finalizeSession = useCallback(() => {
    if (finalizedRef.current) return
    finalizedRef.current = true

    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = null
    }

    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current)
      connectTimeoutRef.current = null
    }

    stopTimer()
    resetTimer()
    setVideoStream(null)
    disconnect()
    stop()
  }, [disconnect, resetTimer, setVideoStream, stop, stopTimer])

  const doCapture = useCallback(async () => {
    const rawStream = rawVideoRef.current?.srcObject || null
    const liveStream = liveVideoRef.current?.srcObject || null

    const [rawFrame, liveFrame] = await Promise.all([
      capture(rawVideoRef.current, rawStream),
      liveStream ? capture(liveVideoRef.current, liveStream) : Promise.resolve(null),
    ])

    finalizeSession()

    if (rawFrame || liveFrame) {
      const nextCaptureId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      celebrate(celebRef.current)
      setCaptureId(nextCaptureId)
      setCapturedFrame(rawFrame || liveFrame)
      setGeneratedFrame(liveFrame || null)
      setTimeout(() => goTo(SCREENS.RESULT), 600)
      return
    }

    setCaptureId(null)
    setGeneratedFrame(null)
    goTo(SCREENS.RESULT)
  }, [capture, celebrate, finalizeSession, goTo, setCaptureId, setCapturedFrame, setGeneratedFrame])

  useEffect(() => {
    doCaptureRef.current = doCapture
  }, [doCapture])

  useEffect(() => {
    let alive = true
    finalizedRef.current = false
    timerStartedRef.current = false
    setSelectedOutfitIndex(0)

    async function init() {
      const cameraResult = await start()
      if (!alive) return

      if (!cameraResult.ok) {
        setCamError(true)
        return
      }

      setVideoStream(cameraResult.stream)
      await attachStream(rawVideoRef.current, cameraResult.stream)

      const decartResult = await connect(cameraResult.stream, outfit?.prompt, outfit?.imageRefUrl)
      if (!alive) return

      if (!decartResult.ok) {
        return
      }

      connectTimeoutRef.current = setTimeout(() => {
        beginSessionTimer()
      }, 2500)
    }

    init()

    return () => {
      alive = false
      finalizeSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!outputStream) return
    void attachStream(liveVideoRef.current, outputStream)
    beginSessionTimer()
  }, [beginSessionTimer, outputStream])

  const poseCountdown = timeLeft <= CAPTURE_COUNTDOWN_SECONDS && timeLeft > 0 ? timeLeft : null
  const showRealtimeLoading = !hasRemoteStream && !camError && connectStatus !== 'error'
  const statusLabel = camError
    ? ''
    : connectStatus === 'error'
      ? 'NO PUDIMOS CARGAR EL LOOK EN VIVO'
      : showRealtimeLoading
        ? 'CARGANDO LOOK EN TIEMPO REAL...'
        : 'LOOK EN VIVO ACTIVO'

  return (
    <div style={{ height: '100%', background: '#000' }}>
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: '#000' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <VideoLayer onReady={handleRawVideoReady} opacity={hasRemoteStream ? 0 : 1} />
          <VideoLayer onReady={handleLiveVideoReady} opacity={hasRemoteStream ? 1 : 0} mirror={false} />
        </div>

        <div ref={celebRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
              <circle
                cx="26"
                cy="26"
                r={r}
                fill="none"
                stroke={timeLeft <= 10 ? '#E31836' : '#fff'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                transform="rotate(-90 26 26)"
                style={{ transition: 'stroke-dashoffset .9s linear, stroke .3s' }}
              />
            </svg>
            <span
              style={{
                position: 'absolute',
                fontFamily: "'Bebas Neue','Arial Narrow',sans-serif",
                fontSize: 18,
                color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.45)',
              }}
            >
              {timeLeft}
            </span>
          </div>

          {statusLabel && (
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '10px 16px',
                borderRadius: 999,
                background: 'rgba(0,0,0,0.42)',
                backdropFilter: 'blur(8px)',
                zIndex: 2,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue','Arial Narrow',sans-serif",
                  fontSize: 18,
                  letterSpacing: 1.5,
                  color: '#fff',
                }}
              >
                {statusLabel}
              </span>
            </div>
          )}

          {poseCountdown !== null && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.12)',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue','Arial Narrow',sans-serif",
                  fontSize: 28,
                  letterSpacing: 3,
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 4px 20px rgba(0,0,0,0.28)',
                  marginBottom: 8,
                }}
              >
                POSA PARA LA FOTO
              </div>
              <span
                key={poseCountdown}
                style={{
                  fontFamily: "'Bebas Neue','Arial Narrow',sans-serif",
                  fontSize: 180,
                  color: 'rgba(255,255,255,0.96)',
                  lineHeight: 1,
                  textShadow: '0 8px 40px rgba(0,0,0,0.3)',
                  animation: 'countPop .22s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              >
                {poseCountdown}
              </span>
            </div>
          )}

          <img
            src="/Marca_Inferior.png"
            alt="Marca inferior"
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 54,
              transform: 'translateX(-50%)',
              width: 'min(62vw, 270px)',
              height: 'auto',
              display: 'block',
            }}
          />

          {(camError || connectStatus === 'error') && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(245,245,245,0.98)',
                pointerEvents: 'all',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '24px',
              }}
            >
              <p style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
                {camError ? 'Permite acceso a la camara.' : lastError || 'No se pudo iniciar el look en tiempo real.'}
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#E31836',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: 4,
                  fontFamily: "'Bebas Neue'",
                  fontSize: 15,
                  letterSpacing: 3,
                  cursor: 'pointer',
                }}
              >
                REINTENTAR
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes countPop { from{transform:scale(.45);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  )
}
