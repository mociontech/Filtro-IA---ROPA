import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createDecartClient } from '@decartai/sdk'
import process from 'node:process'

function decartTokenPlugin(mode) {
  const env = loadEnv(mode, process.cwd(), '')
  const serverApiKey = env.DECART_API_KEY || env.VITE_DECART_API_KEY || ''

  async function handle(req, res, next) {
    if (req.url !== '/api/decart/token') {
      next()
      return
    }

    res.setHeader('Content-Type', 'application/json')

    if (!serverApiKey) {
      res.statusCode = 500
      res.end(JSON.stringify({
        error: 'Missing DECART_API_KEY on the server. Add it to .env and restart Vite.',
      }))
      return
    }

    try {
      const client = createDecartClient({ apiKey: serverApiKey })
      const token = await client.tokens.create()
      res.statusCode = 200
      res.end(JSON.stringify(token))
    } catch (error) {
      res.statusCode = 500
      res.end(JSON.stringify({
        error: error?.message || 'Failed to create Decart client token',
      }))
    }
  }

  return {
    name: 'decart-token-endpoint',
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), decartTokenPlugin(mode)],
  build: {
    chunkSizeWarningLimit: 700,
  },
}))
