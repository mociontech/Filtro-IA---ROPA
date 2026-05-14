import { useEffect, useRef, useState, useCallback, memo } from 'react'
import useTotemStore from '../../store/useTotemStore'
import { useCamera } from '../../hooks/useCamera'
import { useDecartAI } from '../../hooks/useDecartAI'
import { useTimer } from '../../hooks/useTimer'
import { useCelebration } from '../../hooks/useCelebration'
import {
  SCREENS,
  OUTFITS_WOMEN,
  OUTFITS_MEN,
  EXPERIENCE_DURATION,
  PHOTO_READY_COUNTDOWN,
} from '../../constants'

const VideoLayer = memo(function VideoLayer({ onReady }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) onReady(ref.current)
  }, [onReady])

  return (
    <video
      ref={ref}
      style={{
        position:'absolute', inset:0, width:'100%', height:'100%',
        objectFit:'cover', display:'block',
        transform:'scaleX(-1) translateZ(0)',
        willChange:'transform', backfaceVisibility:'hidden',
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
  try { await el.play() } catch { /* autoplay can fail transiently */ }
}

export default function ExperienceScreen() {
  const registration = useTotemStore(s => s.registration)
  const selectedOutfitIndex = useTotemStore(s => s.selectedOutfitIndex)
  const setSelectedOutfitIndex = useTotemStore(s => s.setSelectedOutfitIndex)
  const setCapturedFrame = useTotemStore(s => s.setCapturedFrame)
  const goTo = useTotemStore(s => s.goTo)
  const setVideoStream = useTotemStore(s => s.setVideoStream)
  const refImageUrls = useTotemStore(s => s.refImageUrls)

  const outfits = registration.gender === 'male' ? OUTFITS_MEN : OUTFITS_WOMEN
  const safeIdx = Math.min(selectedOutfitIndex, outfits.length - 1)
  const outfit = outfits[safeIdx] ?? outfits[0]

  const getRefUrl = useCallback(() => {
    const base = registration.gender === 'male' ? refImageUrls.hombre : refImageUrls.mujer
    return base ?? null
  }, [registration.gender, refImageUrls])

  const { start, stop, capture } = useCamera()
  const {
    connect,
    disconnect,
    switchOutfit,
    outputStream,
    connectionState,
    lastError,
    lastSetStatus,
    lastSetMessage,
    generationSeconds,
    hasRemoteStream,
    debugLog,
    connectStatus,
    lastDiagnostic,
    lastStats,
  } = useDecartAI()
  const { trigger: celebrate } = useCelebration()

  const videoElRef = useRef(null)
  const countdownRef = useRef(null)
  const sessionTimeoutRef = useRef(null)
  const switchRef = useRef(switchOutfit)
  const doCaptureRef = useRef(null)
  const finalizedRef = useRef(false)

  useEffect(() => {
    switchRef.current = switchOutfit
  }, [switchOutfit])

  const [camError, setCamError] = useState(false)

  const handleVideoReady = useCallback(el => {
    videoElRef.current = el
  }, [])

  const celebRef = useRef(null)

  const { timeLeft, progress, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(EXPERIENCE_DURATION, () => {
    void doCaptureRef.current?.()
  })
  const r = 22
  const circ = 2 * Math.PI * r

  const finalizeSession = useCallback(() => {
    if (finalizedRef.current) return
    finalizedRef.current = true
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
      sessionTimeoutRef.current = null
    }
    stopTimer()
    resetTimer()
    setVideoStream(null)
    disconnect()
    stop()
  }, [disconnect, stop, stopTimer, resetTimer, setVideoStream])

  const doCapture = useCallback(async () => {
    const activeStream = outputStream || videoElRef.current?.srcObject || null
    const frame = await capture(videoElRef.current, activeStream)
    finalizeSession()
    if (frame) {
      celebrate(celebRef.current)
      setCapturedFrame(frame)
      setTimeout(() => goTo(SCREENS.RESULT), 600)
      return
    }
    goTo(SCREENS.RESULT)
  }, [capture, celebrate, setCapturedFrame, goTo, finalizeSession, outputStream])

  useEffect(() => {
    doCaptureRef.current = doCapture
  }, [doCapture])

  useEffect(() => {
    let alive = true
    finalizedRef.current = false
    setSelectedOutfitIndex(0)

    async function init() {
      const result = await start()
      if (!alive) return
      if (!result.ok) {
        setCamError(true)
        return
      }

      setVideoStream(result.stream)
      await attachStream(videoElRef.current, result.stream)
      startTimer()
      sessionTimeoutRef.current = setTimeout(() => {
        void doCaptureRef.current?.()
      }, (EXPERIENCE_DURATION + 1) * 1000)

      const refUrl = getRefUrl()
      const decart = await connect(result.stream, outfits[0]?.prompt, refUrl)
      if (!alive) return

      if (!decart.ok) return
    }

    init()

    return () => {
      alive = false
      finalizeSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!outputStream) return
    attachStream(videoElRef.current, outputStream)
  }, [outputStream])

  useEffect(() => {
    const refUrl = getRefUrl()
    if (!refUrl) return
    if (!outfit?.prompt) return
    if (!(connectionState === 'connected' || connectionState === 'generating')) return
    switchRef.current?.(outfit.prompt, refUrl)
  }, [connectionState, getRefUrl, outfit])

  const poseCountdown = timeLeft <= PHOTO_READY_COUNTDOWN && timeLeft > 0 ? timeLeft : null
  const refUrl = getRefUrl()
  const diagnosticsColor = {
    idle:'#9ca3af',
    pending:'#60a5fa',
    sending:'#f59e0b',
    retry:'#f97316',
    ok:'#22c55e',
    error:'#ef4444',
  }[lastSetStatus] ?? '#9ca3af'

  useEffect(() => () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
  }, [])

  return (
    <div style={{ height:'100%', background:'#000' }}>
      <div style={{ position:'relative', height:'100%', overflow:'hidden', background:'#000' }}>
        <div style={{ position:'absolute', inset:0 }}>
          <VideoLayer onReady={handleVideoReady} />
        </div>

        <div ref={celebRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
          <div style={{
            position:'absolute',
            top:18,
            left:18,
            width:240,
            background:'rgba(0,0,0,0.68)',
            color:'#fff',
            borderRadius:14,
            padding:'10px 12px',
            zIndex:2,
            pointerEvents:'all',
            boxShadow:'0 10px 24px rgba(0,0,0,0.22)',
          }}>
            <div style={{
              display:'flex',
              alignItems:'center',
              gap:8,
              marginBottom:8,
              fontSize:11,
              fontWeight:700,
              letterSpacing:1.2,
              textTransform:'uppercase',
            }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:diagnosticsColor, flexShrink:0 }}/>
              Lucy Debug
            </div>
            <div style={{ display:'grid', gap:4, fontSize:11, lineHeight:1.35, color:'rgba(255,255,255,0.88)' }}>
              <div>Estado: {connectionState || 'n/a'}</div>
              <div>Connect: {connectStatus}</div>
              <div>Stream remoto: {hasRemoteStream ? 'si' : 'no'}</div>
              <div>Generando: {generationSeconds}s</div>
              <div>Referencia: {refUrl ? 'ok' : 'faltante'}</div>
              <div>Set Lucy: {lastSetStatus}</div>
              {lastDiagnostic && <div>Diag: {lastDiagnostic}</div>}
              {lastStats?.outboundVideo && (
                <div>
                  Out: {lastStats.outboundVideo.frameWidth}x{lastStats.outboundVideo.frameHeight} @{Math.round(lastStats.outboundVideo.framesPerSecond || 0)}fps
                </div>
              )}
              {lastStats?.connection && (
                <div>
                  RTT: {lastStats.connection.currentRoundTripTime !== null ? `${Math.round(lastStats.connection.currentRoundTripTime * 1000)}ms` : 'n/a'}
                </div>
              )}
              {lastSetMessage && <div>Detalle: {lastSetMessage}</div>}
              {lastError && <div style={{ color:'#fca5a5' }}>Error: {lastError}</div>}
              {debugLog.length > 0 && (
                <div style={{
                  marginTop:6,
                  paddingTop:6,
                  borderTop:'1px solid rgba(255,255,255,0.12)',
                  display:'grid',
                  gap:3,
                  fontSize:10,
                  color:'rgba(255,255,255,0.72)',
                }}>
                  {debugLog.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{
            position:'absolute', top:18, right:18, width:52, height:52,
            display:'flex', alignItems:'center', justifyContent:'center',
            zIndex:2,
          }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="3"/>
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
                style={{ transition:'stroke-dashoffset .9s linear, stroke .3s' }}
              />
            </svg>
            <span style={{
              position:'absolute',
              fontFamily:"'Bebas Neue','Arial Narrow',sans-serif",
              fontSize:18, color:'#fff',
              textShadow:'0 1px 4px rgba(0,0,0,0.45)',
            }}>{timeLeft}</span>
          </div>

          {poseCountdown !== null && (
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              background:'rgba(0,0,0,0.12)',
              zIndex:2,
            }}>
              <div style={{
                fontFamily:"'Bebas Neue','Arial Narrow',sans-serif",
                fontSize:28, letterSpacing:3, color:'rgba(255,255,255,0.95)',
                textShadow:'0 4px 20px rgba(0,0,0,0.28)',
                marginBottom:8,
              }}>POSA PARA LA FOTO</div>
              <span key={poseCountdown} style={{
                fontFamily:"'Bebas Neue','Arial Narrow',sans-serif",
                fontSize:180, color:'rgba(255,255,255,0.96)', lineHeight:1,
                textShadow:'0 8px 40px rgba(0,0,0,0.3)',
                animation:'countPop .22s cubic-bezier(0.34,1.56,0.64,1)',
              }}>{poseCountdown}</span>
            </div>
          )}

          <img
            src="/Marco_Sesion.png"
            alt=""
            aria-hidden="true"
            style={{
              position:'absolute',
              inset:0,
              width:'100%',
              height:'100%',
              objectFit:'cover',
              display:'block',
              zIndex:1,
            }}
          />

          {camError && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(245,245,245,0.98)', pointerEvents:'all',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16,
              padding:'24px',
            }}>
              <p style={{ fontSize:13, color:'#888' }}>Permite acceso a la camara</p>
              <button onClick={() => window.location.reload()} style={{
                background:'#E31836', color:'#fff', border:'none',
                padding:'12px 28px', borderRadius:4,
                fontFamily:"'Bebas Neue'", fontSize:15, letterSpacing:3, cursor:'pointer',
              }}>REINTENTAR</button>
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
