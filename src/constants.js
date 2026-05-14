import outfitHombreRef from './assets/reference-images/men/Completo_Hombre.png'
import outfitMujerRef from './assets/reference-images/women/Completo_Mujer.png'

export const SCREENS = {
  START: 'start',
  ENTRY_REGISTER: 'entry-register',
  WELCOME: 'welcome',
  REGISTER: 'register',
  EXPERIENCE: 'experience',
  RESULT: 'result',
  GOODBYE: 'goodbye',
}

export const EXPERIENCE_DURATION = 15
export const PHOTO_READY_COUNTDOWN = 5
export const DECART_REALTIME_MODEL = 'lucy-vton-latest'
export const CAMERA_INPUT_WIDTH = 1920
export const CAMERA_INPUT_HEIGHT = 1080
export const CAMERA_INPUT_FPS = 30

export const OUTFIT_REFS = {
  mujer: outfitMujerRef,
  hombre: outfitHombreRef,
}

export const OUTFITS_WOMEN = [
  {
    id: 'w1',
    name: 'Playera Mexico Verde',
    collection: 'TECH HR DAY 26',
    color: '#00845F',
    colorName: 'Mexico Green',
    imageSrc: '/Dama.png',
    imageRefUrl: null,
    shopUrl: 'https://www.lululemon.com/en-us/c/womens-running',
    prompt:
      'Edit only the shirt area. Replace the current top with a clean, unbranded, short-sleeve emerald green athletic jersey inspired by the reference image, with a dark tonal geometric pattern, red V-neck collar, red sleeve cuffs, and white shoulder stripes. The jersey should fit naturally and flatteringly, with smooth fabric, light realistic folds, no bulky wrinkles, no belly bulge, no sagging, and no distorted body shape. Do not modify the face, facial features, expression, hair, skin, arms, hands, body shape, pose, lower clothing, shoes, lighting, or background. Do not add logos, brand marks, sponsor marks, team crests, badges, shields, emblems, text, numbers, flags, or chest graphics.',
  },
]

export const OUTFITS_MEN = [
  {
    id: 'm1',
    name: 'Playera Mexico Verde',
    collection: 'TECH HR DAY 26',
    color: '#00845F',
    colorName: 'Mexico Green',
    imageSrc: '/Caballero.png',
    imageRefUrl: null,
    shopUrl: 'https://www.lululemon.com/en-us/c/mens-running',
    prompt:
      'Edit only the shirt area. Replace the current top with a clean, unbranded, short-sleeve emerald green athletic jersey inspired by the reference image, with a dark tonal geometric pattern, red V-neck collar, red sleeve cuffs, and white shoulder stripes. The jersey should fit naturally and flatteringly, with smooth fabric, light realistic folds, no bulky wrinkles, no belly bulge, no sagging, and no distorted body shape. Do not modify the face, facial features, expression, hair, skin, arms, hands, body shape, pose, lower clothing, shoes, lighting, or background. Do not add logos, brand marks, sponsor marks, team crests, badges, shields, emblems, text, numbers, flags, or chest graphics.',
  },
]
