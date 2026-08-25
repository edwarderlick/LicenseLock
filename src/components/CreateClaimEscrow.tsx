import { useState } from "react";

export default function CreateClaimEscrow({ 
  claimData, 
  setClaimData, 
  onNext, 
  onBack 
}: { 
  claimData: any, 
  setClaimData: any, 
  onNext?: () => void, 
  onBack?: () => void 
}) {
  const [newLicense, setNewLicense] = useState("");

  const handleAddLicense = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newLicense.trim() !== '') {
      e.preventDefault();
      const trimmed = newLicense.trim().toUpperCase();
      if (!claimData.allowed_licenses.includes(trimmed)) {
        setClaimData({
          ...claimData,
          allowed_licenses: [...claimData.allowed_licenses, trimmed]
        });
      }
      setNewLicense("");
    }
  };

  const removeLicense = (licenseToRemove: string) => {
    setClaimData({
      ...claimData,
      allowed_licenses: claimData.allowed_licenses.filter((l: string) => l !== licenseToRemove)
    });
  };

  const [formError, setFormError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setClaimData({ ...claimData, recipient: text.trim() });
        setFormError(null);
      }
    } catch (err) {
      console.warn("Clipboard paste failed:", err);
    }
  };

  const handleProceed = () => {
    const recipient = claimData.recipient.trim();
    if (!recipient) {
      setFormError("Recipient address is required.");
      return;
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      setFormError("Recipient address must be a valid 42-character EVM address (e.g. 0x1234...).");
      return;
    }

    const amount = parseFloat(claimData.amount);
    if (isNaN(amount) || amount <= 0) {
      setFormError("Escrow amount must be greater than 0 GEN.");
      return;
    }

    if (claimData.claimType === "ALLOWED_LICENSE_SET" && (!claimData.allowed_licenses || claimData.allowed_licenses.length === 0)) {
      setFormError("Please add at least one allowed SPDX license.");
      return;
    }

    setFormError(null);
    if (onNext) onNext();
  };

  return (
    <>
<div className="flex flex-col w-full h-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-margin-desktop">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-full">
{/* Left Column: Wizard & Form */}
<div className="lg:col-span-8 flex flex-col justify-between h-full border-r border-outline-variant/30 pr-0 lg:pr-margin-desktop relative">
<div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-primary-fixed/20 to-transparent hidden lg:block"></div>
<div>
{/* Wizard Header */}
<div className="flex items-center justify-between mb-12 pb-4 border-b border-outline-variant/50">
<div className="flex items-center gap-4">
<span className="font-code-sm text-code-sm text-tertiary-fixed-dim bg-surface-container-high px-3 py-1 border border-outline-variant/30">03</span>
<h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">Escrow &amp; Recipient Configuration</h1>
</div>
<div className="flex gap-2">
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
<div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse shadow-[0_0_10px_rgba(212,240,0,0.5)]"></div>
<div className="w-2 h-2 rounded-full bg-outline-variant"></div>
</div>
</div>

{formError && (
  <div className="mb-6 p-4 bg-error/15 border border-error text-error font-code-sm text-code-sm flex items-center gap-2">
    <span className="material-symbols-outlined text-[18px]">error</span>
    <span>{formError}</span>
  </div>
)}

{/* Form Section */}
<div className="space-y-10">
{/* Escrow Amount */}
<div className="space-y-4 relative group">
<div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-fixed opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
<label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-primary-fixed/70">paid</span>
              Escrow Amount (GEN)
            </label>
<div className="relative">
<input 
  className="w-full bg-surface-container-low border border-outline-variant text-on-surface font-code-sm text-code-sm p-4 outline-none focus:border-primary-fixed focus:bg-surface-container transition-all" 
  min="0" 
  placeholder="0.00" 
  step="0.01" 
  type="number"
  value={claimData.amount}
  onChange={(e) => {
    setClaimData({...claimData, amount: e.target.value});
    setFormError(null);
  }}
/>
<div className="absolute right-4 top-1/2 -translate-y-1/2 font-code-sm text-code-sm text-on-surface-variant/50 pointer-events-none">GEN</div>
</div>
<p className="font-code-sm text-code-sm text-on-surface-variant/70 text-xs">This amount will be locked in the smart contract until the claim is resolved.</p>
</div>
{/* Recipient Address */}
<div className="space-y-4 relative group">
<div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-fixed opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
<label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-primary-fixed/70">account_balance_wallet</span>
              Recipient Address
            </label>
<div className="relative">
<input 
  className="w-full bg-surface-container-low border border-outline-variant text-on-surface font-code-sm text-code-sm p-4 pr-12 outline-none focus:border-primary-fixed focus:bg-surface-container transition-all" 
  placeholder="0x..." 
  type="text"
  value={claimData.recipient}
  onChange={(e) => {
    setClaimData({...claimData, recipient: e.target.value});
    setFormError(null);
  }}
/>
<button 
  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary-fixed transition-colors" 
  title="Paste from clipboard" 
  type="button"
  onClick={handlePaste}
>
<span className="material-symbols-outlined text-[20px]">content_paste</span>
</button>
</div>
<p className="font-code-sm text-code-sm text-on-surface-variant/70 text-xs">The 0x address that will receive the escrowed funds if the claim status evaluates to PASSED.</p>
</div>
</div>
</div>
{/* Action Button */}
<div className="mt-16 pt-8 border-t border-outline-variant/30 flex justify-between">
<button onClick={onBack} className="px-6 py-3 border border-outline hover:bg-surface-container-highest transition-colors font-label-caps text-label-caps text-on-surface group">
<span className="group-hover:text-primary-fixed transition-colors">BACK</span>
</button>
<button onClick={handleProceed} className="group flex items-center gap-3 bg-primary-fixed text-on-primary-fixed px-8 py-4 font-label-caps text-label-caps uppercase tracking-wider hover:bg-primary-fixed-dim transition-all shadow-[4px_4px_0px_0px_rgba(212,240,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(212,240,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
          Review Candidate Files
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
</div>
</div>
{/* Right Column: Summary Context */}
<div className="lg:col-span-4 mt-12 lg:mt-0 pl-0 lg:pl-margin-desktop relative">
<div className="sticky top-24">
<h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-6 flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">data_object</span>
           Claim Context
        </h3>
<div className="bg-surface-container border border-outline-variant/50 p-6 space-y-6 relative overflow-hidden">
{/* Decorative corner accents */}
<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-fixed/50"></div>
<div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-fixed/50"></div>
<div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-fixed/50"></div>
<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-fixed/50"></div>
{/* Summary Items */}
<div>
<span className="block font-label-caps text-label-caps text-on-surface-variant/60 mb-1">Claim Type</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-primary-fixed">gavel</span>
<span className="font-code-sm text-code-sm text-on-surface font-semibold">{claimData.claimType === 'SPDX_MATCH' ? 'SPDX Match' : claimData.claimType}</span>
</div>
</div>
<div className="w-full h-px bg-outline-variant/30"></div>
<div>
<span className="block font-label-caps text-label-caps text-on-surface-variant/60 mb-1">Target Repository</span>
<div className="flex items-center gap-2 break-all">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder_data</span>
<span className="font-code-sm text-code-sm text-on-surface">{claimData.repo || 'github.com/example/proprietary-core'}</span>
</div>
</div>
<div className="w-full h-px bg-outline-variant/30"></div>
<div>
<span className="block font-label-caps text-label-caps text-on-surface-variant/60 mb-1">Target Commit</span>
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px] text-on-surface-variant">commit</span>
<span className="font-code-sm text-code-sm text-on-surface bg-surface-container-high px-2 py-0.5 border border-outline-variant/30">{claimData.commit ? claimData.commit.substring(0, 7) : 'a1b2c3d4'}</span>
</div>
</div>
</div>
{/* Decorative Tech Graphic */}
<div className="mt-8 opacity-20 pointer-events-none">
<svg className="w-full h-24 stroke-primary-fixed fill-none" preserveAspectRatio="none" viewBox="0 0 100 100">
<path className="animate-[dash_3s_linear_infinite]" d="M0,50 Q25,20 50,50 T100,50" strokeDasharray="4 4" strokeWidth="0.5"></path>
<path className="animate-[dash_5s_linear_infinite_reverse]" d="M0,70 Q25,90 50,70 T100,70" strokeDasharray="2 4" strokeWidth="0.2"></path>
<rect className="animate-pulse" fill="currentColor" height="10" width="4" x="10" y="45"></rect>
<rect className="animate-pulse delay-75" fill="currentColor" height="10" width="4" x="80" y="65"></rect>
</svg>
</div>
</div>

