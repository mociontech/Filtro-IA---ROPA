import { create } from 'zustand'
import { SCREENS } from '../constants'

const useTotemStore = create((set, get) => ({
  screen: SCREENS.WELCOME,

  registration: {
    name: '', email: '', gender: null, position: null, acceptsMarketing: false,
  },

  selectedOutfitIndex: 0,
  capturedFrame:       null,
  generatedFrame:      null,
  captureId:           null,
  capturedPhotoURL:    null,
  videoStream:         null,
  decartConnected:     false,

  // Firebase Storage URLs for outfit reference images (filled on app init)
  refImageUrls: { mujer: null, hombre: null },

  setScreen:              s  => set({ screen: s }),
  setVideoStream:         s  => set({ videoStream: s }),
  setDecartConnected:     v  => set({ decartConnected: v }),
  setCapturedFrame:       f  => set({ capturedFrame: f }),
  setGeneratedFrame:      f  => set({ generatedFrame: f }),
  setCaptureId:          id  => set({ captureId: id }),
  setCapturedPhotoURL:    u  => set({ capturedPhotoURL: u }),
  setSelectedOutfitIndex: i  => set({ selectedOutfitIndex: i }),
  setRefImageUrls:        u  => set({ refImageUrls: u }),
  setRegistration: fields =>
    set(s => ({ registration: { ...s.registration, ...fields } })),
  goTo: screen => set({ screen }),

  reset: () => {
    const { videoStream } = get()
    videoStream?.getTracks().forEach(t => t.stop())
    set({
      screen:              SCREENS.WELCOME,
      registration:        { name: '', email: '', gender: null, position: null, acceptsMarketing: false },
      selectedOutfitIndex: 0,
      capturedFrame:       null,
      generatedFrame:      null,
      captureId:           null,
      capturedPhotoURL:    null,
      videoStream:         null,
      decartConnected:     false,
    })
  },
}))

export default useTotemStore
