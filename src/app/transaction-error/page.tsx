"use client";
import { useEffect, useState } from "react";

export default function TransactionError() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(now.toISOString().split('T')[1].split('.')[0] + ' UTC');
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
<div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden relative isolate">
{/* Animated Error Background Overlay */}
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
<svg height="100%" preserveAspectRatio="none" width="100%">
<defs>
<pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
<path className="text-error opacity-30" d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"></path>
</pattern>
<linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="#000" stopOpacity="0"></stop>
<stop offset="100%" stopColor="#000" stopOpacity="1"></stop>
</linearGradient>
</defs>
<rect fill="url(#grid)" height="100%" width="100%"></rect>
<rect fill="url(#fade)" height="100%" width="100%"></rect>
</svg>
</div>
{/* Error Pulse Ring */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
<div className="w-[600px] h-[600px] rounded-full border border-error opacity-10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-error opacity-20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"></div>
</div>
<div className="flex-1 overflow-y-auto z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24 flex items-center justify-center">
<div className="w-full max-w-3xl border border-error/50 bg-error-container/10 p-8 md:p-16 relative">
{/* Decorative Corners */}
<div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-error"></div>
<div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-error"></div>
<div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-error"></div>
<div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-error"></div>
<div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
{/* Icon Block */}
<div className="shrink-0 w-24 h-24 border border-error bg-error/10 flex items-center justify-center">
<span className="material-symbols-outlined text-error text-[48px]">gpp_bad</span>
</div>
<div className="flex-1">
{/* Overline Status */}
<div className="flex items-center gap-2 mb-4">
<span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
<span className="font-label-caps text-label-caps text-error tracking-widest uppercase">System Alert :: EXCEPTION_THROWN</span>
</div>
{/* Error Title */}
<h1 className="font-display-lg text-display-lg text-on-surface mb-2 tracking-tight">Signature <br className="hidden md:block"/>Rejected</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-lg">The transaction was cancelled before signing. Wallet interaction requires explicit user confirmation to proceed with on-chain execution.</p>
{/* Technical Details Box */}
<div className="border border-outline/30 bg-surface-container-lowest p-6 mb-8 relative group cursor-pointer hover:border-outline/60 transition-colors">
<div className="absolute -top-3 left-4 bg-surface px-2 font-code-sm text-code-sm text-on-surface-variant group-hover:text-primary-fixed transition-colors">Transaction Context</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Target Repository</span>
<span className="font-code-sm text-code-sm text-on-surface">github.com/GenLayer/core</span>
</div>
<div className="flex flex-col">
<span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Claim Amount</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-primary-fixed">toll</span>
<span className="font-code-sm text-code-sm text-on-surface">5,000 GL</span>
</div>
</div>
<div className="flex flex-col md:col-span-2 pt-4 border-t border-outline/20">
<span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Error Trace</span>
<div className="bg-surface p-3 border border-outline/20 overflow-x-auto">
<pre className="font-code-sm text-code-sm text-error whitespace-pre-wrap">MetaMask Tx Signature: User denied transaction signature.</pre>
</div>
</div>
</div>
</div>
{/* Actions */}
<div className="flex flex-col sm:flex-row gap-4">
<button className="bg-primary-fixed text-on-primary-fixed px-8 py-4 font-label-caps text-label-caps hover:bg-primary-fixed-dim transition-colors border border-transparent hover:border-primary-fixed flex items-center justify-center gap-2 group">
<span className="material-symbols-outlined text-[18px] group-hover:-rotate-180 transition-transform duration-500">sync</span>
                            RETRY TRANSACTION
                        </button>
<button className="bg-transparent text-on-surface border border-outline/50 px-8 py-4 font-label-caps text-label-caps hover:bg-surface-container hover:border-outline transition-colors flex items-center justify-center gap-2 group">
<span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            RETURN TO DRAFT
                        </button>
</div>
</div>
</div>
{/* Structural Grid Overlay */}
<div className="absolute inset-0 pointer-events-none z-0 border-[0.5px] border-outline/5 grid grid-cols-4 md:grid-cols-12 opacity-30">
<div className="border-r border-outline/10"></div>
<div className="border-r border-outline/10"></div>
<div className="border-r border-outline/10"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div className="border-r border-outline/10 hidden md:block"></div>
<div></div>
</div>
</div>
</div>
{/* Right Sidebar Metadata (Desktop Only) */}
<div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-8 w-8 text-on-surface-variant [writing-mode:vertical-rl]">
<div className="font-code-sm text-code-sm flex items-center gap-4">
<span className="w-px h-12 bg-outline/30 block"></span>
<span>STATUS: ERR_SIG_REJECTED</span>
</div>
<div className="font-code-sm text-code-sm flex items-center gap-4">
<span className="w-px h-12 bg-outline/30 block"></span>
<span>NODE: v1.4.2_beta</span>
</div>
<div className="font-code-sm text-code-sm flex items-center gap-4">
<span className="w-px h-12 bg-outline/30 block"></span>
<span id="current-time">{time}</span>
</div>
</div>
</div>
    </>
  );
}
