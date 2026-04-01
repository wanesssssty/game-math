"use client";

import { useEffect, useState } from "react";
import {
  clearAuth,
  getStoredAuth,
  saveAuth,
  subscribeToAuthChanges,
  type AuthPayload,
  patchStoredUser,
} from "@/lib/auth";

export function useAuth() {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setAuth(getStoredAuth());
    };

    syncAuth();
    setIsHydrated(true);
    return subscribeToAuthChanges(syncAuth);
  }, []);

  return {
    auth,
    user: auth?.user ?? null,
    isAuthenticated: isHydrated && Boolean(auth),
    isHydrated,
    saveAuth,
    clearAuth,
    patchUser: patchStoredUser,
  };
}
