const DATAHUB_URL = import.meta.env.VITE_DATAHUB_URL
const DATAHUB_TOKEN = import.meta.env.VITE_DATAHUB_TOKEN
const DATAHUB_EVENT_ID = import.meta.env.VITE_DATAHUB_EVENT_ID
const DATAHUB_EXPERIENCE_ID = import.meta.env.VITE_DATAHUB_EXPERIENCE_ID
const DATAHUB_SOURCE = import.meta.env.VITE_DATAHUB_SOURCE || 'Foto con IA'

const endpoint = DATAHUB_URL ? `${DATAHUB_URL.replace(/\/$/, '')}/experiences` : null
const LOG_EVENT = 'datahub-log'
const MAX_LOGS = 20
const logs = []

function addDatahubLog(level, message, detail = null) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toLocaleTimeString(),
    level,
    message,
    detail,
  }

  logs.unshift(entry)
  logs.splice(MAX_LOGS)
  window.dispatchEvent(new CustomEvent(LOG_EVENT, { detail: entry }))
}

export function getDatahubLogs() {
  return logs
}

export function subscribeToDatahubLogs(callback) {
  const handler = event => callback(event.detail)

  window.addEventListener(LOG_EVENT, handler)
  return () => window.removeEventListener(LOG_EVENT, handler)
}

export async function sendExperienceData({ name, email, gender }) {
  if (!endpoint || !DATAHUB_TOKEN || !DATAHUB_EVENT_ID || !DATAHUB_EXPERIENCE_ID) {
    const detail = {
      hasUrl: Boolean(endpoint),
      hasToken: Boolean(DATAHUB_TOKEN),
      hasEventId: Boolean(DATAHUB_EVENT_ID),
      hasExperienceId: Boolean(DATAHUB_EXPERIENCE_ID),
    }

    addDatahubLog('warn', 'Missing config. Experience data was not sent.', detail)
    console.warn('[Datahub] Missing config. Experience data was not sent.', detail)
    return null
  }

  const sentAt = new Date().toISOString()
  const payload = {
    eventId: DATAHUB_EVENT_ID,
    experienceId: DATAHUB_EXPERIENCE_ID,
    source: DATAHUB_SOURCE,
    sentAt,
    records: [
      {
        email,
        play_timestamp: sentAt,
        data: {
          name,
          gender,
        },
      },
    ],
  }

  addDatahubLog('info', 'Sending experience payload', payload)
  console.info('[Datahub] Sending experience payload', payload)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${DATAHUB_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    let responseBody = responseText

    try {
      responseBody = responseText ? JSON.parse(responseText) : null
    } catch {
      responseBody = responseText
    }

    if (!response.ok) {
      const detail = {
        status: response.status,
        response: responseBody,
      }

      addDatahubLog('error', 'Experience payload failed', detail)
      console.error('[Datahub] Experience payload failed', detail)
      return null
    }

    const detail = {
      status: response.status,
      response: responseBody,
    }

    addDatahubLog('success', 'Experience payload sent successfully', detail)
    console.info('[Datahub] Experience payload sent successfully', detail)

    return responseBody
  } catch (err) {
    addDatahubLog('error', 'Experience payload request error', err?.message || String(err))
    console.error('[Datahub] Experience payload request error', err)
    return null
  }
}
