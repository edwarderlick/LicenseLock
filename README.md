# 🛡️ LicenseLock
**Institutional-Grade Open-Source License Escrow on GenLayer**

LicenseLock is an autonomous, AI-powered Web3 protocol built on the GenLayer Nondeterministic Virtual Machine. It allows users to lock GEN tokens in escrow against a specific GitHub commit, triggering decentralized validators to parse repository files, evaluate licensing compliance, and automatically execute payouts or refunds based on cryptographic consensus.

---

## 🏗️ Architecture & Security (The Audit Trail)
This protocol was engineered from the ground up to address strict mainnet-ready security standards and resolve architectural critiques from previous GenLayer dApp reviews (Alpha Court, Sybil Court, Provider Court):

*   **No Trapped Funds & State-Backed Payouts (Alpha Court Resolution):** Complete settlement is guaranteed. The protocol includes an explicit `cancel_claim` emergency hatch for funders if a claim remains `OPEN`. Payouts and refunds are strictly derived from contract state, and the LLM parsing incorporates a 0% revert guarantee (regex fallback) ensuring unparsable outputs gracefully refund escrow rather than permanently locking state.
*   **Strict Authentication & Real Economic Consequences (Sybil Court Resolution):** Every state-changing method enforces strict `msg.sender` address normalization against the original `claim.funder` or `claim.recipient`. The interface does not promise fake mechanics; the verdicts trigger actual, irreversible GenVM native token transfers based on authoritative GitHub API evidence.
*   **Adversarial Defenses & Transaction Correlation (Provider Court Resolution):** Global lookups have been replaced with strict, transaction-specific `claim_id` correlation. The protocol is hardened against adversarial manipulation via Prompt Injection Sandboxing, ensuring a user's `custom_policy_prompt` cannot override the validator's core system directive.

---

## ✨ Core Features
*   **Deterministic Evaluation:** `SPDX_MATCH`, `NO_COPYLEFT`, and `ALLOWED_LICENSE_SET` policies with exhaustive candidate fallback chains.
*   **GenVM LLM Semantic Auditor:** Uses GenLayer's native LLM integration (`gl.nondet.exec_prompt`) to read and interpret natural language legal requirements (e.g., "Must permit commercial usage but ban AI training") with sandboxed prompt wrappers and robust regex extraction.
*   **Robust File Fetching:** Case-insensitive GitHub URL resolution with monorepo subdirectory support and exponential rate-limit backoffs (HTTP 429/5xx retry handling).
*   **Revenue Engine:** Automated 2.5% protocol fee (250 BPS) routing to the designated treasury on successful PASS payouts; 100% refund on FAIL, INSUFFICIENT, or CANCELED claims.
*   **Global Event Indexing:** Positional-only EVM indexed log events (`ClaimCreated`, `ClaimResolved`, `ClaimCanceled`) for real-time indexing and subgraph tracking.

---

## 🚀 Stack & Contracts
*   **Intelligent Smart Contract:** Python GenVM (`contracts/licenselock.py`)
*   **Consensus Engine:** GenLayer StudioNet / Testnet
*   **Frontend Application:** Next.js (App Router), Tailwind CSS, Viem, GenLayer JS SDK
*   **Contract Address (StudioNet):** `0xC43cB1408B103654A10C73270025AF5caf46C03F`

---

## 🧪 Testing & Verification
The smart contract is fully covered by a direct GenVM test suite using `gltest`:
```bash
pytest tests/direct/ -v
```
All 19 test cases verify:
1. Input validation & payable bounds
2. SPDX match pass/fail consensus
3. No-copyleft virus detection across `LICENSE` and `package.json`
4. Allowed license whitelist checks
5. Fallback resolution (`license.md`, `COPYING`, etc.)
6. Funder cancellation & authorized access control
7. Monorepo subdirectory-scoped file resolution
8. 2.5% Protocol fee treasury distribution math
9. GenVM LLM semantic audit passes & failures
10. Prompt injection sandboxing and conversational padding regex extractions
11. Garbled LLM output safe fallback to `INSUFFICIENT`
