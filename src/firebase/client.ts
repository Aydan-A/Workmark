// src/firebase/client.ts
// Initializes Firebase for the whole app.
// Keep this file tiny: only setup + exports.

import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Read config from Vite environment variables.
// IMPORTANT: never hardcode keys in source code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

// Initialize Firebase App (singleton in your frontend)
export const firebaseApp = initializeApp(firebaseConfig);

let appCheckInitialized = false;

async function initializeOptionalAppCheck() {
  const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY as string | undefined;

  // The reCAPTCHA site key is safe client config. The corresponding secret key must stay in the server-side
  // Firebase/App Check setup only and must never be exposed through Vite env vars or committed files.
  if (!appCheckSiteKey || appCheckInitialized || typeof window === "undefined") {
    return;
  }

  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  } catch (error) {
    // App Check should not prevent local development or break older browsers.
    console.warn("App Check initialization was skipped:", error);
  }
}

// App Check is defense-in-depth against automated abuse; rules are still the primary access control.
void initializeOptionalAppCheck();

// Firebase services used across the app
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
