# Schema Documentation

## Protocol Schema

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the protocol (lowercase, hyphenated) |
| `name` | string | Yes | Human-readable protocol name |
| `type` | string | Yes | Protocol category (see Protocol Types) |
| `website` | string | No | Official protocol website URL |
| `github` | string | No | GitHub repository URL |
| `docs` | string | No | Documentation URL |
| `tags` | array[string] | Yes | Searchable tags for categorization |
| `contracts` | object | Yes | Contract definitions (see Contract Object) |
| `deployments` | object | Yes | Deployment information per chain (see Deployment Object) |

### Protocol Types

- `lending` - Lending and borrowing protocols
- `dex` - Decentralized exchanges
- `bridge` - Cross-chain bridges
- `derivatives` - Options, futures, perpetuals
- `yield` - Yield aggregators and optimizers
- `stablecoin` - Stablecoin issuers
- `liquid-staking` - Liquid staking protocols
- `insurance` - Insurance and coverage protocols
- `launchpad` - Token launch platforms
- `nft` - NFT marketplaces and protocols
- `dao` - DAO infrastructure
- `oracle` - Price oracles
- `privacy` - Privacy protocols
- `gaming` - Gaming and metaverse protocols

### Contract Object

Keyed by contract identifier. Each contract has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Contract name |
| `type` | string | Yes | Contract category (see Contract Types) |
| `description` | string | Yes | Contract purpose and functionality |
| `proxy` | boolean | Yes | Whether the contract uses a proxy pattern |
| `keyEvents` | array[string] | Yes | Important events emitted (can be empty) |
| `keyFunctions` | array[string] | Yes | Important functions (can be empty) |
| `useCases` | array[string] | Yes | Primary use cases (can be empty) |
| `idl` | string | No | IDL/ABI URL for Solana programs or smart contracts |

### Contract Types

- `core` - Main protocol contract
- `registry` - Address registry or factory
- `admin` - Administrative or governance contract
- `oracle` - Price feed or data oracle
- `data` - Data provider or helper contract
- `treasury` - Treasury or fee collector
- `token` - Token contract (ERC20, ERC721, etc.)
- `vault` - Asset vault or pool
- `router` - Routing or aggregation contract
- `staking` - Staking contract

### IDL Field Usage

**Solana Programs:**
- Required for all Solana program contracts
- Should point to the JSON IDL file in the program's repository
- Example: `"https://github.com/jup-ag/jupiter-swap-api-client/blob/main/idl/jupiter.json"`

**EVM Contracts:**
- Optional - can point to ABI files or contract interfaces
- Typically not needed as ABIs are available on block explorers

**Other Chains:**
- Use chain-specific interface definition formats
- Document the format type in the contract description

### Deployment Object

Keyed by chain identifier. Each deployment has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `chain` | string | Yes | Chain identifier (must match key) |
| `addresses` | object | Yes | Contract addresses keyed by contract ID |
| `deploymentBlocks` | object | Yes | Block numbers keyed by contract ID |
| `verified` | object | Yes | Verification status keyed by contract ID |
| `source` | array[string] | Yes | Data sources used |
| `sourceUrl` | string | Yes | URL to primary source |
| `updated` | string | Yes | Last update date (YYYY-MM-DD format) |

#### Addresses Object

Keyed by contract identifier. Values are:
- `string` - Checksummed Ethereum address (0x...)
- `""` - Empty string indicates known deployment without confirmed address

#### Deployment Blocks Object

Keyed by contract identifier. Values are:
- `number` - Block number where contract was deployed
- `null` - Unknown deployment block

#### Verified Object

Keyed by contract identifier. Values are:
- `true` - Contract is verified on block explorer
- `false` - Contract is not verified or verification unknown

### Source Values

Common source identifiers:
- `official-docs` - Official protocol documentation
- `github` - Protocol GitHub repository
- `etherscan` - Etherscan or equivalent explorer
- `defillama` - DefiLlama protocol page
- `aave-address-book` - Aave Address Book repository
- `uniswap-sdk` - Uniswap SDK
- `community` - Community-maintained registry

## Chain Schema

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique chain identifier (lowercase, hyphenated) |
| `name` | string | Yes | Human-readable chain name |
| `chainId` | number | Yes | EIP-155 chain ID |
| `nativeCurrency` | object | Yes | Native currency information (see Native Currency) |
| `rpc` | array[string] | No | RPC endpoint URLs |
| `explorer` | string | No | Block explorer URL |
| `tags` | array[string] | Yes | Chain categorization tags |

