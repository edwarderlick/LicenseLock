"use client";

export default function ClaimPending({ 
  claim, 
  onResolve, 
  onCancel,
  isResolving, 
  isCanceling,
  isWaitingForWallet, 
  account 
}: { 
  claim: any, 
  onResolve: () => void, 
  onCancel?: () => void,
  isResolving: boolean, 
  isCanceling?: boolean,
  isWaitingForWallet?: boolean, 
  account: string | null 
}) {
  const funderAddr = String(claim.funder || "").toLowerCase().trim();
  const recipientAddr = String(claim.recipient || "").toLowerCase().trim();
  const connectedAddr = String(account || "").toLowerCase().trim();
  
  const isFunder = connectedAddr && connectedAddr === funderAddr;
  const isRecipient = connectedAddr && connectedAddr === recipientAddr;
  const isAuthorized = isFunder || isRecipient;

  const amountDisplay = (Number(claim.amount) / 10**18).toString();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Header Section */}
      <section className="w-full bg-surface-container-lowest border-b border-outline/20 relative overflow-hidden">
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }}
        />
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-secondary-container/15 text-secondary border border-secondary/40 font-label-caps text-label-caps uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                State: Open / Pending Resolution
              </span>
              <span className="font-code-sm text-code-sm text-on-surface-variant px-3 py-1 bg-surface-dim border border-outline/20">
                ID: {claim.id}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight break-words">
              {claim.repo}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant border-l-2 border-primary-fixed/40 pl-4 py-1">
              Funds are securely locked in the smart contract escrow. Run decentralized consensus resolution to evaluate license compliance and trigger automated payout.
            </p>
          </div>

          {/* Top Escrow & Action Card */}
          <div className="md:w-88 w-full shrink-0 bg-surface border border-outline/30 p-6 flex flex-col relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-fixed" />
            <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 flex items-center justify-between">
              <span>Locked Escrow</span>
              <span className="material-symbols-outlined text-[18px] text-primary-fixed">lock</span>
            </span>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
                {amountDisplay}
              </span>
              <span className="font-code-sm text-code-sm text-primary-fixed font-semibold">GEN</span>
            </div>

            {/* Quick Action Button */}
            <button 
              onClick={onResolve} 
              disabled={isResolving || isCanceling} 
              className="w-full bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm py-4 px-6 font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary-fixed-dim transition-all shadow-[0_0_20px_rgba(212,240,0,0.25)] hover:shadow-[0_0_25px_rgba(212,240,0,0.4)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>
                {isWaitingForWallet 
                  ? "Confirm in Wallet..." 
                  : isResolving 
                  ? "Resolving..." 
                  : "Resolve Claim"}
              </span>
              <span className={`material-symbols-outlined text-[18px] ${isResolving ? "animate-spin" : ""}`}>
                {isResolving ? "sync" : "gavel"}
              </span>
            </button>

            {/* Cancel & Refund Action for Funder */}
            {isFunder && claim.state === "OPEN" && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isCanceling || isResolving}
                className="w-full bg-error-container/15 text-error border border-error/40 hover:bg-error-container/30 hover:border-error font-code-sm text-code-sm py-3 px-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                <span>{isCanceling ? "Canceling & Refunding..." : "Cancel & Refund Escrow"}</span>
                <span className={`material-symbols-outlined text-[16px] ${isCanceling ? "animate-spin" : ""}`}>
                  {isCanceling ? "sync" : "cancel"}
                </span>
              </button>
            )}

            <div className="mt-3 text-center">
              <span className="font-code-sm text-[11px] text-on-surface-variant/80">
                {isAuthorized 
                  ? (isFunder ? "✓ Connected as Funder" : "✓ Connected as Recipient")
                  : account 
                  ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Connect wallet to resolve or cancel"}
              </span>
            </div>
          </div>
        </div>
      </section>


      {/* Main Content Area */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 w-full flex flex-col lg:flex-row gap-10">
        {/* Left Column: Action Hub & Details */}
        <div className="flex-1 flex flex-col gap-10">
          
          {/* PRIMARY RESOLUTION BANNER */}
          <section className="bg-gradient-to-r from-surface-container to-surface-container-high border-2 border-primary-fixed/60 p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(212,240,0,0.15)]">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[120px] text-primary-fixed">gavel</span>
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-fixed animate-ping" />
                <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-widest font-bold">
                  Action Required
                </span>
              </div>

              <h2 className="font-headline-md text-headline-md text-on-surface">
                Trigger Consensus Resolution
              </h2>

              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Clicking <strong>Resolve Claim</strong> submits a non-deterministic verification transaction. GenLayer validators will fetch the repository at commit <code className="text-primary-fixed bg-surface-dim px-1.5 py-0.5 border border-outline-variant/30">{claim.commit?.slice(0, 7)}</code>, inspect license manifests, compare evidence, and finalize escrow settlement.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button 
                  onClick={onResolve} 
                  disabled={isResolving} 
                  className="bg-primary-fixed text-on-primary-fixed font-code-sm text-code-sm py-4 px-8 font-bold uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-primary-fixed-dim transition-all shadow-[0_0_25px_rgba(212,240,0,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isResolving ? "animate-spin" : ""}`}>
                    {isResolving ? "sync" : "play_arrow"}
                  </span>
                  <span>
                    {isWaitingForWallet 
                      ? "Confirm in Wallet..." 
                      : isResolving 
                      ? "Executing Resolution On-Chain..." 
                      : "EXECUTE RESOLUTION NOW"}
                  </span>
                </button>

                {isAuthorized && (
                  <span className="font-code-sm text-code-sm text-primary-fixed flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Authorized to resolve
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Parameters Section */}
          <section className="flex flex-col">
            <div className="flex items-center gap-4 mb-6 pb-2 border-b border-outline/20">
              <span className="material-symbols-outlined text-primary-fixed">data_object</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface m-0">Claim Parameters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <div className="flex flex-col py-4 border-b border-outline/20">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Target Repository</span>
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-code-sm text-on-surface">{claim.repo}</span>
                  <a 
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary-fixed text-[18px]" 
                    href={`https://github.com/${claim.repo}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    open_in_new
                  </a>
                </div>
              </div>

              <div className="flex flex-col py-4 border-b border-outline/20">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Target Commit</span>
                <div className="flex items-center justify-between">
                  <span className="font-code-sm text-code-sm text-on-surface bg-surface-variant/50 px-2 py-0.5 border border-outline/20">
                    {claim.commit}
                  </span>
                  <a 
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary-fixed text-[18px]" 
                    href={`https://github.com/${claim.repo}/commit/${claim.commit}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    open_in_new
                  </a>
                </div>
              </div>

              <div className="flex flex-col py-4 border-b border-outline/20">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Claim Type</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  {claim.claim_type === 'SPDX_MATCH' ? 'SPDX License Identifier Match' : 
                   claim.claim_type === 'NO_COPYLEFT' ? 'No Copyleft Licenses' : 
                   claim.claim_type === 'ALLOWED_LICENSE_SET' ? 'Allowed Licenses Set' : 
                   claim.claim_type === 'SEMANTIC_AUDIT' ? 'Semantic AI Audit (GenVM LLM)' : 
                   claim.claim_type}
                </span>
              </div>

              <div className="flex flex-col py-4 border-b border-outline/20">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Expected Criteria</span>
                <span className="font-code-sm text-code-sm text-on-surface">
                  {claim.claim_type === 'SPDX_MATCH' ? 'README and LICENSE must match' : 
                   claim.claim_type === 'NO_COPYLEFT' ? 'No GPL/AGPL/LGPL in LICENSE or manifest' : 
                   claim.claim_type === 'ALLOWED_LICENSE_SET' ? (
                     claim.allowed_licenses_json ? JSON.parse(claim.allowed_licenses_json).join(" OR ") : "Configured Set"
                   ) : claim.claim_type === 'SEMANTIC_AUDIT' ? (
                     claim.custom_policy_prompt ? `"${claim.custom_policy_prompt}"` : "AI Legal Policy Conformance"
                   ) : "N/A"}
                </span>
              </div>

              {claim.target_directory && (
                <div className="flex flex-col py-4 border-b border-outline/20">
                  <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">Target Directory / Subdir</span>
                  <span className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 border border-primary-fixed/20 inline-block w-fit">
                    {claim.target_directory}
                  </span>
                </div>
              )}

              {claim.custom_policy_prompt && (
                <div className="flex flex-col py-4 border-b border-outline/20 md:col-span-2 bg-primary-fixed/5 px-4 my-2 border-l-2 border-primary-fixed">
                  <span className="font-label-caps text-label-caps text-primary-fixed mb-1 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">psychology</span>
                    Custom Policy Requirement (AI Prompt)
                  </span>
                  <p className="font-code-sm text-code-sm text-on-surface">
                    "{claim.custom_policy_prompt}"
                  </p>
                </div>
              )}
            </div>
          </section>



          {/* Ledger Section */}
          <section className="flex flex-col">
            <div className="flex items-center gap-4 mb-6 pb-2 border-b border-outline/20">
              <span className="material-symbols-outlined text-primary-fixed">receipt_long</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface m-0">Transaction Ledger</h2>
            </div>
            <div className="flex flex-col w-full border border-outline/20 bg-surface">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-outline/20 bg-surface-container-low">
                <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant">Role</div>
                <div className="col-span-6 font-label-caps text-label-caps text-on-surface-variant">Address</div>
                <div className="col-span-3 text-right font-label-caps text-label-caps text-on-surface-variant">Status</div>
              </div>

              <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-outline/20 hover:bg-surface-variant/30 transition-colors">
                <div className="col-span-3 font-body-md text-body-md text-on-surface">Funder</div>
                <div className="col-span-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-sm bg-surface-variant border border-outline/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">person</span>
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface truncate">{claim.funder}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="font-code-sm text-code-sm text-primary-fixed">Escrow Deposited</span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-outline/20 hover:bg-surface-variant/30 transition-colors">
                <div className="col-span-3 font-body-md text-body-md text-on-surface">Recipient</div>
                <div className="col-span-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-sm bg-surface-variant border border-outline/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">account_balance_wallet</span>
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface truncate">{claim.recipient}</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="font-code-sm text-code-sm text-on-surface-variant">Beneficiary</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Evidence Placeholder */}
        <div className="lg:w-96 w-full shrink-0 flex flex-col gap-8">
          <div className="border border-outline/30 bg-surface-container-low p-8 flex flex-col items-center justify-center text-center min-h-[340px] relative overflow-hidden">
            <div className="w-16 h-16 mb-6 rounded-full border border-outline/30 bg-surface flex items-center justify-center relative">
              <span className="material-symbols-outlined text-primary-fixed text-[28px]">policy</span>
              <div className="absolute inset-0 rounded-full border border-dashed border-primary-fixed/60 animate-[spin_10s_linear_infinite]" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Evidence Report</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              The cryptographic evidence report will be generated and immutably written to chain as soon as consensus resolution is executed.
            </p>
            <div className="mt-6 flex items-center gap-2 px-3 py-1.5 bg-surface border border-outline/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
              <span className="font-code-sm text-code-sm text-on-surface-variant">Awaiting Resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

