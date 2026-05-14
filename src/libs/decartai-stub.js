/**
 * @decartai/sdk — STUB LOCAL
 *
 * Este archivo simula el SDK de Decart AI para que el proyecto
 * compile y corra sin el paquete real instalado.
 *
 * Cuando Decart publique el SDK en npm:
 *   1. npm install @decartai/sdk
 *   2. Eliminar el alias en vite.config.js
 *   3. Borrar este archivo
 */

export const models = {
  realtime: (modelName) => ({
    name: modelName,
    fps: 30,
    width: 1280,
    height: 720,
  }),
}

export function createDecartClient({ apiKey }) {
  console.info('[Decart STUB] createDecartClient — usando stub local.')
  console.info('[Decart STUB] Cuando el SDK esté disponible, elimina el alias en vite.config.js')

  return {
    realtime: {
      connect: async (inputStream, { onRemoteStream, onError, onClose, initialState }) => {
        console.info('[Decart STUB] connect() — mostrando cámara raw (sin transformación AI)')

        // En modo stub, el "output stream" ES el input stream (cámara sin editar)
        setTimeout(() => {
          onRemoteStream?.(inputStream)
        }, 800)

        return {
          setPrompt: (text) => {
            console.info('[Decart STUB] setPrompt:', text)
          },
          disconnect: () => {
            console.info('[Decart STUB] disconnect()')
            onClose?.()
          },
        }
      },
    },
  }
}