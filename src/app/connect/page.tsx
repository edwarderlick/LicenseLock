"use client";
import Link from "next/link";
import { useGenLayer } from "@/components/GenLayerProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Connect() {
  const { connect, account, error, isConnecting } = useGenLayer();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/my-claims");
    }
  }, [account, router]);
  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] items-center justify-center relative overflow-hidden bg-background">
      {/* Decorative Tech Overlay Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div
          className="absolute w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        ></div>
        <div className="absolute left-1/4 top-0 w-[1px] h-full bg-outline/40"></div>
        <div className="absolute right-1/4 top-0 w-[1px] h-full bg-outline/40"></div>
      </div>
      {/* Main Content Container */}
      <div className="w-full max-w-xl relative z-10 p-margin-mobile md:p-margin-desktop">
        {/* Header */}
        <div className="border-l-[3px] border-primary-fixed pl-6 mb-12">
          <h1 className="font-headline-lg text-headline-lg text-on-background tracking-tight mb-4 uppercase">
            System Access
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Connect your wallet to create claims or view your personal
            dashboard.
          </p>
        </div>
        {/* Connection Module */}
        <div className="border border-outline/30 bg-surface-container-lowest p-6 md:p-8 relative">
          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-primary-fixed opacity-50 scanline-animation pointer-events-none"></div>
          <style>{`
            .scanline-animation {
                animation: scan 3s linear infinite;
            }
            @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { top: 100%; opacity: 0; }
            }
            .wallet-btn:hover .wallet-icon {
                filter: brightness(0) saturate(100%) invert(86%) sepia(87%) saturate(1450%) hue-rotate(24deg) brightness(101%) contrast(106%);
            }
          `}</style>
          <div className="flex items-center justify-between border-b border-outline/20 pb-4 mb-6">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
              Select Provider
            </span>
            <span className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-2 py-1 border border-primary-fixed/30 rounded-sm">
              SECURE_LINK
            </span>
          </div>
          {/* Wallet Options */}
          <div className="space-y-4">
            {/* MetaMask */}
            <button onClick={connect} disabled={isConnecting} className="wallet-btn group w-full flex items-center justify-between p-4 border border-outline/40 hover:border-primary-fixed hover:bg-surface-container transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-outline/30 bg-surface-container-low flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="MetaMask"
                    className="wallet-icon w-full h-full object-contain transition-all duration-200 grayscale group-hover:grayscale-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUqQ93s6qmcCBQmZV6Br4Jzz9ojB_X3iL6K9TzE7y0r-04aSrrE1NPVxPMkPy3vS7iC9LOGiXwqJf-3LSniEvhDHCZvyumC8HfykWGVuDaPFMlN15Gs8jvisRuZR87clG_AkvfVVuJfz-qGHQbF41bwbleis9liSKqPDbG9IjsDiDgTokwoCFpoBTQa8EADA89YjZhg5iXBDpXtB4amP7s2I2ti9hKVkMQGIyf9xOiaalHxno8O85r"
                  />
                </div>
                <span className="font-body-lg text-body-lg text-on-surface group-hover:text-primary-fixed transition-colors">
                  {isConnecting ? "Connecting..." : "MetaMask / Browser Wallet"}
                </span>
              </div>
              <span className="material-symbols-outlined text-outline/50 group-hover:text-primary-fixed transition-colors">
                {isConnecting ? "sync" : "arrow_forward"}
              </span>
            </button>
          </div>
          {/* Error display */}
          {error && (
            <div className="mt-4 border border-error/50 bg-error/10 p-3 text-error font-code-sm text-code-sm">
              {error}
            </div>
          )}
          {/* Network Warning */}
          <div className="mt-8 border border-error/50 bg-error-container/20 p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-error mt-0.5">
              warning
            </span>
            <div>
              <h3 className="font-body-md text-body-md text-error font-bold mb-1">
                WRONG_NETWORK_DETECTED
              </h3>
              <p className="font-code-sm text-code-sm text-on-surface-variant">
                Your current network configuration is invalid. Switch to{" "}
                <span className="text-on-surface font-bold">
                  GenLayer Testnet
                </span>{" "}
                to proceed with verification.
              </p>
            </div>
          </div>
        </div>
        {/* Footer Metadata */}
        <div className="mt-6 flex items-center justify-between border-t border-outline/20 pt-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${account ? 'bg-primary-fixed' : 'bg-error'}`}></div>
            <span className="font-code-sm text-code-sm text-on-surface-variant uppercase">
              Status: {account ? "Connected" : "Disconnected"}
            </span>
          </div>
          <span className="font-code-sm text-code-sm text-outline-variant">
            LL-SYS-V.1.0
          </span>
        </div>
      </div>
    </div>
  );
}
