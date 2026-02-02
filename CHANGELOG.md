# Changelog

All notable changes to the Contracts Registry will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Initial public release of Contracts Registry for LLMs
- Protocol schema supporting EVM chains
- Chain metadata for 100+ blockchain networks
- Complete contract addresses for 5 protocols:
  - Aave V2 (3 chains: Ethereum, Polygon, Avalanche)
  - Aave V3 (19 chains: Ethereum, Polygon, Arbitrum, Base, Optimism, Avalanche, Gnosis, BNB, Scroll, Metis, zkSync Era, Linea, Fantom, Harmony, Celo, Sonic, Soneium, Mantle, Plasma)
  - Morpho Blue (3 chains: Ethereum, Base, Arbitrum One)
  - GMX V1 (1 chain: Arbitrum One)
  - Jupiter (1 chain: Solana)
- Placeholder data for 4,437 protocols from DefiLlama
- Support for non-EVM chains (Solana with base58 addresses)
- IDL (Interface Definition Language) field for Solana program interfaces
- Generated data files:
  - Combined protocols index
  - Contract addresses index
  - Chain-specific protocol views (80+ chains)
  - Category-specific protocol views (87 categories)
  - Address lookup index
  - Event lookup index
- Documentation:
  - README.md with LLM usage guide
  - SCHEMA.md with complete field documentation
  - EXAMPLES.md with 15+ query examples for AI agents
- Build system with JSON schema validation
- Status field for tracking protocol completion ("complete", "partial", "placeholder")
- Populated protocols index at data/populated-protocols.json

### Changed
- Schema validation relaxed to warnings instead of errors
- Protocol schema allows flexible type values
- Deployment schema supports empty addresses and null deployment blocks

## [1.0.0] - 2025-02-02

Initial release.
