"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useGenLayer } from "@/components/GenLayerProvider";

interface Claim {
  id: string;
  repo: string;
  commit: string;
  claim_type: string;
  state: string;
  amount: string;
  funder: string;
  recipient: string;
}

function StatusBadge({ state }: { state: string }) {
  if (state === "OPEN")
    return (
      <div className="font-label-caps text-label-caps uppercase px-3 py-1 bg-secondary-container/15 border border-secondary-container text-on-surface flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary-container animate-pulse" />
        Pending
      </div>
    );
  if (state === "CANCELED")
    return (
      <div className="font-label-caps text-label-caps uppercase px-3 py-1 bg-surface-container-high border border-outline text-on-surface-variant flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-outline" />
        Canceled
      </div>
    );
  return (
    <div className="font-label-caps text-label-caps uppercase px-3 py-1 bg-primary-fixed/15 border border-primary-fixed text-primary-fixed flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed" />
      Resolved
    </div>
  );
}

function ClaimRow({ claim }: { claim: Claim }) {
  const amountGEN = (Number(claim.amount) / 10 ** 18).toFixed(2);
  const typeLabel =
    claim.claim_type === "SPDX_MATCH"
      ? "SPDX Match"
      : claim.claim_type === "NO_COPYLEFT"
      ? "No Copyleft"
      : claim.claim_type === "ALLOWED_LICENSE_SET"
      ? "Allowed License Set"
      : claim.claim_type === "SEMANTIC_AUDIT"
      ? "Semantic AI Audit"
      : claim.claim_type;


  return (
    <Link
      href={`/claim/${claim.id}`}
      className="grid grid-cols-12 gap-4 p-4 items-center border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors group last:border-b-0"
    >
      <div className="col-span-4 flex flex-col gap-1">
        <div className="font-body-md text-body-md text-on-surface font-medium group-hover:text-primary-fixed transition-colors">
          {claim.repo}
        </div>
        <div className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container-highest/50 px-2 py-0.5 inline-block w-fit border border-outline-variant/20">
          @ {claim.commit.slice(0, 7)}
        </div>
      </div>
      <div className="col-span-3 font-body-md text-body-md text-on-surface-variant">
        {typeLabel}
      </div>
      <div className="col-span-2 font-code-sm text-code-sm text-on-surface">
        {amountGEN} GEN
      </div>
      <div className="col-span-1 font-code-sm text-code-sm text-on-surface-variant">
        {claim.id}
      </div>
      <div className="col-span-2 flex justify-end">
        <StatusBadge state={claim.state} />
      </div>
    </Link>
  );
}

