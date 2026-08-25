"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useGenLayer } from "@/components/GenLayerProvider";
import ClaimPending from "@/components/ClaimPending";
import ClaimResolved from "@/components/ClaimResolved";

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

export default function ClaimDetail({ params }: { params?: { id?: string } }) {
  const routeParams = useParams();
  const rawId = (routeParams?.id as string) || params?.id || "";
  const id = decodeURIComponent(rawId).replace(/['"]/g, "").trim();

  const { client, account } = useGenLayer();
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isWaitingForWallet, setIsWaitingForWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaim = async () => {
    if (!client || !id) return;
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        throw new Error("Contract address (NEXT_PUBLIC_CONTRACT_ADDRESS) missing in environment variables.");
      }

      console.log(`[LicenseLock] Fetching claim "${id}" from ${contractAddress}...`);

      const data: any = await client.readContract({
        address: contractAddress as `0x${string}`,
        functionName: "get_claim",
        args: [id],
      });

      console.log(`[LicenseLock] get_claim("${id}") result:`, safeJsonStringify(data));
      
      if (data && data.claim_type === "SEMANTIC_AUDIT") {
        setClaim(null);
        setError(`Claim "${id}" is unsupported or legacy.`);
        return;
      }

      setClaim(data);
      setError(null);
    } catch (err: any) {
      console.warn(`[LicenseLock] Error fetching claim "${id}":`, err);
      const errMsg = err?.message || err?.details || err?.shortMessage || String(err);
      if (!claim) {
        setError(`Failed to fetch claim "${id}": ${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchClaim();
    // Setup polling for updates every 6s (only if claim is still OPEN)
    const interval = setInterval(() => {
      if (!isResolving && !isCanceling && claim?.state === "OPEN") {
        fetchClaim();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [client, id, isResolving, isCanceling, claim?.state]);

  const handleCancel = async () => {
    if (!client || !account) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!id) {
      setError("Invalid claim ID.");
      return;
    }

    try {
      setIsCanceling(true);
      setIsWaitingForWallet(true);
      setError(null);
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address missing in environment variables.");

      console.log(`[LicenseLock] Canceling claim "${id}"...`);
      const txHash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: "cancel_claim",
        args: [id],
      });
      setIsWaitingForWallet(false);

      console.log(`[LicenseLock] Cancel tx submitted: ${txHash}. Waiting for confirmation...`);
      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED"
      });

      console.log("[LicenseLock] Cancel receipt:", receipt);
      await fetchClaim();
    } catch (err: any) {
      console.error("[LicenseLock] Cancel claim failed:", err);
      const errMsg = err?.message || err?.details || err?.shortMessage || String(err);
      setError(`Failed to cancel claim: ${errMsg}`);
    } finally {
      setIsCanceling(false);
      setIsWaitingForWallet(false);
    }
  };

  const handleResolve = async () => {
    if (!client || !account) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!id) {
      setError("Invalid claim ID.");
      return;
    }

    try {
      setIsResolving(true);
      setIsWaitingForWallet(true);
      setError(null);
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) throw new Error("Contract address missing in environment variables.");

      console.log(`[LicenseLock] Resolving claim "${id}"...`);
      
      const txHash = await client.writeContract({
        address: contractAddress as `0x${string}`,
        functionName: "resolve",
        args: [id],
      });
      setIsWaitingForWallet(false);

      console.log(`[LicenseLock] Resolve transaction submitted: ${txHash}. Waiting for ACCEPTED receipt...`);

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED"
      });

      console.log("Resolution TX Receipt:", receipt);
      console.log("[LicenseLock] Resolve TX Receipt JSON:", safeJsonStringify(receipt));

      // ── Comprehensive GenVM Receipt Error Validation ────────────────────
      const extractReceiptError = (r: any): string | null => {
        if (!r) return null;
        if (r.status === 0 || r.status === "0x0" || r.status === "reverted") {
          return "Transaction reverted on-chain (status 0).";
        }
        if (r.result_name === "MAJORITY_DISAGREE" || r.last_round?.result === 7) {
          return "GenLayer validator consensus failed (MAJORITY_DISAGREE).";
        }
        if (r.status === "contract_error" || r.status === "FAILED" || r.status === "ERROR") {
          return r.error || r.message || `Transaction failed with status: ${r.status}`;
        }
        if (r.result?.status === "contract_error" || r.result?.status === "ERROR" || r.result?.status === "FAILED") {
          return r.result?.error || r.result?.message || `Contract execution error: ${r.result?.status}`;
        }
        if (r.execution_result === "ERROR" || r.execution_result === "FAILED") {
          return r.error || `Execution result: ${r.execution_result}`;
        }
        const leader = r.consensus_data?.leader_receipt?.[0] || r.leader_receipt?.[0] || r.leader_receipt;
        if (leader) {
          if (leader.execution_result === "ERROR" || leader.execution_result === "FAILED") {
            return leader.error || `Leader node execution failed (${leader.execution_result})`;
          }
          if (leader.error) {
            return String(leader.error);
          }
        }
        if (r.error) {
          return String(r.error);
        }
        return null;
      };

      const receiptError = extractReceiptError(receipt);
      if (receiptError) {
        console.error("[LicenseLock] GenVM contract execution failed:", receiptError, safeJsonStringify(receipt));
        throw new Error(`GenVM contract execution failed on-chain: ${receiptError}`);
      }

      console.log(`[LicenseLock] Consensus accepted! Waiting 5s for node state propagation...`);
      await new Promise((r) => setTimeout(r, 5000));

      // ── Poll for updated RESOLVED state (up to 25 attempts with 5s delay) ───
      let resolvedClaimData: any = null;
      let consecutiveErrors = 0;

      for (let attempt = 1; attempt <= 25; attempt++) {
        console.log(`[LicenseLock] Polling updated claim state (attempt ${attempt}/25)...`);
        
        try {
          const freshData: any = await client.readContract({
            address: contractAddress as `0x${string}`,
            functionName: "get_claim",
            args: [id],
          });

          consecutiveErrors = 0;
          console.log(`[LicenseLock] Attempt ${attempt} result state:`, freshData?.state, "outcome:", freshData?.outcome);

          if (freshData && freshData.state === "RESOLVED") {
            resolvedClaimData = freshData;
            break;
          }
        } catch (pollErr: any) {
          consecutiveErrors++;
          console.warn(`[LicenseLock] RPC rate limit hit / network drop (consecutive error #${consecutiveErrors}), waiting 5s before retrying...`, pollErr?.message || pollErr);
          // If we hit a network drop or rate limit, do not penalize attempt count for up to 10 network drops
          if (consecutiveErrors <= 10) {
            attempt--;
          }
        }

        // Wait 5000ms between attempts to avoid RPC rate-limits and allow testnet indexing
        await new Promise((r) => setTimeout(r, 5000));
      }

      if (resolvedClaimData) {
        console.log("[LicenseLock] Successfully resolved claim! Updating UI view to ClaimResolved.");
        setClaim(resolvedClaimData);
        setError(null);
      } else {
        console.error("[LicenseLock] Resolution executed, but claim state is still OPEN on-chain. Check receipt above:", receipt);
        setError("Resolution executed, but claim state is still OPEN on-chain after 125s. Check console.");
        await fetchClaim();
      }
    } catch (err: any) {
      console.error(`[LicenseLock] Resolve claim failed:`, err);
      if (err?.code === 4001 || err?.code === 'ACTION_REJECTED' || err?.message?.includes('rejected')) {
        setError("Transaction rejected. You cancelled the request in your wallet.");
      } else {
        setError(err.message || "Failed to resolve claim. Check console for details.");
      }
    } finally {
      setIsResolving(false);
      setIsWaitingForWallet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
        <div className="font-code-sm text-code-sm text-on-surface-variant">Loading claim {id || "..."}</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="max-w-container-max mx-auto px-margin-desktop py-16">
        <div className="bg-error/15 border border-error p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-error font-headline-sm text-headline-sm">
            <span className="material-symbols-outlined">error</span>
            <span>Claim Lookup Error</span>
          </div>
          <p className="font-code-sm text-code-sm text-on-surface break-words">
            {error || `Claim "${id}" was not found on contract.`}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              fetchClaim();
            }}
            className="self-start px-4 py-2 bg-surface-container-high border border-outline-variant font-code-sm text-code-sm hover:border-primary-fixed transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      </div>
    );
  }

  if (claim.state === "OPEN") {
    return (
      <div className="flex flex-col w-full relative">
        {error && (
          <div className="bg-error/20 border-b border-error text-error px-margin-desktop py-3 font-code-sm text-code-sm flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-error hover:text-on-surface font-bold text-xs uppercase">
              DISMISS
            </button>
          </div>
        )}
        <ClaimPending 
          claim={claim} 
          onResolve={handleResolve} 
          onCancel={handleCancel}
          isResolving={isResolving} 
          isCanceling={isCanceling}
          isWaitingForWallet={isWaitingForWallet} 
          account={account} 
        />
      </div>
    );
  }

  return <ClaimResolved claim={claim} />;
}
