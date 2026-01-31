# Contracts Registry for LLM

A comprehensive, schema-validated blockchain contract deployment registry optimized for LLM consumption and blockchain indexer development.

## Features

✅ **Schema-first design** - JSON Schema validation for all data  
✅ **Multi-chain support** - EVM chains (Ethereum, Base, Arbitrum, etc.)  
✅ **Fast lookups** - Pre-built indexes for address and event queries  
✅ **Multiple views** - Query by chain, category, address, or event  
✅ **Type-safe** - Validated contract metadata with events and functions  
✅ **Automated builds** - Generate all outputs from source data  
✅ **Deployment tracking** - Block numbers and verification status  

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd contracts-registry-llm
npm install

# Build the registry
npm run build

# Query contracts
node helpers/query.js find-address ethereum 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
node helpers/query.js find-event Supply
node helpers/query.js chains
node helpers/query.js type lending
```

## Architecture

```
data/
├── schemas/                    # JSON Schema definitions
│   ├── protocol.schema.json
│   ├── contract.schema.json
│   ├── deployment.schema.json
│   └── chain.schema.json
│
├── sources/                    # Source data (edit these)
│   ├── protocols/
│   │   ├── morpho/
│   │   │   └── blue.json
│   │   └── gmx/
│   │       └── v1.json
│   └── chains/
│       ├── ethereum.json
│       ├── base.json
│       └── arbitrum-one.json
│
└── generated/                  # Auto-generated (don't edit)
    ├── protocols.json          # All protocols combined
    ├── contract-addresses.json # Address lookup
    ├── protocol-metadata.json  # Metadata only
    ├── by-chain/              # Chain-centric views
    │   ├── ethereum.json
    │   └── base.json
    ├── by-category/           # Category views
    │   ├── lending.json
    │   └── perpetuals.json
    └── indexes/               # Fast lookups
        ├── by-address.json    # Address → Protocol
        └── by-event.json      # Event → Contracts
```

## Data Structure

### Protocol File (`sources/protocols/<protocol>/<version>.json`)

```json
{
  "id": "morpho-blue",
  "name": "Morpho Blue",
  "type": "lending",
  "website": "https://morpho.org",
  "github": "https://github.com/morpho-org/morpho-blue",
  "docs": "https://docs.morpho.org",
  "tags": ["lending", "peer-to-peer"],
  "contracts": {
    "morpho": {
      "name": "Morpho Market V1",
      "type": "core",
      "description": "Main lending protocol contract",
      "keyEvents": [
        {
          "name": "Supply",
          "signature": "Supply(bytes32 indexed id, ...)",
          "description": "Emitted when assets are supplied"
        }
      ],
      "useCases": [
        "Track user deposits and withdrawals by market"
      ]
    }
  },
  "deployments": {
    "ethereum": {
      "chain": "ethereum",
      "chainId": 1,
      "addresses": {
        "morpho": "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb"
      },
      "deploymentBlocks": {
        "morpho": 18883845
      },
      "verified": {
        "morpho": true
      },
      "source": "docs",
      "updated": "2025-01-31"
    }
  }
}
```

### Chain File (`sources/chains/<chain>.json`)

```json
{
  "id": "ethereum",
  "name": "Ethereum Mainnet",
  "chainId": 1,
  "platform": "evm",
  "portalDataset": "ethereum-mainnet",
  "explorers": {
    "primary": {
      "name": "Etherscan",
      "url": "https://etherscan.io",
      "api": "https://api.etherscan.io/api"
    }
  },
  "aliases": ["eth", "mainnet"],
  "status": "active"
}
```

## Usage Examples

### JavaScript/Node.js

```javascript
import { findByAddress, findByEvent, getProtocolsByChain } from './helpers/query.js';

// Find protocol by contract address
const info = findByAddress('ethereum', '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb');
console.log(info.protocol);  // "morpho"
console.log(info.contract);  // "morpho"
console.log(info.metadata.keyEvents);  // Array of events

// Find all contracts with "Supply" event
const contracts = findByEvent('Supply');
// [{ protocol: "morpho", version: "blue", contract: "morpho", ... }]

// Get all protocols on Ethereum
const ethereum = getProtocolsByChain('ethereum');
console.log(Object.keys(ethereum.protocols));  // ["morpho"]
```

### Command Line

```bash
# Find contract by address
node helpers/query.js find-address ethereum 0xBBBB...

# Find contracts by event
node helpers/query.js find-event Supply

# List all chains
node helpers/query.js chains

# List all protocol types
node helpers/query.js types

# Get all protocols on a chain
node helpers/query.js chain ethereum

# Get all protocols of a type
node helpers/query.js type lending
```

## Adding New Protocols

### Step 1: Create Protocol File

```bash
mkdir -p data/sources/protocols/uniswap
cat > data/sources/protocols/uniswap/v3.json << 'EOF'
{
  "id": "uniswap-v3",
  "name": "Uniswap V3",
  "type": "dex",
  "website": "https://uniswap.org",
  "contracts": {
    "factory": {
      "name": "UniswapV3Factory",
      "type": "factory",
      "keyEvents": [
        { "name": "PoolCreated" }
      ]
    }
  },
  "deployments": {
    "ethereum": {
      "chain": "ethereum",
      "chainId": 1,
      "addresses": {
        "factory": "0x1F98431c8aD98523631AE4a59f267346ea31F984"
      },
      "source": "docs",
      "updated": "2025-01-31"
    }
  }
}
EOF
```

### Step 2: Rebuild

```bash
npm run build
```

### Step 3: Verify

```bash
node helpers/query.js find-address ethereum 0x1F98431c8aD98523631AE4a59f267346ea31F984
```

## Schema Validation

All data is validated against JSON schemas:

```bash
# Build will fail if data is invalid
npm run build

# Example error:
# ❌ Validation failed for morpho/blue:
# - data/contracts/morpho must have required property 'name'
```

## Generated Outputs

### by-address index

```json
{
  "ethereum:0xbbbb...": {
    "protocol": "morpho",
    "version": "blue",
    "contract": "morpho",
    "chain": "ethereum"
  }
}
```

### by-event index

```json
{
  "Supply": [
    {
      "protocol": "morpho",
      "version": "blue",
      "contract": "morpho",
      "signature": "Supply(bytes32 indexed id, ...)"
    }
  ]
}
```

### by-chain view

```json
{
  "chain": "ethereum",
  "chainId": 1,
  "protocols": {
    "morpho": {
      "blue": {
        "name": "Morpho Blue",
        "type": "lending",
        "addresses": { "morpho": "0x..." }
      }
    }
  }
}
```

## Current Coverage

### Protocols
- **Morpho Blue** (lending) - Ethereum, Base, Arbitrum
- **GMX V1** (perpetuals) - Arbitrum

### Chains
- **Ethereum** (chainId: 1)
- **Base** (chainId: 8453)
- **Arbitrum One** (chainId: 42161)

## Roadmap

- [ ] Automated deployment block fetching
- [ ] Contract verification status checking
- [ ] ABI caching
- [ ] More protocols (Uniswap, Aave, Compound, etc.)
- [ ] Solana support
- [ ] TypeScript types generation
- [ ] Web interface

## Contributing

1. Fork the repository
2. Add your protocol data to `data/sources/protocols/`
3. Run `npm run build` to validate
4. Submit a pull request

## License

MIT

## Links

- Architecture docs: `docs/CONTRACT_REGISTRY_ARCHITECTURE.md`
- JSON Schemas: `data/schemas/`
- Query API: `helpers/query.js`
