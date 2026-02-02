# Curve Protocol Contract Addresses - Complete Registry

**Source:** https://github.com/CurveDocs/curve-docs/blob/master/docs/deployments/deployment-data.json

**Extracted:** 2026-02-02

## Overview

This registry contains **1,136 contract addresses** deployed across **29 blockchain networks** for the Curve Finance protocol.

## Statistics

- **Total Chains:** 29
- **Total Contracts:** 1,136
- **Primary Chain:** Ethereum (91 contracts)
- **Most Deployed Categories:** AMM (444), Cross-chain Governance (197), Block Oracle (88)

## Networks Covered

- **Ethereum**: 91 contracts
- **Sonic**: 53 contracts
- **Avalanche**: 52 contracts
- **Polygon**: 49 contracts
- **Bsc**: 47 contracts
- **Fraxtal**: 47 contracts
- **Optimism**: 47 contracts
- **Arbitrum**: 46 contracts
- **Gnosis**: 45 contracts
- **Fantom**: 44 contracts
- **Base**: 40 contracts
- **Xdc**: 40 contracts
- **Corn**: 38 contracts
- **Ink**: 38 contracts
- **Taiko**: 38 contracts
- **Kava**: 37 contracts
- **Tac**: 37 contracts
- **Etherlink**: 36 contracts
- **Plume**: 36 contracts
- **Hyperliquid**: 33 contracts
- **Plasma**: 33 contracts
- **Celo**: 32 contracts
- **X-Layer**: 31 contracts
- **Mantle**: 29 contracts
- **Aurora**: 28 contracts
- **Monad**: 25 contracts
- **Stable**: 25 contracts
- **Unichain**: 25 contracts
- **Moonbeam**: 14 contracts

## Contract Categories

### Core Categories

1. **Tokens** - CRV, veCRV, crvUSD, scrvUSD tokens
2. **Core** - Gauge Controller, Minter, Treasury, Community Fund
3. **DAO** - Voting and governance contracts
4. **AMM** - Stableswap, Twocrypto, Tricrypto pool factories and implementations
5. **Gauges** - Liquidity gauge system
6. **Fees** - Fee collection and distribution
7. **Integrations** - Meta Registry, Address Provider, Rate Provider
8. **crvUSD** - Stablecoin system (Controller, AMM, PegKeepers)
9. **LlamaLend** - Lending protocol contracts
10. **Cross-chain** - Bridge contracts and cross-chain governance

## Ethereum Mainnet - Core Contracts

### Tokens
- **crv**: `0xD533a949740bb3306d119CC777fa900bA034cd52`
- **crvUSD**: `0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E`
- **scrvUSD**: `0x0655977FEb2f289A4aB78af67BAB0d17aAb84367`
- **vecrv**: `0x5f3b5dfeb7b28cdbd7faba78963ee202a494e2a2`

### Core Protocol
- **community-fund**: `0xe3997288987e6297ad550a69b31439504f513267`
- **gauge-controller**: `0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB`
- **minter**: `0xd061D61a4d941c39E5453435B6345Dc261C2fcE0`
- **treasury**: `0x6508ef65b0bd57eabd0f1d52685a70433b2d290b`

### DAO & Governance
- **agent-ownership**: `0x40907540d8a6C65c637785e8f8B742ae6b0b9968`
- **agent-parameter**: `0x4EEb3bA4f221cA16ed4A0cC7254E2E32DF948c5f`
- **emergency-dao**: `0x467947EE34aF926cF1DCac093870f613C96B1E0c`
- **voting-ownership**: `0xe478de485ad2fe566d49342cbd03e49ed7db3356`
- **voting-parameter**: `0xbcff8b0b9419b9a88c44546519b1e909cf330399`

