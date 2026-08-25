"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface WalletOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tag?: string;
}

function MetaMaskIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 flex-shrink-0">
      <path d="M36.2 3L22.1 13.3l2.5-6L36.2 3z" fill="#E17726" stroke="#E17726" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.8 3l14 10.4-2.4-6.1L3.8 3z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30.9 27.7l-3.7 5.7 7.9 2.2 2.3-7.7-6.5-.2zM2.6 27.9l2.2 7.7 7.9-2.2-3.7-5.7-6.4.2z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.3 17.8l-2.2 3.3 7.8.4-.3-8.4-5.3 4.7zM27.7 17.8l-5.4-4.8-.2 8.5 7.8-.4-2.2-3.3z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.7 33.4l4.7-2.3-4-3.2-.7 5.5zM22.6 31.1l4.7 2.3-.7-5.5-4 3.2z" fill="#E27625" stroke="#E27625" strokeWidth=".25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CoinbaseIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 flex-shrink-0">
      <rect width="40" height="40" rx="8" fill="#0052FF"/>
      <path d="M20 8C13.373 8 8 13.373 8 20s5.373 12 12 12 12-5.373 12-12S26.627 8 20 8zm-3 15.5v-7a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1z" fill="white"/>
    </svg>
  );
}

function InjectedIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 flex-shrink-0">
      <rect width="40" height="40" rx="4" fill="#1f2020" stroke="#464932" strokeWidth="1"/>
      <path d="M12 20h16M20 12v16" stroke="#d4f000" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="20" r="6" stroke="#909378" strokeWidth="1" strokeDasharray="2 2"/>
    </svg>
  );
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Browser extension wallet by Consensys",
    icon: <MetaMaskIcon />,
    tag: "POPULAR",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Self-custody wallet by Coinbase",
    icon: <CoinbaseIcon />,
  },
  {
    id: "injected",
    name: "Browser Wallet",
    description: "Any injected EIP-1193 provider",
    icon: <InjectedIcon />,
    tag: "INJECTED",
  },
];

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleWalletClick = useCallback(async (walletId: string) => {
    // All three options use window.ethereum — Coinbase Wallet also injects it.
    if (typeof window === "undefined" || !(window as any).ethereum) {
      const walletUrls: Record<string, string> = {
        metamask: "https://metamask.io/download/",
        coinbase: "https://www.coinbase.com/wallet/downloads",
        injected: "https://metamask.io/download/",
      };
      if (confirm(`No browser wallet detected.\n\nWould you like to install ${walletId === "coinbase" ? "Coinbase Wallet" : "MetaMask"}?`)) {
        window.open(walletUrls[walletId], "_blank");
      }
      onClose();
      return;
    }
    // Close modal first for a snappy feel, then trigger MetaMask popup
    onClose();
    await onConnect();
  }, [onClose, onConnect]);

  if (!isOpen) return null;

  // Portal renders outside <header> to escape backdrop-filter stacking context
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-label="Select Wallet"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 w-full max-w-md mx-4 bg-surface-container-lowest border border-outline/30 shadow-[0_0_80px_rgba(212,240,0,0.06)]"
        style={{ animation: "walletModalIn 0.18s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/20 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse" />
            <span className="font-code-sm text-code-sm text-on-surface uppercase tracking-widest">
              SELECT_WALLET
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-6 pt-5 pb-2">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Connect a wallet to sign transactions on{" "}
            <span className="text-primary-fixed font-semibold">GenLayer Studio</span>.
          </p>
        </div>

        {/* Wallet options */}
        <div className="px-4 pb-4 flex flex-col gap-2 mt-2">
          {WALLET_OPTIONS.map((wallet, idx) => (
            <button
              key={wallet.id}
              id={`wallet-option-${wallet.id}`}
              onClick={() => handleWalletClick(wallet.id)}
              className="w-full flex items-center gap-4 px-4 py-4 border border-outline/20 bg-surface hover:bg-surface-container hover:border-primary-fixed/40 transition-all group text-left relative overflow-hidden"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Glow trace on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: "linear-gradient(90deg, rgba(212,240,0,0.03) 0%, transparent 60%)" }} />

              {wallet.icon}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-body-md text-body-md text-on-surface font-semibold group-hover:text-primary-fixed transition-colors">
                    {wallet.name}
                  </span>
                  {wallet.tag && (
                    <span className="font-label-caps text-[9px] px-1.5 py-0.5 border border-outline/30 text-on-surface-variant tracking-widest">
                      {wallet.tag}
                    </span>
                  )}
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  {wallet.description}
                </span>
              </div>

              <span className="material-symbols-outlined text-[18px] text-outline/50 group-hover:text-primary-fixed group-hover:translate-x-0.5 transition-all">
                arrow_forward_ios
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 border-t border-outline/10 mt-1">
          <p className="font-code-sm text-[10px] text-on-surface-variant/50 text-center leading-relaxed">
            By connecting, you agree to the app's terms. LicenseLock never stores private keys.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes walletModalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}