export default function MyClaims() {
  const { client, account } = useGenLayer();
  const [funderClaims, setFunderClaims] = useState<Claim[]>([]);
  const [recipientClaims, setRecipientClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [stateFilter, setStateFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  useEffect(() => {
    if (!client || !account) {
      setLoading(false);
      return;
    }

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      setError("Contract address not configured.");
      setLoading(false);
      return;
    }

    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch claims where account is funder
        const asFunder: Claim[] = await client.readContract({
          address: contractAddress as `0x${string}`,
          functionName: "get_claims_by_funder",
          args: [account],
        });

        // Fetch claims where account is recipient
        const asRecipient: Claim[] = await client.readContract({
          address: contractAddress as `0x${string}`,
          functionName: "get_claims_by_recipient",
          args: [account],
        });

        setFunderClaims(Array.isArray(asFunder) ? asFunder : []);
        setRecipientClaims(Array.isArray(asRecipient) ? asRecipient : []);
      } catch (err: any) {
        console.error("Failed to fetch claims:", err);
        setFunderClaims([]);
        setRecipientClaims([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [client, account]);

  const totalStaked = [...funderClaims, ...recipientClaims].reduce(
    (sum, c) => sum + Number(c.amount),
    0
  );

  const applyFilters = (list: Claim[]) => {
    return list.filter((claim) => {
      if (!claim) return false;
      if (stateFilter !== "ALL" && claim.state !== stateFilter) return false;
      if (typeFilter !== "ALL" && claim.claim_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRepo = claim.repo?.toLowerCase().includes(q);
        const matchId = claim.id?.toLowerCase().includes(q);
        const matchCommit = claim.commit?.toLowerCase().includes(q);
        if (!matchRepo && !matchId && !matchCommit) return false;
      }
      return true;
    });
  };

  const filteredFunderClaims = applyFilters(funderClaims);
  const filteredRecipientClaims = applyFilters(recipientClaims);
  const activeFilterCount = (stateFilter !== "ALL" ? 1 : 0) + (typeFilter !== "ALL" ? 1 : 0) + (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setStateFilter("ALL");
    setTypeFilter("ALL");
    setSearchQuery("");
  };

  return (
    <>
      <div className="flex flex-col w-full">
        {/* Dashboard Header */}
        <section className="w-full bg-surface-container-lowest border-b border-outline-variant/30 py-16 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#303031 1px, transparent 1px), linear-gradient(90deg, #303031 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="max-w-container-max mx-auto px-margin-desktop relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4 uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-fixed" />
                  System Active
                </div>
                <h1 className="font-display-lg text-display-lg text-on-background mb-2">
                  My Claims
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                  Monitor and manage your cryptographic license verifications.
                  Verbatim evidence locked on GenLayer.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-surface border border-outline-variant/50 p-6 min-w-[200px]">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">
                    Connected Entity
                  </div>
                  <div className="font-code-sm text-code-sm text-on-surface bg-surface-container-high px-3 py-2 border border-outline-variant/30 inline-block">
                    {account
                      ? `${account.slice(0, 6)}...${account.slice(-4)}`
                      : "Not connected"}
                  </div>
                </div>
                <div className="bg-surface border border-outline-variant/50 p-6 min-w-[160px]">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">
                    Total Staked
                  </div>
                  <div className="font-headline-md text-headline-md text-primary-fixed">
                    {(totalStaked / 10 ** 18).toFixed(2)}{" "}
                    <span className="font-code-sm text-code-sm text-on-surface-variant">
                      GEN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Not connected banner */}
        {!account && (
          <div className="max-w-container-max mx-auto px-margin-desktop w-full py-16 text-center">
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
              Connect your wallet to see your claims.
            </p>
            <Link
              href="/connect"
              className="inline-block bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-6 py-3 hover:bg-primary-fixed-dim transition-colors"
            >
              Connect Wallet
            </Link>
          </div>
        )}

        {account && loading && (
          <div className="max-w-container-max mx-auto px-margin-desktop w-full py-16 text-center">
            <p className="font-code-sm text-code-sm text-on-surface-variant animate-pulse">
              Loading claims...
            </p>
          </div>
        )}

        {account && !loading && (
          <>
            {/* Interactive Filter Bar */}
            <div className="max-w-container-max mx-auto px-margin-desktop w-full pt-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container border border-outline/20 p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 pr-2 border-r border-outline/20">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px]">filter_alt</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Filter:</span>
                  </div>

                  {/* State Select */}
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="px-3 py-2 bg-surface border border-outline/30 text-on-surface font-code-sm text-code-sm hover:border-outline focus:border-primary-fixed outline-none"
                  >
                    <option value="ALL">State: All</option>
                    <option value="OPEN">State: Pending (OPEN)</option>
                    <option value="RESOLVED">State: Resolved (RESOLVED)</option>
                    <option value="CANCELED">State: Canceled (CANCELED)</option>
                  </select>

                  {/* Type Select */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-surface border border-outline/30 text-on-surface font-code-sm text-code-sm hover:border-outline focus:border-primary-fixed outline-none"
                  >
                    <option value="ALL">Type: All Types</option>
                    <option value="SPDX_MATCH">Type: SPDX Match</option>
                    <option value="NO_COPYLEFT">Type: No Copyleft</option>
                    <option value="ALLOWED_LICENSE_SET">Type: Allowed Licenses</option>
                  </select>



                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-high border border-outline/30 hover:border-error text-on-surface-variant hover:text-error font-code-sm text-code-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-surface border border-outline/30 px-3 py-1.5 focus-within:border-primary-fixed transition-colors w-full md:w-64">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search repo or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none font-code-sm text-code-sm text-on-surface placeholder:text-on-surface-variant/60 w-full"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* As Funder Section */}
            <section className="max-w-container-max mx-auto px-margin-desktop w-full py-10">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-background">
                  As Funder
                </h2>
                <div className="flex-1 h-px bg-outline-variant/30" />
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase border border-outline-variant/30 px-3 py-1">
                  {filteredFunderClaims.length} of {funderClaims.length} Records
                </div>
              </div>
              <div className="w-full border border-outline-variant/50 bg-surface-container-lowest">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/50 bg-surface/50">
                  <div className="col-span-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Target Asset / Commit</div>
                  <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Claim Type</div>
                  <div className="col-span-2 font-label-caps text-label-caps text-on-surface-variant uppercase">Stake</div>
                  <div className="col-span-1 font-label-caps text-label-caps text-on-surface-variant uppercase">ID</div>
                  <div className="col-span-2 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Status</div>
                </div>
                {filteredFunderClaims.length === 0 ? (
                  <div className="p-8 text-center font-code-sm text-code-sm text-on-surface-variant">
                    {funderClaims.length === 0 ? "No claims found as funder." : "No funder claims match current filter."}
                  </div>
                ) : (
                  filteredFunderClaims.map((c) => <ClaimRow key={c.id} claim={c} />)
                )}
              </div>
            </section>

            {/* As Recipient Section */}
            <section className="max-w-container-max mx-auto px-margin-desktop w-full pb-24">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-background">
                  As Recipient
                </h2>
                <div className="flex-1 h-px bg-outline-variant/30" />
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase border border-outline-variant/30 px-3 py-1">
                  {filteredRecipientClaims.length} of {recipientClaims.length} Records
                </div>
              </div>
              <div className="w-full border border-outline-variant/50 bg-surface-container-lowest">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-outline-variant/50 bg-surface/50">
                  <div className="col-span-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Target Asset / Commit</div>
                  <div className="col-span-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Claim Type</div>
                  <div className="col-span-2 font-label-caps text-label-caps text-on-surface-variant uppercase">Expected Payout</div>
                  <div className="col-span-1 font-label-caps text-label-caps text-on-surface-variant uppercase">ID</div>
                  <div className="col-span-2 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Status</div>
                </div>
                {filteredRecipientClaims.length === 0 ? (
                  <div className="p-8 text-center font-code-sm text-code-sm text-on-surface-variant">
                    {recipientClaims.length === 0 ? "No claims found as recipient." : "No recipient claims match current filter."}
                  </div>
                ) : (
                  filteredRecipientClaims.map((c) => <ClaimRow key={c.id} claim={c} />)
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
