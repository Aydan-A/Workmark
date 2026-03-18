// Auth helper functions so pages/components don't call Firebase directly.

import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./client";

type AuthAction = "signIn" | "signUp" | "google";

// Sign in with email/password
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Create account with email/password
export async function signUp(email: string, password: string, fullName?: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  if (fullName && fullName.trim() !== "") {
    await updateProfile(userCredential.user, { displayName: fullName.trim() });
  }

  return userCredential;
}

// Sign in or create account with Google
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

// Sign out current user
export async function logout() {
  return signOut(auth);
}

// Subscribe to auth state changes (login/logout/refresh)
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Map Firebase auth errors to user-friendly messages.
export function getAuthErrorMessage(error: unknown, action: AuthAction = "signIn"): string {
  const fallbackMessage =
    action === "signUp"
      ? "Sign up failed. Please try again."
      : action === "google"
        ? "Google sign-in failed. Please try again."
        : "Sign in failed. Please try again.";

  if (!(error instanceof FirebaseError)) {
    return fallbackMessage;
  }

  switch (error.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return action === "signIn"
        ? "Incorrect email or password. If you used Google before, choose Continue with Google."
        : "Incorrect email or password.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/cancelled-popup-request":
      return "Another sign-in window is already open.";
    case "auth/account-exists-with-different-credential":
      return "This email is linked to another sign-in method.";
    case "auth/operation-not-allowed":
      return action === "google"
        ? "Google sign-in is not enabled for this project."
        : "Email/password auth is not enabled for this project.";
    case "auth/email-already-in-use":
      return "This email is already in use. Try signing in instead.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    default:
      return fallbackMessage;
  }
}
