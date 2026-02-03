# Add Protocol Deployment Agent

This agent handles adding new protocol deployments to existing chains.

## When to Use
- User wants to add a protocol to a new chain
- User provides contract addresses for a protocol on a specific chain
- User asks to "add {protocol} to {chain}"

## Steps

1. **Verify Protocol Exists**
   - Check if protocol file exists in `data/sources/protocols/{protocol}/`
   - If not found, ask user if they want to create a new protocol

2. **Verify Chain Exists**
   - Check if chain file exists in `data/sources/chains/{chain}.json`
   - Get chain ID from the chain file
   - If not found, ask user if they want to create a new chain

3. **Get Source Information**
   - Ask user for the source of contract addresses (official docs URL, GitHub, etc.)
   - Verify addresses if source is accessible via WebFetch

4. **Read Existing Protocol File**
   - Use Read tool to load current protocol data
   - Check if deployment already exists for this chain
   - If exists, confirm with user before overwriting

5. **Prepare Deployment Data**
   - Format addresses correctly (ensure 0x prefix)
   - Structure deployment object:
     ```json
     {
       "chain": "chain-id",
       "chainId": 123,
       "addresses": {
         "contractName": "0x..."
       },
       "deploymentBlocks": {
         "contractName": null
       },
       "verified": {
         "contractName": true
       },
       "source": "source-type",
       "sourceUrl": "https://...",
       "updated": "YYYY-MM-DD"
     }
     ```

6. **Update Protocol File**
   - Add deployment to "deployments" object
   - Add chain to "tags" array if not present
   - Use Edit tool to update the file

7. **Build and Verify**
   - Run `npm run build`
   - Check for build errors
   - Verify generated files updated

8. **Commit Changes**
   - Stage changes with `git add -A`
   - Commit with message: "Add {protocol} to {chain}"
   - Ask user if they want to push

## Validation Checks
- [ ] Protocol file exists
- [ ] Chain file exists
- [ ] All addresses have 0x prefix and are 40 hex characters
- [ ] Source URL provided
- [ ] Chain added to tags array
- [ ] Build successful
- [ ] Generated files updated

## Example Usage
```
User: "Add Morpho Blue to Avalanche"

Agent:
1. Reads data/sources/protocols/morpho/blue.json
2. Reads data/sources/chains/avalanche.json
3. Asks for contract addresses and source
4. Updates protocol file with deployment
5. Adds "avalanche" to tags
6. Runs npm run build
7. Commits with "Add Morpho Blue to Avalanche"
```

## Error Handling
- If protocol doesn't exist: Offer to create new protocol
- If chain doesn't exist: Offer to create new chain
- If addresses invalid: Ask user to verify format
- If build fails: Show error and ask how to proceed
