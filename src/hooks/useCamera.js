import { useCallback, useRef } from 'react'
import { CAMERA_INPUT_FPS, CAMERA_INPUT_HEIGHT, CAMERA_INPUT_WIDTH } from '../constants'
const OUTPUT_WIDTH = 1080
const OUTPUT_HEIGHT = 1920

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate:  { ideal: CAMERA_INPUT_FPS, max: CAMERA_INPUT_FPS },
          width:      { ideal: CAMERA_INPUT_WIDTH },
          height:     { ideal: CAMERA_INPUT_HEIGHT },
          facingMode: 'user',
        },
        audio: false,
      })
      streamRef.current = stream
      return { ok: true, stream }
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
    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_WIDTH
    canvas.height = OUTPUT_HEIGHT
    const ctx = canvas.getContext('2d')

    const track = stream?.getVideoTracks?.()[0] ?? null
    if (track && typeof window !== 'undefined' && 'ImageCapture' in window) {
      try {
        const imageCapture = new window.ImageCapture(track)
        const bitmap = await imageCapture.grabFrame()
        drawPortraitFrame(ctx, bitmap, bitmap.width, bitmap.height, true)
        bitmap.close?.()
        return canvas.toDataURL('image/jpeg', 0.92)
      } catch (err) {
        console.warn('[Camera] ImageCapture fallback:', err?.message ?? err)
      }
    }

    if (!videoEl || videoEl.readyState < 2) return null

    const sourceWidth = videoEl.videoWidth
    const sourceHeight = videoEl.videoHeight
    if (!sourceWidth || !sourceHeight) return null

    drawPortraitFrame(ctx, videoEl, sourceWidth, sourceHeight, true)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [])

  return { start, stop, capture, streamRef }
}