### AMM Factories
- **stableswap.factory**: `0x6A8cbed756804B16E05E741eDaBd5cB544AE21bf`
- **tricrypto.factory**: `0x0c0e5f2ff0ff18a3be9b835635039256dc4b4963`
- **twocrypto.factory**: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`

### crvUSD System
- **amm-implementation**: `0x2B7e624bdb839975d56D8428d9f6A4cf1160D3e9`
- **controller-factory**: `0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC`
- **controller-implementation**: `0xe3e3Fb7E9f48d26817b7210C9bD6B22744790415`
- **crvusd-price-aggregator**: `0xe5Afcf332a5457E8FafCD668BcE3dF953762Dfe7`
- **crvusd-price-aggregator-v3**: `0x18672b1b0c623a30089A280Ed9256379fb0E4E62`
- **flash-lender**: `0x26dE7861e213A5351F6ED767d00e0839930e9eE1`
- **leverage-zap-1inch**: `0x3294514B78Df4Bb90132567fcf8E5e99f390B687`
- **leverage-zap-odos**: `0xc5898606bdb494a994578453b92e7910a90aa873`

### LlamaLend Protocol
- **amm-implementation**: `0xB57A959cdB3D5e460f9a7Cc48ed05ec29dfF049a`
- **controller-implementation**: `0x584B0Fd8F038fe8AEDf4057Ca3cB3D840446fBbf`
- **gauge-implementation**: `0x79D584d2D49eC8CE8Ea379d69364b700bd35874D`
- **monetary-policy-implementation**: `0x4863c6dF17dD59311B7f67E694DD835ADC87f2d3`
- **one-way-lending-factory**: `0xeA6876DDE9e3467564acBeE1Ed5bac88783205E0`
- **pool-price-oracle-implementation**: `0xC455e6c7936C2382f04306D329ABc5d36444D3F8`
- **vault-implementation**: `0xc014F34D5Ba10B6799d76b0F5ACdEEe577805085`

## Key L2/Sidechain Deployments

### Arbitrum

### Arbitrum

**Tokens:**
- crv: `0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978`
- crvUSD: `0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5`

**AMM Factories:**
- stableswap.factory: `0x9AF14D26075f142eb3F292D5065EB3faa646167b`
- tricrypto.factory: `0xbC0797015fcFc47d9C1856639CaE50D0e69FbEE8`
- twocrypto.factory: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`

### Optimism

**Tokens:**
- crv: `0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53`
- crvUSD: `0xc52d7f23a2e460248db6ee192cb23dd12bddcbf6`
- scrvUSD: `0x289f635106d5b822a505b39ac237a0ae9189335b`

