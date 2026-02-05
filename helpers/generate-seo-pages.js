import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load protocols data from search index (flattened structure)
const protocolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../docs/api/v1/search/index.json'), 'utf8')
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
  const chains = Object.keys(protocolData.deployments || {});

  // Count valid addresses (non-empty strings)
  const totalContracts = chains.reduce((acc, chain) => {
    const addresses = protocolData.deployments[chain].addresses || {};
    const validAddresses = Object.values(addresses).filter(addr => addr && addr.trim() !== '').length;
    return acc + validAddresses;
  }, 0);

  // Only count deployments with valid addresses
  const deploymentCount = totalContracts > 0 ? chains.length : 0;

  // Build contract addresses list for LLMs
  const contractsList = chains.map(chain => {
    const deployment = protocolData.deployments[chain];
    const addresses = Object.entries(deployment.addresses || {})
      .map(([name, address]) => `  - ${name}: ${address}`)
      .join('\n');
    return `${chain}:\n${addresses}`;
  }).join('\n\n');

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": protocolData.name,
    "applicationCategory": "Blockchain Protocol",
    "description": protocolData.description || `${protocolData.name} is a ${protocolData.type || 'DeFi'} protocol deployed across ${deploymentCount} blockchain${deploymentCount !== 1 ? 's' : ''}.`,
    "url": protocolData.website || `https://karelxfi.github.io/contracts-registry-llm/protocols/${protocolId}`,
    "softwareVersion": protocolId,
    "author": {
      "@type": "Organization",
      "name": protocolData.name
    }
  };

  if (protocolData.github) structuredData.codeRepository = protocolData.github;
  if (protocolData.docs) structuredData.documentation = protocolData.docs;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${protocolData.name} Smart Contract Addresses - DeFi Registry</title>
  <meta name="description" content="Verified smart contract addresses for ${protocolData.name} across ${deploymentCount} blockchain${deploymentCount !== 1 ? 's' : ''}. ${protocolData.type ? protocolData.type.charAt(0).toUpperCase() + protocolData.type.slice(1) : 'DeFi'} protocol contracts and ABIs.">
  <link rel="canonical" href="https://karelxfi.github.io/contracts-registry-llm/protocols/${protocolId}" />
  <link rel="stylesheet" href="../styles.css">

  <!-- Structured Data for LLMs and Search Engines -->
  <script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
  </script>

  <!-- OpenGraph for social sharing and LLM parsing -->
  <meta property="og:title" content="${protocolData.name} - Smart Contract Registry" />
  <meta property="og:description" content="${deploymentCount} chains, ${totalContracts} contracts. ${protocolData.type || 'DeFi'} protocol." />
  <meta property="og:type" content="website" />

  <!-- Protocol metadata for easy parsing -->
  <meta name="protocol:id" content="${protocolId}" />
  <meta name="protocol:name" content="${protocolData.name}" />
  <meta name="protocol:type" content="${protocolData.type || 'defi'}" />
  <meta name="protocol:chains" content="${deploymentCount}" />
  <meta name="protocol:contracts" content="${totalContracts}" />
  <meta name="protocol:status" content="${protocolData.status || 'active'}" />
  ${protocolData.defillamaId ? `<meta name="protocol:defillama_id" content="${protocolData.defillamaId}" />` : ''}
  ${protocolData.website ? `<meta name="protocol:website" content="${protocolData.website}" />` : ''}
  ${protocolData.github ? `<meta name="protocol:github" content="${protocolData.github}" />` : ''}
  ${protocolData.docs ? `<meta name="protocol:documentation" content="${protocolData.docs}" />` : ''}
</head>
<body>
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">Addybook</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link">Protocols</a>
        <a href="/chains" class="nav-link">Chains</a>
        <a href="https://addybook.apidocumentation.com/addybook-api" class="nav-link" target="_blank">API</a>
        <a href="https://github.com/karelxfi/contracts-registry-llm" class="nav-link">GitHub</a>
      </div>
    </div>
  </nav>

  <!-- Machine-readable data section for LLMs (hidden from users) -->
  <script type="application/json" id="protocol-data" data-protocol-id="${protocolId}">
