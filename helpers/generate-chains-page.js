import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEARCH_DIR = path.join(__dirname, '../docs/api/v1/search/chain');
const CHAINS_OUTPUT_DIR = path.join(__dirname, '../docs/chains');
const PROTOCOLS_DIR = path.join(__dirname, '../docs/api/v1/protocol');
const OUTPUT_FILE = path.join(CHAINS_OUTPUT_DIR, 'index.html');

console.log('Generating chains pages...');

// Read all chain JSON files
const chainFiles = fs.readdirSync(SEARCH_DIR).filter(f => f.endsWith('.json'));
const chains = [];

const CHAIN_LOGOS_DIR = path.join(__dirname, '../docs/chain-logos');

for (const file of chainFiles) {
  const chainData = JSON.parse(fs.readFileSync(path.join(SEARCH_DIR, file), 'utf8'));
  const chainName = chainData.chain;
  const protocolCount = chainData.protocols?.length || 0;

  // Check if logo exists
  const logoPath = path.join(CHAIN_LOGOS_DIR, `${chainName}.png`);
  const hasLogo = fs.existsSync(logoPath);

  chains.push({
    id: chainName,
    name: chainName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    protocolCount,
    chainId: chainData.chainId,
    hasLogo,
    fallbackLetter: chainName.charAt(0).toUpperCase()
  });
}

