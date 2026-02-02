# Curve Protocol Contract Extraction Report

**Date:** February 2, 2026  
**Source:** [Curve Deployment Data JSON](https://github.com/CurveDocs/curve-docs/blob/master/docs/deployments/deployment-data.json)  
**Status:** ✅ Complete

---

## Executive Summary

Successfully extracted and organized **1,136 contract addresses** from **29 blockchain networks** for the Curve Finance protocol. All contracts have been categorized, documented, and exported in multiple formats for easy integration into the DeFi contracts registry.

---

## Extraction Statistics

| Metric | Count |
|--------|-------|
| Total Chains | 29 |
| Total Contracts | 1,136 |
| Contract Categories | 14 |
| Primary Chain (Ethereum) | 91 contracts |
| L2 Deployments | 6 major L2s |
| Sidechain Deployments | 10+ networks |

---

## Blockchain Networks Coverage

### Tier 1: Ethereum & Major L2s
- **Ethereum** (91 contracts) - Main deployment with governance, DAO, crvUSD, LlamaLend
- **Arbitrum** (46 contracts) - Full AMM suite + LlamaLend
- **Optimism** (47 contracts) - Full AMM suite + LlamaLend + scrvUSD
- **Base** (40 contracts) - Full AMM suite + scrvUSD
- **Polygon** (49 contracts) - Full AMM deployment + bridges
- **Avalanche** (52 contracts) - Full AMM + cross-chain bridges

### Tier 2: Established Sidechains
- **BNB Smart Chain** (47 contracts)
- **Gnosis Chain** (45 contracts)
- **Fantom** (44 contracts)
- **Fraxtal** (47 contracts) - Including LlamaLend

### Tier 3: Emerging Networks
- **Sonic** (53 contracts) - New deployment with LlamaLend
- **Taiko** (38 contracts)
- **Ink** (38 contracts)
- **Corn** (38 contracts)
- **Mantle** (29 contracts)
- **Kava** (37 contracts)

### Additional Networks
Aurora, Celo, Etherlink, Hyperliquid, Moonbeam, Monad, Plasma, Plume, Stable, TAC, Unichain, X-Layer, XDC

---

## Contract Categories Breakdown

| Category | Total Contracts | Description |
|----------|----------------|-------------|
| **AMM** | 444 | Pool factories and implementations (Stableswap, Twocrypto, Tricrypto) |
| **x-gov** | 197 | Cross-chain governance infrastructure |
| **curve-block-oracle** | 88 | Block oracle system for cross-chain |
| **x-dao** | 86 | Cross-chain DAO contracts and bridges |
| **integrations** | 81 | Meta Registry, Address Provider, Rate Provider |
| **vecrv** | 66 | Vote-escrowed CRV related contracts |
| **tokens** | 45 | CRV, veCRV, crvUSD, scrvUSD token addresses |
| **gauges** | 35 | Liquidity gauge system |
| **fees** | 35 | Fee collection and distribution |
| **llamalend** | 35 | One-way lending protocol |
| **crvusd** | 12 | Stablecoin system (Ethereum only) |
| **dao** | 5 | DAO governance (Ethereum only) |
| **core** | 4 | Core protocol contracts (Ethereum only) |
| **scrvusd** | 3 | Savings crvUSD vault |

---

## Core Contract Types

### 1. Tokens
- **CRV** - Native governance token (deployed on all chains)
- **veCRV** - Vote-escrowed CRV (Ethereum only, referenced on L2s)
- **crvUSD** - Curve's stablecoin (Ethereum + 6 L2s)
- **scrvUSD** - Savings/staked crvUSD vault token

### 2. AMM Pool Types

#### Stableswap
- Optimized for stable pairs (stablecoin-to-stablecoin)
- Uses StableSwap invariant
- Deployed on all 29 chains

#### Twocrypto
- Two-token volatile pairs (e.g., ETH/BTC)
- Uses CryptoSwap v2 invariant
- Deployed on most chains

#### Tricrypto
- Three-token volatile pairs (e.g., USDT/WBTC/WETH)
- Uses NG (Next Generation) CryptoSwap invariant
- Deployed on select chains

### 3. crvUSD Stablecoin System (Ethereum)

**Core Components:**
- Controller Factory & Implementation
- AMM Implementation (LLAMMA - Lending-Liquidating AMM Algorithm)
- Price Aggregators (v1 & v3)
- Flash Lender
- Leverage Zaps (1inch & Odos)

**PegKeepers (4 deployed):**
- USDC PegKeeper: `0x9201da0D97CaAAff53f01B2fB56767C7072dE340`
- USDT PegKeeper: `0xFb726F57d251aB5C731E5C64eD4F5F94351eF9F3`
- pyUSD PegKeeper: `0x3fA20eAa107DE08B38a8734063D605d5842fe09C`
- PegKeeper Regulator: `0x36a04CAffc681fa179558B2Aaba30395CDdd855f`

### 4. LlamaLend Lending Protocol

**Deployments:** Ethereum, Arbitrum, Optimism, Fraxtal, Sonic

**Key Contracts:**
- One-Way-Lending Factory
- AMM Implementation
- Controller Implementation
- Vault Implementation (ERC-4626)
- Gauge Implementation
- Pool Price Oracle
- Monetary Policy Implementation
- Leverage Zap

### 5. Cross-Chain Infrastructure

**Bridge Technologies:**
- LayerZero (primary)
- Chainlink CCIP

**Bridge Types:**
- CRV Token Bridges (5 destinations)
- crvUSD Bridges (5 destinations)
- scrvUSD Bridges (4 destinations)

**Cross-Chain Keepers:**
- Maintain state synchronization
- Execute cross-chain governance
- 6 keeper contracts deployed

### 6. Integration Contracts

**Address Provider** - Main entry point for contract discovery  
**Meta Registry** - Query all pools and metadata (deployed on all chains)  
**Rate Provider** - Exchange rates for integrations  
**CRV Circulating Supply** - Token metrics (Ethereum)

### 7. Governance & DAO (Ethereum)

**Core Governance:**
- Gauge Controller: `0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB`
- Minter: `0xd061D61a4d941c39E5453435B6345Dc261C2fcE0`
- Community Fund: `0xe3997288987e6297ad550a69b31439504f513267`
- Treasury: `0x6508ef65b0bd57eabd0f1d52685a70433b2d290b`

**DAO Contracts:**
- Voting Ownership
- Voting Parameter
- Agent Ownership
- Agent Parameter
- Emergency DAO

### 8. Fee System

**Fee Collection:**
- Fee Receiver
- Fee Collector
- Hooker
- CowSwap Burner

**Fee Distribution:**
- Fee Distributor (crvUSD)
- Fee Distributor (3CRV)
- Fee Splitter

---

## Key Contract Addresses by Chain

### Ethereum Mainnet

**Tokens:**
- CRV: `0xD533a949740bb3306d119CC777fa900bA034cd52`
- veCRV: `0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2`
- crvUSD: `0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E`
- scrvUSD: `0x0655977FEb2f289A4aB78af67BAB0d17aAb84367`

**AMM Factories:**
- Stableswap: `0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf`
- Twocrypto: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`
- Tricrypto: `0x0c0e5f2ff0ff18a3be9b835635039256dc4b4963`

**Integrations:**
- Meta Registry: `0xF98B45FA17DE75FB1aD0e7aFD971b0ca00e379fC`
- Address Provider: `0x5ffe7FB82894076ECB99A30D6A32e969e6e35E98`

**LlamaLend:**
- Factory: `0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0`

### Arbitrum One

**Tokens:**
- CRV: `0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978`
- crvUSD: `0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5`

**AMM Factories:**
- Stableswap: `0x9AF14D26075f142eb3F292D5065EB3faa646167b`
- Twocrypto: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`
- Tricrypto: `0xbC0797015fcFc47d9C1856639CaE50D0e69FbEE8`

**Integrations:**
- Meta Registry: `0x13526206545e2DC7CcfBaF28dC88F440ce7AD3e0`

**LlamaLend:**
- Factory: `0xcaEC110C784c9DF37240a8Ce096D352A75922DeA`

### Optimism

**Tokens:**
- CRV: `0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53`
- crvUSD: `0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6`
- scrvUSD: `0x289f635106d5b822a505b39ac237a0ae9189335b`

**AMM Factories:**
- Stableswap: `0x5eeE3091f747E60a045a2E715a4c71e600e31F6E`
- Twocrypto: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`
- Tricrypto: `0xc6C09471Ee39C7E30a067952FcC89c8922f9Ab53`

**LlamaLend:**
- Factory: `0x5EA8f3D674C70b020586933A0a5b250734798BeF`

### Base

**Tokens:**
- CRV: `0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415`
- crvUSD: `0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93`
- scrvUSD: `0x646a737b9b6024e49f5908762b3ff73e65b5160c`

**AMM Factories:**
- Stableswap: `0xd2002373543Ce3527023C75e7518C274A51ce712`
- Twocrypto: `0xc9Fe0C63Af9A39402e8a5514f9c43Af0322b665F`
- Tricrypto: `0xA5961898870943c68037F6848d2D866Ed2016bcB`

### Polygon

**Tokens:**
- CRV: `0x172370d5Cd63279eFa6d502DAB29171933a610AF`
- crvUSD: `0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6`

**AMM Factories:**
- Stableswap: `0x1764ee18e8B3ccA4787249Ceb249356192594585`
- Twocrypto: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`
- Tricrypto: `0xC1b393EfEF38140662b91441C6710Aa704973228`

### Avalanche

**Tokens:**
- CRV: `0xEEbC562d445F4bC13aC75c8caABb438DFae42A1B`
- crvUSD: `0xCb7c161602d04C4e8aF1832046EE08AAF96d855D`
- scrvUSD: `0xA3ea433509F7941df3e33857D9c9f212Ad4A4e64`

**AMM Factories:**
- Stableswap: `0x1764ee18e8B3ccA4787249Ceb249356192594585`
- Twocrypto: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`
- Tricrypto: `0x3d6cB2F6DcF47CDd9C13E4e3beAe9af041d8796a`

---

## Files Delivered

All files are located in: `/Users/account/contracts-registry-llm/data/sources/protocols/curve/`

### 1. curve-deployment-data.json (93 KB)
**Original deployment data from Curve documentation**
- Raw JSON from GitHub repository
- Unmodified source data
- Hierarchical structure by chain and category

### 2. curve-registry-organized.json (87 KB)
**Organized registry with flattened paths**
- Structured by chain → category → contract path
- Flattened nested structures with dot notation
- Easy to query programmatically

**Structure:**
```json
{
  "chain_name": {
    "category": {
      "contract.path.name": "0x..."
    }
  }
}
```

### 3. curve-defi-registry.json (405 KB)
**DeFi registry format with comprehensive metadata**
- Protocol-level metadata (website, docs, social)
- Chain information (network name, chain ID)
- Contracts organized by category with metadata
- Full categorization and tagging

**Includes:**
- Chain IDs for all major networks
- Contract categories and classifications
- Address mappings with context

### 4. curve-quick-reference.json (17 KB)
**Quick reference for key contracts only**
- Essential contracts per chain (tokens, factories, integrations)
- Minimal file size for fast lookups
- Perfect for UI integrations

**Contains only:**
- Token addresses
- Factory contracts
- Integration points (Meta Registry, Address Provider)

### 5. curve-contracts.csv (84 KB)
**CSV export for spreadsheet/database import**

**Columns:**
- Chain
- Category
- Contract Name
- Address

**Usage:**
- Import into databases
- Spreadsheet analysis
- Data processing pipelines

### 6. CURVE_CONTRACTS_SUMMARY.md (9.3 KB)
**Human-readable documentation**
- Overview and statistics
- Contract type descriptions
- Sample addresses by chain
- Usage examples and integration notes

### 7. EXTRACTION_REPORT.md (This file)
**Complete extraction report**
- Executive summary
- Detailed statistics
- Contract categorization
- Key addresses by chain

---

## Usage Examples

### Query Meta Registry on Any Chain
```javascript
// Get Meta Registry address for a specific chain
const metaRegistries = {
  ethereum: "0xF98B45FA17DE75FB1aD0e7aFD971b0ca00e379fC",
  arbitrum: "0x13526206545e2DC7CcfBaF28dC88F440ce7AD3e0",
  optimism: "0xc65CB3156225380BEda366610BaB18D5835A1647",
  base: "0x87DD13Dd25a1DBde0E1EdcF5B8Fa6cfff7eABCaD",
  polygon: "0x296d2B5C23833A70D07c8fCBB97d846c1ff90DDD"
};
```

### Find Pool Factories by Type
```javascript
// Stableswap factories (for stable pairs)
const stableswapFactories = {
  ethereum: "0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf",
  arbitrum: "0x9AF14D26075f142eb3F292D5065EB3faa646167b",
  optimism: "0x5eeE3091f747E60a045a2E715a4c71e600e31F6E",
  base: "0xd2002373543Ce3527023C75e7518C274A51ce712"
};

// Tricrypto factories (for 3-token volatile pairs)
const tricryptoFactories = {
  ethereum: "0x0c0e5f2ff0ff18a3be9b835635039256dc4b4963",
  arbitrum: "0xbC0797015fcFc47d9C1856639CaE50D0e69FbEE8",
  optimism: "0xc6C09471Ee39C7E30a067952FcC89c8922f9Ab53",
  base: "0xA5961898870943c68037F6848d2D866Ed2016bcB"
};
```

### Access LlamaLend Protocol
```javascript
// LlamaLend Factory addresses
const llamalendFactories = {
  ethereum: "0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0",
  arbitrum: "0xcaEC110C784c9DF37240a8Ce096D352A75922DeA",
  optimism: "0x5EA8f3D674C70b020586933A0a5b250734798BeF",
  fraxtal: "0xf3c9bdAB17B7016fBE3B77D17b1602A7db93ac66",
  sonic: "0x30D1859DaD5A52aE03B6e259d1b48c4b12933993"
};
```

---

## Integration Notes

### For DeFi Aggregators
1. Use `curve-quick-reference.json` for fast lookups
2. Query Meta Registry to discover all pools on a chain
3. Use Address Provider as the main entry point

### For Analytics Platforms
1. Import `curve-contracts.csv` into your database
2. Track protocol TVL across all chains
3. Monitor gauge emissions via Gauge Controller

### For Protocol Integrators
1. Reference `curve-defi-registry.json` for complete metadata
2. Use factory contracts to discover new pools
3. Implement Rate Provider for accurate pricing

### For Developers
1. Start with Meta Registry for pool discovery
2. Use Router contracts for optimal swap routing
3. Reference implementation contracts for integration

---

## Contract Verification

All contract addresses have been:
- ✅ Extracted from official Curve documentation
- ✅ Organized by blockchain network
- ✅ Categorized by contract type
- ✅ Cross-referenced with Curve docs
- ✅ Formatted in multiple export formats

**Verification Source:**
- Official Repository: https://github.com/CurveDocs/curve-docs
- Documentation: https://docs.curve.finance
- Deployment Data: https://github.com/CurveDocs/curve-docs/blob/master/docs/deployments/deployment-data.json

---

## Important Notes

1. **veCRV Addresses:** Some chains show empty veCRV addresses as veCRV only exists on Ethereum mainnet. L2s reference it via bridges.

2. **Shared Implementations:** Many chains use the same implementation addresses (especially Twocrypto factory: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`).

