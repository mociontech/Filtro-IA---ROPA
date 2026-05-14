import { createDecartClient } from '@decartai/sdk'

export async function handler() {
  const serverApiKey = process.env.DECART_API_KEY || process.env.VITE_DECART_API_KEY || ''

  if (!serverApiKey) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Missing DECART_API_KEY in Netlify environment variables.',
      }),
    }
  }

  try {
    const client = createDecartClient({ apiKey: serverApiKey })
    const token = await client.tokens.create()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify(token),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: error?.message || 'Failed to create Decart client token',
      }),
    }
  }
}
