#!/usr/bin/env python3
"""
Generate protocol files from DeFi Llama protocols data with high-TVL chains.

This script:
1. Loads chains data from DeFi Llama chains API
2. Filters to only chains with TVL > 10M
3. Determines platform type for each chain (EVM/SVM/Bitcoin/Cosmos/Move/Other)
4. Creates chain files with actual metadata from the chains API
5. Only creates protocol files for high-TVL chains
6. Uses platform-aware contract structures
"""

import json
import os
import sys
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional

# TVL threshold for chains
TVL_THRESHOLD = 10_000_000

def determine_platform(chain_name: str, token_symbol: Optional[str] = None) -> str:
    """
    Determine the platform type for a chain based on its name and characteristics.

    Returns: evm, svm, bitcoin, cosmos, move, or other
    """
    chain_lower = chain_name.lower()

    # SVM (Solana Virtual Machine)
    if "solana" in chain_lower or "eclipse" in chain_lower:
        return "svm"

    # Bitcoin-based
    if "bitcoin" in chain_lower or "btc" in chain_lower:
        return "bitcoin"

    # Cosmos ecosystem
    cosmos_chains = [
        "osmosis", "cosmos", "cosmoshub", "injective", "neutron", "kujira",
        "sei", "juno", "archway", "akash", "terra", "crescent", "stride",
        "umee", "comdex", "persistence", "stargaze", "axelar", "chihuahua",
        "secret", "thorchain", "mayachain", "nibiru", "saga", "celestia",
        "dydx", "nolus", "migaloo", "xpla", "orai", "stargaze", "aura",
        "bostrom", "agoric", "elys", "mantra", "initia"
    ]
    for cosmos_chain in cosmos_chains:
        if cosmos_chain in chain_lower:
            return "cosmos"

    # Move-based
    if "aptos" in chain_lower or "sui" in chain_lower or "movement" in chain_lower:
        return "move"

    # Other known non-EVM platforms
    other_platforms = {
        "near": "other",
        "ton": "other",
        "tron": "other",
        "starknet": "other",
        "stellar": "other",
        "algorand": "other",
        "cardano": "other",
        "tezos": "other",
        "flow": "other",
        "hedera": "other",
        "icp": "other",
        "polkadot": "other",
        "kusama": "other",
        "elrond": "other",
        "multiversx": "other",
        "waves": "other",
        "zilliqa": "other",
        "mixin": "other",
        "neo": "other",
        "icon": "other",
        "vechain": "other",
        "theta": "other",
        "eos": "other",
        "wax": "other",
        "ultra": "other",
        "aleph zero": "other",
        "casper": "other",
        "xrpl": "other",
        "litecoin": "other",
        "doge": "other",
        "vaulta": "other",
        "radix": "other",
        "ergo": "other",
        "kadena": "other",
        "mina": "other",
        "fuel": "other",
        "hyperliquid": "other",
        "provenance": "other",
        "alephium": "other",
        "qubic": "other",
        "verus": "other",
    }

    for platform_name, platform_type in other_platforms.items():
        if platform_name in chain_lower:
            return platform_type

    # Default to EVM for everything else
    # Most chains are EVM-compatible
    return "evm"


def create_chain_id(name: str) -> str:
    """Create a chain ID from the chain name."""
    # Convert to lowercase and replace spaces/special chars with hyphens
    chain_id = name.lower()
    chain_id = chain_id.replace(" ", "-")
    chain_id = chain_id.replace("_", "-")

    # Special cases for common abbreviations
    replacements = {
        "bnb-smart-chain": "bsc",
        "op-mainnet": "optimism",
        "arbitrum-one": "arbitrum",
        "polygon-pos": "polygon",
        "avalanche-c-chain": "avalanche",
        "fantom-opera": "fantom",
        "cosmoshub": "cosmos",
        "terra2": "terra-2",
    }

    return replacements.get(chain_id, chain_id)


def create_chain_name_mapping(chains_data: List[Dict]) -> Dict[str, str]:
    """Create mapping from DeFi Llama chain names to our chain IDs."""
    mapping = {}
    for chain in chains_data:
        name = chain.get("name", "")
        if name:
            chain_id = create_chain_id(name)
            mapping[name] = chain_id
    return mapping


