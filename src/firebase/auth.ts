// src/firebase/auth.ts
// Auth helper functions so pages/components don't call Firebase directly.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./client";

// Sign in with email/password
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Create account with email/password
export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Sign out current user
export async function logout() {
  return signOut(auth);
}

// Subscribe to auth state changes (login/logout/refresh)
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}