import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { OUTFIT_REFS } from './constants.js'
import useTotemStore from './store/useTotemStore.js'

useTotemStore.getState().setRefImageUrls(OUTFIT_REFS)
console.info('[App] Reference images ready', OUTFIT_REFS)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