def create_chain_file(chain_data: Dict[str, Any], base_dir: Path) -> None:
    """Create a chain file from DeFi Llama chain data."""
    name = chain_data.get("name", "")
    if not name:
        return

    chain_id = create_chain_id(name)
    chain_file = base_dir / "data" / "sources" / "chains" / f"{chain_id}.json"

    # Determine platform
    platform = determine_platform(name, chain_data.get("tokenSymbol"))

    # Build chain file structure
    chain_json = {
        "id": chain_id,
        "name": name,
        "platform": platform,
        "status": "active"
    }

    # Add chainId if present and valid
    if chain_data.get("chainId") is not None:
        try:
            # Handle string chain IDs
            chain_num_id = chain_data["chainId"]
            if isinstance(chain_num_id, str):
                chain_num_id = int(chain_num_id)
            chain_json["chainId"] = chain_num_id
        except (ValueError, TypeError):
            pass

    # Add TVL for reference
    if chain_data.get("tvl") is not None:
        chain_json["tvl"] = chain_data["tvl"]

    # Add token information
    token_symbol = chain_data.get("tokenSymbol")
    if token_symbol:
        chain_json["nativeCurrency"] = {
            "name": token_symbol,
            "symbol": token_symbol,
            "decimals": 18 if platform == "evm" else 9 if platform == "svm" else 8
        }

    # Add gecko_id if present
    if chain_data.get("gecko_id"):
        chain_json["gecko_id"] = chain_data["gecko_id"]

    # Add cmcId if present
    if chain_data.get("cmcId"):
        chain_json["cmcId"] = chain_data["cmcId"]

    # Add placeholder explorers
    chain_json["explorers"] = {
        "primary": {
            "name": f"{name} Explorer",
            "url": f"https://explorer.{chain_id}.network"
        }
    }

    # Add placeholder RPC
    chain_json["rpc"] = {
        "public": []
    }

    # Write chain file
    chain_file.parent.mkdir(parents=True, exist_ok=True)
    with open(chain_file, 'w') as f:
        json.dump(chain_json, f, indent=2)

    print(f"  ✓ Created chain: {chain_id} (TVL: ${chain_data.get('tvl', 0):,.2f}, Platform: {platform})")


def get_contract_address_field(platform: str) -> str:
    """Get the appropriate contract address field name for a platform."""
    if platform == "svm":
        return "programId"
    elif platform == "evm":
        return "address"
    else:
        return "address"  # Default to address for other platforms


def create_protocol_file(
    protocol: Dict[str, Any],
    base_dir: Path,
    existing_protocols: set,
    chain_mapping: Dict[str, str],
    valid_chains: set,
    chain_platforms: Dict[str, str]
) -> bool:
    """Create a protocol file from DeFi Llama data, only for valid chains."""
    slug = protocol.get("slug")
    if not slug:
        return False

    # Skip existing protocols
    if slug in existing_protocols:
        return False

    # Map chains
    chains = protocol.get("chains", [])
    if isinstance(chains, str):
        chains = [chains]

    mapped_chains = []
    for chain in chains:
        mapped = chain_mapping.get(chain)
        if mapped and mapped in valid_chains:
            mapped_chains.append(mapped)

    if not mapped_chains:
        # Skip protocols without valid high-TVL chains
        return False

    # Create protocol data structure
    protocol_data = {
        "id": slug,
        "name": protocol.get("name", slug),
        "type": protocol.get("category", "defi").lower(),
        "website": protocol.get("url", ""),
        "github": protocol.get("github", "") or "",
        "docs": "",
        "tags": [protocol.get("category", "defi").lower()] + mapped_chains,
        "contracts": {
            "main": {
                "name": f"{protocol.get('name', slug)} Main Contract",
                "type": "core",
                "description": f"Main contract for {protocol.get('name', slug)}",
                "proxy": False,
                "keyEvents": [],
                "keyFunctions": [],
                "useCases": [
                    "Track protocol activity",
                    "Monitor TVL changes",
                    "Analyze user interactions"
                ]
            }
        },
        "deployments": {}
    }

    # Create deployments for each chain with platform-aware contract fields
    for chain_id in mapped_chains:
        platform = chain_platforms.get(chain_id, "evm")
        address_field = get_contract_address_field(platform)

        deployment = {
            "chain": chain_id,
            "addresses": {
                "main": ""  # To be filled later
            },
            "deploymentBlocks": {
                "main": None
            },
            "verified": {
                "main": False
            },
            "source": "defillama",
            "sourceUrl": f"https://defillama.com/protocol/{slug}",
            "updated": "2025-01-31"
        }

        # Add platform info for non-EVM chains
        if platform != "evm":
            deployment["platform"] = platform

        protocol_data["deployments"][chain_id] = deployment

    # Create protocol directory and file
    protocol_dir = base_dir / "data" / "sources" / "protocols" / slug
    protocol_dir.mkdir(parents=True, exist_ok=True)

    protocol_file = protocol_dir / f"{slug}.json"
    with open(protocol_file, 'w') as f:
        json.dump(protocol_data, f, indent=2)

    return True


