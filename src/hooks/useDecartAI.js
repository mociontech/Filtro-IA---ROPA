import { useCallback, useEffect, useRef, useState } from 'react'
import { createDecartClient, models } from '@decartai/sdk'
import useTotemStore from '../store/useTotemStore'

async function resolveReferenceImage(imageRef) {
  if (!imageRef) return null
  if (imageRef instanceof Blob || imageRef instanceof File) return imageRef

  if (typeof imageRef === 'string') {
    try {
      const res = await fetch(imageRef)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.blob()
    } catch (err) {
      console.warn('[Decart] reference image fetch failed:', err.message)
      return imageRef
    }
  }

  return imageRef
}

function waitForRealtimeReady(rt, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const currentState = rt.getConnectionState?.()
    if (currentState === 'connected' || currentState === 'generating') {
      resolve(currentState)
      return
    }

    let timeoutId

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId)
      rt.off?.('connectionChange', onConnectionChange)
      rt.off?.('error', onError)
    }

    const onConnectionChange = state => {
      if (state === 'connected' || state === 'generating') {
        cleanup()
        resolve(state)
        return
      }

      if (state === 'disconnected') {
        cleanup()
        reject(new Error('Realtime session disconnected before becoming ready'))
      }
    }

    const onError = err => {
      cleanup()
      reject(err instanceof Error ? err : new Error('Realtime session failed'))
    }

    timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error('Timed out waiting for Lucy 2 realtime connection'))
    }, timeoutMs)

    rt.on?.('connectionChange', onConnectionChange)
    rt.on?.('error', onError)
  })
}

async function fetchClientToken() {
  const res = await fetch('/api/decart/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
  })

  let payload = null

  try {
    payload = await res.json()
  } catch {
    // Leave payload empty and use the fallback error below.
  }

  if (!res.ok || !payload?.apiKey) {
    throw new Error(payload?.error || 'Failed to create a Decart client token')
  }

  return payload
}

