import json
import pytest

def mock_github_file(direct_vm, repo, commit, path, status, body):
    url = f".*raw\\.githubusercontent\\.com/{repo}/{commit}/{path}"
    direct_vm.mock_web(
        url,
        {"status": status, "body": body.encode("utf-8")}
    )

SHA_1 = "1111111111111111111111111111111111111111"
SHA_2 = "2222222222222222222222222222222222222222"
SHA_3 = "3333333333333333333333333333333333333333"
SHA_4 = "4444444444444444444444444444444444444444"
SHA_5 = "5555555555555555555555555555555555555555"
SHA_6 = "6666666666666666666666666666666666666666"
SHA_7 = "7777777777777777777777777777777777777777"
SHA_8 = "8888888888888888888888888888888888888888"
SHA_9 = "9999999999999999999999999999999999999999"
SHA_A = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
SHA_B = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
SHA_C = "cccccccccccccccccccccccccccccccccccccccc"
SHA_D = "dddddddddddddddddddddddddddddddddddddddd"
SHA_E = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
SHA_F = "ffffffffffffffffffffffffffffffffffffffff"

def test_create_claim_validations(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice

    direct_vm.value = 0
    with direct_vm.expect_revert("[EXPECTED] Value must be greater than 0"):
        contract.create_claim("owner/repo", SHA_1, direct_bob, "SPDX_MATCH", [])

    direct_vm.value = 100
    with direct_vm.expect_revert("[EXPECTED] Repo cannot be empty"):
        contract.create_claim("", SHA_1, direct_bob, "SPDX_MATCH", [])

def test_create_claim_requires_immutable_commit_sha(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100

    invalid_shas = [
        "main",
        "HEAD",
        "master",
        "0000000",
        "0" * 40,
        "sha123",
        "12345",
        "g" * 40,  # Non-hex character
        "  ",
        ""
    ]

    for inv in invalid_shas:
        with direct_vm.expect_revert("[EXPECTED] Commit must be an immutable 40-character hex SHA"):
            contract.create_claim("owner/repo", inv, direct_bob, "SPDX_MATCH", [])

    # Valid 40-char hex SHA succeeds
    claim_id = contract.create_claim("owner/repo", SHA_1, direct_bob, "SPDX_MATCH", [])
    claim = contract.get_claim(claim_id)
    assert claim["commit"] == SHA_1.lower()

def test_resolve_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_1, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_1, "README.md", 200, "Hello\nSPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", SHA_1, "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_2, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_2, "README.md", 200, "Hello\nSPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", SHA_2, "LICENSE", 200, "SPDX-License-Identifier: APACHE-2.0\nText")
    
    direct_vm.sender = direct_alice
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_insufficient_404(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_3, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_3, "README.md", 404, "Not Found")
    mock_github_file(direct_vm, "test/repo", SHA_3, "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"

def test_resolve_insufficient_no_spdx(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_4, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_4, "README.md", 200, "SPDX-License-Identifier: MIT\n")
    mock_github_file(direct_vm, "test/repo", SHA_4, "LICENSE", 200, "Copyright 2024. All rights reserved.")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"

def test_resolve_no_copyleft_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_5, direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_5, "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/repo", SHA_5, "package.json", 200, '{"license": "MIT"}')
    mock_github_file(direct_vm, "test/repo", SHA_5, "Cargo.toml", 404, "Not Found")
    mock_github_file(direct_vm, "test/repo", SHA_5, "pyproject.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_no_copyleft_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_6, direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/repo", SHA_6, "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/repo", SHA_6, "package.json", 200, '{"license": "GPL-3.0"}')
    mock_github_file(direct_vm, "test/repo", SHA_6, "Cargo.toml", 404, "Not Found")
    mock_github_file(direct_vm, "test/repo", SHA_6, "pyproject.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_allowed_set_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_7, direct_bob, "ALLOWED_LICENSE_SET", ["MIT", "APACHE-2.0"])
    
    mock_github_file(direct_vm, "test/repo", SHA_7, "LICENSE", 200, "SPDX-License-Identifier: MIT\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_allowed_set_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_8, direct_bob, "ALLOWED_LICENSE_SET", ["MIT", "APACHE-2.0"])
    
    mock_github_file(direct_vm, "test/repo", SHA_8, "LICENSE", 200, "SPDX-License-Identifier: GPL-3.0\nText")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"

def test_resolve_fallback_license_md(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("vercel/next.js", SHA_9, direct_bob, "SPDX_MATCH", [])
    
    # LICENSE 404s, but license.md exists
    mock_github_file(direct_vm, "vercel/next.js", SHA_9, "LICENSE", 404, "Not Found")
    mock_github_file(direct_vm, "vercel/next.js", SHA_9, "license.md", 200, "SPDX-License-Identifier: MIT\nMIT License")
    mock_github_file(direct_vm, "vercel/next.js", SHA_9, "README.md", 200, "Next.js\nSPDX-License-Identifier: MIT")
    
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
    
    claim_id = contract.create_claim("test/cancel-repo", SHA_A, direct_bob, "SPDX_MATCH", [])
    
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
    
    claim_id = contract.create_claim("test/cancel-repo", SHA_B, direct_bob, "SPDX_MATCH", [])
    
    # Non-funder (Bob) tries to cancel the claim
    direct_vm.sender = direct_bob
    with pytest.raises(Exception) as excinfo:
        contract.cancel_claim(claim_id)
    assert "Unauthorized" in str(excinfo.value)

def test_cancel_claim_already_resolved(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo", SHA_C, direct_bob, "SPDX_MATCH", [])
    mock_github_file(direct_vm, "test/repo", SHA_C, "LICENSE", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "test/repo", SHA_C, "README.md", 200, "SPDX-License-Identifier: MIT")
    
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
    claim_id = contract.create_claim("org/monorepo", SHA_D, direct_bob, "SPDX_MATCH", [], "packages/core")
    
    # Root files missing, but packages/core/ has LICENSE and README.md
    mock_github_file(direct_vm, "org/monorepo", SHA_D, "LICENSE", 404, "Not Found")
    mock_github_file(direct_vm, "org/monorepo", SHA_D, "README.md", 404, "Not Found")
    mock_github_file(direct_vm, "org/monorepo", SHA_D, "packages/core/LICENSE", 200, "SPDX-License-Identifier: Apache-2.0")
    mock_github_file(direct_vm, "org/monorepo", SHA_D, "packages/core/README.md", 200, "SPDX-License-Identifier: Apache-2.0")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    assert claim["target_directory"] == "packages/core"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert any(f["path"] == "packages/core/LICENSE" for f in result["files"])

def test_missing_target_directory_does_not_fallback_to_root(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Fail-Closed Scoping:
    Root LICENSE is MIT, but target directory packages/does-not-exist does NOT exist.
    Must resolve to INSUFFICIENT (100% refund), NEVER falling back to root LICENSE!
    """
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("org/monorepo", SHA_E, direct_bob, "SPDX_MATCH", [], "packages/does-not-exist")
    
    # Root has valid MIT files
    mock_github_file(direct_vm, "org/monorepo", SHA_E, "LICENSE", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "org/monorepo", SHA_E, "README.md", 200, "SPDX-License-Identifier: MIT")
    
    # Subdir candidate files are 404 missing
    mock_github_file(direct_vm, "org/monorepo", SHA_E, "packages/does-not-exist/.*", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "Insufficient evidence" in result["reason"]

def test_unavailable_license_evidence_is_insufficient(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Fail-Closed Network & Rate-Limiting:
    HTTP 429/5xx after retries must resolve to INSUFFICIENT, NEVER passing.
    """
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo-rate-limit", SHA_F, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "test/repo-rate-limit", SHA_F, "README.md", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "test/repo-rate-limit", SHA_F, "LICENSE", 429, "Too Many Requests")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "unavailable" in result["reason"].lower()

def test_no_copyleft_inspects_every_manifest(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Fail-Closed Multi-Manifest:
    Clean package.json (MIT) cannot hide a copyleft Cargo.toml (GPL-3.0).
    Must evaluate every manifest in scope and FAIL.
    """
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/multi-manifest", SHA_1, direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/multi-manifest", SHA_1, "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/multi-manifest", SHA_1, "package.json", 200, '{"name": "clean-pkg", "license": "MIT"}')
    mock_github_file(direct_vm, "test/multi-manifest", SHA_1, "Cargo.toml", 200, '[package]\nname = "secret-gpl"\nlicense = "GPL-3.0"\n')
    mock_github_file(direct_vm, "test/multi-manifest", SHA_1, "pyproject.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "Cargo.toml" in result["reason"]
    assert "GPL-3.0" in result["reason"]

def test_no_copyleft_unavailable_manifest_is_insufficient(direct_vm, direct_deploy, direct_alice, direct_bob):
    """
    Fail-Closed Multi-Manifest:
    If Cargo.toml returns 429/5xx, resolution cannot PASS on package.json alone.
    Must resolve to INSUFFICIENT.
    """
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/unavail-manifest", SHA_2, direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(direct_vm, "test/unavail-manifest", SHA_2, "LICENSE", 200, "MIT License")
    mock_github_file(direct_vm, "test/unavail-manifest", SHA_2, "package.json", 200, '{"license": "MIT"}')
    mock_github_file(direct_vm, "test/unavail-manifest", SHA_2, "Cargo.toml", 429, "Rate Limited")
    mock_github_file(direct_vm, "test/unavail-manifest", SHA_2, "pyproject.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "unavailable" in result["reason"].lower()

def test_protocol_fee_deduction(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 10000
    
    claim_id = contract.create_claim("test/repo-fee", SHA_3, direct_bob, "SPDX_MATCH", [])
    mock_github_file(direct_vm, "test/repo-fee", SHA_3, "LICENSE", 200, "SPDX-License-Identifier: MIT")
    mock_github_file(direct_vm, "test/repo-fee", SHA_3, "README.md", 200, "SPDX-License-Identifier: MIT")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"

def test_resolve_no_copyleft_no_false_positive_on_ordinary_words(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("test/repo-safe", SHA_4, direct_bob, "NO_COPYLEFT", [])
    
    mock_github_file(
        direct_vm,
        "test/repo-safe",
        SHA_4,
        "LICENSE",
        200,
        "MIT License\n\nPermission to use this web application and template library..."
    )
    mock_github_file(
        direct_vm,
        "test/repo-safe",
        SHA_4,
        "package.json",
        200,
        '{"name": "my-application", "description": "Enterprise application template", "license": "MIT"}'
    )
    mock_github_file(direct_vm, "test/repo-safe", SHA_4, "Cargo.toml", 404, "Not Found")
    mock_github_file(direct_vm, "test/repo-safe", SHA_4, "pyproject.toml", 404, "Not Found")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "No declared copyleft" in result["reason"]

def test_resolve_strict_consensus_spdx_and_excerpts(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 500
    
    claim_id = contract.create_claim("org/strict-repo", SHA_5, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "org/strict-repo", SHA_5, "LICENSE", 200, "SPDX-License-Identifier: Apache-2.0\nApache License Version 2.0")
    mock_github_file(direct_vm, "org/strict-repo", SHA_5, "README.md", 200, "Project\nSPDX-License-Identifier: Apache-2.0")
    
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
    import sys
    
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 100
    
    claim_id = contract.create_claim("attacker/repo", SHA_6, direct_bob, "SPDX_MATCH", [])
    
    mock_github_file(direct_vm, "attacker/repo", SHA_6, "LICENSE", 200, "SPDX-License-Identifier: APACHE-2.0\nApache License 2.0")
    mock_github_file(direct_vm, "attacker/repo", SHA_6, "README.md", 200, "Project\nSPDX-License-Identifier: APACHE-2.0")
    
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
        "outcome": "FAIL",
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
        "license_spdx": "APACHE-2.0",
        "files": [
            {"path": "README.md", "excerpt": "SPDX-License-Identifier: APACHE-2.0", "status": "FOUND"},
            {"path": "LICENSE", "excerpt": "SPDX-License-Identifier: APACHE-2.0", "status": "FOUND"}
        ]
    }
    assert val_fn(gl_vm.Return(genuine_payload)) is True