def delete_existing_files(base_dir: Path):
    """Delete all existing generated chain and protocol files."""
    chains_dir = base_dir / "data" / "sources" / "chains"
    protocols_dir = base_dir / "data" / "sources" / "protocols"

    # Delete all chain files
    if chains_dir.exists():
        print("Deleting existing chain files...")
        for chain_file in chains_dir.glob("*.json"):
            chain_file.unlink()
            print(f"  - Deleted: {chain_file.name}")

    # Delete all protocol directories
    if protocols_dir.exists():
        print("\nDeleting existing protocol directories...")
        count = 0
        for protocol_dir in protocols_dir.iterdir():
            if protocol_dir.is_dir():
                shutil.rmtree(protocol_dir)
                count += 1
                if count % 100 == 0:
                    print(f"  - Deleted {count} protocol directories...")
        print(f"  - Deleted {count} protocol directories total")


def main():
    # Paths
    base_dir = Path("/Users/account/contracts-registry-llm")
    chains_file = base_dir / "defi-llama-chains.json"
    protocols_file = Path("/private/tmp/defi-llama-protocols.json")

    if not chains_file.exists():
        print(f"Error: Chains file not found: {chains_file}")
        sys.exit(1)

    if not protocols_file.exists():
        print(f"Error: Protocols file not found: {protocols_file}")
        sys.exit(1)

    # Delete existing files
    print("="*60)
    print("CLEANING UP EXISTING FILES")
    print("="*60)
    delete_existing_files(base_dir)

    # Read chains data
    print("\n" + "="*60)
    print("LOADING CHAINS DATA")
    print("="*60)
    with open(chains_file, 'r') as f:
        all_chains = json.load(f)

    print(f"Total chains from API: {len(all_chains)}")

    # Filter chains by TVL
    high_tvl_chains = [
        chain for chain in all_chains
        if chain.get("tvl", 0) > TVL_THRESHOLD
    ]

    print(f"Chains with TVL > ${TVL_THRESHOLD:,}: {len(high_tvl_chains)}")

    # Sort by TVL
    high_tvl_chains.sort(key=lambda x: x.get("tvl", 0), reverse=True)

    # Create chain name mapping
    chain_mapping = create_chain_name_mapping(high_tvl_chains)
    valid_chain_ids = set(chain_mapping.values())

    # Track platforms for each chain
    chain_platforms = {}

    # Create chain files
    print("\n" + "="*60)
    print("CREATING CHAIN FILES")
    print("="*60)
    for chain_data in high_tvl_chains:
        create_chain_file(chain_data, base_dir)
        chain_id = create_chain_id(chain_data.get("name", ""))
        platform = determine_platform(chain_data.get("name", ""), chain_data.get("tokenSymbol"))
        chain_platforms[chain_id] = platform

    # Read protocols data
    print("\n" + "="*60)
    print("LOADING PROTOCOLS DATA")
    print("="*60)
    with open(protocols_file, 'r') as f:
        protocols = json.load(f)

    print(f"Total protocols from API: {len(protocols)}")

    # Process protocols (only for high-TVL chains)
    print("\n" + "="*60)
    print("CREATING PROTOCOL FILES")
    print("="*60)
    print(f"Note: Only creating protocols for chains with TVL > ${TVL_THRESHOLD:,}")

    created_count = 0
    skipped_count = 0

    for i, protocol in enumerate(protocols, 1):
        slug = protocol.get("slug")
        name = protocol.get("name", slug)

        if i % 100 == 0:
            print(f"Processing {i}/{len(protocols)}... (Created: {created_count}, Skipped: {skipped_count})")

        # Create protocol file (only for high-TVL chains)
        if create_protocol_file(protocol, base_dir, set(), chain_mapping, valid_chain_ids, chain_platforms):
            created_count += 1
        else:
            skipped_count += 1

    # Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Total chains processed: {len(all_chains)}")
    print(f"High-TVL chains (TVL > ${TVL_THRESHOLD:,}): {len(high_tvl_chains)}")
    print(f"Chain files created: {len(high_tvl_chains)}")
    print(f"\nTotal protocols processed: {len(protocols)}")
    print(f"Protocol files created: {created_count}")
    print(f"Protocol files skipped: {skipped_count}")
    print(f"  (Skipped because no high-TVL chain deployments)")

    # Show top chains by TVL
    print("\n" + "="*60)
    print("TOP 20 CHAINS BY TVL")
    print("="*60)
    for i, chain in enumerate(high_tvl_chains[:20], 1):
        name = chain.get("name", "Unknown")
        tvl = chain.get("tvl", 0)
        chain_id = create_chain_id(name)
        platform = chain_platforms.get(chain_id, "unknown")
        print(f"{i:2d}. {name:25s} - ${tvl:>15,.2f} ({platform})")

    # Show platform distribution
    print("\n" + "="*60)
    print("PLATFORM DISTRIBUTION")
    print("="*60)
    platform_counts = {}
    for platform in chain_platforms.values():
        platform_counts[platform] = platform_counts.get(platform, 0) + 1

    for platform, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"{platform.upper():10s}: {count:3d} chains")

    print("="*60)


if __name__ == "__main__":
    main()
