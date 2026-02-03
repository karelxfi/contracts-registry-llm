import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load protocols data
const protocolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/generated/protocols.json'), 'utf8')
);

// Create directories
const pagesDir = path.join(__dirname, '../docs/protocols');
const chainsDir = path.join(__dirname, '../docs/chains');
const categoriesDir = path.join(__dirname, '../docs/categories');

[pagesDir, chainsDir, categoriesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Protocol page template
function generateProtocolPage(protocolId, protocolData) {
  const deploymentCount = Object.keys(protocolData.deployments || {}).length;
  const chains = Object.keys(protocolData.deployments || {}).join(', ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${protocolData.name} Smart Contract Addresses - DeFi Registry</title>
  <meta name="description" content="Verified smart contract addresses for ${protocolData.name} across ${deploymentCount} blockchain${deploymentCount !== 1 ? 's' : ''}. ${protocolData.type ? protocolData.type.charAt(0).toUpperCase() + protocolData.type.slice(1) : 'DeFi'} protocol contracts and ABIs.">
  <link rel="canonical" href="https://karelxfi.github.io/contracts-registry-llm/protocols/${protocolId}" />
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">DeFi Registry</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link">Protocols</a>
        <a href="/chains" class="nav-link">Chains</a>
        <a href="/api/v1" class="nav-link">API</a>
        <a href="https://github.com/karelxfi/contracts-registry-llm" class="nav-link">GitHub</a>
      </div>
    </div>
  </nav>

  <div class="protocol-page">
    <div class="container">
      <div class="breadcrumb">
        <a href="/">Home</a> / <a href="/protocols">Protocols</a> / ${protocolData.name}
      </div>

      <header class="protocol-hero">
        <div class="protocol-title-section">
          <h1>${protocolData.name}</h1>
          ${protocolData.type ? `<span class="protocol-type-badge">${protocolData.type}</span>` : ''}
        </div>

        <div class="protocol-stats">
          <div class="stat-card">
            <div class="stat-number">${deploymentCount}</div>
            <div class="stat-label">Chain${deploymentCount !== 1 ? 's' : ''}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Object.keys(protocolData.deployments || {}).reduce((acc, chain) => acc + Object.keys(protocolData.deployments[chain].addresses || {}).length, 0)}</div>
            <div class="stat-label">Contracts</div>
          </div>
          ${protocolData.status === 'complete' ? '<div class="stat-card"><div class="verified-badge">✓ Verified</div></div>' : ''}
        </div>

        ${protocolData.website || protocolData.github || protocolData.docs ? `
        <div class="protocol-links">
          ${protocolData.website ? `<a href="${protocolData.website}" class="external-link" target="_blank" rel="noopener">Website ↗</a>` : ''}
          ${protocolData.github ? `<a href="${protocolData.github}" class="external-link" target="_blank" rel="noopener">GitHub ↗</a>` : ''}
          ${protocolData.docs ? `<a href="${protocolData.docs}" class="external-link" target="_blank" rel="noopener">Docs ↗</a>` : ''}
        </div>
        ` : ''}
      </header>

      <div class="deployments-section">
        <h2>Contract Deployments</h2>

        <div class="deployments-grid" id="deploymentsGrid">
          <!-- Deployments will be loaded from API -->
        </div>
      </div>

      <div class="api-section">
        <h2>API Access</h2>
        <div class="code-block">
          <pre><code>GET https://karelxfi.github.io/contracts-registry-llm/api/v1/protocol/${protocolId}.json</code></pre>
          <button class="copy-btn" onclick="copyToClipboard('https://karelxfi.github.io/contracts-registry-llm/api/v1/protocol/${protocolId}.json')">Copy</button>
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-container">
      <div class="footer-bottom">
        <div>© 2025 DeFi Registry. Open source under MIT License.</div>
        <div><a href="https://github.com/karelxfi/contracts-registry-llm">View on GitHub</a></div>
      </div>
    </div>
  </footer>

  <script>
    // Load deployment data from API
    fetch('../api/v1/protocol/${protocolId}.json')
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById('deploymentsGrid');

        Object.entries(data.deployments || {}).forEach(([chainId, deployment]) => {
          const card = document.createElement('div');
          card.className = 'deployment-card';

          const addresses = Object.entries(deployment.addresses || {})
            .map(([name, address]) => \`
              <div class="address-row">
                <span class="address-label">\${name}</span>
                <code class="address-value">\${address}</code>
                <button class="copy-icon" onclick="copyToClipboard('\${address}')" title="Copy address">📋</button>
              </div>
            \`).join('');

          card.innerHTML = \`
            <div class="deployment-header">
              <h3>\${chainId}</h3>
              <span class="chain-id">ID: \${deployment.chainId || 'N/A'}</span>
            </div>
            <div class="addresses-list">
              \${addresses}
            </div>
            \${deployment.sourceUrl ? \`<a href="\${deployment.sourceUrl}" class="source-link" target="_blank" rel="noopener">View Source ↗</a>\` : ''}
          \`;

          grid.appendChild(card);
        });
      })
      .catch(err => console.error('Failed to load deployments:', err));

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        // Show copied feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      });
    }
  </script>
</body>
</html>`;
}

// Generate protocol pages
console.log('Generating protocol pages...');
let generated = 0;
let skipped = 0;

Object.entries(protocolsData).forEach(([protocolId, protocolWrapper]) => {
  // The structure has nested protocol data
  const protocolData = protocolWrapper[protocolId] || protocolWrapper;

  // Only generate pages for protocols with deployments
  if (protocolData.deployments && Object.keys(protocolData.deployments).length > 0) {
    const html = generateProtocolPage(protocolId, protocolData);
    const filename = path.join(pagesDir, `${protocolId}.html`);
    fs.writeFileSync(filename, html);
    generated++;

    if (generated % 100 === 0) {
      console.log(`Generated ${generated} pages...`);
    }
  } else {
    skipped++;
  }
});

console.log(`\nGeneration complete!`);
console.log(`- Generated: ${generated} protocol pages`);
console.log(`- Skipped: ${skipped} protocols (no deployments)`);

// Generate protocols index page
const protocolsWithDeployments = Object.entries(protocolsData)
  .map(([id, wrapper]) => [id, wrapper[id] || wrapper])
  .filter(([_, data]) => data.deployments && Object.keys(data.deployments).length > 0)
  .sort((a, b) => a[1].name.localeCompare(b[1].name));

const protocolsIndexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>All DeFi Protocols - Smart Contract Registry</title>
  <meta name="description" content="Browse ${generated} DeFi protocols with verified smart contract addresses across 100+ blockchains.">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">DeFi Registry</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link active">Protocols</a>
        <a href="/chains" class="nav-link">Chains</a>
        <a href="/api/v1" class="nav-link">API</a>
      </div>
    </div>
  </nav>

  <div class="listing-page">
    <div class="container">
      <h1>All Protocols</h1>
      <p class="subtitle">${generated} DeFi protocols with verified contract addresses</p>

      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search protocols..." />
      </div>

      <div class="protocols-list" id="protocolsList">
        ${protocolsWithDeployments.map(([id, data]) => `
          <a href="${id}.html" class="protocol-list-item">
            <div>
              <h3>${data.name}</h3>
              ${data.type ? `<span class="type-badge">${data.type}</span>` : ''}
            </div>
            <div class="chain-count">${Object.keys(data.deployments).length} chain${Object.keys(data.deployments).length !== 1 ? 's' : ''}</div>
          </a>
        `).join('')}
      </div>
    </div>
  </div>

  <script>
    const searchInput = document.getElementById('searchInput');
    const protocolsList = document.getElementById('protocolsList');
    const items = Array.from(protocolsList.children);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(pagesDir, 'index.html'), protocolsIndexHtml);
console.log('Generated protocols index page');

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://karelxfi.github.io/contracts-registry-llm/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://karelxfi.github.io/contracts-registry-llm/protocols/</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  ${protocolsWithDeployments.map(([id]) => `
  <url>
    <loc>https://karelxfi.github.io/contracts-registry-llm/protocols/${id}.html</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../docs/sitemap.xml'), sitemap);
console.log('Generated sitemap.xml');

console.log('\n✅ SEO pages generation complete!');
