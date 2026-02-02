# Contracts Registry for LLMs

A structured registry of smart contract addresses optimized for consumption by large language models and AI agents.

## Purpose

This registry provides machine-readable contract address data for DeFi protocols across multiple blockchain networks. The data structure is designed for efficient parsing and querying by AI systems.

## Data Structure

```
data/
├── sources/
│   ├── chains/          # Chain-specific metadata
│   └── protocols/       # Protocol contract addresses organized by protocol name
```

Each protocol is stored in its own directory with a JSON file containing:
- Protocol metadata (name, type, website, documentation)
- Contract definitions (names, types, descriptions)
- Deployment information per chain (addresses, verification status, deployment blocks)

## Usage for AI Agents

### Finding Contract Addresses

To retrieve contract addresses for a specific protocol on a chain:

1. Navigate to `data/sources/protocols/{protocol-name}/{protocol-name}.json`
2. Access the `deployments` object
3. Select the target chain
4. Extract addresses from the `addresses` object

### Example: Get Aave V3 Pool address on Base

```
File: data/sources/protocols/aave-v3/aave-v3.json
Path: deployments.base.addresses.pool
Result: 0xA238Dd80C259a72e81d7e4664a9801593F98d1c5
```

### Supported Chains

Chain identifiers use lowercase with hyphens:
- `ethereum`
- `polygon`
- `arbitrum`
- `optimism`
- `base`
- `avalanche`
- `bsc`
- `gnosis`
- See `data/sources/chains/` for complete list

### Supported Protocols

Protocol identifiers use lowercase with hyphens and version suffixes:
- `aave-v2`
- `aave-v3`
- `uniswap-v2`
- `uniswap-v3`
- See `data/sources/protocols/` for complete list

## Data Format

### Protocol File Structure

```json
{
  "id": "protocol-name",
  "name": "Protocol Name",
  "type": "protocol-type",
  "website": "https://protocol.com",
  "github": "https://github.com/org/repo",
  "docs": "https://docs.protocol.com",
  "tags": ["tag1", "tag2"],
  "contracts": {
    "contractId": {
      "name": "Contract Name",
      "type": "contract-type",
      "description": "Contract purpose",
      "proxy": true/false,
      "keyEvents": [],
      "keyFunctions": [],
      "useCases": []
    }
  },
  "deployments": {
    "chainName": {
      "chain": "chainName",
      "addresses": {
        "contractId": "0x..."
      },
      "deploymentBlocks": {
        "contractId": 12345678
      },
      "verified": {
        "contractId": true/false
      },
      "source": ["source-name"],
      "sourceUrl": "https://source.url",
      "updated": "YYYY-MM-DD"
    }
  }
}
```

### Chain File Structure

```json
{
  "id": "chain-name",
  "name": "Chain Name",
  "chainId": 1,
  "nativeCurrency": {
    "name": "Token Name",
    "symbol": "SYMBOL",
    "decimals": 18
  },
  "rpc": ["https://rpc.url"],
  "explorer": "https://explorer.url",
  "tags": ["layer1", "evm"]
}
```

## Data Sources

Contract addresses are sourced from:
- Official protocol documentation
- Verified blockchain explorers
- Protocol GitHub repositories
- Community-maintained registries

Each deployment includes:
- `source`: Array of source names
- `sourceUrl`: URL to the source
- `updated`: Last verification date

## Data Quality

- All Ethereum addresses are checksummed
- `verified` field indicates if the contract is verified on block explorers
- Empty addresses (`""`) indicate known deployments without confirmed addresses
- `null` deployment blocks indicate missing data

## Querying Patterns

### Get all deployments for a protocol
Read the protocol JSON file and iterate through the `deployments` object.

### Get all protocols on a chain
Iterate through protocol files and check if the target chain exists in their `deployments`.

### Find protocols by type
Read protocol files and filter by the `type` field (e.g., "lending", "dex", "bridge").

### Get verified contracts only
Filter deployments where `verified.{contractId}` is `true`.

## File Naming Conventions

- Protocol directories: lowercase with hyphens, match the protocol ID
- Protocol files: `{protocol-id}.json`
- Chain files: `{chain-id}.json`
- All JSON files use 2-space indentation

## Updates

Data is updated periodically. Check the `updated` field in each deployment for the last verification date.

## Contributing

To add or update protocol data:
1. Follow the JSON schema structure
2. Use checksummed addresses for Ethereum-compatible chains
3. Include source attribution
4. Verify addresses against official sources
5. Update the `updated` date

## License

See LICENSE file for details.
