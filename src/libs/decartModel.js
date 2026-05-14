import { models } from '@decartai/sdk'
import { DECART_REALTIME_MODEL } from '../constants'

export function getDecartRealtimeModel() {
  return models.realtime(DECART_REALTIME_MODEL)
}
