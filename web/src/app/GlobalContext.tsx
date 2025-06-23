"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: { toString: () => string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

interface GlobalContextProps {
  walletAddress: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const GlobalContext = createContext<GlobalContextProps>({
  walletAddress: null,
  login: async () => {},
  logout: () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true }).then(({ publicKey }) => {
        setWalletAddress(publicKey?.toString() || null);
      }).catch(() => {});
    }
  }, []);

  const login = async () => {
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect();
        setWalletAddress(resp.publicKey.toString());
        router.push("/dashboard");
      } catch {
        // handle error
      }
    } else {
      alert("Phantom wallet not found!");
    }
  };

  const logout = () => {
    setWalletAddress(null);
    router.push("/");
  };

  return (
    <GlobalContext.Provider value={{ walletAddress, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
}; 