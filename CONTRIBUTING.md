# Contributing to Contracts Registry

Contributions are welcome. This guide explains how to add or update protocol data.

## Before Contributing

1. Read the [SCHEMA.md](SCHEMA.md) to understand the data structure
2. Check [EXAMPLES.md](EXAMPLES.md) for query patterns
3. Ensure addresses are from official sources only

## Adding a New Protocol

### 1. Create Protocol Directory

```bash
mkdir -p data/sources/protocols/protocol-name
```

### 2. Create Protocol JSON File

File: `data/sources/protocols/protocol-name/protocol-name.json`

Required fields:
- `id` - Protocol identifier (lowercase, hyphens)
- `name` - Human-readable name
- `type` - Protocol category
- `status` - "complete", "partial", or "placeholder"
- `contracts` - Contract definitions
- `deployments` - Chain deployments with addresses

See [SCHEMA.md](SCHEMA.md) for complete field specifications.

### 3. Verify Addresses

**Critical**: Only use addresses from official sources:
- Official protocol documentation
- Verified GitHub repositories
- Official announcements
- Verified block explorers

**Never** use:
- Unverified third-party sources
- Social media without verification
- Addresses from unknown contracts

### 4. Address Formats by Chain

**EVM Chains:**
- Must be checksummed (0x with mixed case)
- 42 characters (0x + 40 hex)
- Use ethers.js or web3.js to checksum

**Solana:**
- Base58 encoded (32-44 characters)
- No checksum required

**Other Chains:**
- Follow chain-specific formats
- Document in contract description

### 5. Add Status Field

Set protocol status:
- `"status": "complete"` - All contracts have addresses
- `"status": "partial"` - Some contracts missing
- `"status": "placeholder"` - No addresses yet

### 6. For Solana Programs

Include IDL links:

```json
{
  "contracts": {
    "program": {
      "name": "Program Name",
      "type": "core",
      "description": "Program description",
      "proxy": false,
      "idl": "https://github.com/org/repo/blob/main/idl/program.json",
      "keyEvents": [],
      "keyFunctions": [],
      "useCases": ["use-case"]
    }
  }
}
```

### 7. Build and Validate

```bash
npm run build
```

This validates your JSON and regenerates indexes.

### 8. Update Populated Protocols Index

If adding a complete protocol, update `data/populated-protocols.json`:

```json
{
  "populatedProtocols": 6,
  "populatedList": [
    {
      "id": "your-protocol",
      "name": "Your Protocol",
      "type": "protocol-type",
      "chains": ["chain1", "chain2"],
      "chainCount": 2,
      "status": "complete",
      "contractCount": 3,
      "lastUpdated": "2025-02-02"
    }
  ]
}
```

## Updating Existing Protocols

### Adding Addresses

1. Read the existing protocol file
2. Add addresses to the `deployments` section
3. Update `verified` field if contract is verified on explorer
4. Update `updated` field to current date
5. Run `npm run build`

### Adding New Chains

1. Add chain to protocol's `deployments` object
2. Add chain to protocol's `tags` array
3. Update `data/populated-protocols.json` if needed
4. Run `npm run build`

## Adding Chain Metadata

File: `data/sources/chains/chain-name.json`

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
  "tags": ["layer1", "evm", "mainnet"]
}
```

## Pull Request Guidelines

### PR Title Format

- `feat: Add [Protocol Name] on [Chain]`
- `fix: Update [Protocol Name] addresses`
- `docs: Improve [documentation area]`

### PR Description

Include:
1. What protocol/chain you're adding or updating
2. Source URLs for all addresses
3. Verification status of contracts
4. Any notes about the deployment

### Example PR Description

```markdown
## Summary
Add Uniswap V3 protocol addresses on Ethereum and Polygon

## Addresses Source
- https://docs.uniswap.org/contracts/v3/reference/deployments
- Verified on Etherscan and Polygonscan

## Contracts Added
- Factory: 0x1F98431c8aD98523631AE4a59f267346ea31F984
- Router: 0xE592427A0AEce92De3Edee1F18E0157C05861564
- QuoterV2: 0x61fFE014bA17989E743c5F6cB21bF9697530B21e

## Verification
All contracts verified on block explorers.
```

## Code Style

- Use 2-space indentation
- No trailing commas in JSON
- Double quotes for strings
- Sort object keys alphabetically where reasonable
- Keep addresses checksummed (EVM)

## Testing Your Changes

Before submitting:

```bash
# Validate JSON
npm run build

# Check for errors
cat data/generated/protocols.json | jq . > /dev/null
```

## Questions?

- Open an issue for questions about contributing
- Check existing protocols for examples
- Read SCHEMA.md for detailed specifications

## License

By contributing, you agree your contributions will be licensed under the MIT License.
