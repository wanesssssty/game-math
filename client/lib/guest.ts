const GUEST_NAME_KEY = "math-paws-guest-name";

function canUseStorage() {
  return typeof window !== "undefined";
}

function isAsciiHeaderValue(value: string) {
  return /^[\x00-\xFF]*$/.test(value);
}

export function getGuestName(): string {
  if (!canUseStorage()) return "guest";

  const stored = window.localStorage.getItem(GUEST_NAME_KEY);
  if (stored && stored.trim() && isAsciiHeaderValue(stored.trim())) {
    return stored.trim().slice(0, 64);
  }

  const generated = `guest-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(GUEST_NAME_KEY, generated);
  return generated;
}