${JSON.stringify(protocolData, null, 2)}
  </script>

  <!-- Plain text summary for easy LLM parsing -->
  <div id="llm-summary" style="display: none;" data-purpose="llm-parsing">
    <h1>Protocol: ${protocolData.name}</h1>
    <p>ID: ${protocolId}</p>
    <p>Type: ${protocolData.type || 'defi'}</p>
    <p>Status: ${protocolData.status || 'active'}</p>
    <p>Chains: ${deploymentCount}</p>
    <p>Total Contracts: ${totalContracts}</p>
    ${protocolData.website ? `<p>Website: ${protocolData.website}</p>` : ''}
    ${protocolData.github ? `<p>GitHub: ${protocolData.github}</p>` : ''}
    ${protocolData.docs ? `<p>Documentation: ${protocolData.docs}</p>` : ''}
    ${protocolData.defillamaId ? `<p>DefiLlama ID: ${protocolData.defillamaId}</p>` : ''}

    <h2>Contract Addresses by Chain:</h2>
    <pre>${contractsList}</pre>

    <h2>API Endpoint:</h2>
    <p>GET https://karelxfi.github.io/contracts-registry-llm/api/v1/protocol/${protocolId}.json</p>
  </div>

  <div class="protocol-page" itemscope itemtype="https://schema.org/SoftwareApplication">
    <div class="container">
      <div class="breadcrumb">
        <a href="/">Home</a> / <a href="/protocols">Protocols</a> / <span itemprop="name">${protocolData.name}</span>
      </div>

      <header class="protocol-hero">
        <div class="protocol-title-row">
          <div class="protocol-title-section">
            <h1 itemprop="name" data-protocol-id="${protocolId}">${protocolData.name}</h1>
            ${protocolData.type ? `<span class="protocol-type-badge" data-type="${protocolData.type}">${protocolData.type}</span>` : ''}
          </div>
          ${protocolData.website || protocolData.github || protocolData.docs ? `
          <div class="protocol-links">
            ${protocolData.website ? `<a href="${protocolData.website}" class="external-link" target="_blank" rel="noopener" itemprop="url" data-link-type="website">Website ↗</a>` : ''}
            ${protocolData.github ? `<a href="${protocolData.github}" class="external-link" target="_blank" rel="noopener" itemprop="codeRepository" data-link-type="github">GitHub ↗</a>` : ''}
            ${protocolData.docs ? `<a href="${protocolData.docs}" class="external-link" target="_blank" rel="noopener" itemprop="documentation" data-link-type="docs">Docs ↗</a>` : ''}
          </div>
          ` : ''}
        </div>
      </header>

      <div class="deployments-section">
        <div class="section-header">
          <div class="section-header-content">
            <h2>Contract Deployments</h2>
            <p class="section-description">${deploymentCount > 0 ? `Smart contract addresses for ${protocolData.name} across ${deploymentCount} blockchain${deploymentCount !== 1 ? 's' : ''}.` : `Contract deployment information for ${protocolData.name} is not yet available.`}</p>
          </div>
          ${deploymentCount > 0 ? `<a
            href="../api/v1/protocol/${protocolId}.json"
            download="${protocolId}.json"
            class="download-json-btn"
            title="Download all contract data as JSON"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download JSON
          </a>` : ''}
        </div>

        ${deploymentCount > 0 ? `<div class="table-wrapper">
          <div class="table-controls">
            <div class="filter-controls">
              <input
                type="text"
                id="tableFilter"
                placeholder="Filter by chain, chain ID, contract name, or address..."
                class="filter-input"
              />
              <div class="filter-stats" id="filterStats">
                Showing <span id="visibleRows">0</span> of <span id="totalRows">0</span> deployments
              </div>
            </div>
          </div>

          <div class="table-container">
            <table class="deployments-table" id="deploymentsTable" data-total-chains="${deploymentCount}">
              <thead>
                <tr>
                  <th data-column="chain">
                    <div class="th-content">
                      Chain
                      <span class="sort-indicator"></span>
                    </div>
                  </th>
                  <th data-column="chainId">
                    <div class="th-content">
                      Chain ID
                      <span class="sort-indicator"></span>
                    </div>
                  </th>
                  <th data-column="contractName">
                    <div class="th-content">
                      Contract Name
                      <span class="sort-indicator"></span>
                    </div>
                  </th>
                  <th data-column="address">
                    <div class="th-content">
                      Address
                      <span class="sort-indicator"></span>
                    </div>
                  </th>
                  <th data-column="source">
                    <div class="th-content">
                      Source
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Deployments will be loaded from API -->
              </tbody>
            </table>
            <div id="noResults" class="no-results" style="display: none;">
              <div class="no-results-content">
                <span class="no-results-icon">🔍</span>
                <span class="no-results-text">No deployments found matching your filter</span>
              </div>
            </div>
          </div>
        </div>` : `
          <div class="no-deployments-message">
            <div class="no-deployments-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-text-tertiary); opacity: 0.5; margin-bottom: 16px;">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3>No Contracts Available Yet</h3>
              <p>Contract deployment information for ${protocolData.name} is not currently available in our registry.</p>
              ${protocolData.website || protocolData.github || protocolData.docs ? `
              <p style="margin-top: 12px; font-size: 13px; color: var(--color-text-tertiary);">
                For more information, visit the official project links above.
              </p>
              ` : ''}
            </div>
          </div>
        </div>`}
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
    let copiedAddress = null;
    let sortState = { column: 'chain', direction: 'asc' };
    let allRows = [];

    // Load deployment data from API
    fetch('../api/v1/protocol/${protocolId}.json')
      .then(res => res.json())
      .then(data => {
        const tbody = document.querySelector('#deploymentsTable tbody');
        if (!tbody) return;

        // Flatten deployments into table rows (no rowspan for better sorting)
        Object.entries(data.deployments || {}).forEach(([chainId, deployment]) => {
          const addresses = Object.entries(deployment.addresses || {});

          addresses.forEach(([contractName, address]) => {
            const row = document.createElement('tr');
            row.setAttribute('data-chain', chainId.toLowerCase());
            row.setAttribute('data-chain-id', String(deployment.chainId || ''));
            row.setAttribute('data-contract-name', contractName.toLowerCase());
            row.setAttribute('data-contract-address', address.toLowerCase());

            // Show chain info on every row for better sorting
            row.innerHTML = \`
              <td class="chain-cell">
                \${chainId}
              </td>
              <td class="chain-id-cell">\${deployment.chainId || 'N/A'}</td>
              <td class="contract-name-cell">\${contractName}</td>
              <td class="address-cell">
                <div class="address-with-copy">
                  <code>\${address}</code>
                  <button class="copy-btn-inline" onclick="copyAddress('\${address}', this)" title="Copy address">
                    <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </button>
                </div>
              </td>
              <td class="source-cell">
                \${deployment.sourceUrl ? \`<a href="\${deployment.sourceUrl}" class="source-link-small" target="_blank" rel="noopener">View Source ↗</a>\` : '<span class="no-source">—</span>'}
              </td>
            \`;

            tbody.appendChild(row);
            allRows.push(row);
          });
        });

        // After loading, update stats and initialize features
        updateFilterStats();
        updateLLMSummary(data);
        initTableSort();
        initTableFilter();
      })
      .catch(err => console.error('Failed to load deployments:', err));

    // Update the hidden LLM summary section with full contract data
    function updateLLMSummary(data) {
      const summaryDiv = document.getElementById('llm-summary');
      if (!summaryDiv) return;

      const contractsList = Object.entries(data.deployments || {}).map(([chain, deployment]) => {
        const addresses = Object.entries(deployment.addresses || {})
          .map(([name, address]) => \`  - \${name}: \${address}\`)
          .join('\\n');
        return \`\${chain}:\\n\${addresses}\`;
      }).join('\\n\\n');

      const contractsSection = summaryDiv.querySelector('pre');
      if (contractsSection) {
        contractsSection.textContent = contractsList;
      }
    }

    // Copy to clipboard function with visual feedback
    function copyAddress(text, button) {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            showCopyFeedback(button);
          })
          .catch(err => {
            console.error('Clipboard API failed:', err);
            fallbackCopy(text, button);
          });
      } else {
        // Fallback for older browsers or non-secure contexts
        fallbackCopy(text, button);
      }
    }

    function showCopyFeedback(button) {
      const copyIcon = button.querySelector('.copy-icon');
      const checkIcon = button.querySelector('.check-icon');

      if (copyIcon && checkIcon) {
        copyIcon.style.display = 'none';
        checkIcon.style.display = 'block';
        button.classList.add('copied');

        setTimeout(() => {
          copyIcon.style.display = 'block';
          checkIcon.style.display = 'none';
          button.classList.remove('copied');
        }, 2000);
      }
    }

    function fallbackCopy(text, button) {
      // Create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);

      try {
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        const successful = document.execCommand('copy');
        if (successful) {
          showCopyFeedback(button);
        } else {
          throw new Error('execCommand failed');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        // Show address in alert as last resort
        prompt('Copy this address:', text);
      } finally {
        document.body.removeChild(textarea);
      }
    }

    // Keep old function for API section compatibility
    function copyToClipboard(text) {
      const btn = event.target;
      const originalText = btn.textContent;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '✓ Copied!';
          btn.style.background = '#00d084';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
          }, 2000);
        }).catch(err => {
          console.error('Clipboard API failed:', err);
        });
      }
    }

    // Filter table functionality
    function initTableFilter() {
      const filterInput = document.getElementById('tableFilter');
      if (!filterInput) return;

      filterInput.addEventListener('input', (e) => {
        const filterValue = e.target.value.toLowerCase().trim();
        filterTable(filterValue);
      });
    }

    function filterTable(filterValue) {
      const tbody = document.querySelector('#deploymentsTable tbody');
      const noResults = document.getElementById('noResults');
      if (!tbody) return;

      let visibleCount = 0;

      allRows.forEach(row => {
        const chain = row.getAttribute('data-chain') || '';
        const chainId = row.getAttribute('data-chain-id') || '';
        const contractName = row.getAttribute('data-contract-name') || '';
        const address = row.getAttribute('data-contract-address') || '';

        const matches = filterValue === '' ||
          chain.includes(filterValue) ||
          chainId.includes(filterValue) ||
          contractName.includes(filterValue) ||
          address.includes(filterValue);

        if (matches) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      // Show/hide no results message
      if (noResults) {
        if (visibleCount === 0 && filterValue !== '') {
          noResults.style.display = 'flex';
          tbody.style.display = 'none';
        } else {
          noResults.style.display = 'none';
          tbody.style.display = '';
        }
      }

      updateFilterStats(visibleCount);
    }

    function updateFilterStats(visibleCount) {
      const visibleEl = document.getElementById('visibleRows');
      const totalEl = document.getElementById('totalRows');

      if (visibleEl && totalEl) {
        const visible = visibleCount !== undefined ? visibleCount : allRows.length;
        visibleEl.textContent = visible;
        totalEl.textContent = allRows.length;
      }
    }

    // Add table sorting functionality
    function initTableSort() {
      const table = document.getElementById('deploymentsTable');
      if (!table) return;

      const headers = table.querySelectorAll('th');
      const tbody = table.querySelector('tbody');

      headers.forEach((header, index) => {
        const column = header.getAttribute('data-column');
        if (!column) return; // Skip headers without data-column (like Source)

        header.addEventListener('click', () => {
          const currentDirection = sortState.column === column && sortState.direction === 'asc' ? 'desc' : 'asc';
          sortState.column = column;
          sortState.direction = currentDirection;

          // Sort the rows
          sortTable(column, currentDirection);

          // Update sort indicators
          headers.forEach(h => {
            const indicator = h.querySelector('.sort-indicator');
            if (indicator) {
              indicator.textContent = '';
              indicator.className = 'sort-indicator';
            }
          });

          const indicator = header.querySelector('.sort-indicator');
          if (indicator) {
            indicator.textContent = currentDirection === 'asc' ? ' ↑' : ' ↓';
            indicator.className = 'sort-indicator active';
          }
        });
      });

      // Initial sort by chain name
      sortTable('chain', 'asc');
    }

    function sortTable(column, direction) {
      const tbody = document.querySelector('#deploymentsTable tbody');
      if (!tbody) return;

      const rows = Array.from(allRows);

      rows.sort((a, b) => {
        let aVal, bVal;

        switch (column) {
          case 'chain':
            aVal = a.getAttribute('data-chain') || '';
            bVal = b.getAttribute('data-chain') || '';
            break;
          case 'chainId':
            aVal = parseInt(a.getAttribute('data-chain-id')) || 0;
            bVal = parseInt(b.getAttribute('data-chain-id')) || 0;
            break;
          case 'contractName':
            aVal = a.getAttribute('data-contract-name') || '';
            bVal = b.getAttribute('data-contract-name') || '';
            break;
          case 'address':
            aVal = a.getAttribute('data-contract-address') || '';
            bVal = b.getAttribute('data-contract-address') || '';
            break;
          default:
            return 0;
        }

        // Numeric comparison for chain IDs
        if (column === 'chainId') {
          return direction === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // String comparison
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      // Clear and re-append rows in sorted order
      tbody.innerHTML = '';
      rows.forEach(row => tbody.appendChild(row));
    }

    // Initialize sorting after data loads
    document.addEventListener('DOMContentLoaded', initTableSort);
  </script>
</body>
</html>`;
}

// Generate protocol pages
console.log('Generating protocol pages...');
let generated = 0;
let withDeployments = 0;
let withoutDeployments = 0;

Object.entries(protocolsData).forEach(([protocolId, protocolData]) => {
  const html = generateProtocolPage(protocolId, protocolData);
  const filename = path.join(pagesDir, `${protocolId}.html`);
  fs.writeFileSync(filename, html);
  generated++;

  if (protocolData.deployments && Object.keys(protocolData.deployments).length > 0) {
    withDeployments++;
  } else {
    withoutDeployments++;
  }

  if (generated % 100 === 0) {
    console.log(`Generated ${generated} pages...`);
  }
});

console.log(`\nGeneration complete!`);
console.log(`- Generated: ${generated} protocol pages`);
console.log(`  - With deployments: ${withDeployments}`);
console.log(`  - Without deployments: ${withoutDeployments}`);

// Generate protocols index page
const protocolsWithDeployments = Object.entries(protocolsData)
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
      <a href="/" class="logo">Addybook</a>
      <div class="nav-links">
        <a href="/protocols" class="nav-link active">Protocols</a>
        <a href="/chains" class="nav-link">Chains</a>
        <a href="https://addybook.apidocumentation.com/addybook-api" class="nav-link" target="_blank">API</a>
        <a href="https://github.com/karelxfi/contracts-registry-llm" class="nav-link">GitHub</a>
      </div>
    </div>
  </nav>

  <main class="container listing-page">
    <nav class="breadcrumb">
      <a href="/">Home</a> / Protocols
    </nav>

    <h1>All Protocols</h1>
    <p class="subtitle">${generated} DeFi protocols with verified contract addresses</p>

    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search protocols..." aria-label="Search protocols" />
    </div>

    <div class="protocol-grid" id="protocolsList">
      ${protocolsWithDeployments.map(([id, data]) => {
        // Check if local logo exists
        const logoPath = path.join(__dirname, '../docs/logos', `${id}.png`);
        const hasLogo = fs.existsSync(logoPath);
        const logoUrl = hasLogo ? `../logos/${id}.png` : null;
        const fallbackLetter = data.name.charAt(0).toUpperCase();

        return `
        <a href="/protocols/${id}" class="protocol-card">
          <div class="protocol-card-header">
            <div class="protocol-icon${!logoUrl ? ' protocol-icon-fallback' : ''}">
              ${logoUrl
                ? `<img src="${logoUrl}" alt="${data.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                   <span style="display:none">${fallbackLetter}</span>`
                : `<span>${fallbackLetter}</span>`
              }
            </div>
            <div class="protocol-info">
              <h3>${data.name}</h3>
              ${data.type ? `<span class="protocol-type">${data.type}</span>` : ''}
            </div>
          </div>
          <div class="protocol-card-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>${Object.keys(data.deployments).length} chain${Object.keys(data.deployments).length !== 1 ? 's' : ''}</span>
          </div>
        </a>
      `}).join('')}
    </div>

    <div id="noResults" style="display: none; padding: 60px 20px; text-align: center;">
      <p style="color: var(--color-text-secondary);">No protocols found matching your search.</p>
    </div>
  </main>

  <footer>
    <div class="footer-container">
      <div class="footer-bottom">
        <div>© 2025 DeFi Registry. Open source under MIT License.</div>
        <div><a href="https://github.com/karelxfi/contracts-registry-llm">View on GitHub</a></div>
      </div>
    </div>
  </footer>

  <script>
    const searchInput = document.getElementById('searchInput');
    const protocolsList = document.getElementById('protocolsList');
    const noResults = document.getElementById('noResults');
    const items = Array.from(protocolsList.children);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      let visibleCount = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = query === '' || text.includes(query);

        if (matches) {
          item.style.display = '';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (visibleCount === 0 && query !== '') {
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
