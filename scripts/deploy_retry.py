import sys
import time
import genlayer_py as gl

def main():
    print("Connecting to GenLayer StudioNet...", flush=True)
    account = gl.create_account()
    client = gl.create_client(gl.studionet, account=account)
    print(f"Deployer account address: {account.address}", flush=True)
    
    with open("contracts/licenselock.py", "r", encoding="utf-8") as f:
        code = f.read()

    for attempt in range(5):
        print(f"\n--- Deployment Attempt {attempt+1}/5 ---", flush=True)
        tx_hash = client.deploy_contract(code=code, account=account, args=[])
        print(f"Deployment Transaction Hash: {tx_hash}", flush=True)
        
        print("Polling transaction on StudioNet...", flush=True)
        for _ in range(40):
            time.sleep(3)
            try:
                tx = client.get_transaction(tx_hash)
                status_name = tx.get("status_name")
                print(f"Status: {status_name}", flush=True)
                if status_name == "FINALIZED":
                    contract_address = tx.get("contract_address")
                    last_round = tx.get("last_round", {})
                    result = last_round.get("result")
                    print(f"Round Result: {result}", flush=True)
                    if contract_address:
                        print(f"Deployed Contract Address: {contract_address}", flush=True)
                        return contract_address
                    else:
                        print("Deployment failed (no contract address). Retrying...", flush=True)
                        break
            except Exception as e:
                print(f"Polling error: {e}", flush=True)
        time.sleep(5)
    print("Failed to deploy after 5 attempts.")
    sys.exit(1)

if __name__ == "__main__":
    main()
