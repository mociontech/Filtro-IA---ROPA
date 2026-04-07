import { useCallback, useRef } from 'react'
import { createDecartClient, models } from '@decartai/sdk'

const DECART_TOKEN_ENDPOINT = import.meta.env.DEV
  ? '/api/decart/token'
  : '/.netlify/functions/decart-token'

const EDIT_CROP_ASPECT = 9 / 16
const EDIT_CROP_WIDTH_RATIO = 0.64
const EDIT_CROP_TOP_RATIO = 0.12
const EDIT_CROP_MAX_HEIGHT_RATIO = 0.72

async function fetchClientToken() {
  const res = await fetch(DECART_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  })

  let payload = null

  try {
    payload = await res.json()
  } catch {
    // Ignore JSON parse errors and use the generic fallback below.
  }

  if (!res.ok || !payload?.apiKey) {
    throw new Error(payload?.error || 'Failed to create a Decart client token')
  }

  return payload
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl)
  if (!res.ok) throw new Error(`Failed to read captured image: HTTP ${res.status}`)
  return res.blob()
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to convert edited image'))
    reader.readAsDataURL(blob)
  })
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image for editing'))
    img.src = src
  })
}

function getEditRect(width, height) {
  const maxHeight = Math.round(height * EDIT_CROP_MAX_HEIGHT_RATIO)
  let cropWidth = Math.round(width * EDIT_CROP_WIDTH_RATIO)
  let cropHeight = Math.round(cropWidth / EDIT_CROP_ASPECT)

  if (cropHeight > maxHeight) {
    cropHeight = maxHeight
    cropWidth = Math.round(cropHeight * EDIT_CROP_ASPECT)
  }

  const x = Math.max(0, Math.round((width - cropWidth) / 2))
  const y = Math.max(0, Math.min(Math.round(height * EDIT_CROP_TOP_RATIO), height - cropHeight))

  return { x, y, width: cropWidth, height: cropHeight }
}

async function cropImageDataUrl(dataUrl, rect) {
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = rect.width
  canvas.height = rect.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height,
  )

  return canvas.toDataURL('image/jpeg', 0.92)
}

async function compositeEditedCrop(baseDataUrl, editedCropDataUrl, rect) {
  const [baseImage, editedCrop] = await Promise.all([
    loadImage(baseDataUrl),
    loadImage(editedCropDataUrl),
  ])

  const width = baseImage.naturalWidth || baseImage.width
  const height = baseImage.naturalHeight || baseImage.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.drawImage(baseImage, 0, 0, width, height)
  ctx.drawImage(editedCrop, rect.x, rect.y, rect.width, rect.height)

  return canvas.toDataURL('image/jpeg', 0.92)
}

export function useDecartImageEdit() {
  const tokenRef = useRef(null)

  const transformPhoto = useCallback(async (dataUrl, prompt) => {
    if (!dataUrl || !prompt) return dataUrl

    const now = Date.now()
    const cachedToken = tokenRef.current
    const token = cachedToken && cachedToken.expiresAt && Date.parse(cachedToken.expiresAt) - now > 30_000
      ? cachedToken
      : await fetchClientToken()

    tokenRef.current = token

    const client = createDecartClient({ apiKey: token.apiKey })
    const originalImage = await loadImage(dataUrl)
    const rect = getEditRect(
      originalImage.naturalWidth || originalImage.width,
      originalImage.naturalHeight || originalImage.height,
    )
    const croppedDataUrl = await cropImageDataUrl(dataUrl, rect)
    const source = await dataUrlToBlob(croppedDataUrl)
    const blob = await client.process({
      model: models.image('lucy-pro-i2i'),
      prompt,
      data: source,
      resolution: '720p',
      orientation: 'portrait',
      enhance_prompt: false,
    })

    const editedCropDataUrl = await blobToDataUrl(blob)
    return compositeEditedCrop(dataUrl, editedCropDataUrl, rect)
  }, [])

  return { transformPhoto }
}
