export default function HowItWorks() {
  return (
    <>
<div className="flex flex-col w-full relative">
{/* Grid Background Overlay */}
<div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 border-x border-outline/20 max-w-container-max mx-auto px-margin-desktop w-full flex justify-between">
<div className="w-px h-full bg-outline/20"></div>
<div className="w-px h-full bg-outline/20"></div>
<div className="w-px h-full bg-outline/20"></div>
<div className="w-px h-full bg-outline/20"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden md:block"></div>
<div className="w-px h-full bg-outline/20 hidden lg:block"></div>
<div className="w-px h-full bg-outline/20 hidden lg:block"></div>
<div className="w-px h-full bg-outline/20 hidden lg:block"></div>
</div>
<div className="max-w-container-max mx-auto px-margin-desktop w-full flex flex-col pt-24 pb-32">
{/* Header Section */}
<div className="flex flex-col gap-8 mb-24 border-b border-outline/30 pb-16">
<div className="flex items-center gap-4">
<span className="font-label-caps text-label-caps text-primary-fixed bg-primary-fixed/10 px-3 py-1 border border-primary-fixed">PROTOCOL DOCUMENTATION</span>
<span className="font-code-sm text-code-sm text-on-surface-variant">v1.2.4</span>
</div>
<h1 className="font-display-lg text-display-lg text-on-background uppercase max-w-4xl tracking-tight leading-none">
        How Verification <br/><span className="text-on-surface-variant">Operates</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-4 border-l border-primary-fixed pl-6">
        LicenseLock utilizes deterministic validation protocols to analyze repository metadata and file contents. It translates subjective legal claims into objective, machine-verifiable truths.
      </p>
</div>
{/* Prominent Callout */}
<div className="bg-surface-container border border-error-container relative mb-32 p-8 lg:p-12 group overflow-hidden">
<div className="absolute inset-0 bg-gradient-to-r from-error-container/10 to-transparent pointer-events-none"></div>
<div className="absolute right-0 top-0 h-full w-1 bg-error-container"></div>
<div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
<div className="w-16 h-16 bg-error-container/20 border border-error-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-error text-[32px]">warning</span>
</div>
<div className="flex flex-col gap-4">
<h2 className="font-headline-md text-headline-md text-on-background">Scope Limitation Notice</h2>
<p className="font-body-lg text-body-lg text-on-surface">
                    LicenseLock <span className="text-error font-bold border-b border-error">does not</span> judge code quality, security, or trustworthiness. It only verifies if a repository's license paperwork matches a specific, predefined claim at the time of execution.
                </p>
</div>
</div>
</div>
{/* Claim Types Grid */}
<div className="flex flex-col mb-32">
<div className="flex items-center gap-4 mb-16">
<div className="h-px bg-outline/40 flex-1"></div>
<h2 className="font-headline-lg text-headline-lg text-on-background">Supported Claims</h2>
<div className="h-px bg-outline/40 flex-1"></div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
{/* Claim: SPDX Match */}
<div className="flex flex-col border border-outline/30 bg-surface group hover:border-primary-fixed transition-colors duration-300 relative h-full">
<div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-outline/30 group-hover:border-primary-fixed group-hover:bg-primary-fixed/10 transition-colors duration-300"></div>
<div className="p-6 border-b border-outline/30 bg-surface-container-low">
<div className="font-label-caps text-label-caps text-on-surface-variant mb-2">CLAIM TYPE 01</div>
<h3 className="font-headline-sm text-headline-sm text-on-background">Exact SPDX Match</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-4">
                        Asserts that the repository contains an explicit license declaration matching a specific SPDX identifier (e.g., MIT, Apache-2.0).
                    </p>
</div>
<div className="p-6 flex flex-col gap-6 flex-1">
{/* Pass Case */}
<div className="flex flex-col gap-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span>
<span className="font-label-caps text-label-caps text-on-surface">PASS CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-primary-fixed mb-2">// Repository contains LICENSE file</div>
<span>SPDX-License-Identifier: MIT</span><br/>
<span>Permission is hereby granted...</span>
</div>
</div>
{/* Fail Case */}
<div className="flex flex-col gap-2 mt-auto">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-caps text-label-caps text-on-surface">FAIL CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-error mb-2">// Ambiguous or missing declaration</div>
<span>"Free to use for non-commercial"</span><br/>
<span>[No standard LICENSE file found]</span>
</div>
</div>
</div>
</div>
{/* Claim: No Copyleft */}
<div className="flex flex-col border border-outline/30 bg-surface group hover:border-primary-fixed transition-colors duration-300 relative h-full">
<div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-outline/30 group-hover:border-primary-fixed group-hover:bg-primary-fixed/10 transition-colors duration-300"></div>
<div className="p-6 border-b border-outline/30 bg-surface-container-low">
<div className="font-label-caps text-label-caps text-on-surface-variant mb-2">CLAIM TYPE 02</div>
<h3 className="font-headline-sm text-headline-sm text-on-background">No Copyleft Found</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-4">
                        Scans the repository to ensure no restrictive copyleft licenses (like GPL, AGPL) are present in any detected license files or headers.
                    </p>
</div>
<div className="p-6 flex flex-col gap-6 flex-1">
{/* Pass Case */}
<div className="flex flex-col gap-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span>
<span className="font-label-caps text-label-caps text-on-surface">PASS CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-primary-fixed mb-2">// Only permissive licenses detected</div>
<span>Found: ISC License</span><br/>
<span>Found: BSD-3-Clause</span>
</div>
</div>
{/* Fail Case */}
<div className="flex flex-col gap-2 mt-auto">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-caps text-label-caps text-on-surface">FAIL CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-error mb-2">// Copyleft license detected in subdirectory</div>
<span>src/vendor/lib-x/LICENSE</span><br/>
<span>SPDX-License-Identifier: GPL-3.0</span>
</div>
</div>
</div>
</div>
{/* Claim: Allowed Set */}
<div className="flex flex-col border border-outline/30 bg-surface group hover:border-primary-fixed transition-colors duration-300 relative h-full">
<div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-outline/30 group-hover:border-primary-fixed group-hover:bg-primary-fixed/10 transition-colors duration-300"></div>
<div className="p-6 border-b border-outline/30 bg-surface-container-low">
<div className="font-label-caps text-label-caps text-on-surface-variant mb-2">CLAIM TYPE 03</div>
<h3 className="font-headline-sm text-headline-sm text-on-background">Allowed License Set</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-4">
                        Validates that all detected licenses within the repository belong to a predefined, user-specified allowlist.
                    </p>
</div>
<div className="p-6 flex flex-col gap-6 flex-1">
{/* Pass Case */}
<div className="flex flex-col gap-2">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span>
<span className="font-label-caps text-label-caps text-on-surface">PASS CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-primary-fixed mb-2">Allowlist: [MIT, Apache-2.0]</div>
<span>Detected: MIT (root)</span><br/>
<span>Detected: Apache-2.0 (lib/)</span>
</div>
</div>
{/* Fail Case */}
<div className="flex flex-col gap-2 mt-auto">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-error"></span>
<span className="font-label-caps text-label-caps text-on-surface">FAIL CONDITION</span>
</div>
<div className="bg-surface-container border border-outline/20 p-4 font-code-sm text-code-sm text-on-surface-variant break-all">
<div className="text-error mb-2">Allowlist: [MIT, Apache-2.0]</div>
<span>Detected: MIT (root)</span><br/>
<span><span className="text-error font-bold">Detected: BSD-2-Clause (utils/)</span></span>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Flow Explanation */}
<div className="flex flex-col relative border border-outline/30 bg-surface-container-lowest overflow-hidden">
{/* Decorative bg elements */}
<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-fixed/50 to-transparent"></div>
<div className="absolute -right-32 -top-32 w-96 h-96 bg-primary-fixed/5 rounded-full blur-[100px] pointer-events-none"></div>
<div className="p-12 border-b border-outline/30 flex justify-between items-end">
<h2 className="font-headline-lg text-headline-lg text-on-background">Verification Pipeline</h2>
<span className="font-code-sm text-code-sm text-on-surface-variant hidden md:block">STATUS_STATE_MACHINE</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline/30">
{/* Step 1 */}
<div className="p-12 relative group">
<div className="w-8 h-8 bg-surface border border-outline/50 flex items-center justify-center font-code-sm text-code-sm text-on-surface mb-8">01</div>
<div className="flex items-center gap-3 mb-4">
<span className="w-3 h-3 bg-surface-variant border border-outline rounded-sm"></span>
<h4 className="font-headline-sm text-headline-sm text-on-background uppercase tracking-tight">Pending</h4>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    A claim is submitted to the network. It awaits pickup by verification nodes. During this phase, the claim parameters are locked into the ledger.
                </p>
{/* Terminal decorative */}
<div className="mt-8 bg-background border border-outline/20 p-3 font-code-sm text-code-sm text-on-surface-variant opacity-50 group-hover:opacity-100 transition-opacity">
                    &gt; status: queued<br/>
                    &gt; nodes_assigned: 0
                </div>
</div>
{/* Step 2 */}
<div className="p-12 relative group bg-surface-container-low">
<div className="w-8 h-8 bg-surface border border-primary-fixed flex items-center justify-center font-code-sm text-code-sm text-primary-fixed mb-8">02</div>
<div className="flex items-center gap-3 mb-4">
<span className="w-3 h-3 bg-primary-fixed border border-primary-fixed rounded-sm animate-pulse"></span>
<h4 className="font-headline-sm text-headline-sm text-on-background uppercase tracking-tight">Judging</h4>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Nodes actively fetch the repository data, parse license files, and execute the logic defined by the claim type. Consensus is being formed.
                </p>
{/* Terminal decorative */}
<div className="mt-8 bg-background border border-outline/20 p-3 font-code-sm text-code-sm text-primary-fixed opacity-80 group-hover:opacity-100 transition-opacity">
                    &gt; status: executing<br/>
                    &gt; fetching_repo_tree...<br/>
                    &gt; parsing_blob_spdx...
                </div>
</div>
{/* Step 3 */}
<div className="p-12 relative group">
<div className="w-8 h-8 bg-surface border border-outline/50 flex items-center justify-center font-code-sm text-code-sm text-on-surface mb-8">03</div>
<div className="flex items-center gap-3 mb-4">
<span className="w-3 h-3 bg-inverse-primary border border-outline rounded-sm"></span>
<h4 className="font-headline-sm text-headline-sm text-on-background uppercase tracking-tight">Resolved</h4>
</div>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Consensus is reached. The claim is permanently recorded as either True (Pass) or False (Fail), along with cryptographic proof of the execution.
                </p>
{/* Terminal decorative */}
<div className="mt-8 bg-background border border-outline/20 p-3 font-code-sm text-code-sm text-on-surface-variant opacity-50 group-hover:opacity-100 transition-opacity">
                    &gt; consensus: reached<br/>
                    &gt; block_hash: 0x8f4a...<br/>
                    &gt; final_state: sealed
                </div>
</div>
</div>
</div>
</div>
</div>
    </>
  );
}
