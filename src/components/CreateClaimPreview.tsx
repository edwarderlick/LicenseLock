"use client";

import { useEffect, useState } from "react";

export default function CreateClaimPreview({ 
  claimData, 
  onBack,
  onSubmit,
  isSubmitting,
  isWaitingForWallet,
  isLocating
}: { 
  claimData: any, 
  onBack?: () => void,
  onSubmit?: () => void,
  isSubmitting?: boolean,
  isWaitingForWallet?: boolean,
  isLocating?: boolean
}) {
  const [fileStatus, setFileStatus] = useState<any>({
    "LICENSE": "checking",
  });

  useEffect(() => {
    let repoClean = claimData.repo.trim();
    repoClean = repoClean.replace(/https?:\/\/github\.com\//, '');
    repoClean = repoClean.replace(/\.git$/, '');

    const baseDir = (claimData.target_directory || "").trim().replace(/^\/+|\/+$/g, "");
    const resolvePath = (p: string) => baseDir ? `${baseDir}/${p}` : p;

    const checkFile = async (path: string) => {
      const fullPath = resolvePath(path);
      try {
        const res = await fetch(`/api/github-preview?repo=${encodeURIComponent(repoClean)}&commit=${encodeURIComponent(claimData.commit)}&path=${encodeURIComponent(fullPath)}`);
        const data = await res.json();
        setFileStatus((prev: any) => ({...prev, [path]: data.status.toUpperCase()}));
      } catch (e) {
        setFileStatus((prev: any) => ({...prev, [path]: "UNAVAILABLE"}));
      }
    };

    if (repoClean && claimData.commit) {
      if (claimData.claimType === "SPDX_MATCH") {
        setFileStatus({ "LICENSE": "checking", "README.md": "checking" });
        checkFile("LICENSE");
        checkFile("README.md");
      } else if (claimData.claimType === "NO_COPYLEFT") {
        setFileStatus({ "LICENSE": "checking", "package.json": "checking", "Cargo.toml": "checking" });
        checkFile("LICENSE");
        checkFile("package.json");
        checkFile("Cargo.toml");
      } else if (claimData.claimType === "ALLOWED_LICENSE_SET" || claimData.claimType === "SEMANTIC_AUDIT") {
        setFileStatus({ "LICENSE": "checking" });
        checkFile("LICENSE");
      }
    }
  }, [claimData.repo, claimData.commit, claimData.claimType, claimData.target_directory]);

  return (
    <div className="flex flex-col w-full max-w-container-max mx-auto px-margin-desktop py-12 gap-8">
      <div className="flex flex-col gap-4 border-b border-outline/20 pb-8">
        <h1 className="font-display-lg text-display-lg text-on-background tracking-tight">CANDIDATE FILES & CONFIG</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          This is a quick check that these files exist. The actual verdict happens on-chain after you lock, and reads these files independently.
        </p>
      </div>

      {claimData.claimType === "SEMANTIC_AUDIT" && claimData.custom_policy_prompt && (
        <div className="bg-primary-fixed/5 border border-primary-fixed/30 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary-fixed">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            <span className="font-label-caps text-label-caps font-bold">AI SEMANTIC AUDIT PROMPT</span>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface bg-surface-container p-3 border border-outline/20">
            "{claimData.custom_policy_prompt}"
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 bg-surface-container-low border border-outline/20 p-8">
        <div className="flex items-center justify-between border-b border-outline/20 pb-4 mb-4">
          <span className="font-label-caps text-label-caps text-on-surface-variant">FILE PATH</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant">STATUS</span>
        </div>
        
        {Object.entries(fileStatus).map(([file, status]: [string, any]) => (
          <div key={file} className="flex items-center justify-between py-2 border-b border-outline/10 hover:bg-surface-container-highest transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">draft</span>
              <span className="font-code-sm text-code-sm text-on-background">{file}</span>
            </div>
            <div className={`px-3 py-1 border ${status === 'FOUND' ? 'bg-primary-container/10 border-primary-container text-primary-fixed' : status === 'NOT_FOUND' ? 'bg-error-container/10 border-error-container text-error' : 'bg-surface border-outline-variant text-on-surface-variant'}`}>
              <span className="font-label-caps text-label-caps">{status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-primary-fixed/20 bg-surface-container-lowest p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed">paid</span>
          <span className="font-code-sm text-code-sm text-on-surface">Protocol Fee: <strong className="text-primary-fixed">2.5%</strong> (Deducted only on PASS)</span>
        </div>
        <span className="font-label-caps text-label-caps text-on-surface-variant">100% REFUND ON FAIL/INSUFFICIENT</span>
      </div>

      <div className="flex items-center justify-end gap-4 mt-8 pt-8 border-t border-outline/20">
        <button onClick={onBack} disabled={isSubmitting} className="px-6 py-3 border border-outline hover:bg-surface-container-highest transition-colors font-label-caps text-label-caps text-on-surface group disabled:opacity-50">
          <span className="group-hover:text-primary-fixed transition-colors">BACK</span>
        </button>
        <button onClick={onSubmit} disabled={isSubmitting} className="bg-primary-fixed text-on-primary-fixed px-8 py-3 font-label-caps text-label-caps hover:bg-primary-fixed-dim transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <span>
            {isWaitingForWallet
              ? "Confirm in Wallet..."
              : isLocating
              ? "Locating Claim..."
              : isSubmitting
              ? "Submitting..."
              : "LOCK ESCROW"}
          </span>
          <span className={`material-symbols-outlined text-[16px] ${isSubmitting ? "animate-spin" : ""}`}>
            {isSubmitting ? "sync" : "lock"}
          </span>
        </button>
      </div>
    </div>
  );
}
