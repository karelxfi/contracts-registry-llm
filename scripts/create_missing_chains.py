#!/usr/bin/env python3
"""
Create all missing chain files from the CHAIN_METADATA.
"""

import json
import sys
from pathlib import Path

# Import the chain metadata from the main script
sys.path.insert(0, str(Path(__file__).parent))
from generate_protocols_from_defillama import CHAIN_METADATA

def create_chain_file(chain_id: str, metadata: dict, base_dir: Path) -> bool:
    """Create a chain file."""
    chain_file = base_dir / "data" / "sources" / "chains" / f"{chain_id}.json"

    if chain_file.exists():
        return False

    chain_data = {
        "id": chain_id,
        "name": metadata["name"],
        "platform": metadata["platform"],
        "status": "active"
    }

    if metadata["chainId"] is not None:
        chain_data["chainId"] = metadata["chainId"]

    if metadata["portalDataset"]:
        chain_data["portalDataset"] = metadata["portalDataset"]

    chain_data["explorers"] = {
        "primary": {
            "name": metadata["explorer"]["name"],
            "url": metadata["explorer"]["url"]
        }
    }
    if metadata["explorer"]["api"]:
        chain_data["explorers"]["primary"]["api"] = metadata["explorer"]["api"]

    chain_data["rpc"] = {"public": metadata["rpc"]}

    chain_data["nativeCurrency"] = {
        "name": metadata["currency"]["name"],
        "symbol": metadata["currency"]["symbol"],
        "decimals": metadata["currency"]["decimals"]
    }

    # Write chain file
    chain_file.parent.mkdir(parents=True, exist_ok=True)
    with open(chain_file, 'w') as f:
        json.dump(chain_data, f, indent=2)

    return True


def main():
    base_dir = Path("/Users/account/contracts-registry-llm")

    created = 0
    skipped = 0

    print(f"Processing {len(CHAIN_METADATA)} chains...")

    for chain_id, metadata in sorted(CHAIN_METADATA.items()):
        if create_chain_file(chain_id, metadata, base_dir):
            print(f"  ✓ Created: {chain_id}")
            created += 1
        else:
            skipped += 1

    print(f"\nCreated: {created}")
    print(f"Skipped (already exist): {skipped}")
    print(f"Total: {len(CHAIN_METADATA)}")


if __name__ == "__main__":
    main()
