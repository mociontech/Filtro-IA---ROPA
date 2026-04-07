import { useCallback } from 'react'

const imageCache = new Map()
const TOP_BRAND_SRC = `${import.meta.env.BASE_URL}Marca_Inferior.png`
const RUN_LOGO_SRC = `${import.meta.env.BASE_URL}Run_Logo.png`

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

function drawCenteredImage(ctx, img, centerX, y, targetWidth) {
  const ratio = targetWidth / img.width
  const width = targetWidth
  const height = img.height * ratio
  const x = centerX - width / 2

  ctx.drawImage(img, x, y, width, height)

  return { x, y, width, height }
}

export function useBrandFrame() {
  const applyFrame = useCallback(async (dataURL) => {
    if (!dataURL) return dataURL

    try {
      const [photo, topBrand, runLogo] = await Promise.all([
        loadImage(dataURL),
        loadImage(TOP_BRAND_SRC),
        loadImage(RUN_LOGO_SRC),
      ])

      const canvas = document.createElement('canvas')
      canvas.width = photo.naturalWidth || photo.width
      canvas.height = photo.naturalHeight || photo.height

      const ctx = canvas.getContext('2d')
      if (!ctx || !canvas.width || !canvas.height) return dataURL

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height)

      const topWidth = canvas.width * 0.68
      const topMargin = canvas.height * 0.032
      const bottomWidth = canvas.width * 0.42
      const bottomMargin = canvas.height * 0.045

      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)'
      ctx.shadowBlur = Math.max(12, canvas.width * 0.015)
      ctx.shadowOffsetY = Math.max(3, canvas.height * 0.004)
      drawCenteredImage(ctx, topBrand, canvas.width / 2, topMargin, topWidth)
      ctx.restore()

      const runRatio = bottomWidth / runLogo.width
      const runHeight = runLogo.height * runRatio

      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.32)'
      ctx.shadowBlur = Math.max(12, canvas.width * 0.015)
      ctx.shadowOffsetY = Math.max(3, canvas.height * 0.004)
      drawCenteredImage(
        ctx,
        runLogo,
        canvas.width / 2,
        canvas.height - bottomMargin - runHeight,
        bottomWidth,
      )
      ctx.restore()

      return canvas.toDataURL('image/jpeg', 0.96)
    } catch (err) {
      console.warn('[BrandFrame] applyFrame:', err)
      return dataURL
    }
  }, [])

  return { applyFrame }
}