3. **Cross-Chain Bridges:** LayerZero is the primary bridge technology with 5 CRV bridges and 5 crvUSD bridges active.

4. **AMM Types:**
   - Stableswap: All 29 chains
   - Twocrypto: Most chains
   - Tricrypto: Select chains (newer deployment)

5. **LlamaLend:** Currently deployed on 5 chains (Ethereum, Arbitrum, Optimism, Fraxtal, Sonic).

6. **scrvUSD:** Savings vault available on Ethereum, Optimism, Base, Avalanche, BSC.

---

## Statistics Summary

| Category | Value |
|----------|-------|
| **Total Contracts** | 1,136 |
| **Total Chains** | 29 |
| **Ethereum Contracts** | 91 |
| **AMM Contracts** | 444 |
| **Cross-chain Contracts** | 283 |
| **Integration Contracts** | 81 |
| **Token Deployments** | 45 |
| **LlamaLend Deployments** | 35 |
| **Files Generated** | 7 |
| **Data Formats** | JSON (4), CSV (1), Markdown (2) |

---

## Conclusion

This extraction provides a comprehensive registry of all Curve Finance protocol contracts across 29 blockchain networks. The data has been organized in multiple formats to support various use cases including:

- DeFi protocol integrations
- Analytics and data science
- Smart contract development
- Portfolio tracking
- Protocol research

All data is current as of February 2, 2026, and sourced directly from the official Curve documentation repository.

---

**For questions or updates, refer to:**
- Curve Documentation: https://docs.curve.finance
- Curve GitHub: https://github.com/curvefi
- Deployment Data: https://github.com/CurveDocs/curve-docs

---

*Report generated: February 2, 2026*  
*Extraction source: Official Curve deployment registry*  
*Total processing time: < 1 minute*
