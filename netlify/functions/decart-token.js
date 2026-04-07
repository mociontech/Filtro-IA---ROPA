import { createDecartClient } from '@decartai/sdk'
import process from 'node:process'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  const apiKey = process.env.DECART_API_KEY || process.env.VITE_DECART_API_KEY

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Missing DECART_API_KEY on the server.',
      }),
    }
  }

  try {
    const client = createDecartClient({ apiKey })
    const token = await client.tokens.create()

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error?.message || 'Failed to create Decart client token',
      }),
    }
  }
}
