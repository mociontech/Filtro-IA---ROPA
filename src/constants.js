export const SCREENS = {
  WELCOME: 'welcome',
  POSITION: 'position',
  SELECTION: 'seleccion',
  REGISTER: 'register',
  EXPERIENCE: 'experience',
  RESULT: 'result',
  GOODBYE: 'goodbye',
}

export const EXPERIENCE_DURATION = 20
export const CAPTURE_COUNTDOWN_SECONDS = 5
export const ASSET_VERSION = '20260407-09'
export const POSITION_IDS = {
  GOALKEEPER: 'goalkeeper',
  FORWARD: 'forward',
  MIDFIELDER: 'midfielder',
}

export const DEFAULT_POSITION = POSITION_IDS.GOALKEEPER

export const PUBLIC_LOOKS = {
  mujer: `/referencia_public_dama.png?v=${ASSET_VERSION}`,
  hombre: `/referencia_public_hombre.png?v=${ASSET_VERSION}`,
}

export const GENERATION_REFS = {
  mujer: `/referencia_public_dama_lucy.png?v=${ASSET_VERSION}`,
  hombre: `/referencia_public_hombre_lucy.png?v=${ASSET_VERSION}`,
}

export const OUTFIT_REFS = {
  mujer: GENERATION_REFS.mujer,
  hombre: GENERATION_REFS.hombre,
}

export const POSITION_PUBLIC_LOOKS = {
  [POSITION_IDS.GOALKEEPER]: PUBLIC_LOOKS,
  [POSITION_IDS.FORWARD]: {
    mujer: `/Delantero%20-%20Mujer.png?v=${ASSET_VERSION}`,
    hombre: `/Delantero%20-%20Hombre.png?v=${ASSET_VERSION}`,
  },
  [POSITION_IDS.MIDFIELDER]: {
    mujer: `/Volante%20-%20Mujer.png?v=${ASSET_VERSION}`,
    hombre: `/Volante%20-%20Hombre.png?v=${ASSET_VERSION}`,
  },
}

export const POSITION_GENERATION_REFS = {
  [POSITION_IDS.GOALKEEPER]: GENERATION_REFS,
  [POSITION_IDS.FORWARD]: POSITION_PUBLIC_LOOKS[POSITION_IDS.FORWARD],
  [POSITION_IDS.MIDFIELDER]: POSITION_PUBLIC_LOOKS[POSITION_IDS.MIDFIELDER],
}

const bodyPreservationPrompt =
  'Keep my exact body shape, physical complexion, body proportions, skin tone, pose, framing, camera distance, and crop unchanged. Do not slim me down. Do not change my height, build, face, hair, hands, legs, or body. Do not widen or narrow the camera.'

const goalkeeperPrompt =
  `Change only my clothing to match the goalkeeper uniform from the reference image. ${bodyPreservationPrompt} Match only the outfit and accessories from the reference image. No text, no letters, no numbers, and no extra logos.`

const forwardPrompt =
  `Change only my clothing to match the forward soccer uniform from the reference image: yellow jersey, blue shorts, red socks, blue/red/yellow trim, and the single number 7 exactly as shown in the reference. Do not duplicate the number 7 or add any extra number. Keep the number 7 normal, readable from the viewer perspective, and never mirrored or reversed. ${bodyPreservationPrompt}`

const midfielderPrompt =
  `Change only my clothing to match the midfielder soccer uniform from the reference image: yellow jersey, blue shorts, red socks, blue/red/yellow trim, and the single number 10 exactly as shown in the reference. Do not duplicate the number 10 or add any extra number. Keep the number 10 normal, readable from the viewer perspective, and never mirrored or reversed. ${bodyPreservationPrompt}`

const goalkeeperWomenOutfit = {
  id: 'w1',
  name: 'Kit Arquera Colombia',
  collection: 'Colombia Goalkeeper',
  color: '#B7EF3A',
  colorName: 'Neon Lime',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.GOALKEEPER].mujer,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.GOALKEEPER].mujer,
  shopUrl: 'https://www.lululemon.com/en-us/c/womens-running',
  prompt: goalkeeperPrompt,
}

const goalkeeperMenOutfit = {
  id: 'm1',
  name: 'Kit Arquero Colombia',
  collection: 'Colombia Goalkeeper',
  color: '#B7EF3A',
  colorName: 'Neon Lime',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.GOALKEEPER].hombre,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.GOALKEEPER].hombre,
  shopUrl: 'https://www.lululemon.com/en-us/c/mens-running',
  prompt: goalkeeperPrompt,
}

const forwardWomenOutfit = {
  id: 'forward-w1',
  name: 'Kit Delantera Colombia',
  collection: 'Colombia Forward',
  color: '#F8D331',
  colorName: 'Amarillo Colombia',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.FORWARD].mujer,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.FORWARD].mujer,
  shopUrl: 'https://www.lululemon.com/en-us/c/womens-running',
  prompt: forwardPrompt,
}

const forwardMenOutfit = {
  id: 'forward-m1',
  name: 'Kit Delantero Colombia',
  collection: 'Colombia Forward',
  color: '#F8D331',
  colorName: 'Amarillo Colombia',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.FORWARD].hombre,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.FORWARD].hombre,
  shopUrl: 'https://www.lululemon.com/en-us/c/mens-running',
  prompt: forwardPrompt,
}

const midfielderWomenOutfit = {
  id: 'midfielder-w1',
  name: 'Kit Volante Colombia',
  collection: 'Colombia Midfielder',
  color: '#F8D331',
  colorName: 'Amarillo Colombia',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.MIDFIELDER].mujer,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.MIDFIELDER].mujer,
  shopUrl: 'https://www.lululemon.com/en-us/c/womens-running',
  prompt: midfielderPrompt,
}

const midfielderMenOutfit = {
  id: 'midfielder-m1',
  name: 'Kit Volante Colombia',
  collection: 'Colombia Midfielder',
  color: '#F8D331',
  colorName: 'Amarillo Colombia',
  imageSrc: POSITION_PUBLIC_LOOKS[POSITION_IDS.MIDFIELDER].hombre,
  imageRefUrl: POSITION_GENERATION_REFS[POSITION_IDS.MIDFIELDER].hombre,
  shopUrl: 'https://www.lululemon.com/en-us/c/mens-running',
  prompt: midfielderPrompt,
}

export const OUTFITS_BY_POSITION = {
  [POSITION_IDS.GOALKEEPER]: {
    female: [goalkeeperWomenOutfit],
    male: [goalkeeperMenOutfit],
  },
  [POSITION_IDS.FORWARD]: {
    female: [forwardWomenOutfit],
    male: [forwardMenOutfit],
  },
  [POSITION_IDS.MIDFIELDER]: {
    female: [midfielderWomenOutfit],
    male: [midfielderMenOutfit],
  },
}

export const OUTFITS_WOMEN = OUTFITS_BY_POSITION[POSITION_IDS.GOALKEEPER].female
export const OUTFITS_MEN = OUTFITS_BY_POSITION[POSITION_IDS.GOALKEEPER].male

export function resolvePosition(position) {
  return POSITION_PUBLIC_LOOKS[position] ? position : DEFAULT_POSITION
}

export function getPublicLooksForPosition(position) {
  return POSITION_PUBLIC_LOOKS[resolvePosition(position)]
}

export function getOutfitsForRegistration(registration = {}) {
  const position = resolvePosition(registration.position)
  const gender = registration.gender === 'male' ? 'male' : 'female'

  return OUTFITS_BY_POSITION[position]?.[gender] || OUTFITS_BY_POSITION[DEFAULT_POSITION][gender]
}
