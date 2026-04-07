import { useCallback } from 'react'

const imageCache = new Map()
const BOTTOM_LABEL = 'RC FARIAS'

function loadImage(src) {
  if (!imageCache.has(src)) {
    imageCache.set(src, new Promise((resolve, reject) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    }))
  }

  return imageCache.get(src)
}

function drawBottomLabel(ctx, width, height) {
  const fontSize = Math.max(34, Math.round(width * 0.075))
  const bottomMargin = height * 0.045

  ctx.save()
  ctx.font = `900 ${fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
  ctx.shadowBlur = Math.max(12, width * 0.018)
  ctx.shadowOffsetY = Math.max(3, height * 0.004)
  ctx.fillText(BOTTOM_LABEL, width / 2, height - bottomMargin)
  ctx.restore()
}

export function useBrandFrame() {
  const applyFrame = useCallback(async (dataURL) => {
    if (!dataURL) return dataURL

    try {
      const photo = await loadImage(dataURL)

      const canvas = document.createElement('canvas')
      canvas.width = photo.naturalWidth || photo.width
      canvas.height = photo.naturalHeight || photo.height

      const ctx = canvas.getContext('2d')
      if (!ctx || !canvas.width || !canvas.height) return dataURL

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height)
      drawBottomLabel(ctx, canvas.width, canvas.height)

      return canvas.toDataURL('image/jpeg', 0.96)
    } catch (err) {
      console.warn('[BrandFrame] applyFrame:', err)
      return dataURL
    }
  }, [])

  return { applyFrame }
}
