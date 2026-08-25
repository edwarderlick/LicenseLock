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
    assert "not OPEN" in str(excinfo.value)

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

def test_semantic_audit_pass(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    
    custom_prompt = "Must permit commercial usage and modification without copyleft viral terms"
    claim_id = contract.create_claim(
        "org/ai-repo",
        "sha-ai",
        direct_bob,
        "SEMANTIC_AUDIT",
        [],
        "",
        custom_prompt
    )
    
    mock_github_file(
        direct_vm,
        "org/ai-repo",
        "sha-ai",
        "LICENSE",
        200,
        "MIT License\n\nPermission is hereby granted, free of charge..."
    )
    
    # Mock GenVM LLM response
    direct_vm.mock_llm(
        ".*",
        json.dumps({
            "verdict": "PASS",
            "reasoning": "The MIT license grants unrestricted commercial usage and modification with no copyleft obligations."
        })
    )
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "MIT license grants unrestricted commercial usage" in result["reason"]

def test_semantic_audit_fail(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    
    custom_prompt = "Must permit closed-source proprietary distribution without source disclosure"
    claim_id = contract.create_claim(
        "org/gpl-repo",
        "sha-gpl",
        direct_bob,
        "SEMANTIC_AUDIT",
        [],
        "",
        custom_prompt
    )
    
    mock_github_file(
        direct_vm,
        "org/gpl-repo",
        "sha-gpl",
        "LICENSE",
        200,
        "GNU GENERAL PUBLIC LICENSE Version 3..."
    )
    
    # Mock LLM fail verdict
    direct_vm.mock_llm(
        ".*",
        json.dumps({
            "verdict": "FAIL",
            "reasoning": "GPLv3 is a strong reciprocal copyleft license that requires complete source code disclosure upon distribution."
        })
    )
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "FAIL"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "copyleft" in result["reason"].lower()

def test_semantic_audit_conversational_padding(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Ensure regex extractor handles markdown fences and conversational wrapper text without crashing."""
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    
    claim_id = contract.create_claim(
        "org/chat-repo",
        "sha-chat",
        direct_bob,
        "SEMANTIC_AUDIT",
        [],
        "",
        "Must be MIT compatible"
    )
    
    mock_github_file(
        direct_vm,
        "org/chat-repo",
        "sha-chat",
        "LICENSE",
        200,
        "MIT License\n\nCopyright (c) 2026..."
    )
    
    # Mock LLM returning conversational padding around markdown JSON
    conversational_response = (
        "Hello! I have completed your legal review.\n"
        "Here is the evaluation payload:\n"
        "```json\n"
        "{\n"
        '  "verdict": "PASS",\n'
        '  "reasoning": "The repository is licensed under the permissive MIT license."\n'
        "}\n"
        "```\n"
        "Let me know if you need anything else!"
    )
    direct_vm.mock_llm(".*", conversational_response)
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "PASS"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "permissive mit license" in result["reason"].lower()

def test_semantic_audit_garbled_output_safe_fallback(direct_vm, direct_deploy, direct_alice, direct_bob):
    """Ensure garbled/non-JSON LLM responses never cause fatal revert and safely refund as INSUFFICIENT."""
    contract = direct_deploy("contracts/licenselock.py")
    direct_vm.sender = direct_alice
    direct_vm.value = 1000
    
    claim_id = contract.create_claim(
        "org/garbled-repo",
        "sha-garbled",
        direct_bob,
        "SEMANTIC_AUDIT",
        [],
        "",
        "Must be MIT compatible"
    )
    
    mock_github_file(
        direct_vm,
        "org/garbled-repo",
        "sha-garbled",
        "LICENSE",
        200,
        "MIT License\n\nCopyright (c) 2026..."
    )
    
    # Mock LLM returning totally unparsable string
    direct_vm.mock_llm(".*", "I am unable to answer this question due to safety policies.")
    
    direct_vm.sender = direct_bob
    contract.resolve(claim_id)
    
    claim = contract.get_claim(claim_id)
    assert claim["state"] == "RESOLVED"
    assert claim["outcome"] == "INSUFFICIENT"
    result = claim["result_json"] if isinstance(claim["result_json"], dict) else json.loads(claim["result_json"])
    assert "unparsable" in result["reason"].lower()





