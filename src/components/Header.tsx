"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGenLayer } from "@/components/GenLayerProvider";
import { useState, useRef, useEffect, useCallback } from "react";
import WalletModal from "@/components/WalletModal";

export function Header() {
  const pathname = usePathname();
  const { account, connect, disconnect, isConnecting } = useGenLayer();

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hydration guard: wallet state is client-only
  useEffect(() => setMounted(true), []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleCopy = useCallback(async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers that block clipboard
      const el = document.createElement("textarea");
      el.value = account;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [account]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setDropdownOpen(false);
  }, [disconnect]);

  const navLinks = [
    { name: "Create Claim", path: "/create-claim" },
    { name: "Browse Claims", path: "/browse" },
    { name: "My Claims", path: "/my-claims" },
    { name: "How It Works", path: "/how-it-works" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline/20">
      <div className="h-16 max-w-container-max mx-auto px-margin-desktop flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">security</span>
          </div>
          <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">LicenseLock</span>
        </Link>

        <nav className="flex items-center gap-margin-desktop">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`font-label-caps text-label-caps transition-colors py-2 ${
                  isActive
                    ? "text-primary-fixed border-b-2 border-primary-fixed"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-gutter">
          {/* Hydration-safe wallet button: render placeholder until client mounts */}
          {!mounted ? (
            <div className="bg-primary-fixed text-on-primary-fixed px-6 py-2 font-label-caps text-label-caps opacity-0 pointer-events-none select-none">
              Connect Wallet
            </div>
          ) : account ? (
            /* ── Connected: dropdown trigger ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-4 py-2 border border-primary-fixed/40 bg-surface-container hover:bg-surface-container-high transition-colors"
              >
                {/* Green pulse dot */}
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse flex-shrink-0" />
                <span className="font-code-sm text-code-sm text-primary-fixed">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span
                  className={`material-symbols-outlined text-[16px] text-primary-fixed transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 border border-outline/30 bg-surface-container-lowest shadow-xl z-50 overflow-hidden">
                  {/* Address preview */}
                  <div className="px-4 py-3 border-b border-outline/20 bg-surface-container-low">
                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase tracking-widest">
                      Connected
                    </p>
                    <p className="font-code-sm text-code-sm text-on-surface truncate">
                      {account}
                    </p>
                  </div>

                  {/* Copy address */}
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-left group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary-fixed transition-colors">
                      {copied ? "check_circle" : "content_copy"}
                    </span>
                    <span
                      className={`font-body-md text-body-md transition-colors ${
                        copied ? "text-primary-fixed" : "text-on-surface group-hover:text-primary-fixed"
                      }`}
                    >
                      {copied ? "Copied!" : "Copy Address"}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="h-px bg-outline/20" />

                  {/* Disconnect */}
                  <button
                    onClick={handleDisconnect}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-error/10 transition-colors text-left group"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-error transition-colors">
                      logout
                    </span>
                    <span className="font-body-md text-body-md text-on-surface group-hover:text-error transition-colors">
                      Disconnect
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Not connected: plain button ── */
          <button
              onClick={() => setModalOpen(true)}
              disabled={isConnecting}
              className="bg-primary-fixed text-on-primary-fixed px-6 py-2 font-label-caps text-label-caps hover:bg-primary-fixed-dim transition-all disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}

          {/* Avatar dot */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>

      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={connect}
      />
    </header>
  );
}
