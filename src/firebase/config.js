import { initializeApp } from 'firebase/app'
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage'

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyAd32fjHVssRxIzHijkeWd37MamHWzCajM',
  authDomain: 'f1-sap.firebaseapp.com',
  databaseURL: 'https://f1-sap-default-rtdb.firebaseio.com',
  projectId: 'f1-sap',
  storageBucket: 'f1-sap.appspot.com',
  messagingSenderId: '1043864334257',
  appId: '1:1043864334257:web:bcc854d01f1c12fa415790',
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || defaultFirebaseConfig.databaseURL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
}

function normalizeStorageFolder(path) {
  return (path || 'TryOnLuluLemon').replace(/^\/+|\/+$/g, '') || 'TryOnLuluLemon'
}

const tryOnFolder = normalizeStorageFolder(import.meta.env.VITE_FIREBASE_TRYON_PATH)
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
const isConfigured = requiredKeys.every(key => Boolean(firebaseConfig[key]))

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
  if (!storage || !dataURL || !sessionId) return null

  try {
    const path = `${tryOnFolder}/${sessionId}.jpg`
    const fileRef = ref(storage, path)

    await uploadString(fileRef, dataURL, 'data_url', {
      contentType: 'image/jpeg',
      cacheControl: 'public,max-age=3600',
    })

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

export async function saveSession({ name, email, gender, acceptsMarketing, outfitName, photoURL }) {
  if (!db) return null

  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      name,
      email,
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

export { db, storage, isConfigured, tryOnFolder }
