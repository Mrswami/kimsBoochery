// ══════════════════════════════════════════════════════════════
// KIMBOOCHERLY — Firebase Configuration
// ══════════════════════════════════════════════════════════════
// Modeled after Sovereign Nexus (ideaapp-209463) architecture
// Replace placeholder values with your actual Firebase project config
// ══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kimboocherly-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kimboocherly-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kimboocherly-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services with offline cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})
export const auth = getAuth(app)
export const storage = getStorage(app)

// Analytics (only in browser)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}
export { analytics }

export default app
