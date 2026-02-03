# Add New Chain Agent

This agent handles adding support for new blockchain networks.

## When to Use
- User wants to add a new chain to the registry
- User says "add {chain} support"
- User provides chain information

## Steps

1. **Gather Chain Information**
   - Ask user for:
     - Chain name (display name)
     - Chain ID (numeric)
     - Chain slug (lowercase, hyphenated ID)
     - Native currency (name, symbol, decimals)
     - RPC endpoints (if available)
     - Block explorer URL
     - Platform type (evm, other)

2. **Fetch External Platform IDs**
   - **CoinGecko**: Search for chain token
     ```bash
     curl -s "https://api.coingecko.com/api/v3/search?query={chain}"
     ```
   - **CoinMarketCap**: Ask user for CMC ID or search
   - **DefiLlama**: Check chains API
     ```bash
     curl -s "https://api.llama.fi/chains" | jq '.[] | select(.name == "{Chain}")'
     ```

3. **Create Chain File**
   - Use Write tool to create `data/sources/chains/{chain-slug}.json`
   - Structure:
     ```json
     {
       "id": "chain-slug",
       "name": "Chain Name",
       "platform": "evm",
       "status": "active",
       "chainId": 123,
       "nativeCurrency": {
         "name": "Token Name",
         "symbol": "SYMBOL",
         "decimals": 18
       },
       "gecko_id": "coingecko-id",
       "cmcId": "coinmarketcap-id",
       "defillamaId": "defillama-slug",
       "explorers": {
         "primary": {
           "name": "Explorer Name",
           "url": "https://explorer.example.com"
         }
       },
       "rpc": {
         "public": ["https://rpc.example.com"]
       }
     }
     ```

4. **Verify External IDs**
   - Cross-check gecko_id with CoinGecko API
   - Cross-check defillamaId with DefiLlama chains
   - Verify chain ID is correct and unique

5. **Build and Test**
   - Run `npm run build`
   - Check that chain appears in generated files
   - Verify `data/generated/by-chain/{chain-slug}.json` created

6. **Commit Changes**
   - Stage with `git add -A`
   - Commit with message: "Add {chain} support"
   - Ask user if they want to push

## Information Sources

### Chain Registry
```
https://chainlist.org/
https://chainid.network/
```

### CoinGecko
```
https://api.coingecko.com/api/v3/search?query={chain}
```

### DefiLlama
```
https://api.llama.fi/chains
```

### Chain Documentation
```
Official docs usually at: https://docs.{chain}.com
```

## Validation Checks
- [ ] Chain ID is unique (not already in use)
- [ ] Chain slug is lowercase, hyphenated, no special chars
- [ ] Native currency decimals correct (usually 18 for EVM)
- [ ] Explorer URL is accessible
- [ ] Platform type correct (evm vs other)
- [ ] External IDs verified
- [ ] Build successful

## Common Platform Types
- `"evm"` - Ethereum Virtual Machine chains (most common)
- `"other"` - Non-EVM chains (Bitcoin, Solana, Cosmos, etc.)

## Common Native Currency Decimals
- **18**: Most EVM chains (Ethereum, Arbitrum, Base, etc.)
- **8**: Bitcoin and some Bitcoin-based chains
- **9**: Solana
- **6**: Some specific chains

## Example Usage
```
User: "Add Zircuit chain support"

Agent:
1. Asks for chain ID, native currency info
2. Fetches gecko_id from CoinGecko
3. Fetches defillamaId from DefiLlama
4. Creates data/sources/chains/zircuit.json
5. Builds and verifies
6. Commits with "Add Zircuit support"
```

## Error Handling
- If chain already exists: Inform user and ask if they want to update
- If chain ID conflicts: Ask user to verify correct ID
- If external IDs not found: Proceed without them (can add later)
- If build fails: Show error and ask how to proceed

## Post-Creation Steps
Remind user that after adding a chain:
1. They can now add protocol deployments to this chain
2. The chain will appear in the API endpoints
3. They may want to add protocols that support this chain
