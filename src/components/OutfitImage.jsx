import { useState } from 'react'

/**
 * OutfitImage
 *
 * 1. Intenta cargar imageUrl (archivo local en src/assets/outfits/)
 * 2. Si falla → intenta imageFallback (URL de lululemon.com)
 * 3. Si falla → muestra el color swatch
 *
 * Props:
 *   outfit      — objeto outfit completo
 *   className   — clase CSS para el <img> o el swatch
 *   style       — estilos inline adicionales
 */
export default function OutfitImage({ outfit, className, style }) {
  const [src, setSrc]         = useState(outfit.imageUrl)
  const [failed, setFailed]   = useState(false)
  const [tried, setTried]     = useState(false)   // has tried fallback?

  const handleError = () => {
    if (!tried && outfit.imageFallback) {
      // First failure → try the remote fallback URL
      setTried(true)
      setSrc(outfit.imageFallback)
    } else {
      // Both failed → show color swatch
      setFailed(true)
    }
  }

  if (failed) {
    // Color swatch fallback
    return (
      <div
        className={className}
        style={{
          background: outfit.color,
          borderRadius: 8,
          border: '0.5px solid rgba(255,255,255,0.06)',
          ...style,
        }}
      />
    )
  }

  return (
    <img
      src={src}
      alt={outfit.name}
      className={className}
      style={{
        objectFit: 'cover',
        borderRadius: 8,
        ...style,
      }}
      onError={handleError}
      draggable="false"
    />
  )
}