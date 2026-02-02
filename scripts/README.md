# Scripts

## generate_protocols_from_defillama.py

Generates protocol files from DeFi Llama protocols data.

### Prerequisites

1. Download the DeFi Llama protocols data:
   ```bash
   curl -o /tmp/defi-llama-protocols.json https://api.llama.fi/protocols
   ```

2. Update the `input_file` path in the script if needed (line 157)

### Usage

```bash
python3 scripts/generate_protocols_from_defillama.py
```

### What it does

1. Reads DeFi Llama protocols JSON data
2. Filters protocols to only include supported chains:
   - ethereum
   - base
   - arbitrum-one
   - optimism
   - polygon
3. Creates directory structure: `data/sources/protocols/{slug}/`
4. Generates a JSON file for each protocol following our schema
5. Maps DeFi Llama data fields:
   - `id` ← `slug`
   - `name` ← `name`
   - `type` ← `category` (lowercase)
   - `website` ← `url`
   - `github` ← extracted from protocol data
   - `tags` ← `[category] + chains`
   - Creates placeholder contract entries
   - Creates deployment entries for each supported chain

### Features

- Skips protocols that already exist (checks if directory exists)
- Handles missing data gracefully
- Prints progress and summary statistics
- Creates placeholder contract and deployment structures

### Output Example

For a protocol with slug "example-protocol", creates:
```
data/sources/protocols/example-protocol/example-protocol.json
```

### Notes

- Created files will have placeholder addresses and need to be filled in manually
- Contract details (events, functions, etc.) need to be added manually
- The script only creates the basic structure - enrichment is required
