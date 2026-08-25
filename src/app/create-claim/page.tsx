"use client";

import { useState } from "react";
import CreateClaimSetup from "@/components/CreateClaimSetup";
import CreateClaimPreview from "@/components/CreateClaimPreview";
import CreateClaimEscrow from "@/components/CreateClaimEscrow";
import { useGenLayer } from "@/components/GenLayerProvider";
import { useRouter } from "next/navigation";

// Helper to safely serialize objects containing BigInt values without crashing
const safeJsonStringify = (obj: any, space = 2): string => {
  try {
    return JSON.stringify(
      obj,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value),
      space
    );
  } catch (err) {
    return String(obj);
  }
};

export default function CreateClaim() {
  const [step, setStep] = useState(1);
  const { client, account } = useGenLayer();
  const router = useRouter();

  const [claimData, setClaimData] = useState({
    repo: "",
    commit: "",
    claimType: "SPDX_MATCH",
    amount: "0.00",
    recipient: "",
    allowed_licenses: [] as string[],
    target_directory: "",
    custom_policy_prompt: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Pre-flight input validation ─────────────────────────────────────────
  const validateInputs = (): string | null => {
    const recipient = claimData.recipient.trim();
    if (!recipient) {
      return "Recipient address is required.";
    }
    if (!/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      return "Recipient address must be a valid 42-character EVM address (starting with 0x).";
    }

    const amount = parseFloat(claimData.amount);
    if (isNaN(amount) || amount <= 0) {
      return "Escrow amount must be greater than 0.";
    }

    const repo = claimData.repo.trim();
    if (!repo) {
      return "Repository cannot be empty.";
    }

    const commit = claimData.commit.trim();
    if (!commit) {
      return "Commit hash cannot be empty.";
    }

    if (claimData.claimType === "ALLOWED_LICENSE_SET" && claimData.allowed_licenses.length === 0) {
      return "Please specify at least one allowed SPDX license.";
    }

    return null;
  };


  const handleSubmit = async () => {
    if (!client || !account) {
      setError("Please connect your wallet first.");
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setIsWaitingForWallet(true);
      setError(null);

      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address missing in environment variables.");

      // Clean github repo url
      let repoClean = claimData.repo.trim();
      repoClean = repoClean.replace(/https?:\/\/github\.com\//, '');
      repoClean = repoClean.replace(/\.git$/, '');
      const commitClean = claimData.commit.trim();
      const recipientAddress = (claimData.recipient.trim().toLowerCase().startsWith("0x")
        ? claimData.recipient.trim()
        : `0x${claimData.recipient.trim()}`) as `0x${string}`;

      // Guaranteed 5th argument: always an array (e.g. [] for SPDX_MATCH / NO_COPYLEFT)
      const allowedLicenses: string[] = Array.isArray(claimData.allowed_licenses)
        ? claimData.allowed_licenses
        : [];

      // Clean target directory
      const targetDirClean = (claimData.target_directory || "").trim().replace(/^\/+|\/+$/g, "");

      // Safe decimal to 18-decimal wei conversion without floating point distortion
      const [whole = "0", fraction = ""] = claimData.amount.trim().split(".");
      const paddedFraction = fraction.padEnd(18, "0").slice(0, 18);
      const valueWei = BigInt(whole || "0") * BigInt(10 ** 18) + BigInt(paddedFraction || "0");

      console.log("Submitting TX with args:", {
        repo: repoClean,
        commit: commitClean,
        recipient: recipientAddress,
        claimType: claimData.claimType,
        allowedLicenses,
        targetDirectory: targetDirClean,
        value: valueWei.toString(),
      });

      const txHash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: "create_claim",
        args: [
          repoClean,
          commitClean,
          recipientAddress,
          claimData.claimType,
          allowedLicenses,
          targetDirClean,
        ],
        value: valueWei,
      });



      // Wallet signed — now waiting for on-chain confirmation
      setIsWaitingForWallet(false);

      console.log("[LicenseLock] Tx submitted! Hash:", txHash);

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED",
      });

      console.log("Raw TX Receipt:", safeJsonStringify(receipt));

      // ── Check Transaction Status ──────────────────────────────────────────
      const leaderReceipt = receipt?.consensus_data?.leader_receipt?.[0];
      const execResult = leaderReceipt?.execution_result;
      const receiptError = leaderReceipt?.error;

      if (execResult === "ERROR" || execResult === "FAILED" || receiptError) {
        console.error("[LicenseLock] Transaction execution failed on-chain:", receiptError || execResult, safeJsonStringify(leaderReceipt));
        throw new Error(`Transaction failed on-chain: ${receiptError || execResult}. Check your inputs and GEN balance.`);
      }

      // ── Step 1: Attempt Receipt Extraction ────────────────────────────────
      let claimId: string | null = null;

      try {
        const leaderResult = leaderReceipt?.result;
        console.log("[LicenseLock] leader_receipt[0].result =", safeJsonStringify(leaderResult));

        if (leaderResult) {
          if (typeof leaderResult === "string") {
            claimId = leaderResult.replace(/^['"]+|['"]+$/g, "").trim();
          } else if (typeof leaderResult === "object") {
            const payload = (leaderResult as any).payload;
            console.log("[LicenseLock] result.payload =", safeJsonStringify(payload));

            if (typeof payload === "string") {
              claimId = payload.replace(/^['"]+|['"]+$/g, "").trim();
            } else if (payload && typeof payload === "object") {
              const readable = (payload as any).readable ?? (payload as any)[0]?.readable;
              if (typeof readable === "string") {
                claimId = readable.replace(/^['"]+|['"]+$/g, "").trim();
              }
            }
          }
        }

        if (claimId) {
          console.log("[LicenseLock] Extracted claim_id from receipt:", claimId);
        } else {
          console.warn("[LicenseLock] Could not extract claim_id from receipt — proceeding to state fallback.");
        }
      } catch (receiptErr) {
        console.warn("[LicenseLock] Error during receipt parse:", receiptErr);
      }

      // ── Step 2: Fallback to list_claim_ids() + get_claim() ────────────────
      if (!claimId) {
        setIsLocating(true);
        console.log("[LicenseLock] Fallback: querying list_claim_ids from contract...");

        try {
          const ids: string[] = await client.readContract({
            address: contractAddress as `0x${string}`,
            functionName: "list_claim_ids",
            args: [],
          });
          console.log("[LicenseLock] list_claim_ids returned:", ids);

          if (ids && Array.isArray(ids) && ids.length > 0) {
            // Check the last 10 claims in reverse order
            const recentIds = ids.slice(-10).reverse();
            for (const id of recentIds) {
              try {
                const claimInfo: any = await client.readContract({
                  address: contractAddress as `0x${string}`,
                  functionName: "get_claim",
                  args: [id],
                });

                console.log(`[LicenseLock] Checking claim ${id}:`, safeJsonStringify(claimInfo));

                const matchRepo = String(claimInfo?.repo || "").toLowerCase().trim() === repoClean.toLowerCase().trim();
                const claimCommit = String(claimInfo?.commit || "").toLowerCase().trim();
                const targetCommit = commitClean.toLowerCase().trim();
                const matchCommit = claimCommit === targetCommit ||
                                    targetCommit.startsWith(claimCommit) ||
                                    claimCommit.startsWith(targetCommit);

                if (matchRepo && matchCommit) {
                  claimId = id;
                  console.log("[LicenseLock] Found matching claim on-chain:", claimId);
                  break;
                }
              } catch (readErr) {
                console.error(`[LicenseLock] get_claim(${id}) read error:`, readErr);
              }
            }

            // If exact match loop didn't find it, use the newest ID
            if (!claimId) {
              claimId = ids[ids.length - 1];
              console.warn("[LicenseLock] Fallback: using latest ID in list:", claimId);
            }
          } else {
            console.warn("[LicenseLock] list_claim_ids returned empty or non-array:", ids);
          }
        } catch (listErr) {
          console.error("[LicenseLock] list_claim_ids RPC read failed:", listErr);
        }
      }

      if (!claimId) {
        throw new Error("Could not locate newly created claim ID. Please check the Browse Claims page.");
      }

      console.log("[LicenseLock] Successfully resolved Claim ID:", claimId, "-> Navigating to /claim/" + claimId);
      router.push(`/claim/${claimId}`);
    } catch (err: any) {
      console.error("[LicenseLock] Create claim submission error:", err);
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED' || err?.message?.includes('rejected')) {
        setError("Transaction rejected. You cancelled the request in your wallet.");
      } else {
        setError(err.message || "Transaction failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setIsWaitingForWallet(false);
      setIsLocating(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-4rem)] relative bg-background">
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-error/20 border border-error text-error px-4 py-2">
          {error}
        </div>
      )}

      {step === 1 && (
        <CreateClaimSetup 
          claimData={claimData}
          setClaimData={setClaimData}
          onNext={() => setStep(2)} 
        />
      )}
      {step === 2 && (
        <CreateClaimEscrow 
          claimData={claimData}
          setClaimData={setClaimData}
          onNext={() => setStep(3)} 
          onBack={() => setStep(1)} 
        />
      )}
      {step === 3 && (
        <CreateClaimPreview 
          claimData={claimData}
          onBack={() => setStep(2)} 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isWaitingForWallet={isWaitingForWallet}
          isLocating={isLocating}
        />
      )}
    </div>
  );
}
