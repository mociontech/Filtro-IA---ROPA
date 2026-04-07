import { useRef, useEffect, useCallback } from 'react'

/**
 * useSwipe(el, { onLeft, onRight, threshold })
 *
 * Attaches native addEventListener (passive:true) directly to a DOM element.
 * This bypasses React's synthetic event system which registers passive:false
 * and can cause browsers to cancel horizontal touch events.
 *
 * Usage:
 *   const swipeRef = useRef(null)
 *   useSwipe(swipeRef, { onLeft: prev, onRight: next })
 *   <div ref={swipeRef} />
 */
export function useSwipe(elRef, { onLeft, onRight, threshold = 40 }) {
  const startX = useRef(null)
  const startY = useRef(null)

  const onLeftRef  = useRef(onLeft)
  const onRightRef = useRef(onRight)
  useEffect(() => { onLeftRef.current  = onLeft  }, [onLeft])
  useEffect(() => { onRightRef.current = onRight }, [onRight])

  useEffect(() => {
    const el = elRef?.current
    if (!el) return

    const handleStart = (x, y) => {
      startX.current = x
      startY.current = y
    }

    const handleEnd = (x, y) => {
      if (startX.current === null) return
      const dx = x - startX.current
      const dy = y - startY.current
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) onLeftRef.current?.()
        else        onRightRef.current?.()
      }
      startX.current = null
      startY.current = null
    }

    // Touch — passive:true so browser doesn't cancel horizontal swipes
    const onTouchStart = (e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchEnd   = (e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)

    // Mouse — for desktop dev
    const onMouseDown = (e) => handleStart(e.clientX, e.clientY)
    const onMouseUp   = (e) => handleEnd(e.clientX, e.clientY)

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    el.addEventListener('mousedown',  onMouseDown)
    el.addEventListener('mouseup',    onMouseUp)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
      el.removeEventListener('mousedown',  onMouseDown)
      el.removeEventListener('mouseup',    onMouseUp)
    }
  }, [elRef, threshold])
}