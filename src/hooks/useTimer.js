import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useTimer(seconds, onEnd)
 * Returns { timeLeft, progress (0→1), start, stop, reset }
 */
export function useTimer(totalSeconds, onEnd) {
  const [timeLeft, setTimeLeft]   = useState(totalSeconds)
  const [running,  setRunning]    = useState(false)
  const intervalRef               = useRef(null)
  const onEndRef                  = useRef(onEnd)

  // Keep onEnd ref fresh
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])

  const clear = () => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  const start = useCallback(() => {
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clear()
          setRunning(false)
          onEndRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const stop  = useCallback(() => { clear(); setRunning(false) }, [])

  const reset = useCallback(() => {
    clear()
    setRunning(false)
    setTimeLeft(totalSeconds)
  }, [totalSeconds])

  useEffect(() => () => clear(), [])

  const progress = 1 - timeLeft / totalSeconds   // 0 = start, 1 = done

  return { timeLeft, progress, running, start, stop, reset }
}
