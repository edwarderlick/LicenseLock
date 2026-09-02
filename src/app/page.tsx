import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-[1px] bg-outline-variant/30">
        {/* HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[1px]">
          {/* Left Content (8 Cols) */}
          <div className="col-span-1 md:col-span-8 bg-surface relative flex flex-col justify-center px-margin-mobile md:px-margin-desktop py-24 md:py-32 overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            ></div>
            <div className="flex items-center gap-2 mb-12">
              <div className="h-2 w-2 bg-primary-fixed rounded-full animate-pulse"></div>
              <span className="font-label-caps text-label-caps text-primary-fixed tracking-widest uppercase">
                GenLayer StudioNet Connected
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface max-w-4xl relative z-10 mb-8 leading-[0.9]">
              Verify License Claims with GenVM Consensus.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl relative z-10 mb-12">
              A neutral payout gate for open-source license claims. Lock GEN in
              escrow against immutable 40-character commit SHAs. Decentralized validators execute fail-closed mechanical verification across scoped license and manifest files before settling payouts.
            </p>
            <div className="flex flex-wrap items-center gap-6 relative z-10">
              <Link
                className="group relative inline-flex items-center justify-center bg-primary-fixed text-on-primary-fixed px-10 py-4 font-code-sm text-code-sm font-bold uppercase tracking-wider overflow-hidden"
                href="/create-claim"
              >
                <span className="relative z-10">Enter App</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </Link>
            </div>
          </div>
          {/* Right Structural Image (4 Cols) */}
          <div className="col-span-1 md:col-span-4 bg-surface relative min-h-[40vh] md:min-h-full overflow-hidden flex flex-col justify-between p-6">
            <div
              className="absolute inset-0 w-full h-[200%] mix-blend-screen opacity-60"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXTNOYI9FWghVPh0Iyl_geO3NnQ8BOjSjw9hDSF1f9r5NarJcEvg0qfye-uHq2vFvZ9FxF_wRhIKgzP9n2mgaf_AL82i6oIRu2Ll5nFkD56J4t3BIjUgI20A86--PJKalu7GfEJyDhdgX3CruyOzlmVhxNQ3Olq6n_I5pPSdJYzREjRWFZWKPNVElawbJGvRoybX0Vkx7fDekotymjCU_wNhzCzO81CJBkGKSqzQIdR6q_3n8Uy1e52RP-pO8tcmiOMA')",
                backgroundSize: "cover",
                backgroundPosition: "top center",
                animation: "panImage 60s linear infinite",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-transparent to-surface/80"></div>
            <div className="relative z-10 flex justify-end w-full">
              <span
                className="font-label-caps text-label-caps text-outline-variant [writing-mode:vertical-rl] transform rotate-180"
              >
                Fig 1. Intelligent Contract Execution
              </span>
            </div>
            <div className="relative z-10 bg-surface-container-lowest/80 backdrop-blur-md p-4 flex flex-col gap-2 shadow-xl border border-outline/20">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                GENVM CONSENSUS
              </span>
              <span className="font-code-sm text-code-sm text-primary-fixed truncate">
                Fail-closed verification of scoped license and manifests
              </span>
            </div>
          </div>
        </div>
        {/* Ticker Section */}
        <div className="bg-surface-container py-4 overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite] gap-8 font-code-sm text-code-sm text-on-surface-variant">
            <span>// FAIL-CLOSED REPOSITORY SCOPE</span>
            <span>// IMMUTABLE 40-HEX COMMIT SHA REQUIRED</span>
            <span>// INSPECTING EVERY APPLICABLE MANIFEST</span>
            <span>// REJECTING UNAVAILABLE EVIDENCE</span>
            <span>// FAIL-CLOSED REPOSITORY SCOPE</span>
            <span>// IMMUTABLE 40-HEX COMMIT SHA REQUIRED</span>
            <span>// INSPECTING EVERY APPLICABLE MANIFEST</span>
            <span>// REJECTING UNAVAILABLE EVIDENCE</span>
          </div>
        </div>
        {/* 3 CLAIM TYPES SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
          {/* Claim Type 1 */}
          <div className="bg-surface p-margin-desktop flex flex-col group hover:bg-surface-container transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary-fixed text-[32px]">
                check_circle
              </span>
            </div>
            <div className="font-label-caps text-label-caps text-outline mb-16 uppercase">
              Claim Interface // 01
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 group-hover:text-primary-fixed transition-colors">
              SPDX Match
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-12 flex-1">
              Mechanical string verification of standard SPDX license identifiers between the root LICENSE file and README.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-code-sm text-code-sm text-on-surface bg-surface-container-highest px-3 py-1 rounded-sm shadow-sm">
                Root File Matching
              </span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 group-hover:text-primary-fixed transition-all">
                east
              </span>
            </div>
          </div>
          {/* Claim Type 2 */}
          <div className="bg-surface p-margin-desktop flex flex-col group hover:bg-surface-container transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary-fixed text-[32px]">
                lock_open
              </span>
            </div>
            <div className="font-label-caps text-label-caps text-outline mb-16 uppercase">
              Claim Interface // 02
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 group-hover:text-primary-fixed transition-colors">
              No Copyleft
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-12 flex-1">
              Inspects root LICENSE and package manifests (package.json, pyproject.toml, Cargo.toml) to ensure no viral copyleft licenses (e.g. GPL, AGPL) exist.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-code-sm text-code-sm text-on-surface bg-surface-container-highest px-3 py-1 rounded-sm shadow-sm">
                Manifest Checking
              </span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 group-hover:text-primary-fixed transition-all">
                east
              </span>
            </div>
          </div>
          {/* Claim Type 3 */}
          <div className="bg-surface p-margin-desktop flex flex-col group hover:bg-surface-container transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-primary-fixed text-[32px]">
                fact_check
              </span>
            </div>
            <div className="font-label-caps text-label-caps text-outline mb-16 uppercase">
              Claim Interface // 03
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6 group-hover:text-primary-fixed transition-colors">
              Allowed Set
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-12 flex-1">
              Checks root LICENSE and package manifests against an explicit whitelist of acceptable SPDX identifiers provided by the funder.
            </p>
            <div className="flex items-center justify-between">
              <span className="font-code-sm text-code-sm text-on-surface bg-surface-container-highest px-3 py-1 rounded-sm shadow-sm">
                Whitelist Check
              </span>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-2 group-hover:text-primary-fixed transition-all">
                east
              </span>
            </div>
          </div>
        </div>
        {/* Final CTA Footer Block */}

        <div className="bg-surface p-margin-mobile md:p-margin-desktop flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-primary-fixed">terminal</span>
            </div>
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface">
                Ready to secure your claims?
              </div>
              <div className="font-code-sm text-code-sm text-on-surface-variant mt-1">
                Deploy escrow via GenVM protocol now.
              </div>
            </div>
          </div>
          <button className="bg-surface-container text-on-surface hover:bg-white hover:text-black transition-colors px-8 py-3 font-code-sm text-code-sm shadow-sm flex items-center gap-2">
            Read Documentation
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes panImage {
          0% { transform: translateY(0); }
          50% { transform: translateY(-30%); }
          100% { transform: translateY(0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-\\[marquee_20s_linear_infinite\\] {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
