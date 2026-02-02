# API Setup Instructions

## Enable GitHub Pages (One-time setup)

1. Go to: https://github.com/karelxfi/contracts-registry-llm/settings/pages
2. Under "Source", select: **Deploy from a branch**
3. Under "Branch", select: **main** and **/docs**
4. Click **Save**

GitHub will take 1-2 minutes to deploy.

## Your API Endpoints

Once enabled, your API will be live at:

**Base URL:** `https://karelxfi.github.io/contracts-registry-llm`

**Homepage:** https://karelxfi.github.io/contracts-registry-llm/

### Example Endpoints:

```bash
# Get all Ethereum protocols
curl https://karelxfi.github.io/contracts-registry-llm/data/generated/by-chain/ethereum.json

# Get Aave V3 contract addresses
curl https://karelxfi.github.io/contracts-registry-llm/data/sources/protocols/aave-v3/aave-v3.json

# Get all lending protocols
curl https://karelxfi.github.io/contracts-registry-llm/data/generated/by-category/lending.json

# Reverse lookup by address
curl https://karelxfi.github.io/contracts-registry-llm/data/generated/indexes/by-address.json

# Get populated protocols
curl https://karelxfi.github.io/contracts-registry-llm/data/populated-protocols.json
```

## Features

- **Free hosting** via GitHub Pages CDN
- **No rate limits**
- **CORS enabled** - works from browsers
- **Instant updates** - push to main branch and it updates automatically
- **Global CDN** - fast worldwide access

## Updating the API

To add new protocol data:

1. Edit files in `data/sources/protocols/`
2. Run `npm run build` to regenerate indexes
3. Commit and push to GitHub
4. API updates automatically in 1-2 minutes

## Cost

Free forever. GitHub Pages is free for public repositories.
