# Usage Examples for AI Agents

This document provides practical examples for AI agents querying the contracts registry.

## Basic Queries

### 1. Get Pool Address for Aave V3 on Base

**Query**: "What is the Aave V3 pool address on Base?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Navigate to: `deployments.base.addresses.pool`
3. Return: `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5`

**Code path**:
```
aave-v3.json -> deployments -> base -> addresses -> pool
```

### 2. Get All Contract Addresses for a Protocol on a Chain

**Query**: "Get all Aave V2 contract addresses on Ethereum"

**Steps**:
1. Read file: `data/sources/protocols/aave-v2/aave-v2.json`
2. Navigate to: `deployments.ethereum.addresses`
3. Return all key-value pairs

**Response**:
```json
{
  "lendingPool": "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
  "poolAddressesProvider": "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
  "poolConfigurator": "0x311Bb771e4F8952E6Da169b425E7e92d6Ac45756",
  "aaveOracle": "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9",
  "protocolDataProvider": "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d",
  "collector": "0x464C71f6c2F760DdA6093dCB91C24c39e5d6e18c"
}
```

### 3. List All Chains Where a Protocol is Deployed

**Query**: "On which chains is Aave V3 deployed?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Get keys from: `deployments`
3. Return array of chain names

**Response**:
```json
[
  "ethereum",
  "plasma",
  "arbitrum",
  "base",
  "avalanche",
  "polygon",
  "linea",
  "sonic",
  "celo",
  "scroll",
  "soneium",
  "metis",
  "optimism",
  "gnosis",
  "bsc",
  "zksync-era",
  "fantom",
  "harmony",
  "mantle"
]
```

### 4. Check if Contract is Verified

**Query**: "Is the Aave V3 pool contract verified on Base?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Navigate to: `deployments.base.verified.pool`
3. Return boolean value

**Response**: `true`

### 5. Get Contract Deployment Block

**Query**: "When was the Aave V2 lending pool deployed on Ethereum?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v2/aave-v2.json`
2. Navigate to: `deployments.ethereum.deploymentBlocks.lendingPool`
3. Return block number or null

**Response**: `null` (data not available)

## Advanced Queries

### 6. Find All Lending Protocols

**Query**: "List all lending protocols in the registry"

**Steps**:
1. List all directories in: `data/sources/protocols/`
2. For each protocol, read the JSON file
3. Filter where `type === "lending"`
4. Return array of protocol IDs and names

**Pseudocode**:
```
protocols = []
for each file in data/sources/protocols/*/*.json:
  data = read(file)
  if data.type == "lending":
    protocols.append({id: data.id, name: data.name})
return protocols
```

### 7. Get All Protocols Deployed on a Specific Chain

**Query**: "Which protocols are deployed on Base?"

**Steps**:
1. List all protocol files in: `data/sources/protocols/`
2. For each protocol, check if `deployments.base` exists
3. Return protocols with Base deployments

**Pseudocode**:
```
protocols_on_base = []
for each file in data/sources/protocols/*/*.json:
  data = read(file)
  if "base" in data.deployments:
    protocols_on_base.append({
      id: data.id,
      name: data.name,
      addresses: data.deployments.base.addresses
    })
return protocols_on_base
```

### 8. Find Contract by Address

**Query**: "What contract is at address 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2 on Ethereum?"

**Steps**:
1. Normalize address to checksummed format
2. Iterate through all protocol files
3. For each protocol, check `deployments.ethereum.addresses`
4. If address matches, return protocol, chain, and contract name

**Response**:
```json
{
  "protocol": "aave-v3",
  "protocolName": "Aave V3",
  "chain": "ethereum",
  "contractId": "pool",
  "contractName": "Pool",
  "address": "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
}
```

### 9. Get Chain Metadata

**Query**: "What is the chain ID for Polygon?"

**Steps**:
1. Read file: `data/sources/chains/polygon.json`
2. Navigate to: `chainId`
3. Return value

**Response**: `137`

### 10. Get All Verified Contracts for a Protocol

**Query**: "Which Aave V3 contracts on Base are verified?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Navigate to: `deployments.base.verified`
3. Filter for entries with value `true`
4. Return contract IDs

**Response**:
```json
[
  "pool",
  "poolAddressesProvider",
  "poolConfigurator",
  "aaveOracle",
  "poolDataProvider",
  "aclManager",
  "collector"
]
```

## Multi-Step Queries

### 11. Get Oracle Address for All Lending Protocols on Ethereum

**Query**: "Get oracle addresses for all lending protocols on Ethereum"

