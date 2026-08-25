"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

// Create context
interface GenLayerContextType {
  client: any | null;
  account: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  error: string | null;
  chainId: number | null;
}

const GenLayerContext = createContext<GenLayerContextType>({
  client: null,
  account: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  error: null,
  chainId: null,
});

export const useGenLayer = () => useContext(GenLayerContext);

/**
 * Build a genlayer-js client.
 * - With `provider` (window.ethereum) + `account`: writeContract will route
 *   tx signing through MetaMask — the browser wallet popup will appear.
 * - Without them: read-only (view calls only).
 */
function buildClient(account?: string | null, provider?: any) {
  return createClient({
    chain: studionet,
    ...(account ? { account: account as `0x${string}` } : {}),
    ...(provider ? { provider } : {}),
  });
}

export function GenLayerProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Rebuild client whenever account changes.
  // Pass window.ethereum as provider so writeContract uses MetaMask for signing.
  useEffect(() => {
    const provider =
      typeof window !== "undefined" ? (window as any).ethereum : undefined;
    setClient(buildClient(account, provider));
  }, [account]);

  // On mount: check if wallet already connected + listen for changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;

    eth
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      })
      .catch(() => {});

    eth
      .request({ method: "eth_chainId" })
      .then((hex: string) => setChainId(parseInt(hex, 16)))
      .catch(() => {});

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    const handleChainChanged = (hex: string) => {
      setChainId(parseInt(hex, 16));
      window.location.reload();
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);
    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError(
        "No browser wallet detected. Please install MetaMask and refresh."
      );
      return;
    }

    const eth = (window as any).ethereum;
    setIsConnecting(true);
    setError(null);

    try {
      // 1. Open MetaMask popup — requests account access
      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0)
        throw new Error("No accounts returned from wallet.");

      const connectedAccount = accounts[0];
      setAccount(connectedAccount); // triggers client rebuild via useEffect

      // 2. Read current chain
      const chainIdHex: string = await eth.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);

      // 3. Switch to studionet if necessary
      if (currentChainId !== studionet.id) {
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${studionet.id.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            // Chain not in wallet yet — add it
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${studionet.id.toString(16)}`,
                  chainName: "GenLayer Studio",
                  rpcUrls: [
                    process.env.NEXT_PUBLIC_STUDIO_RPC_URL ||
                      "https://studio.genlayer.com:7182",
                  ],
                  nativeCurrency: {
                    name: "GEN",
                    symbol: "GEN",
                    decimals: 18,
                  },
                },
              ],
            });
          } else {
            // User rejected switch — not fatal, just warn
            console.warn("Network switch declined:", switchError.message);
          }
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setError(null);
    // client rebuilds to read-only via the account useEffect
  }, []);

  return (
    <GenLayerContext.Provider
      value={{ client, account, connect, disconnect, isConnecting, error, chainId }}
    >
      {children}
    </GenLayerContext.Provider>
  );
}
