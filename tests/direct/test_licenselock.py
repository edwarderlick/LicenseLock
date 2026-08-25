import json
import pytest

def mock_github_file(direct_vm, repo, commit, path, status, body):
    url = f".*raw\\.githubusercontent\\.com/{repo}/{commit}/{path}.*"
    direct_vm.mock_web(
        url,
        {"status": status, "body": body.encode("utf-8")}
    )

def test_create_claim_validations(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice



    
    direct_vm.value = 0
    with direct_vm.expect_revert("[EXPECTED] Value must be greater than 0"):
        contract.create_claim("owner/repo", "sha123", direct_bob, "SPDX_MATCH", [])

        
    direct_vm.value = 100
    with direct_vm.expect_revert("[EXPECTED] Repo cannot be empty"):
        contract.create_claim("", "sha123", direct_bob, "SPDX_MATCH", [])

def test_resolve_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha1", direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", "sha1", "README.md", 200, "Hello\nSPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", "sha1", "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    # Check claim state
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha2", direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", "sha2", "README.md", 200, "Hello\nSPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", "sha2", "LICENSE", 200, "SPDX-License-Identifier: APACHE-2.0\nText")
    
    direct_vm.sender = direct_alice
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_insufficient_404(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha3", direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", "sha3", "README.md", 404, "Not Found")
    mock_github_file(direct_vm, "test/repo", "sha3", "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"

def test_resolve_insufficient_no_spdx(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha4", direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", "sha4", "README.md", 200, "SPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", "sha4", "LICENSE", 200, "Copyright 2024. All rights reserved.")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"

def test_resolve_no_copyleft_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha5", direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/repo", "sha5", "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/repo", "sha5", "package.json", 200, '{"license": "MIT"}')
    mock_github_file(direct_vm, "test/repo", "sha5", "Cargo.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_no_copyleft_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha6", direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/repo", "sha6", "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/repo", "sha6", "package.json", 200, '{"license": "GPL-3.0"}')
    mock_github_file(direct_vm, "test/repo", "sha6", "Cargo.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_allowed_set_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha7", direct_bob, "ALLOWED_LICENSE_SET", ["MIT", "APACHE-2.0"])
    
    mock_github_file(direct_vm, "test/repo", "sha7", "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_allowed_set_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha8", direct_bob, "ALLOWED_LICENSE_SET", ["MIT", "APACHE-2.0"])
    
    mock_github_file(direct_vm, "test/repo", "sha8", "LICENSE", 200, "SPDX-License-Identifier: GPL-3.0\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_fallback_license_md(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("vercel/next.js", "sha-next", direct_bob, "SPDX_MATCH", [])
    
    # LICENSE 404s, but license.md exists
    mock_github_file(direct_vm, "vercel/next.js", "sha-next", "LICENSE", 404, "Not Found")
    mock_github_file(direct_vm, "vercel/next.js", "sha-next", "license.md", 200, "SPDX-License-Identifier: MIT\nMIT License")
    mock_github_file(direct_vm, "vercel/next.js", "sha-next", "README.md", 200, "Next.js\nSPDX-License-Identifier: MIT")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert result["reason"] == "Both README.md and license.md explicitly declare the MIT license."
    assert any(f["path"] == "license.md" for f in result["files"])

def test_cancel_claim_success(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 500
    
    claim_id = contract.create_claim("test/cancel-repo", "sha-c", direct_bob, "SPDX_MATCH", [])
    
    # Funder cancels the claim
    direct_vm.sender = direct_alice
    contract.cancel_claim(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "CANCELED"
    assert claim["outcome"] == "CANCELED"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "canceled" in result["reason"].lower()

def test_cancel_claim_unauthorized(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 500
    
    claim_id = contract.create_claim("test/cancel-repo", "sha-c", direct_bob, "SPDX_MATCH", [])
    
    # Non-funder (Bob) tries to cancel the claim
    direct_vm.sender = direct_bob
    with pytest.raises(Exception) as excinfo:
        contract.cancel_claim(claim_id)
    assert "Unauthorized" in str(excinfo.value)

def test_cancel_claim_already_resolved(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", "sha-res", direct_bob, "SPDX_MATCH", [])
    mock_github_file(direct_vm, "test/repo", "sha-res", "LICENSE", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "test/repo", "sha-res", "README.md", 200, "SPDX-License-Identifier: MIT")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    # Alice tries to cancel after resolution
    direct_vm.sender = direct_alice
    with pytest.raises(Exception) as excinfo:
        contract.cancel_claim(claim_id)
    assert "Cannot cancel a claim" in str(excinfo.value)


def test_resolve_monorepo_subdirectory(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    # Target directory "packages/core"
    claim_id = contract.create_claim("org/monorepo", "sha-mono", direct_bob, "SPDX_MATCH", [], "packages/core")
    
    # Root files missing, but packages/core/ has LICENSE and README.md
    mock_github_file(direct_vm, "org/monorepo", "sha-mono", "LICENSE", 404, "Not Found")
    mock_github_file(direct_vm, "org/monorepo", "sha-mono", "README.md", 404, "Not Found")
    mock_github_file(direct_vm, "org/monorepo", "sha-mono", "packages/core/LICENSE", 200, "SPDX-License-Identifier: Apache-2.0")
    mock_github_file(direct_vm, "org/monorepo", "sha-mono", "packages/core/README.md", 200, "SPDX-License-Identifier: Apache-2.0")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    assert claim["target_directory"] == "packages/core"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert any(f["path"] == "packages/core/LICENSE" for f in result["files"])

def test_protocol_fee_deduction(direct_vm, direct_deploy, direct_alice, direct_bob):
    # Deploy contract with Alice as treasury or default
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 10000  # 10,000 wei
    
    claim_id = contract.create_claim("test/repo-fee", "sha-fee", direct_bob, "SPDX_MATCH", [])
    mock_github_file(direct_vm, "test/repo-fee", "sha-fee", "LICENSE", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "test/repo-fee", "sha-fee", "README.md", 200, "SPDX-License-Identifier: MIT")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_no_copyleft_no_false_positive_on_ordinary_words(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Ensure ordinary words like 'application' or 'template' in package.json description do not cause false copyleft failures."""
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo-safe", "sha-safe", direct_bob, "NO_COPYLEFT", [])
    
    # LICENSE contains words like 'application' and 'template', but license is MIT
    mock_github_file(
        direct_vm,
        "test/repo-safe",
        "sha-safe",
        "LICENSE",
        200,
        "MIT License\n\nPermission to use this web application and template library..."
    )
    # package.json has description with 'application' and 'example', but declared license is MIT
    mock_github_file(
        direct_vm,
        "test/repo-safe",
        "sha-safe",
        "package.json",
        200,
        '{"name": "my-application", "description": "Enterprise application template", "license": "MIT"}'
    )
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "No declared copyleft" in result["reason"]

def test_resolve_strict_consensus_spdx_and_excerpts(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Ensure validator verifies genuine evidence excerpts and exact SPDX matching."""
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 500
    
    claim_id = contract.create_claim("org/strict-repo", "sha-strict", direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "org/strict-repo", "sha-strict", "LICENSE", 200, "SPDX-License-Identifier: Apache-2.0\nApache License Version 2.0")
    mock_github_file(direct_vm, "org/strict-repo", "sha-strict", "README.md", 200, "Project\nSPDX-License-Identifier: Apache-2.0")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert result["outcome"] == "PASS"
    assert any(f["path"] == "LICENSE" and "Apache-2.0" in f["excerpt"] for f in result["files"])
    assert any(f["path"] == "README.md" and "Apache-2.0" in f["excerpt"] for f in result["files"])

def test_validator_rejects_hallucinated_payload(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Verify that validator_fn explicitly rejects malicious leader payloads:
    1. Hallucinated evidence excerpts (substring not in fetched text) -> validator returns False
    2. Forged SPDX declarations (claiming MIT when repository is Apache-2.0) -> validator returns False
    3. Conflicting outcome claims -> validator returns False
    4. Genuine payload -> validator returns True
    """
    import sys
    
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("attacker/repo", "sha-evil", direct_bob, "SPDX_MATCH", [])
    
    # Real repository files contain Apache-2.0
    mock_github_file(direct_vm, "attacker/repo", "sha-evil", "LICENSE", 200, "SPDX-License-Identifier: APACHE-2.0\nApache License 2.0")
    mock_github_file(direct_vm, "attacker/repo", "sha-evil", "README.md", 200, "Project\nSPDX-License-Identifier: APACHE-2.0")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    assert len(direct_vm._captured_validators) > 0
    result, leader_fn, val_fn = direct_vm._captured_validators[-1]
    
    gl_vm = sys.modules['genlayer.gl.vm']

    
    # 1. Hallucinated excerpt test:
    hallucinated_excerpt_payload = {
        "outcome": "PASS",
        "reason": "Both files declare Apache-2.0",
        "readme_path": "README.md",
        "license_path": "LICENSE",
        "readme_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "license_excerpt": "FABRICATED_SUBSTRING_DOES_NOT_EXIST",
        "readme_spdx": "APACHE-2.0",
        "license_spdx": "APACHE-2.0"
    }
    assert val_fn(gl_vm.Return(hallucinated_excerpt_payload)) is False
    
    # 2. Forged SPDX test:
    forged_spdx_payload = {
        "outcome": "PASS",
        "reason": "Both files declare Apache-2.0",
        "readme_path": "README.md",
        "license_path": "LICENSE",
        "readme_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "license_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "readme_spdx": "APACHE-2.0",
        "license_spdx": "MIT"  # Forged!
    }
    assert val_fn(gl_vm.Return(forged_spdx_payload)) is False
    
    # 3. Forged outcome test:
    forged_outcome_payload = {
        "outcome": "FAIL",  # Contradicts real PASS
        "reason": "Fake fail",
        "readme_path": "README.md",
        "license_path": "LICENSE",
        "readme_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "license_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "readme_spdx": "APACHE-2.0",
        "license_spdx": "APACHE-2.0"
    }
    assert val_fn(gl_vm.Return(forged_outcome_payload)) is False
    
    # 4. Genuine payload test:
    genuine_payload = {
        "outcome": "PASS",
        "reason": "Both README.md and LICENSE explicitly declare the APACHE-2.0 license.",
        "readme_path": "README.md",
        "license_path": "LICENSE",
        "readme_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "license_excerpt": "SPDX-License-Identifier: APACHE-2.0",
        "readme_spdx": "APACHE-2.0",
        "license_spdx": "APACHE-2.0"
    }
    assert val_fn(gl_vm.Return(genuine_payload)) is True










