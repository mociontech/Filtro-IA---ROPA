import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage'

const storageBasePath = import.meta.env.VITE_FIREBASE_STORAGE_PATH || 'captures'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Object.values(firebaseConfig).every(Boolean)

let app
let db
let storage

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
} else {
  console.warn('[Firebase] No config - offline mode')
}

export async function uploadPhoto(dataURL, sessionId) {
  if (!storage) return null

  try {
    const path = `${storageBasePath}/${sessionId}.jpg`
    const fileRef = ref(storage, path)
    await uploadString(fileRef, dataURL, 'data_url')
    return await getDownloadURL(fileRef)
  } catch (err) {
    console.error('[Firebase] uploadPhoto:', err)
    return null
  }
}

export async function uploadReferenceImages(mujerSrc, hombreSrc) {
  if (!storage) return { mujer: null, hombre: null }

  const version = Date.now()

  const upload = async (src, name) => {
    try {
      const fileRef = ref(storage, `references/${name}-${version}.jpg`)
      const res = await fetch(src)
      const blob = await res.blob()

      await uploadBytes(fileRef, blob, {
        contentType: blob.type || 'image/jpeg',
        cacheControl: 'no-cache',
      })

      return await getDownloadURL(fileRef)
    } catch (err) {
      console.warn('[Firebase] uploadReferenceImage:', name, err)
      return null
    }
  }

  const [mujer, hombre] = await Promise.all([
    upload(mujerSrc, 'outfit-mujer'),
    upload(hombreSrc, 'outfit-hombre'),
  ])

  return { mujer, hombre }
}

export async function saveSession({ name, email, company, gender, acceptsMarketing, outfitName, photoURL }) {
  if (!db) return null

  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      name,
      email,
      company,
      gender,
      acceptsMarketing,
      outfitName,
      photoURL: photoURL || null,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (err) {
    console.error('[Firebase] saveSession:', err)
    return null
  }
}

export { db, storage, isConfigured }
