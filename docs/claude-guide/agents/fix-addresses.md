# Fix Protocol Addresses Agent

This agent handles fixing incorrect contract addresses for existing protocol deployments.

## When to Use
- User reports wrong addresses for a protocol
- User wants to update addresses based on new source
- User says "fix {protocol} addresses on {chain}"
- Addresses need verification against official source

## Steps

1. **Identify Protocol and Chain**
   - Parse user request for protocol name and chain
   - Verify both exist in the registry

2. **Fetch Official Source**
   - Ask user for official documentation URL if not provided
   - Use WebFetch to get official addresses if URL provided
   - Common sources:
     - Protocol official docs
     - GitHub repositories
     - DefiLlama API
     - Block explorers

3. **Read Current State**
   - Use Read tool to load protocol file
   - Show user current addresses for the chain
   - Ask user to confirm which addresses are incorrect

4. **Verify New Addresses**
   - Check address format (0x + 40 hex chars)
   - Cross-reference with official source
   - If multiple sources available, verify consistency

5. **Update Addresses**
   - Use Edit tool to replace incorrect addresses
   - Update metadata:
     - `source`: Update to reflect new source
     - `sourceUrl`: Update to official URL
     - `updated`: Set to current date (YYYY-MM-DD)
     - `verified`: Set to true for verified addresses

6. **Build and Verify**
   - Run `npm run build`
   - Check generated files
   - Verify addresses appear correctly in API

7. **Commit Changes**
   - Stage with `git add -A`
   - Commit with message: "Fix {protocol} addresses on {chain}"
   - Ask user if they want to push

## Validation Checks
- [ ] Official source verified
- [ ] All addresses match official documentation
- [ ] Address format valid (0x + 40 hex)
- [ ] Metadata updated (source, sourceUrl, updated)
- [ ] Build successful
- [ ] No unintended changes in git diff

## Example Usage
```
User: "Fix Morpho Blue addresses on Camp chain"

Agent:
1. Asks for official source URL
2. Fetches addresses from source
3. Shows current vs. official addresses
4. Updates incorrect addresses
5. Updates metadata (source, updated)
6. Builds and verifies
7. Commits with "Fix Morpho Blue addresses on Camp"
```

## Common Address Sources

### Official Docs
```
WebFetch: https://docs.protocol.com/addresses
Prompt: "Extract contract addresses for {chain}"
```

### GitHub
```
WebFetch: https://github.com/protocol/repo/blob/main/addresses.json
Prompt: "Extract contract addresses for {chain}"
```

### DefiLlama
```
Bash: curl -s "https://api.llama.fi/protocol/{protocol-slug}"
```

## Verification Strategy
1. **Primary Source**: Official protocol documentation
2. **Secondary Source**: GitHub repository
3. **Tertiary Source**: DefiLlama API or block explorer
4. **Always**: Ask user to confirm if any doubt

## Error Handling
- If source inaccessible: Ask user to provide addresses manually
- If addresses don't match format: Ask user to verify
- If multiple conflicting sources: Ask user which to trust
- If build fails: Show error and rollback if needed
