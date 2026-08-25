# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

import json
import re
import time
from dataclasses import dataclass
from genlayer import *

ERROR_EXPECTED  = "[EXPECTED]"
ERROR_EXTERNAL  = "[EXTERNAL]"
ERROR_TRANSIENT = "[TRANSIENT]"

PROTOCOL_FEE_BPS: u256 = u256(250)  # 2.5% protocol fee on successful resolution

@allow_storage
@dataclass
class FileEvidence:
    path: str
    excerpt: str
    status: str

class ClaimCreated(gl.Event):
    def __init__(self, claim_id: str, repo: str, amount: u256, /):
        pass

class ClaimResolved(gl.Event):
    def __init__(self, claim_id: str, verdict: str, /):
        pass

class ClaimCanceled(gl.Event):
    def __init__(self, claim_id: str, /):
        pass

@allow_storage
@dataclass
class Claim:
    id: str
    repo: str
    commit: str
    recipient: Address
    funder: Address
    amount: u256
    claim_type: str
    allowed_licenses_json: str
    state: str
    result_json: str
    target_directory: str = ""

class LicenseLock(gl.Contract):
    next_claim_id: u256
    protocol_treasury: Address
    claims: TreeMap[str, Claim]

    def __init__(self, treasury: Address = Address("0x0000000000000000000000000000000000000001")):
        self.next_claim_id = u256(1)
        self.protocol_treasury = treasury

    @gl.public.write.payable
    def create_claim(
        self,
        repo: str,
        commit: str,
        recipient: Address,
        claim_type: str,
        allowed_licenses: list[str],
        target_directory: str = ""
    ) -> str:
        if not isinstance(recipient, Address):
            recipient = Address(recipient)
        if gl.message.value == 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Value must be greater than 0")
        if not repo:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Repo cannot be empty")
        if not commit:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Commit cannot be empty")
        if not recipient:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Recipient cannot be empty")
        if claim_type not in ["SPDX_MATCH", "NO_COPYLEFT", "ALLOWED_LICENSE_SET"]:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unsupported claim_type")

        claim_id = f"claim-{self.next_claim_id}"
        self.next_claim_id += u256(1)

        clean_dir = str(target_directory or "").strip().strip("/")

        self.claims[claim_id] = Claim(
            id=claim_id,
            repo=repo,
            commit=commit,
            recipient=recipient,
            funder=gl.message.sender_address,
            amount=gl.message.value,
            claim_type=claim_type,
            allowed_licenses_json=json.dumps(allowed_licenses),
            state="OPEN",
            result_json="",
            target_directory=clean_dir
        )

        ClaimCreated(claim_id, repo, gl.message.value).emit()
        return claim_id

    @gl.public.view
    def list_claim_ids(self) -> list[str]:
        return list(self.claims.keys())

    @gl.public.view
    def get_claim(self, claim_id: str) -> dict:
        if claim_id not in self.claims:
            raise gl.vm.UserError("Claim not found")
        claim = self.claims[claim_id]
        
        result_obj = None
        outcome = None
        if claim.result_json:
            try:
                result_obj = json.loads(claim.result_json)
                outcome = result_obj.get("outcome")
            except:
                pass
            
        return {
            "id": claim.id,
            "repo": claim.repo,
            "commit": claim.commit,
            "recipient": str(claim.recipient),
            "funder": str(claim.funder),
            "amount": int(claim.amount),
            "claim_type": claim.claim_type,
            "allowed_licenses_json": claim.allowed_licenses_json,
            "state": claim.state,
            "outcome": outcome,
            "result_json": result_obj,
            "target_directory": getattr(claim, "target_directory", "")
        }

    @gl.public.view
    def get_claims_by_funder(self, funder_address: str) -> list:
        result = []
        funder_lower = funder_address.lower()
        for claim_id, claim in self.claims.items():
            if str(claim.funder).lower() == funder_lower:
                result.append(self.get_claim(claim_id))
        return result

    @gl.public.view
    def get_claims_by_recipient(self, recipient_address: str) -> list:
        result = []
        recip_lower = recipient_address.lower()
        for claim_id, claim in self.claims.items():
            if str(claim.recipient).lower() == recip_lower:
                result.append(self.get_claim(claim_id))
        return result

    @gl.public.view
    def get_treasury(self) -> str:
        return str(self.protocol_treasury)

    @gl.public.write
    def cancel_claim(self, claim_id: str) -> None:
        if claim_id not in self.claims:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Claim not found")
        
        claim = self.claims[claim_id]
        
        if claim.state != "OPEN":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Cannot cancel a claim that is already {claim.state}")
            
        caller_str = str(gl.message.sender_address).lower()
        funder_str = str(claim.funder).lower()
        if caller_str != funder_str:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unauthorized: only original funder can cancel")
            
        claim.state = "CANCELED"
        claim.result_json = json.dumps({
            "outcome": "CANCELED",
            "reason": "Claim canceled by funder prior to resolution. Escrow refunded in full.",
            "files": []
        })
        self.claims[claim_id] = claim
        
        gl.get_contract_at(Address(str(claim.funder))).emit_transfer(value=claim.amount)
        ClaimCanceled(claim_id).emit()

    @gl.public.write
    def resolve(self, claim_id: str) -> None:
        if claim_id not in self.claims:
            raise gl.vm.UserError("Claim not found")
        claim = self.claims[claim_id]

        if claim.state != "OPEN":
            raise gl.vm.UserError("Claim already resolved")

        target_repo = claim.repo
        target_commit = claim.commit
        target_claim_type = claim.claim_type
        target_allowed_licenses_raw = claim.allowed_licenses_json
        target_dir = getattr(claim, "target_directory", "").strip("/")

        def fetch_file(repo: str, commit: str, path: str) -> dict:
            url = f"https://raw.githubusercontent.com/{repo}/{commit}/{path}"
            max_retries = 3
            backoff = 0.5
            
            for attempt in range(max_retries):
                try:
                    res = gl.nondet.web.get(url)
                except Exception:
                    if attempt < max_retries - 1:
                        time.sleep(backoff)
                        backoff *= 1.5
                        continue
                    return {"status": "MISSING", "path": path, "excerpt": "", "spdx": None, "raw": ""}

                if res.status == 404:
                    return {"status": "MISSING", "path": path, "excerpt": "", "spdx": None, "raw": ""}
                
                if res.status == 429:
                    if attempt < max_retries - 1:
                        time.sleep(backoff)
                        backoff *= 2.0
                        continue
                    return {"status": "MISSING", "path": path, "excerpt": "", "spdx": None, "raw": ""}

                if res.status >= 500:
                    if attempt < max_retries - 1:
                        time.sleep(backoff)
                        backoff *= 1.5
                        continue
                    raise gl.vm.UserError(f"{ERROR_TRANSIENT} HTTP error {res.status} on {url}")

                if res.status != 200:
                    return {"status": "MISSING", "path": path, "excerpt": "", "spdx": None, "raw": ""}
                
                try:
                    body = res.body.decode("utf-8")
                except Exception:
                    body = str(res.body)

                if not body:
                    return {"status": "EMPTY", "path": path, "excerpt": "", "spdx": None, "raw": body}
                
                # Regex search for standard SPDX-License-Identifier
                match = re.search(r"SPDX-License-Identifier:\s*([A-Za-z0-9\.\-\+]+)", body, re.IGNORECASE)
                if match:
                    spdx = match.group(1).upper()
                    excerpt = match.group(0)
                    return {"status": "FOUND", "path": path, "excerpt": excerpt, "spdx": spdx, "raw": body}
                
                # Fallbacks for standard permissive licenses
                lower_body = body.lower()
                if "mit license" in lower_body:
                    return {"status": "FOUND", "path": path, "excerpt": "MIT License", "spdx": "MIT", "raw": body}
                if "apache license" in lower_body and "version 2.0" in lower_body:
                    return {"status": "FOUND", "path": path, "excerpt": "Apache License Version 2.0", "spdx": "APACHE-2.0", "raw": body}
                
                return {"status": "NO_SPDX", "path": path, "excerpt": "", "spdx": None, "raw": body}

            return {"status": "MISSING", "path": path, "excerpt": "", "spdx": None, "raw": ""}

        def fetch_first_valid(repo: str, commit: str, candidate_paths: list[str]) -> dict:
            evaluated_candidates = []
            if target_dir:
                for c in candidate_paths:
                    scoped = f"{target_dir}/{c}".strip("/")
                    if scoped not in evaluated_candidates:
                        evaluated_candidates.append(scoped)
            for c in candidate_paths:
                if c not in evaluated_candidates:
                    evaluated_candidates.append(c)

            for candidate in evaluated_candidates:
                res = fetch_file(repo, commit, candidate)
                if res["status"] in ("FOUND", "NO_SPDX", "EMPTY"):
                    return res
            default_path = evaluated_candidates[0] if evaluated_candidates else ""
            return {"status": "MISSING", "path": default_path, "excerpt": "", "spdx": None, "raw": ""}

        def is_copyleft_identifier(spdx_or_name: str) -> bool:
            if not spdx_or_name:
                return False
            s = spdx_or_name.strip().upper()
            copyleft_prefixes = ("GPL", "AGPL", "LGPL", "MPL", "EUPL", "SSPL", "OSL")
            for prefix in copyleft_prefixes:
                if s == prefix or s.startswith(prefix + "-") or s.startswith(prefix + "_") or s.startswith(prefix + "V"):
                    return True
            return False

        def check_declared_license_copyleft(text: str) -> tuple[bool, str]:
            """
            Check explicit license declaration headers in root LICENSE files.
            Requires structured headers (SPDX or formal license title),
            preventing false positives on ordinary words like 'application' or 'template'.
            """
            if not text:
                return False, ""
            
            # Check for explicit SPDX-License-Identifier
            spdx_match = re.search(r"SPDX-License-Identifier:\s*([A-Za-z0-9\.\-\+]+)", text, re.IGNORECASE)
            if spdx_match:
                found_spdx = spdx_match.group(1).upper()
                if is_copyleft_identifier(found_spdx):
                    return True, spdx_match.group(0)
            
            # Check for formal GNU / Mozilla license titles at the top of the file
            gnu_match = re.search(r"GNU\s+(?:AFFERO\s+|LESSER\s+|LIBRARY\s+)?GENERAL\s+PUBLIC\s+LICENSE", text, re.IGNORECASE)
            if gnu_match:
                return True, gnu_match.group(0)
            
            mpl_match = re.search(r"MOZILLA\s+PUBLIC\s+LICENSE", text, re.IGNORECASE)
            if mpl_match:
                return True, mpl_match.group(0)

            return False, ""

        def parse_manifest_declared_license(manifest_path: str, raw_text: str) -> str:
            """
            Parse ONLY the declared 'license' key from root manifest files.
            Never scans lockfiles or unparsed text bodies.
            """
            if not raw_text:
                return ""
            if manifest_path.endswith("package.json"):
                try:
                    data = json.loads(raw_text)
                    lic = data.get("license", "")
                    if isinstance(lic, str):
                        return lic.strip()
                    elif isinstance(lic, dict):
                        return str(lic.get("type", "")).strip()
                except Exception:
                    pass
            elif manifest_path.endswith("Cargo.toml") or manifest_path.endswith("pyproject.toml"):
                match = re.search(r'^\s*license\s*=\s*["\']([^"\']+)["\']', raw_text, re.MULTILINE | re.IGNORECASE)
                if match:
                    return match.group(1).strip()
            return ""

        LICENSE_CANDIDATES = [
            "LICENSE", "license.md", "LICENSE.md", "LICENSE.txt", "license",
            "COPYING", "LICENSE.rst", "LICENSE-MIT", "LICENSE-APACHE"
        ]
        README_CANDIDATES = [
            "README.md", "readme.md", "README.rst", "README.txt", "README"
        ]
        MANIFEST_CANDIDATES = [
            "package.json", "Cargo.toml", "pyproject.toml"
        ]

        def evaluate_repository(include_raw: bool = False) -> dict:
            """
            Executes independent file fetching and rule evaluation.
            """
            if target_claim_type == "SPDX_MATCH":
                readme_res = fetch_first_valid(target_repo, target_commit, README_CANDIDATES)
                license_res = fetch_first_valid(target_repo, target_commit, LICENSE_CANDIDATES)
                
                if readme_res["status"] != "FOUND" or license_res["status"] != "FOUND":
                    outcome = "INSUFFICIENT"
                    missing = []
                    if readme_res["status"] != "FOUND":
                        missing.append(f"{readme_res['path']} ({readme_res['status']})")
                    if license_res["status"] != "FOUND":
                        missing.append(f"{license_res['path']} ({license_res['status']})")
                    reason = f"Insufficient evidence: Could not find valid SPDX license declarations in {', '.join(missing)}."
                elif readme_res["spdx"] == license_res["spdx"]:
                    outcome = "PASS"
                    reason = f"Both {readme_res['path']} and {license_res['path']} explicitly declare the {readme_res['spdx']} license."
                else:
                    outcome = "FAIL"
                    reason = f"License mismatch: {readme_res['path']} declares {readme_res['spdx']}, but {license_res['path']} declares {license_res['spdx']}."
                    
                res = {
                    "outcome": outcome,
                    "reason": reason,
                    "readme_path": readme_res["path"],
                    "license_path": license_res["path"],
                    "readme_excerpt": str(readme_res["excerpt"]),
                    "license_excerpt": str(license_res["excerpt"]),
                    "readme_spdx": readme_res["spdx"],
                    "license_spdx": license_res["spdx"],
                }
                if include_raw:
                    res["readme_raw"] = readme_res.get("raw", "")
                    res["license_raw"] = license_res.get("raw", "")
                return res

            elif target_claim_type == "ALLOWED_LICENSE_SET":
                license_res = fetch_first_valid(target_repo, target_commit, LICENSE_CANDIDATES)
                allowed_list = []
                if target_allowed_licenses_raw:
                    try:
                        allowed_list = json.loads(target_allowed_licenses_raw)
                    except:
                        pass

                if license_res["status"] != "FOUND":
                    outcome = "INSUFFICIENT"
                    reason = f"Insufficient evidence: Could not locate a valid license file with a recognizable license across candidate paths."
                elif license_res["spdx"] in allowed_list:
                    outcome = "PASS"
                    reason = f"{license_res['path']} declares {license_res['spdx']}, which is included in the allowed license set: {allowed_list}."
                else:
                    outcome = "FAIL"
                    reason = f"Policy violation: Found {license_res['spdx']} in {license_res['path']}, but it is not in the allowed licenses list: {allowed_list}."
                    
                res = {
                    "outcome": outcome,
                    "reason": reason,
                    "license_path": license_res["path"],
                    "license_excerpt": str(license_res["excerpt"]),
                    "license_spdx": license_res["spdx"],
                }
                if include_raw:
                    res["license_raw"] = license_res.get("raw", "")
                return res

            elif target_claim_type == "NO_COPYLEFT":
                license_res = fetch_first_valid(target_repo, target_commit, LICENSE_CANDIDATES)
                manifest_res = fetch_first_valid(target_repo, target_commit, MANIFEST_CANDIDATES)
                manifest_path = manifest_res["path"] if manifest_res["status"] != "MISSING" else ""
                
                if license_res["status"] == "MISSING" and manifest_res["status"] == "MISSING":
                    outcome = "INSUFFICIENT"
                    reason = "Insufficient evidence: Could not locate license or package manifest files at commit."
                else:
                    license_is_copyleft, license_copyleft_excerpt = check_declared_license_copyleft(license_res["raw"])
                    manifest_declared_license = parse_manifest_declared_license(manifest_path, manifest_res["raw"])
                    manifest_is_copyleft = is_copyleft_identifier(manifest_declared_license)
                    
                    if license_is_copyleft or manifest_is_copyleft:
                        outcome = "FAIL"
                        sources = []
                        if license_is_copyleft:
                            sources.append(f"{license_res['path']} ({license_copyleft_excerpt})")
                        if manifest_is_copyleft:
                            sources.append(f"{manifest_path} ('license': '{manifest_declared_license}')")
                        reason = f"Policy violation: Detected declared copyleft license in {', '.join(sources)}."
                    else:
                        outcome = "PASS"
                        reason = "No declared copyleft or viral licenses detected in root LICENSE or manifest 'license' fields."
                
                manifest_excerpt = ""
                if manifest_res["raw"]:
                    manifest_declared_license = parse_manifest_declared_license(manifest_path, manifest_res["raw"])
                    if manifest_declared_license:
                        manifest_excerpt = f'"license": "{manifest_declared_license}"'

                res = {
                    "outcome": outcome,
                    "reason": reason,
                    "license_path": license_res["path"],
                    "license_excerpt": str(license_res["excerpt"]),
                    "manifest_excerpt": manifest_excerpt,
                    "manifest_path": manifest_path
                }
                if include_raw:
                    res["license_raw"] = license_res.get("raw", "")
                    res["manifest_raw"] = manifest_res.get("raw", "")
                return res

            else:
                return {"outcome": "INSUFFICIENT", "reason": "Insufficient evidence: Unknown claim type or missing repository data."}

        def leader_fn() -> dict:
            return evaluate_repository(include_raw=False)

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            """
            Strict Consensus Validation:
            1. Executes independent web fetches.
            2. Re-derives verdict locally.
            3. Verifies leader's reported SPDX identifiers match validator's parsed SPDX identifiers.
            4. Validates that leader's excerpts exist as exact substrings within the validator's fetched texts.
            """
            if not isinstance(leaders_res, gl.vm.Return):
                try:
                    leader_fn()
                    return False
                except gl.vm.UserError as e:
                    validator_msg = str(e)
                    leader_msg = leaders_res.message if hasattr(leaders_res, 'message') else ''
                    if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
                        return validator_msg == leader_msg
                    if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
                        return True
                    return False
                except Exception:
                    return False
                
            leader_data = leaders_res.calldata
            if not isinstance(leader_data, dict):
                return False

            # Validator executes its own independent web fetch and evaluation
            val_data = evaluate_repository(include_raw=True)
            
            # 1. Independent Re-derivation: Assert identical outcome verdict
            if val_data.get("outcome") != leader_data.get("outcome"):
                return False

            # 2. Path consistency verification
            if leader_data.get("license_path") != val_data.get("license_path"):
                return False
            if target_claim_type == "SPDX_MATCH":
                if leader_data.get("readme_path") != val_data.get("readme_path"):
                    return False

            # 3. SPDX Identifier verification
            if target_claim_type == "SPDX_MATCH":
                if leader_data.get("readme_spdx") != val_data.get("readme_spdx"):
                    return False
                if leader_data.get("license_spdx") != val_data.get("license_spdx"):
                    return False
            elif target_claim_type == "ALLOWED_LICENSE_SET":
                if leader_data.get("license_spdx") != val_data.get("license_spdx"):
                    return False
            elif target_claim_type == "NO_COPYLEFT":
                if leader_data.get("manifest_path") != val_data.get("manifest_path"):
                    return False

            # 4. Excerpt Substring Verification (Anti-Hallucination)
            # The leader's evidence excerpts MUST exist as genuine substrings in the validator's fetched text
            leader_lic_excerpt = str(leader_data.get("license_excerpt", "")).strip()
            if leader_lic_excerpt:
                val_lic_raw = str(val_data.get("license_raw", ""))
                if leader_lic_excerpt not in val_lic_raw:
                    return False  # Hallucinated license excerpt rejected

            leader_readme_excerpt = str(leader_data.get("readme_excerpt", "")).strip()
            if leader_readme_excerpt:
                val_readme_raw = str(val_data.get("readme_raw", ""))
                if leader_readme_excerpt not in val_readme_raw:
                    return False  # Hallucinated readme excerpt rejected

            leader_manifest_excerpt = str(leader_data.get("manifest_excerpt", "")).strip()
            if leader_manifest_excerpt:
                val_manifest_raw = str(val_data.get("manifest_raw", ""))
                if leader_manifest_excerpt not in val_manifest_raw:
                    return False  # Hallucinated manifest excerpt rejected

            return True

        result_data = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        if not isinstance(result_data, dict):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Invalid consensus result data format")
        if "outcome" not in result_data:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Missing outcome in consensus result")
        
        # Save outcome in main deterministic execution path
        claim.state = "RESOLVED"
        
        if target_claim_type == "SPDX_MATCH":
            files_arr = [
                {"path": result_data.get("readme_path", "README.md"), "excerpt": result_data.get("readme_excerpt", ""), "status": "PROCESSED"},
                {"path": result_data.get("license_path", "LICENSE"), "excerpt": result_data.get("license_excerpt", ""), "status": "PROCESSED"}
            ]
        elif target_claim_type == "ALLOWED_LICENSE_SET":
            files_arr = [
                {"path": result_data.get("license_path", "LICENSE"), "excerpt": result_data.get("license_excerpt", ""), "status": "PROCESSED"}
            ]
        elif target_claim_type == "NO_COPYLEFT":
            files_arr = [
                {"path": result_data.get("license_path", "LICENSE"), "excerpt": result_data.get("license_excerpt", ""), "status": "PROCESSED"}
            ]
            if result_data.get("manifest_path"):
                files_arr.append({"path": result_data.get("manifest_path"), "excerpt": result_data.get("manifest_excerpt", ""), "status": "PROCESSED"})
        else:
            files_arr = []

        result_dict = {
            "outcome": result_data["outcome"],
            "reason": result_data.get("reason", ""),
            "files": files_arr
        }
        claim.result_json = json.dumps(result_dict)
        
        # Reassign back to storage so modifications persist
        self.claims[claim_id] = claim
        
        # Payout based on verdict with Protocol Fee calculation
        if result_data["outcome"] == "PASS":
            fee = (claim.amount * PROTOCOL_FEE_BPS) // u256(10000)
            payout = claim.amount - fee
            if fee > 0:
                gl.get_contract_at(Address(str(self.protocol_treasury))).emit_transfer(value=fee)
            if payout > 0:
                gl.get_contract_at(Address(str(claim.recipient))).emit_transfer(value=payout)
        else:
            # 100% refund to funder on FAIL or INSUFFICIENT
            gl.get_contract_at(Address(str(claim.funder))).emit_transfer(value=claim.amount)

        ClaimResolved(claim_id, result_data["outcome"]).emit()