**Steps**:
1. List all protocol files
2. Filter protocols where `type === "lending"`
3. For each lending protocol:
   - Check if `deployments.ethereum` exists
   - Look for contract with `type === "oracle"` in `contracts`
   - Get address from `deployments.ethereum.addresses[oracleContractId]`
4. Return results

**Response**:
```json
[
  {
    "protocol": "aave-v2",
    "protocolName": "Aave V2",
    "oracleContract": "aaveOracle",
    "address": "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9"
  },
  {
    "protocol": "aave-v3",
    "protocolName": "Aave V3",
    "oracleContract": "aaveOracle",
    "address": "0x54586bE62E3c3580375aE3723C145253060Ca0C2"
  }
]
```

### 12. Compare Deployments Across Chains

**Query**: "Compare Aave V3 pool addresses across all chains"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Iterate through `deployments`
3. Extract `pool` address for each chain
4. Return mapping

**Response**:
```json
{
  "ethereum": "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  "polygon": "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  "arbitrum": "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  "base": "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
  "optimism": "0x794a61358D6845594F94dc1DB02A252b5b4814aD"
}
```

### 13. Get Data Source Information

**Query**: "Where did the Aave V3 Base deployment data come from?"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Navigate to: `deployments.base`
3. Return `source`, `sourceUrl`, and `updated` fields

**Response**:
```json
{
  "source": ["aave-address-book"],
  "sourceUrl": "https://github.com/bgd-labs/aave-address-book",
  "updated": "2025-01-31"
}
```

## Complex Queries

### 14. Build Transaction for Interacting with Contract

**Query**: "I want to call the Aave V3 pool on Base. Give me the contract address and help me understand what it does."

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Get address: `deployments.base.addresses.pool`
3. Get contract info: `contracts.pool`
4. Return combined information

**Response**:
```json
{
  "address": "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",
  "name": "Pool",
  "type": "core",
  "description": "Main lending pool contract for Aave V3",
  "proxy": true,
  "useCases": ["lending", "borrowing", "liquidity"],
  "verified": true,
  "chain": "base",
  "chainId": 8453
}
```

### 15. Find Similar Protocols

**Query**: "Find protocols similar to Aave V3"

**Steps**:
1. Read file: `data/sources/protocols/aave-v3/aave-v3.json`
2. Extract `type` and `tags`
3. Search for other protocols with matching type or tags
4. Return matches

**Pseudocode**:
```
aave_v3 = read("aave-v3.json")
target_type = aave_v3.type  // "lending"
target_tags = aave_v3.tags

similar_protocols = []
for each file in data/sources/protocols/*/*.json:
  protocol = read(file)
  if protocol.id != "aave-v3":
    if protocol.type == target_type:
      similar_protocols.append(protocol)
    else if any tag in protocol.tags matches target_tags:
      similar_protocols.append(protocol)

return similar_protocols
```

## Error Handling

### Case 1: Chain Not Found

**Query**: "Get Aave V3 pool on Solana"

**Expected behavior**:
1. Read `aave-v3.json`
2. Check if `deployments.solana` exists
3. Return: "Aave V3 is not deployed on Solana"

### Case 2: Contract Not Found

**Query**: "Get Aave V3 staking contract on Base"

**Expected behavior**:
1. Read `aave-v3.json`
2. Check `deployments.base.addresses` for "staking" key
3. Return: "Contract 'staking' not found in Aave V3 deployment on Base"

### Case 3: Missing Address

**Query**: "Get contract address for Plasma deployment"

**Expected behavior**:
1. Read protocol file
2. Find `deployments.plasma.addresses.contractId`
3. If value is `""`: "Address not available for this contract"
4. If contract doesn't exist: "Contract not found in Plasma deployment"

## Query Optimization

For AI agents processing multiple queries:

1. **Cache protocol files**: Read each protocol file once and cache in memory
2. **Index by chain**: Build reverse index mapping chains to protocols
3. **Index by address**: Build reverse index mapping addresses to contracts
4. **Index by type**: Build reverse index mapping protocol types to protocols

**Example index structure**:
```json
{
  "by_chain": {
    "base": ["aave-v3", "uniswap-v3", "compound-v3"]
  },
  "by_type": {
    "lending": ["aave-v2", "aave-v3", "compound-v2"]
  },
  "by_address": {
    "ethereum": {
      "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2": {
        "protocol": "aave-v3",
        "contract": "pool"
      }
    }
  }
}
```

This approach significantly improves query performance for repeated lookups.
