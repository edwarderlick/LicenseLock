"use client";
import { useEffect, useState } from "react";

export default function CreateClaimSetup({ 
  claimData, 
  setClaimData, 
  onNext 
}: { 
  claimData: any, 
  setClaimData: any, 
  onNext?: () => void 
}) {
  const claimType = claimData.claimType;
  const setClaimType = (val: string) => setClaimData({...claimData, claimType: val});

  return (
    <>
<div className="flex flex-col w-full relative min-h-full">
{/* Grid Background overlay */}
<div aria-hidden="true" className="absolute inset-0 pointer-events-none border-x border-outline/20 max-w-container-max mx-auto px-margin-desktop flex">
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 border-r border-outline/10 h-full"></div>
<div className="w-1/12 h-full"></div>
</div>
<div className="max-w-container-max mx-auto px-margin-desktop w-full py-16 relative z-10 flex flex-col md:flex-row gap-16">
{/* Sidebar / Progress Indicator */}
<aside className="w-full md:w-64 flex-shrink-0">
<div className="sticky top-24">
<div className="border border-outline/30 bg-surface-container-lowest">
<div className="border-b border-outline/30 px-4 py-3 bg-surface-container-low flex justify-between items-center">
<span className="font-label-caps text-label-caps text-on-surface">SEQUENCE</span>
<span className="font-code-sm text-code-sm text-tertiary-fixed-dim">01/03</span>
</div>
<div className="p-4 flex flex-col gap-6 relative">
{/* Vertical connecting line */}
<div className="absolute left-[27px] top-8 bottom-8 w-[1px] bg-outline/20 z-0"></div>
<div className="flex items-start gap-4 relative z-10 opacity-100">
<div className="w-8 h-8 rounded-full border border-primary-fixed bg-surface flex items-center justify-center flex-shrink-0">
<div className="w-2 h-2 bg-primary-fixed rounded-full"></div>
</div>
<div className="pt-1">
<div className="font-code-sm text-code-sm text-primary-fixed mb-1">STEP_01</div>
<div className="font-body-md text-body-md text-on-surface">Claim Type</div>
</div>
</div>
<div className="flex items-start gap-4 relative z-10 opacity-100">
<div className="w-8 h-8 rounded-full border border-primary-fixed bg-surface flex items-center justify-center flex-shrink-0">
<div className="w-2 h-2 bg-primary-fixed rounded-full animate-pulse"></div>
</div>
<div className="pt-1">
<div className="font-code-sm text-code-sm text-primary-fixed mb-1">STEP_02</div>
<div className="font-body-md text-body-md text-on-surface">Target Config</div>
</div>
</div>
<div className="flex items-start gap-4 relative z-10 opacity-50">
<div className="w-8 h-8 rounded-full border border-outline/50 bg-surface flex items-center justify-center flex-shrink-0">
</div>
<div className="pt-1">
<div className="font-code-sm text-code-sm text-tertiary-fixed-dim mb-1">STEP_03</div>
<div className="font-body-md text-body-md text-on-surface">Validation</div>
</div>
</div>
</div>
</div>

{/* Protocol Fee Switch Banner */}
<div className="mt-6 border border-primary-fixed/30 bg-primary-fixed/5 p-4 flex flex-col gap-2">
  <div className="flex items-center gap-2 text-primary-fixed">
    <span className="material-symbols-outlined text-[18px]">account_balance</span>
    <span className="font-label-caps text-label-caps font-bold">2.5% PROTOCOL FEE</span>
  </div>
  <p className="font-code-sm text-[11px] text-on-surface-variant leading-relaxed">
    Fee applies strictly on verified PASS resolutions. 100% of escrow is refunded on failures, cancellation, or insufficient evidence.
  </p>
</div>
</div>
</aside>
{/* Main Content Area */}
<div className="flex-1 max-w-4xl flex flex-col gap-12">
{/* Header */}
<div>
<h1 className="font-display-lg text-display-lg text-on-surface mb-4">Initialize<br/>Verification Claim</h1>
<p className="font-body-lg text-body-lg text-tertiary-fixed-dim max-w-2xl">Define the assertion logic and target repository parameters. This transaction will lock the evaluation criteria immutably on-chain upon execution.</p>
</div>
{/* Step 1 Container */}
<section className="border border-outline/30 bg-surface-container-lowest">
<div className="border-b border-outline/30 px-6 py-4 bg-surface-container-low flex justify-between items-center">
<h2 className="font-code-sm text-code-sm text-on-surface uppercase">Step_01: Select Assertion Type</h2>
<span className="material-symbols-outlined text-tertiary-fixed-dim text-[16px]">account_tree</span>
</div>
<div className="p-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="claim-type-grid">
{/* Option 1 */}
<label className={`cursor-pointer border bg-surface p-5 transition-colors relative group block claim-option ${claimType === 'SPDX_MATCH' ? 'border-primary-fixed selected' : 'border-outline/30 hover:border-outline/60'}`}>
<input className="peer sr-only" name="claim_type" type="radio" value="SPDX_MATCH" checked={claimType === 'SPDX_MATCH'} onChange={(e) => setClaimType(e.target.value)}/>
<div className="absolute inset-0 border border-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
<div className="flex justify-between items-start mb-4">
<div className={`w-6 h-6 rounded-full border flex items-center justify-center ${claimType === 'SPDX_MATCH' ? 'border-primary-fixed' : 'border-outline/50'}`}>
<div className={`w-2.5 h-2.5 rounded-full bg-primary-fixed transition-opacity ${claimType === 'SPDX_MATCH' ? 'opacity-100' : 'opacity-0'}`}></div>
</div>
<span className="font-label-caps text-label-caps text-outline px-2 py-1 border border-outline/20 bg-surface-container">A1</span>
</div>
<h3 className={`font-body-md text-body-md font-bold mb-2 transition-colors ${claimType === 'SPDX_MATCH' ? 'text-primary-fixed' : 'text-on-surface'}`}>SPDX Match</h3>
<p className="font-code-sm text-code-sm text-tertiary-fixed-dim">Checks if the root LICENSE file matches the README identifier.</p>
</label>

{/* Option 2 */}
<label className={`cursor-pointer border bg-surface p-5 transition-colors relative group block claim-option ${claimType === 'NO_COPYLEFT' ? 'border-primary-fixed selected' : 'border-outline/30 hover:border-outline/60'}`}>
<input className="peer sr-only" name="claim_type" type="radio" value="NO_COPYLEFT" checked={claimType === 'NO_COPYLEFT'} onChange={(e) => setClaimType(e.target.value)}/>
<div className="absolute inset-0 border border-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
<div className="flex justify-between items-start mb-4">
<div className={`w-6 h-6 rounded-full border flex items-center justify-center ${claimType === 'NO_COPYLEFT' ? 'border-primary-fixed' : 'border-outline/50'}`}>
<div className={`w-2.5 h-2.5 rounded-full bg-primary-fixed transition-opacity ${claimType === 'NO_COPYLEFT' ? 'opacity-100' : 'opacity-0'}`}></div>
</div>
<span className="font-label-caps text-label-caps text-outline px-2 py-1 border border-outline/20 bg-surface-container">A2</span>
</div>
<h3 className={`font-body-md text-body-md font-bold mb-2 transition-colors ${claimType === 'NO_COPYLEFT' ? 'text-primary-fixed' : 'text-on-surface'}`}>No Copyleft</h3>
<p className="font-code-sm text-code-sm text-tertiary-fixed-dim">Fails if GPL, AGPL, LGPL, or MPL are found in LICENSE or manifests.</p>
</label>

{/* Option 3 */}
<label className={`cursor-pointer border bg-surface p-5 transition-colors relative group block claim-option ${claimType === 'ALLOWED_LICENSE_SET' ? 'border-primary-fixed selected' : 'border-outline/30 hover:border-outline/60'}`}>
<input className="peer sr-only" name="claim_type" type="radio" value="ALLOWED_LICENSE_SET" checked={claimType === 'ALLOWED_LICENSE_SET'} onChange={(e) => setClaimType(e.target.value)}/>
<div className="absolute inset-0 border border-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
<div className="flex justify-between items-start mb-4">
<div className={`w-6 h-6 rounded-full border flex items-center justify-center ${claimType === 'ALLOWED_LICENSE_SET' ? 'border-primary-fixed' : 'border-outline/50'}`}>
<div className={`w-2.5 h-2.5 rounded-full bg-primary-fixed transition-opacity ${claimType === 'ALLOWED_LICENSE_SET' ? 'opacity-100' : 'opacity-0'}`}></div>
</div>
<span className="font-label-caps text-label-caps text-outline px-2 py-1 border border-outline/20 bg-surface-container">A3</span>
</div>
<h3 className={`font-body-md text-body-md font-bold mb-2 transition-colors ${claimType === 'ALLOWED_LICENSE_SET' ? 'text-primary-fixed' : 'text-on-surface'}`}>Allowed Licenses</h3>
<p className="font-code-sm text-code-sm text-tertiary-fixed-dim">Passes only if the license matches an approved list.</p>
</label>

{/* Option 4: Semantic AI Audit */}
<label className={`cursor-pointer border bg-surface p-5 transition-colors relative group block claim-option ${claimType === 'SEMANTIC_AUDIT' ? 'border-primary-fixed selected' : 'border-outline/30 hover:border-outline/60'}`}>
<input className="peer sr-only" name="claim_type" type="radio" value="SEMANTIC_AUDIT" checked={claimType === 'SEMANTIC_AUDIT'} onChange={(e) => setClaimType(e.target.value)}/>
<div className="absolute inset-0 border border-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
<div className="flex justify-between items-start mb-4">
<div className={`w-6 h-6 rounded-full border flex items-center justify-center ${claimType === 'SEMANTIC_AUDIT' ? 'border-primary-fixed' : 'border-outline/50'}`}>
<div className={`w-2.5 h-2.5 rounded-full bg-primary-fixed transition-opacity ${claimType === 'SEMANTIC_AUDIT' ? 'opacity-100' : 'opacity-0'}`}></div>
</div>
<span className="font-label-caps text-label-caps text-primary-fixed px-2 py-1 border border-primary-fixed/30 bg-primary-fixed/10">AI</span>
</div>
<h3 className={`font-body-md text-body-md font-bold mb-2 transition-colors ${claimType === 'SEMANTIC_AUDIT' ? 'text-primary-fixed' : 'text-on-surface'}`}>Semantic AI Audit</h3>
<p className="font-code-sm text-code-sm text-tertiary-fixed-dim">Evaluates repository license against custom legal requirements using GenLayer AI consensus.</p>
</label>
</div>
</div>
</section>

{/* Step 2 Container */}
<section className="border border-outline/30 bg-surface-container-lowest">
<div className="border-b border-outline/30 px-6 py-4 bg-surface-container-low flex justify-between items-center">
<h2 className="font-code-sm text-code-sm text-on-surface uppercase">Step_02: Target Parameters</h2>
<span className="material-symbols-outlined text-tertiary-fixed-dim text-[16px]">data_object</span>
</div>
<div className="p-6 flex flex-col gap-6">

{/* Custom Prompt if SEMANTIC_AUDIT */}
{claimType === 'SEMANTIC_AUDIT' && (
  <div className="flex flex-col gap-2 p-4 border border-primary-fixed/30 bg-primary-fixed/5">
    <div className="flex justify-between items-end">
      <label className="font-label-caps text-label-caps text-primary-fixed tracking-widest flex items-center gap-2" htmlFor="custom_policy_prompt">
        <span className="material-symbols-outlined text-[16px]">psychology</span>
        Custom Policy Requirement (AI Prompt)
      </label>
      <span className="font-code-sm text-[10px] text-primary-fixed bg-surface-container px-2 py-0.5 border border-primary-fixed/30">GENVM LLM</span>
    </div>
    <textarea 
      className="w-full bg-surface border border-outline/30 text-body-md text-on-surface p-3 focus:outline-none focus:border-primary-fixed transition-colors font-code-sm placeholder-outline/30 min-h-[90px]" 
      id="custom_policy_prompt" 
      placeholder="e.g. Must permit commercial use and modification without viral copyleft disclosure requirements."
      value={claimData.custom_policy_prompt || ""}
      onChange={(e) => setClaimData({...claimData, custom_policy_prompt: e.target.value})}
    />
    <p className="font-code-sm text-[11px] text-tertiary-fixed-dim">
      Decentralized GenVM validator nodes will execute an AI evaluation prompt on the repository license.
    </p>
  </div>
)}

<div className="flex flex-col gap-2">
<label className="font-label-caps text-label-caps text-tertiary-fixed-dim tracking-widest" htmlFor="repo_url">Target Repository URL</label>
<div className="relative flex items-center group">
<span className="material-symbols-outlined absolute left-4 text-outline/50 group-focus-within:text-primary-fixed transition-colors">link</span>
<input 
  className="w-full bg-surface border border-outline/30 text-body-md text-on-surface py-3 pl-12 pr-4 focus:outline-none focus:border-primary-fixed transition-colors font-code-sm placeholder-outline/30" 
  id="repo_url" 
  placeholder="https://github.com/org/repo" 
  type="text" 
  value={claimData.repo}
  onChange={(e) => setClaimData({...claimData, repo: e.target.value})}
/>
<div className="absolute bottom-0 left-0 h-[1px] bg-primary-fixed w-0 group-focus-within:w-full transition-all duration-300"></div>
</div>
</div>
<div className="flex flex-col gap-2">
<div className="flex justify-between items-end">
<label className="font-label-caps text-label-caps text-tertiary-fixed-dim tracking-widest" htmlFor="commit_hash">Commit Hash (40-char)</label>
<span className="font-code-sm text-[10px] text-tertiary-fixed-dim bg-surface-container px-2 py-0.5 border border-outline/20">VER: SHA-1</span>
</div>
<div className="relative flex items-center group">
<span className="material-symbols-outlined absolute left-4 text-outline/50 group-focus-within:text-primary-fixed transition-colors">tag</span>
<input 
  className="w-full bg-surface border border-outline/30 text-body-md text-on-surface py-3 pl-12 pr-4 focus:outline-none focus:border-primary-fixed transition-colors font-code-sm placeholder-outline/30 uppercase tracking-widest" 
  id="commit_hash" 
  maxLength={40} 
  placeholder="e.g. 7d8f9e..." 
  type="text" 
  value={claimData.commit}
  onChange={(e) => setClaimData({...claimData, commit: e.target.value})}
/>
<div className="absolute bottom-0 left-0 h-[1px] bg-primary-fixed w-0 group-focus-within:w-full transition-all duration-300"></div>
</div>
</div>

<div className="flex flex-col gap-2">
<div className="flex justify-between items-end">
<label className="font-label-caps text-label-caps text-tertiary-fixed-dim tracking-widest" htmlFor="target_directory">Target Directory (Optional)</label>
<span className="font-code-sm text-[10px] text-tertiary-fixed-dim bg-surface-container px-2 py-0.5 border border-outline/20">SUBDIR / MONOREPO</span>
</div>
<div className="relative flex items-center group">
<span className="material-symbols-outlined absolute left-4 text-outline/50 group-focus-within:text-primary-fixed transition-colors">folder</span>
<input 
  className="w-full bg-surface border border-outline/30 text-body-md text-on-surface py-3 pl-12 pr-4 focus:outline-none focus:border-primary-fixed transition-colors font-code-sm placeholder-outline/30" 
  id="target_directory" 
  placeholder="e.g. packages/core or apps/web (leave blank for root)" 
  type="text" 
  value={claimData.target_directory || ""}
  onChange={(e) => setClaimData({...claimData, target_directory: e.target.value})}
/>
<div className="absolute bottom-0 left-0 h-[1px] bg-primary-fixed w-0 group-focus-within:w-full transition-all duration-300"></div>
</div>
</div>

</div>
</section>
{/* Action Footer */}
<div className="flex justify-end pt-4 border-t border-outline/30 mt-4">
<button onClick={onNext} className="bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm font-bold px-8 py-3 flex items-center gap-2 hover:bg-primary-fixed-dim transition-colors">
<span>PROCEED TO VALIDATION</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
    </>
  );
}
