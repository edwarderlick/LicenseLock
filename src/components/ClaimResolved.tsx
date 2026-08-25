"use client";

import Link from "next/link";

export default function ClaimResolved({ claim }: { claim: any }) {
  let resultData: any = null;
  if (typeof claim.result_json === "string") {
    try {
      resultData = JSON.parse(claim.result_json);
    } catch {
      resultData = null;
    }
  } else if (claim.result_json && typeof claim.result_json === "object") {
    resultData = claim.result_json;
  }

  const files = Array.isArray(resultData?.files) ? resultData.files : [];
  const isCanceled = claim.state === "CANCELED" || claim.outcome === "CANCELED";
  const isPass = claim.outcome === "PASS";
  const isInsufficient = claim.outcome === "INSUFFICIENT";

  return (
    <>
<div className="flex flex-col w-full relative min-h-[calc(100vh-4rem)]">
{/* Subtle decorative grid */}
<div className="absolute inset-0 pointer-events-none opacity-20" style={{"backgroundImage":"linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)","backgroundSize":"24px 24px"}}></div>
<div className="max-w-container-max mx-auto px-margin-desktop py-12 relative z-10 grid grid-cols-12 gap-gutter w-full">
{/* Left Column: Primary Content */}
<div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
{/* Header Section */}
<header className="border-b border-outline/30 pb-6 mb-2">
<div className="flex items-center gap-4 mb-4">
<span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-3 py-1 border border-outline/20">CLAIM_ID: {claim.id}</span>
{isCanceled ? (
  <span className="font-label-caps text-label-caps text-on-surface bg-surface-container-high border border-outline px-3 py-1 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
    CANCELED: REFUNDED
  </span>
) : isPass ? (
  <span className="font-label-caps text-label-caps text-primary-fixed bg-primary-fixed/15 border border-primary-fixed px-3 py-1 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse"></span>
    RESOLVED: PASSED
  </span>
) : isInsufficient ? (
  <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-variant/30 border border-outline/40 px-3 py-1 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-outline animate-pulse"></span>
    RESOLVED: INSUFFICIENT
  </span>
) : (
  <span className="font-label-caps text-label-caps text-on-error bg-error-container/20 border border-error px-3 py-1 flex items-center gap-2">
    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
    RESOLVED: FAILED
  </span>
)}
</div>
<h1 className="font-headline-lg text-headline-lg text-on-surface mb-6 truncate" title={claim.repo}>{claim.repo}</h1>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<div className="flex flex-col gap-1 border-l-2 border-outline/30 pl-4">
<span className="font-label-caps text-label-caps text-on-surface-variant">COMMIT HASH</span>
<span className="font-code-sm text-code-sm text-on-surface bg-surface-container px-2 py-1 truncate">{claim.commit ? claim.commit.substring(0, 7) : ''}</span>
</div>
<div className="flex flex-col gap-1 border-l-2 border-outline/30 pl-4">
<span className="font-label-caps text-label-caps text-on-surface-variant">POLICY TYPE</span>
<span className="font-code-sm text-code-sm text-on-surface">
  {claim.claim_type === 'SPDX_MATCH' ? 'SPDX Match' : 
   claim.claim_type === 'NO_COPYLEFT' ? 'No Copyleft' : 
   claim.claim_type === 'ALLOWED_LICENSE_SET' ? 'Allowed Licenses' : 
   claim.claim_type === 'SEMANTIC_AUDIT' ? 'Semantic AI Audit' : 
   claim.claim_type}
</span>
</div>
<div className="flex flex-col gap-1 border-l-2 border-outline/30 pl-4">
<span className="font-label-caps text-label-caps text-on-surface-variant">ESCROW STAKED</span>
<span className="font-code-sm text-code-sm text-primary-fixed font-semibold">{(Number(claim.amount) / 10**18).toString()} GEN</span>
</div>
<div className="flex flex-col gap-1 border-l-2 border-outline/30 pl-4">
<span className="font-label-caps text-label-caps text-on-surface-variant">STATE</span>
<span className={`font-code-sm text-code-sm font-bold ${isCanceled ? 'text-on-surface-variant' : isPass ? 'text-primary-fixed' : isInsufficient ? 'text-on-surface-variant' : 'text-error'}`}>
  {claim.outcome || claim.state}
</span>
</div>
</div>
{claim.target_directory && (
  <div className="mt-4 flex items-center gap-2">
    <span className="font-label-caps text-label-caps text-on-surface-variant">SUBDIRECTORY:</span>
    <span className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 border border-primary-fixed/20">
      {claim.target_directory}
    </span>
  </div>
)}
{claim.custom_policy_prompt && (
  <div className="mt-4 p-3 bg-primary-fixed/5 border border-primary-fixed/30 flex flex-col gap-1">
    <span className="font-label-caps text-label-caps text-primary-fixed flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px]">psychology</span>
      AI AUDIT POLICY PROMPT
    </span>
    <p className="font-code-sm text-code-sm text-on-surface">"{claim.custom_policy_prompt}"</p>
  </div>
)}
</header>
{/* Outcome Banner */}
<section className={`border p-6 flex items-start gap-4 shadow-md ${isCanceled ? 'bg-surface-container border-outline/40' : isPass ? 'bg-primary-container/10 border-primary-fixed/50' : isInsufficient ? 'bg-surface-container border-outline/40' : 'bg-error-container/10 border-error'}`}>
<span className={`material-symbols-outlined text-[32px] shrink-0 ${isCanceled ? 'text-on-surface-variant' : isPass ? 'text-primary-fixed' : isInsufficient ? 'text-on-surface-variant' : 'text-error'}`}>
  {isCanceled ? 'cancel' : isPass ? 'check_circle' : isInsufficient ? 'help' : 'gavel'}
</span>
<div className="flex flex-col gap-2 w-full">
<div className="flex items-center justify-between">
  <h2 className={`font-headline-sm text-headline-sm ${isCanceled ? 'text-on-surface' : isPass ? 'text-primary-fixed' : isInsufficient ? 'text-on-surface' : 'text-error'}`}>
    VERDICT: {isCanceled ? 'CANCELED' : claim.outcome}
  </h2>
  {isPass && (
    <span className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-3 py-1 border border-primary-fixed/30">
      2.5% Protocol Fee Applied
    </span>
  )}
</div>

{resultData?.reason ? (
  <>
    <div className={`font-body-md text-body-md text-on-surface font-medium bg-surface-container-high/60 p-3 border-l-2 ${isCanceled ? 'border-outline' : isPass ? 'border-primary-fixed' : isInsufficient ? 'border-outline' : 'border-error'}`}>
      <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
        {isCanceled ? 'STATUS DETAILS' : claim.claim_type === 'SEMANTIC_AUDIT' ? 'AI AUDITOR CONSENSUS REASONING' : 'VALIDATOR CONSENSUS REASONING'}
      </span>
      {resultData.reason}
    </div>
    <p className="font-code-sm text-code-sm text-on-surface-variant mt-1">
      {isCanceled
        ? 'The escrow has been refunded to the original funder.'
        : claim.outcome === 'PASS'
        ? 'The repository satisfies the required license policy. Escrow (net of 2.5% protocol fee) released to recipient.'
        : claim.outcome === 'INSUFFICIENT'
        ? 'Decentralized validators found insufficient evidence to verify the claim at the designated commit. 100% escrow refunded.'
        : 'The repository violates the specified license constraints. 100% escrow refunded to funder.'}
    </p>
  </>
) : (
  <p className="font-code-sm text-code-sm text-on-surface-variant">
    {isCanceled
      ? 'This claim was canceled by the funder. The locked escrow has been refunded.'
      : claim.outcome === 'PASS' 
      ? 'The repository satisfies the required license policy. Escrow (net of 2.5% protocol fee) released to recipient.' 
      : claim.outcome === 'INSUFFICIENT'
      ? 'Decentralized validators found insufficient evidence to verify the claim at the designated commit.'
      : 'The repository violates the specified license constraints. Escrow was refunded to funder.'}
  </p>
)}
</div>
</section>

{/* On-chain Report (Evidence) */}
<section className="flex flex-col gap-4">
<h3 className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2 border-b border-outline/20 pb-2">
<span className="material-symbols-outlined text-[16px]">plagiarism</span>
          ON-CHAIN EVIDENCE REPORT
        </h3>
{files.length > 0 ? files.map((file: any, idx: number) => (
  <div key={file.path || file.status || idx} className="border border-outline/20 bg-surface-container shadow-sm group">
    <div className="bg-surface-container-high px-4 py-2 border-b border-outline/20 flex justify-between items-center">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">description</span>
        <span className="font-code-sm text-code-sm text-on-surface truncate">{file.path}</span>
      </div>
      <span className="font-label-caps text-label-caps text-on-surface-variant shrink-0">{file.status}</span>
    </div>
    {file.excerpt && (
      <div className="p-4 bg-[#0a0b0b] overflow-x-auto relative">
        <div className={`absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent pointer-events-none ${isPass ? 'from-primary-fixed/10 border-l-2 border-primary-fixed' : 'from-error/10 border-l-2 border-error'}`}></div>
        <pre className="font-code-sm text-code-sm text-on-surface whitespace-pre opacity-80 pl-4">{file.excerpt}</pre>
      </div>
    )}
  </div>
)) : (
  <div className="p-4 bg-surface-container text-on-surface-variant text-center border border-outline/20">No file evidence available</div>
)}
</section>

{/* Post-Resolution Actions */}
<section className="border border-outline/20 bg-surface-container p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
  <div className="flex flex-col gap-1 text-center sm:text-left">
    <div className="font-label-caps text-label-caps text-on-surface">NEED ANOTHER VERIFICATION?</div>
    <div className="font-code-sm text-code-sm text-on-surface-variant">Lock escrow against a new commit or repository.</div>
  </div>
  <div className="flex items-center gap-3 w-full sm:w-auto">
    <Link 
      href="/browse"
      className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface-container-high border border-outline/40 hover:border-primary-fixed font-code-sm text-code-sm text-on-surface text-center transition-colors"
    >
      Browse All Claims
    </Link>
    <Link 
      href="/create-claim"
      className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-label-caps text-label-caps tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(212,240,0,0.15)] hover:shadow-[0_0_20px_rgba(212,240,0,0.3)]"
    >
      <span className="material-symbols-outlined text-[18px]">add_circle</span>
      CREATE ANOTHER CLAIM
    </Link>
  </div>
</section>
</div>
{/* Right Column: Metadata & Timeline */}
<aside className="col-span-12 lg:col-span-4 flex flex-col gap-8 lg:pl-8 border-l border-outline/20">
{/* Transaction Hashes */}
<div className="border border-outline/20 bg-surface-container p-6 shadow-sm">
<h3 className="font-label-caps text-label-caps text-on-surface-variant border-b border-outline/20 pb-2 mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">link</span>
           BLOCKCHAIN RECORD
        </h3>
<div className="flex flex-col gap-4">
<div>
<div className="font-label-caps text-label-caps text-on-surface-variant mb-1">LOCK TRANSACTION</div>
<div className="font-code-sm text-code-sm text-on-surface bg-[#0a0b0b] p-2 truncate border border-outline/10 cursor-pointer hover:border-primary-fixed transition-colors" onClick={() => navigator.clipboard.writeText('0x7f8b9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e3a9c')} title="0x7f8b...3a9c">
              0x7f8b9a0c...e3a9c
            </div>
</div>
<div>
<div className="font-label-caps text-label-caps text-on-surface-variant mb-1">RESOLVE TRANSACTION</div>
<div className="font-code-sm text-code-sm text-on-surface bg-[#0a0b0b] p-2 truncate border border-outline/10 cursor-pointer hover:border-primary-fixed transition-colors" onClick={() => navigator.clipboard.writeText('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f9f8e')} title="0x1a2b...9f8e">
              0x1a2b3c4d...f9f8e
            </div>
</div>
</div>
</div>
{/* Execution Timeline */}
<div className="flex flex-col">
<h3 className="font-label-caps text-label-caps text-on-surface-variant border-b border-outline/20 pb-2 mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">history</span>
          EXECUTION TIMELINE
        </h3>
<div className="relative pl-6 flex flex-col gap-6">
{/* Vertical Line */}
<div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-outline/20"></div>
{/* Step 1 */}
<div className="relative">
<div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-surface-container border-2 border-outline z-10"></div>
<div className="font-label-caps text-label-caps text-on-surface">CLAIM LOCKED</div>
<div className="font-code-sm text-code-sm text-on-surface-variant mt-1">Block 1492019 • 2024-10-24 14:32 UTC</div>
</div>
{/* Step 2 */}
<div className="relative">
<div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-surface-container border-2 border-outline z-10"></div>
<div className="font-label-caps text-label-caps text-on-surface">RESOLVE TRIGGERED</div>
<div className="font-code-sm text-code-sm text-on-surface-variant mt-1">Validator node initiated parsing.</div>
</div>
{/* Step 3 (Final) */}
<div className="relative">
<div className="absolute left-[7px] top-0 h-full w-[2px] bg-outline/20 z-0"></div>
<div className={`absolute -left-6 top-1 w-3 h-3 rounded-full z-10 ${claim.outcome === 'PASS' ? 'bg-primary-fixed shadow-[0_0_8px_rgba(212,240,0,0.6)]' : 'bg-error shadow-[0_0_8px_rgba(255,180,171,0.6)]'}`}></div>
<div className={`font-label-caps text-label-caps ${claim.outcome === 'PASS' ? 'text-primary-fixed' : 'text-error'}`}>RESOLVED ({claim.outcome})</div>
<div className="font-code-sm text-code-sm text-on-surface-variant mt-1">Status changed from OPEN to RESOLVED.</div>
</div>
</div>
</div>
{/* Visual Accent */}
<div className="mt-auto pt-8 border-t border-outline/20">
<div className="flex items-center justify-between mb-2">
<span className="font-code-sm text-code-sm text-on-surface-variant">SYS_INTEGRITY</span>
<span className="font-code-sm text-code-sm text-primary-fixed">100%</span>
</div>
<div className="w-full h-1 bg-surface-container overflow-hidden">
<div className="h-full bg-primary-fixed w-full"></div>
</div>
</div>
</aside>
</div>
</div>
    </>
  );
}
