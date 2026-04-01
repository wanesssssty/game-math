export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  candyBalance: number;
};

export type AuthPayload = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "math-paws-auth";
const AUTH_CHANGE_EVENT = "auth-changed";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredAuth(): AuthPayload | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getAuthToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

export function saveAuth(payload: AuthPayload) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuth() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function updateStoredUser(user: AuthUser) {
  const current = getStoredAuth();
  if (!current) return;

  saveAuth({
    ...current,
    user,
  });
}

export function patchStoredUser(patch: Partial<AuthUser>) {
  const current = getStoredAuth();
  if (!current) return;

  saveAuth({
    ...current,
    user: {
      ...current.user,
      ...patch,
    },
  });
}

export function subscribeToAuthChanges(listener: () => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
