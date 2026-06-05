'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface SessionUser {
  id: string;
  email: string;
  [key: string]: any;
}

interface SessionData {
  user: SessionUser;
  role: string;
  intakeCompleted: boolean;
}

// Module-level cache so all components share the same data
let cachedSession: SessionData | null = null;
let inFlightRequest: Promise<SessionData | null> | null = null;

// Refetch signal — incremented whenever session state changes (login/logout)
// All useSession instances watch this via a ref to trigger a re-fetch
let refetchToken = 0;
const refetchListeners: Set<() => void> = new Set();

function notifyRefetch() {
  refetchToken++;
  // Copy to array to avoid iteration issues if listeners modify the set
  for (const listener of Array.from(refetchListeners)) {
    listener();
  }
}

function fetchSessionInternal(): Promise<SessionData | null> {
  // If we have a valid cached session, return it immediately
  if (cachedSession) return Promise.resolve(cachedSession);
  // If a request is already in flight, share it (deduplication)
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetch('/api/auth/session')
    .then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        cachedSession = data;
        return data;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(cachedSession);
  const [loading, setLoading] = useState(!cachedSession);
  const mountedRef = useRef(true);
  // Stable ref to track the refetch token — forces effect re-run on login/logout
  const tokenRef = useRef(refetchToken);

  useEffect(() => {
    mountedRef.current = true;

    // Fetch on mount — will use cache if available, or share in-flight request
    fetchSessionInternal().then((data) => {
      if (mountedRef.current) {
        setSession(data);
        setLoading(false);
      }
    });

    // Listen for refetch signals (login/logout events from anywhere in the app)
    const currentToken = tokenRef.current;
    const checkToken = () => {
      if (refetchToken !== currentToken && mountedRef.current) {
        tokenRef.current = refetchToken;
        fetchSessionInternal().then((data) => {
          if (mountedRef.current) {
            setSession(data);
            setLoading(false);
          }
        });
      }
    };

    refetchListeners.add(checkToken);

    return () => {
      mountedRef.current = false;
      refetchListeners.delete(checkToken);
    };
  }, []);

  const invalidate = useCallback(() => {
    cachedSession = null;
    inFlightRequest = null;
    setSession(null);
    setLoading(true);
    notifyRefetch(); // Notify all instances to re-fetch
  }, []);

  return { session, loading, invalidate };
}

// Helper to clear the cache — call BEFORE redirect after login/logout
// This ensures useSession will re-fetch on next mount with fresh data
export function clearSessionCache() {
  cachedSession = null;
  inFlightRequest = null;
  notifyRefetch(); // Notify all mounted instances to re-fetch immediately
}
