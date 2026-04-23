"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

// --- Internal Hook Abstraction ---
const useFreighterWallet = () => {
  const mockPublicKey = "GABC1234MOCKWALLETXYZ";

  const connect = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPublicKey), 500);
    });
  }, []);

  const disconnect = useCallback((): void => {
    // Mock disconnect logic
  }, []);

  return { connect, disconnect };
};

// --- Context Definition ---
export type StellarAuthContextType = {
  publicKey: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const StellarAuthContext = createContext<StellarAuthContextType | undefined>(undefined);

// --- Provider Component ---
const STORAGE_KEY = "stellar_wallet_connection";

export const StellarAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { connect: mockConnect, disconnect: mockDisconnect } = useFreighterWallet();

  // Rehydrate state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && typeof data.publicKey === "string") {
          setPublicKey(data.publicKey);
          setIsConnected(true);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const connect = useCallback(async () => {
    if (isConnected) return;
    try {
      const key = await mockConnect();
      setPublicKey(key);
      setIsConnected(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ publicKey: key }));
    } catch (error) {
      throw error;
    }
  }, [isConnected, mockConnect]);

  const disconnect = useCallback(() => {
    mockDisconnect();
    setPublicKey(null);
    setIsConnected(false);
    localStorage.removeItem(STORAGE_KEY);
  }, [mockDisconnect]);

  const value = useMemo(
    () => ({
      publicKey,
      isConnected,
      connect,
      disconnect,
    }),
    [publicKey, isConnected, connect, disconnect]
  );

  return <StellarAuthContext.Provider value={value}>{children}</StellarAuthContext.Provider>;
};

// --- Custom Hook ---
export const useStellarAuth = () => {
  const context = useContext(StellarAuthContext);
  if (context === undefined) {
    throw new Error("useStellarAuth must be used within a StellarAuthProvider");
  }
  return context;
};
