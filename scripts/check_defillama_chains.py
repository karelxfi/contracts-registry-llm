#!/usr/bin/env python3
"""
Check all unique chains in DeFi Llama data and compare with our chain mappings.
"""

import json
from pathlib import Path

# Import the chain mapping
import sys
sys.path.insert(0, str(Path(__file__).parent))
from generate_protocols_from_defillama import CHAIN_MAPPING

def main():
    input_file = Path("/private/tmp/defi-llama-protocols.json")

    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return

    # Read DeFi Llama data
    with open(input_file, 'r') as f:
        protocols = json.load(f)

    # Collect all unique chains
    all_chains = set()
    for protocol in protocols:
        chains = protocol.get("chains", [])
        if isinstance(chains, str):
            chains = [chains]
        for chain in chains:
            if chain:
                all_chains.add(chain)

    # Check which chains are mapped and which are not
    mapped = set()
    unmapped = set()

    for chain in sorted(all_chains):
        if chain in CHAIN_MAPPING:
            mapped.add(chain)
        else:
            unmapped.add(chain)

    print(f"Total unique chains in DeFi Llama: {len(all_chains)}")
    print(f"Mapped chains: {len(mapped)}")
    print(f"Unmapped chains: {len(unmapped)}")

    if unmapped:
        print(f"\nUnmapped chains ({len(unmapped)}):")
        for chain in sorted(unmapped):
            print(f"  - {chain}")

    # Show unique mapped chain IDs
    unique_chain_ids = set()
    for chain in mapped:
        chain_id = CHAIN_MAPPING[chain]
        unique_chain_ids.add(chain_id)

    print(f"\nUnique chain IDs (our identifiers): {len(unique_chain_ids)}")
    print("\nChain IDs:")
    for chain_id in sorted(unique_chain_ids):
        print(f"  - {chain_id}")


if __name__ == "__main__":
    main()
