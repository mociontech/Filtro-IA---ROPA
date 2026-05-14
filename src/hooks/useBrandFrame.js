import { useCallback } from 'react'

const OUTPUT_WIDTH = 1080
const OUTPUT_HEIGHT = 1920

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

export function useBrandFrame() {
  const applyFrame = useCallback(async (dataURL) => {
    try {
      const [photo, frame] = await Promise.all([
        loadImage(dataURL),
        loadImage('/Marco_Sesion.png'),
      ])

      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_WIDTH
      canvas.height = OUTPUT_HEIGHT
      const ctx = canvas.getContext('2d')

      ctx.drawImage(photo, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
      ctx.drawImage(frame, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)

      return canvas.toDataURL('image/jpeg', 0.92)
    } catch (error) {
      console.warn('[BrandFrame] Could not apply Marco_Sesion:', error)
      return dataURL
    }
  }, [])

  return { applyFrame }
}
