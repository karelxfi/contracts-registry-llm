# Quick Reference Guide

## Most Common Operations

### 1. Add New Protocol Deployment

```bash
# 1. Read existing protocol file
Read: data/sources/protocols/{protocol}/{protocol}.json

# 2. Edit to add new chain deployment
Edit: Add deployment under "deployments" object

# 3. Add chain to tags array if new
Edit: Add chain to "tags" array

# 4. Build
npm run build

# 5. Commit
git add -A
git commit -m "Add {protocol} to {chain}"
git push
```

### 2. Fix Wrong Addresses

```bash
# 1. Verify correct addresses from official source
WebFetch: {official-docs-url}

# 2. Read current protocol file
Read: data/sources/protocols/{protocol}/{protocol}.json

# 3. Update addresses
Edit: Replace incorrect addresses

# 4. Update metadata
Edit: Update "updated" field, add "source" info

# 5. Build and commit
npm run build
git add -A
git commit -m "Fix {protocol} addresses on {chain}"
git push
```

### 3. Add New Chain

```bash
# 1. Create chain file
Write: data/sources/chains/{chain}.json

# 2. Use this template:
{
  "id": "chain-slug",
  "name": "Chain Name",
  "platform": "evm",
  "status": "active",
  "chainId": 123,
  "nativeCurrency": {
    "name": "Token",
    "symbol": "TKN",
    "decimals": 18
  },
  "gecko_id": "coingecko-id",
  "cmcId": "cmc-id",
  "defillamaId": "defillama-slug",
  "explorers": {
    "primary": {
      "name": "Explorer",
      "url": "https://explorer.example.com"
    }
  },
  "rpc": {
    "public": []
  }
}

# 3. Build
npm run build

# 4. Commit
git add -A
git commit -m "Add {chain} support"
git push
```

### 4. Update External Platform IDs

```bash
# For chains:
Edit: data/sources/chains/{chain}.json
# Add/update: gecko_id, cmcId, defillamaId

# For protocols:
Edit: data/sources/protocols/{protocol}/{protocol}.json
# Add/update: defillamaId field at protocol level

# Always build after:
npm run build
```

## Quick Checks

### Verify Build
```bash
npm run build                          # Build everything
echo $?                                # Should be 0 (success)
```

### Check Generated Files
```bash
ls docs/api/v1/protocol/{protocol}.json     # Should exist
cat docs/api/v1/protocol/{protocol}.json | jq '.deployments | keys'
```

### Verify Git Status
```bash
git status --short                     # Shows all changes
git diff data/sources/protocols/       # Show source changes
```

### Check Live Deployment
```bash
curl -s "https://karelxfi.github.io/contracts-registry-llm/api/v1/protocol/{protocol}.json" | jq '.'
```

## Common Commands

```bash
# Build project
npm run build

# Git operations
git status --short
git add -A
git commit -m "message"
git push

# Check protocol deployments
cat data/sources/protocols/{protocol}/{protocol}.json | jq '.deployments | keys'

# Check chain info
cat data/sources/chains/{chain}.json | jq '{id, name, chainId, defillamaId}'

# Verify address format
echo "0xAddress" | grep -E '^0x[a-fA-F0-9]{40}$'

# Count deployments
cat data/sources/protocols/{protocol}/{protocol}.json | jq '.deployments | length'
```

## Protocol File Template

```json
{
  "id": "protocol-id",
  "name": "Protocol Name",
  "type": "category",
  "status": "complete",
  "website": "https://protocol.com",
  "github": "https://github.com/protocol/repo",
  "docs": "https://docs.protocol.com",
  "defillamaId": "defillama-slug",
  "tags": [
    "category",
    "chain1",
    "chain2"
  ],
  "contracts": {
    "contractName": {
      "name": "Contract Display Name",
      "type": "core",
      "description": "What this contract does",
      "proxy": false,
      "keyEvents": [],
      "keyFunctions": [],
      "useCases": []
    }
  },
  "deployments": {
    "chain1": {
      "chain": "chain1",
      "chainId": 1,
      "addresses": {
        "contractName": "0x..."
      },
      "deploymentBlocks": {
        "contractName": 12345678
      },
      "verified": {
        "contractName": true
      },
      "source": "official-docs",
      "sourceUrl": "https://docs.protocol.com/addresses",
      "updated": "2026-02-03"
    }
  }
}
```

## Emergency Commands

```bash
# Rollback last commit
git reset --hard HEAD~1
npm run build
git push --force

# Clean build
rm -rf data/generated docs/api
npm run build

# Fix git repository
git prune
git gc
```

## Verification Checklist

Before pushing:
- [ ] Ran `npm run build` successfully
- [ ] No build errors in terminal
- [ ] Generated files updated (check timestamps)
- [ ] Git diff shows expected changes
- [ ] No unintended files in `git status`
- [ ] Addresses verified against official source
- [ ] Commit message is descriptive

## Need Help?

1. Check `.claude/config.md` for detailed guidelines
2. Look at similar protocols for patterns
3. Verify with official protocol documentation
4. Ask user if uncertain about data accuracy
