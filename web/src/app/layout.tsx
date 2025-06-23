"use client";
import "./globals.css";
// import type { Metadata } from "next";
import { GlobalProvider, useGlobalContext } from "./GlobalContext";
import React from "react";

// export const metadata: Metadata = {
//   title: "Solana Subastas",
//   description: "Subastas dApp on Solana",
// };

function Header() {
  const { walletAddress, login, logout } = useGlobalContext();
  return (
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderBottom: "1px solid #eee" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Solana Subastas</div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {walletAddress ? (
          <>
            <span style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <button onClick={login}>Login with Phantom</button>
        )}
      </div>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>
          <Header />
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
