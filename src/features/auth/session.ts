const AUTH_SESSION_KEY = "daily-work-log:isAuthed";

const DEMO_EMAIL = "alex@example.com";
const DEMO_PASSWORD = "password123";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_SESSION_KEY) === "true";
}

export function signInWithDemo(email: string, password: string): boolean {
  const emailMatch = email.trim().toLowerCase() === DEMO_EMAIL;
  const passwordMatch = password === DEMO_PASSWORD;

  if (!emailMatch || !passwordMatch) return false;

  window.localStorage.setItem(AUTH_SESSION_KEY, "true");
  return true;
}

export function signOut(): void {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}