{/* Allowed Licenses (Only if ALLOWED_LICENSE_SET) */}
{claimData.claimType === 'ALLOWED_LICENSE_SET' && (
  <div className="space-y-4 relative group mt-8">
    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-fixed opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
    <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px] text-primary-fixed/70">playlist_add_check</span>
      Allowed Licenses
    </label>
    <div className="relative border border-outline-variant bg-surface-container-low p-4 focus-within:border-primary-fixed transition-all">
      <div className="flex flex-wrap gap-2 mb-2">
        {claimData.allowed_licenses?.map((license: string) => (
          <div key={license} className="flex items-center gap-1 bg-surface-container-high border border-outline-variant px-2 py-1 font-code-sm text-code-sm text-on-surface">
            {license}
            <button 
              type="button" 
              onClick={() => removeLicense(license)}
              className="text-on-surface-variant hover:text-error transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        ))}
      </div>
      <input 
        className="w-full bg-transparent text-on-surface font-code-sm text-code-sm outline-none placeholder-on-surface-variant/50" 
        placeholder="Type SPDX ID (e.g. MIT) and press Enter" 
        type="text"
        value={newLicense}
        onChange={(e) => setNewLicense(e.target.value)}
        onKeyDown={handleAddLicense}
      />
    </div>
    <p className="font-code-sm text-code-sm text-on-surface-variant/70 text-xs">Enter exactly matched SPDX identifiers. Press enter to add.</p>
  </div>
)}

</div>
</div>
</div>
<style>{`
  @keyframes dash {
    to { strokeDashoffset: -8; }
  }
`}</style>
    </>
  );
}