**AMM Factories:**
- stableswap.factory: `0x5eeE3091f747E60a045a2E715a4c71e600e31F6E`
- tricrypto.factory: `0xc6C09471Ee39C7E30a067952FcC89c8922f9Ab53`
- twocrypto.factory: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`

### Base

**Tokens:**
- crv: `0x8Ee73c484A26e0A5df2Ee2a4960B789967dd0415`
- crvUSD: `0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93`
- scrvUSD: `0x646a737b9b6024e49f5908762b3ff73e65b5160c`

**AMM Factories:**
- stableswap.factory: `0xd2002373543Ce3527023C75e7518C274A51ce712`
- tricrypto.factory: `0xA5961898870943c68037F6848d2D866Ed2016bcB`
- twocrypto.factory: `0xc9Fe0C63Af9A39402e8a5514f9c43Af0322b665F`

### Polygon

**Tokens:**
- crv: `0x172370d5Cd63279eFa6d502DAB29171933a610AF`
- crvUSD: `0xc4Ce1D6F5D98D65eE25Cf85e9F2E9DcFEe6Cb5d6`

**AMM Factories:**
- stableswap.factory: `0x1764ee18e8B3ccA4787249Ceb249356192594585`
- tricrypto.factory: `0xC1b393EfEF38140662b91441C6710Aa704973228`
- twocrypto.factory: `0x98EE851a00abeE0d95D08cF4CA2BdCE32aeaAF7F`

## File Structure

This extraction includes three files:

1. **curve-deployment-data.json** - Original deployment data from Curve docs
2. **curve-registry-organized.json** - Organized by chain and category with flattened paths
3. **curve-contracts.csv** - CSV export with columns: Chain, Category, Contract Name, Address

## Usage

### JSON Structure

The organized JSON follows this structure:

```json
{
  "chain_name": {
    "category": {
      "contract.path.name": "0x..."
    }
  }
}
```

### CSV Format

The CSV file contains all contracts in a flat format:

```
Chain,Category,Contract Name,Address
ethereum,tokens,crv,0xD533a949740bb3306d119CC777fa900bA034cd52
```

## Contract Type Descriptions

### AMM Types

- **Stableswap** - Optimized for stable pairs (stablecoin-to-stablecoin)
- **Twocrypto** - Two-token volatile pairs (e.g., ETH/BTC)
- **Tricrypto** - Three-token volatile pairs (e.g., USDT/WBTC/WETH)

### Key Components

- **Factory** - Deploys new pool instances
- **Implementation** - Template contract for pools
- **Math** - Mathematical libraries for curve calculations
- **Views** - Read-only helper contracts
- **Gauge Implementation** - Template for liquidity gauges

### crvUSD Components

- **Controller** - Manages debt positions
- **AMM (LLAMMA)** - Liquidation AMM for soft liquidations
- **PegKeepers** - Maintain crvUSD peg stability
- **Price Aggregator** - Oracle for price feeds

### LlamaLend Components

- **One-Way-Lending-Factory** - Deploys lending markets
- **Controller** - Manages lending positions
- **Vault** - ERC-4626 vault implementation
- **Monetary Policy** - Interest rate model

## Networks Details

### Ethereum (91 contracts)
Primary deployment with all core governance, DAO, and protocol contracts.

### Layer 2s
- **Arbitrum** (46): Full AMM suite + LlamaLend
- **Optimism** (47): Full AMM suite + LlamaLend + scrvUSD
- **Base** (40): Full AMM suite + scrvUSD

### Sidechains
- **Polygon** (49): Full AMM deployment
- **Avalanche** (52): Full AMM + cross-chain bridges
- **BSC** (47): Full AMM deployment
- **Gnosis** (45): Full AMM deployment

### Emerging Networks
- **Sonic** (53): New deployment with LlamaLend
- **Fraxtal** (47): Full AMM + LlamaLend
- **Taiko** (38): AMM deployment
- **Ink** (38): AMM deployment
- **Corn** (38): AMM deployment

## Cross-Chain Infrastructure

Curve uses LayerZero (LZ) and Chainlink CCIP for cross-chain operations:

- **CRV Bridges** - Transfer CRV tokens across chains
- **crvUSD Bridges** - Transfer crvUSD across chains
- **scrvUSD Bridges** - Transfer scrvUSD across chains
- **Keepers** - Maintain cross-chain state synchronization
- **x-Gov Relayers** - Execute cross-chain governance

## Integration Points

### For Developers

- **Address Provider**: Main entry point for discovering contract addresses
- **Meta Registry**: Query all pools and their metadata
- **Rate Provider**: Get exchange rates for integrations
- **Routers**: Optimal swap routing across pools

### For Analytics

- **CRV Circulating Supply**: Track token metrics
- **Fee Collector**: Monitor protocol revenue
- **Gauge Controller**: Analyze CRV emissions

## Notes

- All addresses are checksummed Ethereum addresses
- Some chains may have incomplete deployments based on protocol roadmap
- Contract implementations may be shared across multiple chains
- Always verify addresses against official Curve documentation

## Resources

- **Curve Documentation**: https://docs.curve.finance/
- **Deployment Data Source**: https://github.com/CurveDocs/curve-docs
- **Official Website**: https://curve.fi/

---

*Last Updated: 2026-02-02*
*Data extracted from official Curve deployment registry*
