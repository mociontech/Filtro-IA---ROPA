import { useCallback, useRef } from 'react'
import { models } from '@decartai/sdk'

const lucy2Model = models.realtime('lucy_2_rt')
const OUTPUT_WIDTH = 1080
const OUTPUT_HEIGHT = 1920
const EXTERNAL_CAMERA_KEYWORDS = [
  'usb',
  'webcam',
  'hd pro',
  'logitech',
  'c920',
  'c922',
  'brio',
  'cam link',
  'capture',
  'sony',
  'canon',
  'iphone',
  'android',
  'droidcam',
]
const DEPRIORITIZED_CAMERA_KEYWORDS = ['virtual', 'obs', 'snap camera']

function scoreCamera(device) {
  const label = (device.label || '').toLowerCase()

  let score = 0

  if (EXTERNAL_CAMERA_KEYWORDS.some(keyword => label.includes(keyword))) score += 8
  if (label.includes('integrated')) score -= 3
  if (label.includes('front')) score -= 1
  if (DEPRIORITIZED_CAMERA_KEYWORDS.some(keyword => label.includes(keyword))) score -= 6

  return score
}

async function pickPreferredCameraId() {
  if (!navigator.mediaDevices?.enumerateDevices) return null

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    if (cameras.length === 0) return null

    const ranked = [...cameras].sort((a, b) => scoreCamera(b) - scoreCamera(a))
    return ranked[0]?.deviceId || null
  } catch (err) {
    console.warn('[Camera] enumerateDevices failed:', err?.message ?? err)
    return null
  }
}

async function openCameraStream(preferredDeviceId) {
  const strictConstraints = {
    audio: false,
    video: {
      ...(preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : {}),
      frameRate: { ideal: lucy2Model.fps, max: lucy2Model.fps },
      width: { exact: lucy2Model.width },
      height: { exact: lucy2Model.height },
      aspectRatio: { exact: lucy2Model.width / lucy2Model.height },
      resizeMode: 'none',
    },
  }

  try {
    return await navigator.mediaDevices.getUserMedia(strictConstraints)
  } catch (err) {
    console.warn('[Camera] strict constraints fallback:', err?.message ?? err)
  }

  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      ...(preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : {}),
      frameRate: { ideal: lucy2Model.fps, max: lucy2Model.fps },
      width: { ideal: lucy2Model.width },
      height: { ideal: lucy2Model.height },
      aspectRatio: { ideal: lucy2Model.width / lucy2Model.height },
    },
  })
}

function drawPortraitFrame(ctx, source, sourceWidth, sourceHeight, mirror = true) {
  const sourceAspect = sourceWidth / sourceHeight
  const targetAspect = OUTPUT_WIDTH / OUTPUT_HEIGHT

  let sx = 0
  let sy = 0
  let sWidth = sourceWidth
  let sHeight = sourceHeight

  if (sourceAspect > targetAspect) {
    sWidth = sourceHeight * targetAspect
    sx = (sourceWidth - sWidth) / 2
  } else {
    sHeight = sourceWidth / targetAspect
    sy = (sourceHeight - sHeight) / 2
  }

  ctx.save()
  if (mirror) ctx.scale(-1, 1)
  ctx.drawImage(
    source,
    sx,
    sy,
    sWidth,
    sHeight,
    mirror ? -OUTPUT_WIDTH : 0,
    0,
    OUTPUT_WIDTH,
    OUTPUT_HEIGHT,
  )
  ctx.restore()
}

export function useCamera() {
  const streamRef = useRef(null)

  const start = useCallback(async () => {
    try {
      // First request opens permissions so device labels become available on desktop browsers.
      const warmupStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      warmupStream.getTracks().forEach(track => track.stop())

      const preferredDeviceId = await pickPreferredCameraId()
      const stream = await openCameraStream(preferredDeviceId)

      const activeTrack = stream.getVideoTracks?.()[0]
      const settings = activeTrack?.getSettings?.() || {}
      console.info('[Camera] Active device:', activeTrack?.label || 'unknown', settings)

      streamRef.current = stream
      return { ok: true, stream, deviceLabel: activeTrack?.label || '' }
    } catch (err) {
      console.error('[Camera]', err.message)
      return { ok: false, error: err.message }
    }
  }, [])

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  // Captures a frame from a <video> element as a base64 JPEG
  const capture = useCallback(async (videoEl, stream = null) => {
    if (!videoEl || videoEl.readyState < 2) return null

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_WIDTH
    canvas.height = OUTPUT_HEIGHT
    const ctx = canvas.getContext('2d')

    const track = stream?.getVideoTracks?.()[0] ?? null
    if (track && typeof window !== 'undefined' && 'ImageCapture' in window) {
      try {
        const imageCapture = new window.ImageCapture(track)
        const bitmap = await imageCapture.grabFrame()
        drawPortraitFrame(ctx, bitmap, bitmap.width, bitmap.height, false)
        bitmap.close?.()
        return canvas.toDataURL('image/jpeg', 0.92)
      } catch (err) {
        console.warn('[Camera] ImageCapture fallback:', err?.message ?? err)
      }
    }

    const sourceWidth = videoEl.videoWidth
    const sourceHeight = videoEl.videoHeight
    if (!sourceWidth || !sourceHeight) return null

    drawPortraitFrame(ctx, videoEl, sourceWidth, sourceHeight, false)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  return { start, stop, capture, streamRef }
}
