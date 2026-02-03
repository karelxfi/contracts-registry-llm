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

## API Endpoints

The registry is available as a static JSON API at:
**Base URL**: `https://karelxfi.github.io/contracts-registry-llm`

### Search Endpoints

#### Fuzzy Name Search
`GET /api/v1/search/by-name.json`

Returns a lightweight index for client-side fuzzy protocol name searching. Use with a fuzzy matching library (e.g., fast-levenshtein) for typo-tolerant search.

```javascript
// Example: Client-side fuzzy search
const response = await fetch('https://karelxfi.github.io/contracts-registry-llm/api/v1/search/by-name.json');
const { protocols } = await response.json();

// Find protocols matching "aav" (fuzzy)
import levenshtein from 'fast-levenshtein';
const results = protocols.filter(p =>
  levenshtein.get(query.toLowerCase(), p.nameNormalized) < 3
);
```

#### Address Lookup
`GET /api/v1/search/by-address.json`

Reverse lookup: find protocol by contract address. Supports both formats:
- Full: `ethereum:0x...`
- Address only: `0x...` (may return multiple results if address exists on multiple chains)

#### Verified Contracts Only
`GET /api/v1/search/verified.json`

Returns only contracts verified on block explorers, organized by protocol and by chain.

#### Chain-Specific Search
`GET /api/v1/search/chain/{chain}.json`

Get lightweight summaries of all protocols on a specific chain.

Example: `/api/v1/search/chain/base.json`

#### Multi-Chain Protocols
`GET /api/v1/search/multi-chain.json`

Find protocols deployed on 2+ chains, categorized by deployment count (10+, 5-9, 2-4).

#### Contract Type Search
`GET /api/v1/search/by-contract-type/{type}.json`

Find protocols by contract type (e.g., oracle, vault, core).

Example: `/api/v1/search/by-contract-type/oracle.json`

#### Recent Updates
`GET /api/v1/search/recent.json`

View protocols updated in the last 7, 30, and 90 days.

### Other Endpoints

- `/api/v1/metadata.json` - API metadata and stats
- `/api/v1/protocol/{id}.json` - Full protocol details
- `/api/v1/updates.json` - Recent changes
- `/api/v1/openapi.json` - OpenAPI 3.0 specification
- `/api/v1/queries.json` - Pre-computed common queries

All endpoints support gzip compression (`.json.gz` files available).

## Querying Patterns

### Get all deployments for a protocol
Read the protocol JSON file and iterate through the `deployments` object.

### Get all protocols on a chain
Use `/api/v1/search/chain/{chain}.json` or iterate through protocol files.

### Find protocols by type
Read protocol files and filter by the `type` field (e.g., "lending", "dex", "bridge").

### Get verified contracts only
Use `/api/v1/search/verified.json` or filter deployments where `verified.{contractId}` is `true`.

## File Naming Conventions

- Protocol directories: lowercase with hyphens, match the protocol ID
- Protocol files: `{protocol-id}.json`
- Chain files: `{chain-id}.json`
- All JSON files use 2-space indentation

## Updates

Data is updated periodically. Check the `updated` field in each deployment for the last verification date.

## Development

### Building the API

The registry automatically generates API endpoints from source data:

```bash
npm run build
```

This command:
1. Validates all protocol JSON files against the schema
2. Generates search indexes and API endpoints
3. **Auto-generates the OpenAPI specification** with current stats and metadata

**Important**: The OpenAPI spec (`/api/v1/openapi.json`) is automatically generated during the build process. It uses live metadata values for examples, ensuring the documentation always reflects the current state of the registry (total protocols, chains, categories, etc.). You should never manually edit the OpenAPI spec - it will be regenerated on the next build.

### Other Commands

```bash
npm run validate       # Validate protocol JSON files
npm run scaffold       # Create a new protocol template
npm run fetch-blocks   # Fetch deployment block numbers
```

## Contributing

To add or update protocol data:
1. Follow the JSON schema structure
2. Use checksummed addresses for Ethereum-compatible chains
3. Include source attribution
4. Verify addresses against official sources
5. Update the `updated` date
6. Run `npm run build` to regenerate API endpoints and OpenAPI spec

## License

See LICENSE file for details.
