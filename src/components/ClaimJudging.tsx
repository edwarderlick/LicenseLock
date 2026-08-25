"use client";
import { useEffect } from "react";
export default function ClaimJudging() {
  return (
    <>
<div className="flex flex-col w-full relative">
{/* Ambient Scanning Pattern overlay */}
<div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 mix-blend-screen" style={{"backgroundImage":"repeating-linear-gradient(0deg, transparent, transparent 2px, #ffffff 2px, #ffffff 4px)","backgroundSize":"100% 4px"}}></div>
<div className="w-full max-w-container-max mx-auto px-margin-desktop py-16 lg:py-24 relative z-10 flex flex-col min-h-[calc(100vh-64px)] justify-center">
<div className="w-full max-w-3xl mx-auto flex flex-col gap-12 border border-[#222222] bg-[#111111] p-8 lg:p-12 relative overflow-hidden group">
{/* Scanning Line Animation inside the main container */}
<div className="absolute inset-x-0 top-0 h-[2px] bg-primary-fixed opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{"animation":"scanline 3s linear infinite"}}></div>
{/* Header Section: Active judging state */}
<div className="flex flex-col gap-6 relative">
<div className="flex items-center gap-4">
<div className="relative w-8 h-8 flex items-center justify-center">
<span className="material-symbols-outlined text-primary-fixed text-[24px] absolute z-10" style={{"fontVariationSettings":"'FILL' 1"}}>sync</span>
{/* Pulsing rings */}
<div className="absolute inset-0 border border-primary-fixed rounded-full opacity-50 animate-ping" style={{"animationDuration":"2s"}}></div>
<div className="absolute inset-0 border border-primary-fixed rounded-full opacity-25 animate-ping" style={{"animationDuration":"3s","animationDelay":"0.5s"}}></div>
</div>
<h1 className="font-display-lg text-display-lg text-on-surface tracking-tight uppercase">Judging in Progress</h1>
</div>
<div className="w-full h-[1px] bg-[#222222]"></div>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                    Validators are independently fetching and reading the files now. This can take a few minutes. You can leave this page; the result will be here when you come back.
                </p>
{/* Terminal-like progress output (visual only) */}
<div className="bg-[#000000] border border-[#222222] p-4 font-code-sm text-code-sm text-on-surface-variant h-32 overflow-hidden relative" id="terminal-output">
<div className="absolute bottom-4 left-4 flex flex-col gap-1 w-full" id="terminal-lines">
{/* JS injected lines go here */}
<div className="opacity-50">Initializing validation sequence...</div>
<div className="opacity-70">Awaiting consensus nodes [3/5]</div>
</div>
</div>
</div>
{/* Metadata Section */}
<div className="flex flex-col gap-8">
<h2 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest flex items-center gap-2">
<span className="w-2 h-2 bg-[#222222]"></span> Context Payload
                </h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#222222] border border-[#222222]">
<div className="bg-[#111111] p-6 flex flex-col gap-2 hover:bg-[#1A1A1A] transition-colors">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Repository</span>
<span className="font-body-md text-body-md text-on-surface truncate">GenLayer/core-protocol</span>
</div>
<div className="bg-[#111111] p-6 flex flex-col gap-2 hover:bg-[#1A1A1A] transition-colors">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Claim Type</span>
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-outline"></span>
<span className="font-body-md text-body-md text-on-surface">Licensing Compliance</span>
</div>
</div>
<div className="bg-[#111111] p-6 flex flex-col gap-2 md:col-span-2 hover:bg-[#1A1A1A] transition-colors">
<span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Commit Hash Target</span>
<div className="flex items-center justify-between w-full">
<span className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-2 py-1 border border-primary-fixed/20 truncate max-w-[80%]">Target commit SHA</span>
<span className="material-symbols-outlined text-on-surface-variant text-[16px]">file_copy</span>
</div>
</div>
</div>
</div>
{/* Actions */}
<div className="pt-8 border-t border-[#222222] flex justify-end">
<button className="border border-on-surface text-on-surface font-body-md text-body-md px-6 py-3 hover:bg-on-surface hover:text-[#111111] transition-all flex items-center gap-2" onClick={() => { window.history.back() }}>
<span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Return to Dashboard
                </button>
</div>
</div>
{/* Decorative background elements */}
<div className="absolute right-0 bottom-0 opacity-10 pointer-events-none z-0 transform translate-x-1/4 translate-y-1/4">
<span className="material-symbols-outlined text-[400px]">verified_user</span>
</div>
</div>
</div>
<style>{`
    @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }
`}</style>
{/*

    // Simulate terminal output for the active judging state
    document.addEventListener("DOMContentLoaded", () => {
        const terminalLines = document.getElementById("terminal-lines");
        const messages = [
            "Fetching artifact...",
            "fetching files...",
            "Checking license declarations...",
            "Awaiting consensus..."
        ];

        
        let messageIndex = 0;
        
        setInterval(() => {
            if(messageIndex >= messages.length) messageIndex = 0;
            
            const newLine = document.createElement("div");
            newLine.className = "text-primary-fixed opacity-90 transition-opacity duration-300";
            newLine.innerText = `> ${messages[messageIndex]}`;
            
            terminalLines.appendChild(newLine);
            
            // Keep only the last 4 lines to simulate scrolling
            if(terminalLines.children.length > 4) {
                terminalLines.removeChild(terminalLines.firstChild);
            }
            
            // Fade out older lines slightly
            Array.from(terminalLines.children).forEach((child, index, array) => {
                if(index < array.length - 1) {
                    child.classList.replace("opacity-90", "opacity-50");
                    child.classList.replace("text-primary-fixed", "text-on-surface-variant");
                }
            });
            
            messageIndex++;
        }, 2500);
    });

*/}
    </>
  );
}