export function useDecartAI() {
  const setConnected = useTotemStore(state => state.setDecartConnected)

  const rtRef = useRef(null)
  const outStreamRef = useRef(null)
  const connectedRef = useRef(false)
  const [outputStream, setOutputStream] = useState(null)
  const [connectionState, setConnectionState] = useState('disconnected')
  const [lastError, setLastError] = useState('')
  const [lastSetStatus, setLastSetStatus] = useState('idle')
  const [lastSetMessage, setLastSetMessage] = useState('')
  const [generationSeconds, setGenerationSeconds] = useState(0)
  const [hasRemoteStream, setHasRemoteStream] = useState(false)
  const [debugLog, setDebugLog] = useState([])
  const [connectStatus, setConnectStatus] = useState('idle')
  const [lastDiagnostic, setLastDiagnostic] = useState('')
  const [lastStats, setLastStats] = useState(null)
  const tokenRef = useRef(null)

  const pushDebugLog = useCallback((message) => {
    const stamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    setDebugLog(prev => [`${stamp} ${message}`, ...prev].slice(0, 8))
  }, [])

  const connect = useCallback(async (inputStream, initialPrompt, imageRefUrl = null) => {
    if (!inputStream) return { ok: false }

    try {
      const now = Date.now()
      const cachedToken = tokenRef.current
      const token = cachedToken && cachedToken.expiresAt && Date.parse(cachedToken.expiresAt) - now > 30_000
        ? cachedToken
        : await fetchClientToken()

      tokenRef.current = token

      const client = createDecartClient({ apiKey: token.apiKey })
      const model = models.realtime('lucy_2_rt')
      const resolvedImage = await resolveReferenceImage(imageRefUrl)

      console.info('[Decart] Connecting model:', model.name, `${model.fps}fps`)
      setConnectStatus('connecting')
      pushDebugLog(`connect() model=${model.name}`)
      pushDebugLog('client token=ready')
      pushDebugLog(`reference image=${resolvedImage ? 'ready' : 'missing'}`)

      const rt = await client.realtime.connect(inputStream, {
        model,
        onRemoteStream: stream => {
          outStreamRef.current = stream
          setOutputStream(stream)
          setHasRemoteStream(true)
          pushDebugLog('remote stream received')
        },
      })

      rt.on('connectionChange', state => {
        connectedRef.current = state === 'connected' || state === 'generating'
        setConnected(connectedRef.current)
        setConnectionState(state)
        if (state === 'connected' || state === 'generating') setConnectStatus('connected')
        console.info('[Decart] state:', state)
        pushDebugLog(`connection=${state}`)
      })

      rt.on('error', err => {
        const message = err?.message ?? 'Unknown Decart error'
        setLastError(prev => prev || message)
        console.error('[Decart] error:', err)
        pushDebugLog(`error=${message}`)
      })

      rt.on('generationTick', ({ seconds }) => {
        setGenerationSeconds(seconds)
      })

      rt.on('diagnostic', event => {
        const { name, data } = event
        let summary = name

        if (name === 'phaseTiming') {
          summary = `phase=${data.phase} success=${data.success} ${Math.round(data.durationMs)}ms`
        } else if (name === 'iceStateChange') {
          summary = `ice=${data.previousState}->${data.state}`
        } else if (name === 'peerConnectionStateChange') {
          summary = `peer=${data.previousState}->${data.state}`
        } else if (name === 'signalingStateChange') {
          summary = `signal=${data.previousState}->${data.state}`
        } else if (name === 'selectedCandidatePair') {
          summary = `pair=${data.local.candidateType}/${data.local.protocol} -> ${data.remote.candidateType}/${data.remote.protocol}`
        } else if (name === 'reconnect') {
          summary = `reconnect #${data.attempt} success=${data.success}`
        } else if (name === 'videoStall') {
          summary = `videoStall=${data.stalled}`
        }

        setLastDiagnostic(summary)
        pushDebugLog(`diag ${summary}`)
      })

      rt.on('stats', stats => {
        setLastStats(stats)
      })

      rtRef.current = rt
      await waitForRealtimeReady(rt)

      if (initialPrompt || resolvedImage) {
        setLastSetStatus('sending')
        setLastSetMessage('Sending initial prompt and reference image')
        pushDebugLog('set() initial request')
        await rt.set({
          prompt: initialPrompt,
          image: resolvedImage,
          enhance: false,
        })
        setLastSetStatus('ok')
        setLastSetMessage('Initial outfit request sent')
        pushDebugLog('set() initial ok')
      }

      setConnectStatus('connected')
      return { ok: true, model }
    } catch (err) {
      const message = err?.message ?? 'Failed to connect to Lucy 2'
      console.warn('[Decart] connect failed:', err.message)
      connectedRef.current = false
      setConnected(false)
      setConnectionState('disconnected')
      setLastError(prev => prev || message)
      setLastSetStatus('error')
      setLastSetMessage('Initial Lucy request failed')
      setConnectStatus('error')
      pushDebugLog(`connect failed=${message}`)
      return { ok: false }
    }
  }, [pushDebugLog, setConnected])

  const switchOutfit = useCallback(async (prompt, imageRefUrl = null) => {
    const rt = rtRef.current
    if (!rt || !connectedRef.current) {
      console.warn('[Decart] switchOutfit: not connected')
      if (connectStatus === 'error') {
        setLastSetStatus('error')
        setLastSetMessage('Cannot switch outfit: Lucy failed to connect')
      } else {
        setLastSetStatus('pending')
        setLastSetMessage('Waiting for Lucy connection')
      }
      pushDebugLog('switch skipped=not connected')
      return
    }

    try {
      const resolvedImage = await resolveReferenceImage(imageRefUrl)
      setLastSetStatus('sending')
      setLastSetMessage('Sending outfit update to Lucy')
      pushDebugLog('set() outfit update')
      await rt.set({
        prompt,
        enhance: false,
        ...(resolvedImage ? { image: resolvedImage } : {}),
      })
      setLastSetStatus('ok')
      setLastSetMessage('Outfit update sent')
      console.info('[Decart] switchOutfit ok')
      pushDebugLog('set() outfit ok')
    } catch (err) {
      const message = err?.message ?? 'Failed to update Lucy 2 state'
      setLastError(prev => prev || message)
      setLastSetStatus('retry')
      setLastSetMessage('Primary outfit update failed, retrying')
      console.warn('[Decart] set failed:', err.message)
      pushDebugLog(`set() primary failed=${message}`)
      try {
        const resolvedImage = await resolveReferenceImage(imageRefUrl)
        await rt.set({
          prompt,
          ...(resolvedImage ? { image: resolvedImage } : {}),
        })
        setLastSetStatus('ok')
        setLastSetMessage('Fallback outfit update sent')
        pushDebugLog('set() fallback ok')
      } catch (fallbackErr) {
        const fallbackMessage = fallbackErr?.message ?? 'Fallback update failed'
        setLastError(prev => prev || fallbackMessage)
        setLastSetStatus('error')
        setLastSetMessage('Outfit update failed')
        console.warn('[Decart] fallback set failed:', fallbackErr.message)
        pushDebugLog(`set() fallback failed=${fallbackMessage}`)
      }
    }
  }, [connectStatus, pushDebugLog])

  const disconnect = useCallback(() => {
    try {
      rtRef.current?.disconnect()
    } catch {
      // no-op
    }

    rtRef.current = null
    outStreamRef.current = null
    setOutputStream(null)
    connectedRef.current = false
    setConnected(false)
    setConnectionState('disconnected')
    setLastError('')
    setLastSetStatus('idle')
    setLastSetMessage('')
    setGenerationSeconds(0)
    setHasRemoteStream(false)
    setDebugLog([])
    setConnectStatus('idle')
    setLastDiagnostic('')
    setLastStats(null)
    tokenRef.current = null
  }, [setConnected])

  useEffect(() => () => disconnect(), [disconnect])

  return {
    connect,
    disconnect,
    switchOutfit,
    outputStreamRef: outStreamRef,
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
  }
}