### Native Currency Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Currency full name |
| `symbol` | string | Yes | Currency symbol |
| `decimals` | number | Yes | Token decimals (typically 18) |

### Chain Tags

- `layer1` - Layer 1 blockchain
- `layer2` - Layer 2 scaling solution
- `evm` - EVM-compatible chain
- `rollup` - Rollup technology
- `sidechain` - Sidechain architecture
- `testnet` - Test network
- `mainnet` - Main network

## Validation Rules

### Address Format

**EVM Chains:**
- Must be a valid Ethereum address: `^0x[a-fA-F0-9]{40}$`
- Must be checksummed (mixed case based on EIP-55)
- Empty string `""` is allowed for missing addresses

**Solana:**
- Base58 encoded program addresses (32-44 characters)
- Example: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`
- Empty string `""` is allowed for missing addresses

**Other Chains:**
- Follow chain-specific address formats
- Document format in chain metadata

### Chain Identifiers
- Lowercase letters, numbers, and hyphens only
- No leading or trailing hyphens
- Must match the key in deployments object

### Contract Identifiers
- Lowercase letters, numbers, and hyphens only
- Must be consistent across addresses, deploymentBlocks, and verified objects
- Must reference a contract defined in the contracts object

### Date Format
- Must follow ISO 8601 date format: `YYYY-MM-DD`
- Example: `2025-01-31`

### URLs
- Must be valid HTTP or HTTPS URLs
- Should not include trailing slashes
- GitHub URLs should point to the repository root or specific file

## JSON Formatting

- Use 2-space indentation
- No trailing commas
- Double quotes for strings
- Boolean values: `true` or `false` (lowercase)
- Null values: `null` (lowercase)

## Example Minimal Protocol (EVM)

```json
{
  "id": "example-protocol",
  "name": "Example Protocol",
  "type": "lending",
  "website": "https://example.com",
  "github": "",
  "docs": "",
  "tags": ["lending", "ethereum"],
  "contracts": {
    "pool": {
      "name": "Lending Pool",
      "type": "core",
      "description": "Main lending pool contract",
      "proxy": true,
      "keyEvents": [],
      "keyFunctions": [],
      "useCases": ["lending", "borrowing"]
    }
  },
  "deployments": {
    "ethereum": {
      "chain": "ethereum",
      "addresses": {
        "pool": "0x1234567890123456789012345678901234567890"
      },
      "deploymentBlocks": {
        "pool": 15000000
      },
      "verified": {
        "pool": true
      },
      "source": ["official-docs"],
      "sourceUrl": "https://docs.example.com",
      "updated": "2025-01-31"
    }
  }
}
```

## Example Solana Protocol

```json
{
  "id": "example-solana-dex",
  "name": "Example Solana DEX",
  "type": "dex",
  "website": "https://example.sol",
  "github": "",
  "docs": "",
  "tags": ["dex", "solana"],
  "contracts": {
    "swap": {
      "name": "Swap Program",
      "type": "core",
      "description": "Main swap program",
      "proxy": false,
      "idl": "https://github.com/example/program/idl/swap.json",
      "keyEvents": [],
      "keyFunctions": [],
      "useCases": ["swap"]
    }
  },
  "deployments": {
    "solana": {
      "chain": "solana",
      "addresses": {
        "swap": "ExAmPL3aBc123dEf456GhI789jKlMnOpQrStUvWxYz"
      },
      "deploymentBlocks": {
        "swap": null
      },
      "verified": {
        "swap": true
      },
      "source": ["official-docs"],
      "sourceUrl": "https://docs.example.sol",
      "updated": "2025-02-02"
    }
  }
}
```

## Example Minimal Chain

```json
{
  "id": "ethereum",
  "name": "Ethereum",
  "chainId": 1,
  "nativeCurrency": {
    "name": "Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "rpc": ["https://eth.llamarpc.com"],
  "explorer": "https://etherscan.io",
  "tags": ["layer1", "evm", "mainnet"]
}
```

## Object Key Consistency

Within a single protocol file:
1. Contract identifiers in the `contracts` object must match keys used in deployment `addresses`, `deploymentBlocks`, and `verified` objects
2. Chain identifiers must match both the deployment object key and the `chain` field value
3. All addresses for a given contract across all chains should reference the same logical contract (same interface/functionality)

## Optional vs Required Fields

Fields marked as "No" in the Required column can be:
- Omitted entirely from the JSON
- Set to empty string `""` for strings
- Set to empty array `[]` for arrays
- Set to `null` for nullable fields

Required fields must always be present with a valid value.