// Sort by protocol count descending
chains.sort((a, b) => b.protocolCount - a.protocolCount);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blockchain Chains - Contracts Registry</title>
  <meta name="description" content="Browse ${chains.length} blockchain chains with their deployed protocols and smart contracts.">
  <link rel="stylesheet" href="../styles.css">
  <link rel="canonical" href="https://contracts.llamarpc.com/chains/">

  <!-- Open Graph -->
  <meta property="og:title" content="Blockchain Chains - Contracts Registry">
  <meta property="og:description" content="Browse ${chains.length} blockchain chains with their deployed protocols and smart contracts.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://contracts.llamarpc.com/chains/">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Blockchain Chains - Contracts Registry">
  <meta name="twitter:description" content="Browse ${chains.length} blockchain chains with their deployed protocols and smart contracts.">
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">Addybook</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link">Protocols</a>
        <a href="/chains" class="nav-link active">Chains</a>
        <a href="https://addybook.apidocumentation.com/addybook-api" class="nav-link" target="_blank">API</a>
        <a href="https://github.com/karelxfi/contracts-registry-llm" class="nav-link">GitHub</a>
      </div>
    </div>
  </nav>

  <main class="container listing-page">
    <nav class="breadcrumb">
      <a href="/">Home</a> / Chains
    </nav>

    <h1>Blockchain Chains</h1>
    <p class="subtitle">Browse ${chains.length} blockchains and their deployed protocols</p>

    <div class="search-box">
      <input
        type="text"
        id="chainSearch"
        placeholder="Search chains by name or chain ID..."
        aria-label="Search chains"
      >
    </div>

    <div class="chains-grid" id="chainsList">
      ${chains.map(chain => `
        <a href="/chains/${chain.id}" class="chain-card" data-chain-name="${chain.name.toLowerCase()}" data-chain-id="${chain.chainId || ''}">
          <div class="chain-card-header">
            <div class="chain-icon${!chain.hasLogo ? ' chain-icon-fallback' : ''}">
              ${chain.hasLogo
                ? `<img src="../chain-logos/${chain.id}.png" alt="${chain.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <span style="display:none">${chain.fallbackLetter}</span>`
                : `<span>${chain.fallbackLetter}</span>`
              }
            </div>
            <div class="chain-info">
              <h3>${chain.name}</h3>
              ${chain.chainId ? `<span class="chain-id-badge">Chain ID: ${chain.chainId}</span>` : ''}
            </div>
          </div>
          <div class="chain-card-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>${chain.protocolCount} protocol${chain.protocolCount !== 1 ? 's' : ''}</span>
          </div>
        </a>
      `).join('')}
    </div>

    <div id="noResults" style="display: none; padding: 60px 20px; text-align: center;">
      <p style="color: var(--color-text-secondary);">No chains found matching your search.</p>
    </div>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Contracts Registry. Data updated daily.</p>
        <a href="https://github.com/llamafolio/contracts-registry" target="_blank">GitHub</a>
      </div>
    </div>
  </footer>

  <script>
    // Search functionality
    const searchInput = document.getElementById('chainSearch');
    const chainsList = document.getElementById('chainsList');
    const noResults = document.getElementById('noResults');
    const allChains = Array.from(document.querySelectorAll('.chain-card'));

    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      let visibleCount = 0;

      allChains.forEach(chain => {
        const chainName = chain.getAttribute('data-chain-name');
        const chainId = chain.getAttribute('data-chain-id');

        const matches = searchTerm === '' ||
          chainName.includes(searchTerm) ||
          chainId.includes(searchTerm);

        if (matches) {
          chain.style.display = '';
          visibleCount++;
        } else {
          chain.style.display = 'none';
        }
      });

      if (visibleCount === 0 && searchTerm !== '') {
        chainsList.style.display = 'none';
        noResults.style.display = 'block';
      } else {
        chainsList.style.display = 'grid';
        noResults.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, html, 'utf8');

console.log(`✅ Generated chains index page with ${chains.length} chains`);

// Generate individual chain pages
console.log('\nGenerating individual chain pages...');
let generatedPages = 0;

for (const file of chainFiles) {
  const chainData = JSON.parse(fs.readFileSync(path.join(SEARCH_DIR, file), 'utf8'));
  const chainName = chainData.chain;
  const protocols = chainData.protocols || [];
  const displayName = chainName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Load protocol details to get logos
  const protocolsWithLogos = protocols.map(p => {
    const logoPath = path.join(__dirname, '../docs/logos', `${p.id}.png`);
    const hasLogo = fs.existsSync(logoPath);
    return {
      ...p,
      hasLogo,
      logoUrl: hasLogo ? `../logos/${p.id}.png` : null,
      fallbackLetter: p.name.charAt(0).toUpperCase()
    };
  });

  const chainPageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} Protocols - Contracts Registry</title>
  <meta name="description" content="Browse ${protocols.length} DeFi protocols deployed on ${displayName} blockchain with verified smart contract addresses.">
  <link rel="stylesheet" href="../styles.css">
  <link rel="canonical" href="https://contracts.llamarpc.com/chains/${chainName}.html">

  <!-- Open Graph -->
  <meta property="og:title" content="${displayName} Protocols - Contracts Registry">
  <meta property="og:description" content="Browse ${protocols.length} DeFi protocols deployed on ${displayName} blockchain.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://contracts.llamarpc.com/chains/${chainName}.html">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${displayName} Protocols">
  <meta name="twitter:description" content="Browse ${protocols.length} DeFi protocols on ${displayName}.">
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">Addybook</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link">Protocols</a>
        <a href="/chains" class="nav-link active">Chains</a>
        <a href="https://addybook.apidocumentation.com/addybook-api" class="nav-link" target="_blank">API</a>
        <a href="https://github.com/karelxfi/contracts-registry-llm" class="nav-link">GitHub</a>
      </div>
    </div>
  </nav>

  <main class="container listing-page">
    <nav class="breadcrumb">
      <a href="/">Home</a> / <a href="/chains">Chains</a> / ${displayName}
    </nav>

    <div class="protocol-header">
      <div>
        <h1>${displayName}</h1>
        <p class="subtitle">${protocols.length} protocol${protocols.length !== 1 ? 's' : ''} deployed on this chain</p>
        ${chainData.chainId ? `<p class="chain-id-info">Chain ID: ${chainData.chainId}</p>` : ''}
      </div>
    </div>

    <div class="search-box">
      <input
        type="text"
        id="protocolSearch"
        placeholder="Search protocols by name or type..."
        aria-label="Search protocols"
      >
    </div>

    <div class="protocol-grid" id="protocolsList">
      ${protocolsWithLogos.map(protocol => `
        <a href="/protocols/${protocol.id}" class="protocol-card" data-protocol-name="${protocol.name.toLowerCase()}" data-protocol-type="${(protocol.type || '').toLowerCase()}">
          <div class="protocol-card-header">
            <div class="protocol-icon${!protocol.logoUrl ? ' protocol-icon-fallback' : ''}">
              ${protocol.logoUrl
                ? `<img src="${protocol.logoUrl}" alt="${protocol.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <span style="display:none">${protocol.fallbackLetter}</span>`
                : `<span>${protocol.fallbackLetter}</span>`
              }
            </div>
            <div class="protocol-info">
              <h3>${protocol.name}</h3>
              ${protocol.type ? `<span class="protocol-type">${protocol.type}</span>` : ''}
            </div>
          </div>
          <div class="protocol-card-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>${protocol.contractCount} contract${protocol.contractCount !== 1 ? 's' : ''}</span>
          </div>
        </a>
      `).join('')}
    </div>

    <div id="noResults" style="display: none; padding: 60px 20px; text-align: center;">
      <p style="color: var(--color-text-secondary);">No protocols found matching your search.</p>
    </div>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Contracts Registry. Data updated daily.</p>
        <a href="https://github.com/llamafolio/contracts-registry" target="_blank">GitHub</a>
      </div>
    </div>
  </footer>

  <script>
    // Search functionality
    const searchInput = document.getElementById('protocolSearch');
    const protocolsList = document.getElementById('protocolsList');
    const noResults = document.getElementById('noResults');
    const allProtocols = Array.from(document.querySelectorAll('.protocol-card'));

    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      let visibleCount = 0;

      allProtocols.forEach(protocol => {
        const protocolName = protocol.getAttribute('data-protocol-name');
        const protocolType = protocol.getAttribute('data-protocol-type');

        const matches = searchTerm === '' ||
          protocolName.includes(searchTerm) ||
          protocolType.includes(searchTerm);

        if (matches) {
          protocol.style.display = '';
          visibleCount++;
        } else {
          protocol.style.display = 'none';
        }
      });

      if (visibleCount === 0 && searchTerm !== '') {
        protocolsList.style.display = 'none';
        noResults.style.display = 'block';
      } else {
        protocolsList.style.display = 'grid';
        noResults.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;

  const chainOutputFile = path.join(CHAINS_OUTPUT_DIR, `${chainName}.html`);
  fs.writeFileSync(chainOutputFile, chainPageHtml, 'utf8');
  generatedPages++;
}

console.log(`✅ Generated ${generatedPages} individual chain pages`);
