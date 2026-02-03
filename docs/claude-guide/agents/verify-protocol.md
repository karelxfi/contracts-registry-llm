# Verify Protocol Data Agent

This agent handles comprehensive verification of protocol data against official sources.

## When to Use
- User wants to verify all addresses for a protocol
- User suspects there may be errors in the data
- User says "verify {protocol} data"
- Before major updates or releases

## Steps

1. **Load Protocol Data**
   - Read protocol file from `data/sources/protocols/{protocol}/`
   - Get list of all chains with deployments
   - Count total addresses to verify

2. **Identify Official Sources**
   - Check protocol's GitHub for addresses
   - Check official documentation
   - Check DefiLlama API
   - Ask user which source to prioritize

3. **Fetch Official Data**
   - For GitHub:
     ```bash
     WebFetch: https://github.com/{org}/{repo}/blob/main/addresses.json
     ```
   - For Docs:
     ```bash
     WebFetch: {official-docs-url}/addresses
     ```
   - For DefiLlama:
     ```bash
     curl -s "https://api.llama.fi/protocol/{protocol-slug}"
     ```

4. **Compare Each Deployment**
   - For each chain in deployments:
     - Compare addresses with official source
     - Check if all contracts present
     - Flag any mismatches
     - Flag any missing contracts

5. **Generate Report**
   - Create summary report:
     ```
     Protocol: {protocol}
     Total Chains: {count}
     Verified: {count}
     Mismatches: {count}
     Missing: {count}

     Details:
     ✓ Chain1: All addresses verified
     ✗ Chain2: Address mismatch for contract X
     ⚠ Chain3: Missing contract Y
     ```

6. **Fix Issues (if requested)**
   - If mismatches found, offer to fix them
   - If missing contracts found, offer to add them
   - Update source metadata for corrected chains

7. **Update Verification Status**
   - Mark verified addresses with `"verified": true`
   - Update `source` and `sourceUrl` fields
   - Update `updated` timestamp

8. **Build and Commit (if changes made)**
   - Run `npm run build`
   - Commit with message: "Verify and fix {protocol} addresses"

## Report Format

```markdown
# Verification Report: {Protocol}

**Date**: YYYY-MM-DD
**Source**: {official-source-url}

## Summary
- Total Chains: {count}
- Fully Verified: {count}
- Issues Found: {count}
- Missing Contracts: {count}

## Detailed Results

### ✓ Verified Chains
- ethereum: All 5 contracts verified
- base: All 3 contracts verified
- arbitrum: All 3 contracts verified

### ✗ Mismatches Found
- **camp**:
  - morpho: Expected 0x123..., Found 0xabc...
  - adaptiveCurveIrm: Expected 0x456..., Found 0xdef...

### ⚠ Missing Contracts
- **polygon**:
  - Missing: bundler contract

### ℹ Info
- **avalanche**: Not in official source (newly added chain)

## Recommendations
1. Fix mismatched addresses for camp chain
2. Add missing bundler contract for polygon
3. Verify avalanche addresses with protocol team
```

## Validation Strategy

### Priority Order
1. **Official GitHub repo** (most reliable)
2. **Official documentation** (usually up-to-date)
3. **Protocol SDK/npm packages** (programmatic source)
4. **DefiLlama API** (community verified)
5. **Block explorers** (last resort)

### Verification Levels
- **Full Match**: Address matches exactly ✓
- **Case Mismatch**: Address matches but different case ⚠
- **Wrong Address**: Address doesn't match ✗
- **Missing**: Address not in official source ⚠
- **Extra**: We have address not in official source ℹ

## Common Issues

### Issue 1: Checksum Case
```
Our address: 0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb
Official:    0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
```
Solution: Update to checksummed version

### Issue 2: Wrong Network
```
User added Ethereum address to Base deployment
```
Solution: Verify chain IDs match

### Issue 3: Old Address
```
Protocol upgraded contract, we have old address
```
Solution: Update to new address, note in commit

### Issue 4: Proxy vs Implementation
```
Official lists proxy, we have implementation
```
Solution: Use proxy address, mark as proxy in metadata

## Automation Opportunities

For protocols with JSON addresses file:
```bash
# Fetch official addresses
curl -s "https://raw.githubusercontent.com/{org}/{repo}/main/addresses.json" \
  > /tmp/official_addresses.json

# Compare with our data
node scripts/compare-addresses.js {protocol} /tmp/official_addresses.json
```

## Example Usage
```
User: "Verify all Morpho Blue addresses"

Agent:
1. Reads data/sources/protocols/morpho/blue.json
2. Fetches from https://github.com/morpho-org/morpho-blue
3. Compares all 37 chain deployments
4. Finds 2 mismatches on camp chain
5. Generates report showing issues
6. Offers to fix the mismatches
7. Updates and commits if user agrees
```

## Error Handling
- If official source unreachable: Use backup sources
- If no official source: Ask user to provide reference
- If conflicting sources: Ask user which to trust
- If too many errors: Generate report and ask before fixing

## Post-Verification
- Save verification report to `/tmp/verification-report-{protocol}.md`
- Update protocol's `updated` field
- Add verification timestamp to metadata
- Consider adding `verified: true` flag to protocol level
