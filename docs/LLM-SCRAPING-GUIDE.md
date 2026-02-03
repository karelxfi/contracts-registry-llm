# LLM Scraping Guide

This document describes how to extract protocol and smart contract information from the DeFi Contracts Registry pages.

## Protocol Page Structure

Each protocol page (e.g., `/protocols/morpho-blue.html`) is optimized for LLM parsing with multiple data formats:

### 1. Meta Tags (Head Section)

Quick metadata extraction from HTML meta tags:

```html
<meta name="protocol:id" content="morpho-blue" />
<meta name="protocol:name" content="Morpho Blue" />
<meta name="protocol:type" content="lending" />
<meta name="protocol:chains" content="37" />
<meta name="protocol:contracts" content="103" />
<meta name="protocol:status" content="complete" />
<meta name="protocol:defillama_id" content="morpho-v1" />
<meta name="protocol:website" content="https://morpho.org" />
<meta name="protocol:github" content="https://github.com/morpho-org/morpho-blue" />
<meta name="protocol:documentation" content="https://docs.morpho.org" />
```

### 2. JSON-LD Structured Data

Schema.org structured data for search engines and LLMs:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Morpho Blue",
  "applicationCategory": "Blockchain Protocol",
  "description": "Morpho Blue is a lending protocol deployed across 37 blockchains.",
  "url": "https://morpho.org",
  "softwareVersion": "morpho-blue",
  "codeRepository": "https://github.com/morpho-org/morpho-blue",
  "documentation": "https://docs.morpho.org"
}
</script>
```

### 3. Complete Protocol Data (JSON)

Full protocol data embedded in the page:

```html
<script type="application/json" id="protocol-data" data-protocol-id="morpho-blue">
{
  "id": "morpho-blue",
  "name": "Morpho Blue",
  "type": "lending",
  "status": "complete",
  "website": "https://morpho.org",
  "github": "https://github.com/morpho-org/morpho-blue",
  "docs": "https://docs.morpho.org",
  "defillamaId": "morpho-v1",
  "tags": [...],
  "contracts": {...},
  "deployments": {...}
}
</script>
```

### 4. Human-Readable Summary (Hidden)

Plain text summary optimized for LLM extraction:

```html
<div id="llm-summary" style="display: none;" data-purpose="llm-parsing">
  <h1>Protocol: Morpho Blue</h1>
  <p>ID: morpho-blue</p>
  <p>Type: lending</p>
  <p>Status: complete</p>
  <p>Chains: 37</p>
  <p>Total Contracts: 103</p>
  <p>Website: https://morpho.org</p>
  <p>GitHub: https://github.com/morpho-org/morpho-blue</p>
  <p>Documentation: https://docs.morpho.org</p>
  <p>DefiLlama ID: morpho-v1</p>

  <h2>Contract Addresses by Chain:</h2>
  <pre>
ethereum:
  - Morpho: 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
  - AdaptiveCurveIrm: 0x46415998764C29aB2a25CbeA6254146D50D22687
  ...

base:
  - Morpho: 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
  ...
  </pre>

  <h2>API Endpoint:</h2>
  <p>GET https://karelxfi.github.io/contracts-registry-llm/api/v1/protocol/morpho-blue.json</p>
</div>
```

### 5. Semantic HTML with Data Attributes

The visible HTML includes data attributes for easy parsing:

```html
<div class="protocol-page" itemscope itemtype="https://schema.org/SoftwareApplication">
  <h1 itemprop="name" data-protocol-id="morpho-blue">Morpho Blue</h1>
  <span class="protocol-type-badge" data-type="lending">lending</span>

  <div class="stat-card" data-metric="chains">
    <div class="stat-number" data-value="37">37</div>
    <div class="stat-label">Chains</div>
  </div>

  <div class="deployment-card" data-chain="ethereum" data-chain-id="1">
    <h3>ethereum</h3>
    <div class="address-row"
         data-contract-name="Morpho"
         data-contract-address="0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb">
      <span class="address-label">Morpho</span>
      <code class="address-value">0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb</code>
    </div>
  </div>
</div>
```

## Recommended LLM Parsing Strategies

### Strategy 1: Meta Tags (Fastest)
Extract basic info from meta tags in the `<head>`:
- Protocol ID, name, type
- Chain count, contract count
- Links to website, docs, GitHub

### Strategy 2: JSON-LD Structured Data
Parse the `<script type="application/ld+json">` for Schema.org data.

### Strategy 3: Embedded JSON (Most Complete)
Parse the `<script type="application/json" id="protocol-data">` for full protocol details.

### Strategy 4: Hidden Summary Section (Most Human-Readable)
Extract the `<div id="llm-summary">` for plain text with all contract addresses.

### Strategy 5: Data Attributes (Fine-Grained)
Query DOM elements with data attributes like `[data-protocol-id]`, `[data-chain]`, `[data-contract-address]`.

## API Alternative

For programmatic access, use the JSON API:

```
GET /api/v1/protocol/{protocol-id}.json
```

Example:
```
GET /api/v1/protocol/morpho-blue.json
```

Returns complete protocol data including all deployments and contract addresses.

## Search Index

For searching across all protocols:

```
GET /api/v1/search/index.json
```

Returns a flat map of all protocols with basic info and deployment data.

## Examples

### Extract Protocol Name
```javascript
// From meta tag
document.querySelector('meta[name="protocol:name"]')?.content

// From JSON
JSON.parse(document.getElementById('protocol-data').textContent).name

// From hidden summary
document.querySelector('#llm-summary h1')?.textContent

// From visible HTML
document.querySelector('[data-protocol-id]').textContent
```

### Extract All Contract Addresses
```javascript
// From hidden summary (easiest)
document.querySelector('#llm-summary pre').textContent

// From JSON
const data = JSON.parse(document.getElementById('protocol-data').textContent);
Object.entries(data.deployments).map(([chain, d]) => ({
  chain,
  addresses: d.addresses
}));

// From data attributes
Array.from(document.querySelectorAll('[data-contract-address]')).map(el => ({
  name: el.dataset.contractName,
  address: el.dataset.contractAddress,
  chain: el.closest('[data-chain]').dataset.chain
}));
```

### Extract Chain-Specific Contracts
```javascript
// Get all Ethereum contracts
const ethCard = document.querySelector('[data-chain="ethereum"]');
Array.from(ethCard.querySelectorAll('[data-contract-address]')).map(el => ({
  name: el.dataset.contractName,
  address: el.dataset.contractAddress
}));
```

## Benefits for LLMs

1. **Multiple Formats**: Choose the format that best suits your parsing capabilities
2. **Redundancy**: Same data available in multiple locations for reliability
3. **Semantic HTML**: Clear structure with meaningful tags and attributes
4. **Hidden Summary**: Plain text format that's easy for LLMs to understand
5. **Structured Data**: JSON-LD for schema-aware systems
6. **Direct API Access**: Skip HTML parsing entirely with JSON API

## Need Help?

- Full API documentation: `/api/v1/openapi.json`
- GitHub repository: https://github.com/karelxfi/contracts-registry-llm
- Search index: `/api/v1/search/index.json`
