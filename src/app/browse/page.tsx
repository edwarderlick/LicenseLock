"use client";

import { useEffect, useState, useRef } from "react";
import { useGenLayer } from "@/components/GenLayerProvider";
import Link from "next/link";

const STATE_OPTIONS = [
  { value: "ALL", label: "State: All" },
  { value: "OPEN", label: "State: Pending (OPEN)" },
  { value: "RESOLVED", label: "State: Resolved (RESOLVED)" },
  { value: "CANCELED", label: "State: Canceled (CANCELED)" },
];

const TYPE_OPTIONS = [
  { value: "ALL", label: "Type: All Types" },
  { value: "SPDX_MATCH", label: "Type: SPDX Match" },
  { value: "NO_COPYLEFT", label: "Type: No Copyleft" },
  { value: "ALLOWED_LICENSE_SET", label: "Type: Allowed Licenses" },
  { value: "SEMANTIC_AUDIT", label: "Type: Semantic AI Audit" },
];


export default function BrowseClaims() {
  const { client } = useGenLayer();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [stateFilter, setStateFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Dropdown open states
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const stateRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(event.target as Node)) {
        setIsStateOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setIsTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function fetchClaims() {
      if (!client || !contractAddress) return;
      try {
        setLoading(true);
        const claimIds = await client.readContract({
          address: contractAddress as `0x${string}`,
          functionName: "list_claim_ids",
          args: [],
        });

        const claimsData = await Promise.all(
          claimIds.map(async (id: string) => {
            return await client.readContract({
              address: contractAddress as `0x${string}`,
              functionName: "get_claim",
              args: [id],
            });
          })
        );
        
        setClaims(claimsData.reverse()); // Show newest first
      } catch (error) {
        console.error("Failed to fetch claims", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, [client, contractAddress]);

  // Filtered claims logic
  const filteredClaims = claims.filter((claim) => {
    if (!claim) return false;
    
    // State filtering
    if (stateFilter !== "ALL" && claim.state !== stateFilter) {
      return false;
    }
    
    // Type filtering
    if (typeFilter !== "ALL" && claim.claim_type !== typeFilter) {
      return false;
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRepo = claim.repo?.toLowerCase().includes(q);
      const matchId = claim.id?.toLowerCase().includes(q);
      const matchCommit = claim.commit?.toLowerCase().includes(q);
      if (!matchRepo && !matchId && !matchCommit) {
        return false;
      }
    }

    return true;
  });

  const activeFilterCount = (stateFilter !== "ALL" ? 1 : 0) + (typeFilter !== "ALL" ? 1 : 0) + (searchQuery ? 1 : 0);

  const resetFilters = () => {
    setStateFilter("ALL");
    setTypeFilter("ALL");
    setSearchQuery("");
  };

  const selectedStateLabel = STATE_OPTIONS.find((o) => o.value === stateFilter)?.label || "State: All";
  const selectedTypeLabel = TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label || "Type: All Types";

  return (
    <>
      <div className="flex flex-col w-full max-w-container-max mx-auto px-margin-desktop py-8 gap-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse" />
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">ON-CHAIN LEDGER</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-background tracking-tighter">Browse Claims.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            A real-time ledger of intellectual property verification on GenLayer. Objective consensus on software licensing, resolved by distributed intelligent nodes.
          </p>
        </div>

        {/* Interactive Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-surface-container border border-outline/20 p-4 relative z-20 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 pr-2 border-r border-outline/20">
              <span className="material-symbols-outlined text-primary-fixed text-[20px]">filter_alt</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Filter:</span>
            </div>

            {/* State Filter Dropdown */}
            <div className="relative" ref={stateRef}>
              <button
                type="button"
                onClick={() => {
                  setIsStateOpen(!isStateOpen);
                  setIsTypeOpen(false);
                }}
                className={`flex items-center justify-between gap-3 px-4 py-2 border font-code-sm text-code-sm transition-all min-w-[170px] ${
                  stateFilter !== "ALL"
                    ? "bg-primary-fixed/10 border-primary-fixed text-primary-fixed font-semibold"
                    : "bg-surface border-outline/30 text-on-surface hover:border-outline hover:bg-surface-container-high"
                }`}
              >
                <span>{selectedStateLabel}</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isStateOpen ? "rotate-180 text-primary-fixed" : "text-on-surface-variant"}`}>
                  expand_more
                </span>
              </button>

              {isStateOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-surface-container-high border border-outline/40 shadow-2xl z-50 flex flex-col py-1 backdrop-blur-md">
                  {STATE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStateFilter(option.value);
                        setIsStateOpen(false);
                      }}
                      className={`px-4 py-2.5 text-left font-code-sm text-code-sm flex items-center justify-between transition-colors ${
                        stateFilter === option.value
                          ? "bg-primary-fixed/15 text-primary-fixed font-bold border-l-2 border-primary-fixed"
                          : "text-on-surface hover:bg-surface-container-highest hover:text-on-surface"
                      }`}
                    >
                      <span>{option.label}</span>
                      {stateFilter === option.value && (
                        <span className="material-symbols-outlined text-[16px] text-primary-fixed">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative" ref={typeRef}>
              <button
                type="button"
                onClick={() => {
                  setIsTypeOpen(!isTypeOpen);
                  setIsStateOpen(false);
                }}
                className={`flex items-center justify-between gap-3 px-4 py-2 border font-code-sm text-code-sm transition-all min-w-[190px] ${
                  typeFilter !== "ALL"
                    ? "bg-primary-fixed/10 border-primary-fixed text-primary-fixed font-semibold"
                    : "bg-surface border-outline/30 text-on-surface hover:border-outline hover:bg-surface-container-high"
                }`}
              >
                <span>{selectedTypeLabel}</span>
                <span className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${isTypeOpen ? "rotate-180 text-primary-fixed" : "text-on-surface-variant"}`}>
                  expand_more
                </span>
              </button>

              {isTypeOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-surface-container-high border border-outline/40 shadow-2xl z-50 flex flex-col py-1 backdrop-blur-md">
                  {TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTypeFilter(option.value);
                        setIsTypeOpen(false);
                      }}
                      className={`px-4 py-2.5 text-left font-code-sm text-code-sm flex items-center justify-between transition-colors ${
                        typeFilter === option.value
                          ? "bg-primary-fixed/15 text-primary-fixed font-bold border-l-2 border-primary-fixed"
                          : "text-on-surface hover:bg-surface-container-highest hover:text-on-surface"
                      }`}
                    >
                      <span>{option.label}</span>
                      {typeFilter === option.value && (
                        <span className="material-symbols-outlined text-[16px] text-primary-fixed">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-high border border-outline/30 hover:border-error text-on-surface-variant hover:text-error font-code-sm text-code-sm transition-colors"
                title="Clear all filters"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search Box */}
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
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Stats Bar */}
        {!loading && (
          <div className="flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm -mt-4 px-1">
            <span>
              Showing <strong className="text-on-surface font-semibold">{filteredClaims.length}</strong> of <strong className="text-on-surface font-semibold">{claims.length}</strong> claims
            </span>
            {activeFilterCount > 0 && (
              <span className="text-primary-fixed font-medium">
                {activeFilterCount} active filter{activeFilterCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Claims Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max relative z-10">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-surface-container/40 border border-outline/20">
              <div className="w-8 h-8 border-2 border-primary-fixed border-t-transparent rounded-full animate-spin" />
              <div className="font-code-sm text-code-sm text-on-surface-variant">Loading on-chain claims from StudioNet...</div>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-4 bg-surface-container/30 border border-outline/20 text-center p-8">
              <span className="material-symbols-outlined text-on-surface-variant text-[40px]">search_off</span>
              <div className="font-headline-sm text-headline-sm text-on-surface">No Claims Match Your Filter</div>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
                Try loosening your filters or resetting them to view all verified open-source claims.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-5 py-2.5 bg-surface-container-high border border-outline/40 hover:border-primary-fixed font-code-sm text-code-sm text-on-surface transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredClaims.map((claim) => {
              let parsedResult: any = null;
              if (typeof claim.result_json === "string") {
                try {
                  parsedResult = JSON.parse(claim.result_json);
                } catch {
                  parsedResult = null;
                }
              } else if (claim.result_json && typeof claim.result_json === "object") {
                parsedResult = claim.result_json;
              }

              const typeFormatted =
                claim.claim_type === "SPDX_MATCH"
                  ? "SPDX Match"
                  : claim.claim_type === "NO_COPYLEFT"
                  ? "No Copyleft"
                  : claim.claim_type === "ALLOWED_LICENSE_SET"
                  ? "Allowed Licenses"
                  : claim.claim_type || "SPDX Match";

              return (
                <div key={claim.id} className="group relative flex flex-col bg-surface-container-lowest border border-outline/20 hover:border-primary-fixed/50 transition-colors duration-300 shadow-sm">
                  <div className="p-6 border-b border-outline/10 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-label-caps text-label-caps uppercase ${
                        claim.state === "OPEN"
                          ? "bg-secondary-container/15 border-secondary-container text-on-surface"
                          : claim.outcome === "PASS"
                          ? "bg-primary-fixed/15 border-primary-fixed text-primary-fixed"
                          : claim.outcome === "FAIL"
                          ? "bg-error-container/20 border-error text-error"
                          : "bg-surface-variant/30 border-outline/40 text-on-surface-variant"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          claim.state === "OPEN"
                            ? "bg-secondary-container animate-pulse"
                            : claim.outcome === "PASS"
                            ? "bg-primary-fixed"
                            : claim.outcome === "FAIL"
                            ? "bg-error"
                            : "bg-outline"
                        }`} />
                        {claim.state === "OPEN" ? "Pending" : claim.outcome === "PASS" ? "Passed" : claim.outcome === "FAIL" ? "Failed" : "Insufficient"}
                      </div>
                      <div className="font-code-sm text-code-sm text-primary-fixed bg-primary-fixed/10 px-2.5 py-1 border border-primary-fixed/20 font-semibold">
                        {(Number(claim.amount) / 10**18).toString()} GEN
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">CLAIM_ID: {claim.id}</div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface break-words font-semibold" title={claim.repo}>{claim.repo}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-[16px]">commit</span>
                        <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-2 py-0.5 border border-outline/10">
                          {claim.commit ? claim.commit.substring(0, 7) : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">POLICY TYPE</div>
                        <div className="font-code-sm text-code-sm text-on-surface font-medium">{typeFormatted}</div>
                      </div>

                      {claim.state === "RESOLVED" && (
                        <div className={`bg-surface-container border-l-2 p-3 ${
                          claim.outcome === "PASS"
                            ? "border-primary-fixed"
                            : claim.outcome === "FAIL"
                            ? "border-error"
                            : "border-outline"
                        }`}>
                          <div className={`font-label-caps text-label-caps mb-1 ${
                            claim.outcome === "PASS"
                              ? "text-primary-fixed"
                              : claim.outcome === "FAIL"
                              ? "text-error"
                              : "text-on-surface-variant"
                          }`}>
                            Resolution Reason
                          </div>
                          <p className="font-code-sm text-code-sm text-on-surface leading-relaxed">
                            {parsedResult?.reason || (
                              claim.outcome === "PASS"
                                ? "Policy satisfied. Escrow released."
                                : claim.outcome === "FAIL"
                                ? "Policy violation detected."
                                : "Insufficient evidence."
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/claim/${claim.id}`}
                      className="w-full py-3 bg-surface border border-outline/30 hover:bg-primary hover:text-on-primary hover:border-primary transition-all font-code-sm text-code-sm flex justify-center items-center gap-2 text-on-surface mt-auto group-hover:border-primary-fixed/40"
                    >
                      <span>View Details</span>
                      <span className="material-symbols-outlined text-[18px]">
                        {claim.state === "RESOLVED" ? "gavel" : "arrow_forward"}
                      </span>
                    </Link>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-fixed scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

