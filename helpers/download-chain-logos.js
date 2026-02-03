import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEARCH_DIR = path.join(__dirname, '../docs/api/v1/search/chain');
const LOGOS_DIR = path.join(__dirname, '../docs/chain-logos');

// Create logos directory if it doesn't exist
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

// Fetch chains data from DefiLlama API to get gecko_id mappings
async function fetchChainsData() {
  return new Promise((resolve, reject) => {
    https.get('https://api.llama.fi/v2/chains', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const chains = JSON.parse(data);
          const mapping = {};
          chains.forEach(chain => {
            const normalizedName = chain.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/^op\s+mainnet$/i, 'optimism');
            mapping[normalizedName] = chain.gecko_id;
          });
          resolve(mapping);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Manual mappings for chains not in DefiLlama or with different names
const manualMappings = {
  'bsc': 'binancecoin',
  'bnb': 'binancecoin',
  'optimism': 'optimism',
  'arbitrum-one': 'arbitrum',
  'polygon': 'matic-network',
  'zksync-era': 'zksync',
  'base': 'base',
  'blast': 'blast',
  'abstract': 'abstract',
  'bob': 'bob-token',
  'botanix': 'botanix',
  'core': 'core',
  'doge': 'dogecoin',
  'immutable-zkevm': 'immutable-x',
  'lisk': 'lisk',
  'merlin': 'merlin-chain',
  'ronin': 'ronin',
  'sonic': 'sonic-2',
  'stacks': 'blockstack',
  'unichain': 'unichain',
  'world-chain': 'worldcoin',
  'zora': 'zora',
  'x-layer': 'okb',
  'xdc': 'xdc-network',
  'zerog': 'zerog-chain',
  'zircuit': 'zircuit',
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
  'solana': 'solana',
  'aptos': 'aptos',
  'sui': 'sui',
  'near': 'near',
  'cardano': 'cardano',
  'tron': 'tron',
  'ton': 'the-open-network',
  'stellar': 'stellar',
  'hedera': 'hedera-hashgraph',
  'algorand': 'algorand',
  'tezos': 'tezos',
  'icp': 'internet-computer',
  'flow': 'flow',
  'starknet': 'starknet',
  'cronos': 'crypto-com-chain',
  'flare': 'flare-networks',
  'linea': 'linea',
  'scroll': 'scroll',
  'mode': 'mode',
  'manta': 'manta-network',
  'metis': 'metis-token',
  'sei': 'sei-network',
  'injective': 'injective-protocol',
  'osmosis': 'osmosis',
  'kava': 'kava',
  'neutron': 'neutron-3',
  'dydx': 'dydx-chain',
};

// Function to download a single image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      } else {
        resolve(false);
      }
    }).on('error', (err) => {
      // Clean up failed download
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      resolve(false);
    });
  });
}

// Add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function downloadAllChainLogos() {
  console.log('Fetching chains data from DefiLlama...');

  let apiMappings = {};
  try {
    apiMappings = await fetchChainsData();
    console.log(`Got mappings for ${Object.keys(apiMappings).length} chains from API`);
  } catch (e) {
    console.log('⚠️  Failed to fetch from API, using manual mappings only');
  }

  // Merge API mappings with manual mappings (manual takes precedence)
  const geckoIdMappings = { ...apiMappings, ...manualMappings };

  console.log('Reading chain files...');

  const chainFiles = fs.readdirSync(SEARCH_DIR)
    .filter(file => file.endsWith('.json'));

  console.log(`Found ${chainFiles.length} chains`);

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < chainFiles.length; i++) {
    const file = chainFiles[i];
    const chainName = file.replace('.json', '');
    const logoFilename = `${chainName}.png`;
    const logoPath = path.join(LOGOS_DIR, logoFilename);

    // Skip if already downloaded
    if (fs.existsSync(logoPath)) {
      skipped++;
      continue;
    }

    const geckoId = geckoIdMappings[chainName];

    if (!geckoId || geckoId === 'null') {
      console.log(`⚠️  No CoinGecko ID found for: ${chainName}`);
      failed++;
      continue;
    }

    // Fetch coin data from CoinGecko to get image URL
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${geckoId}`;

    let logoUrl;
    try {
      const coinData = await new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      logoUrl = coinData.image?.large;

      if (!logoUrl) {
        console.log(`✗ No image URL for: ${chainName}`);
        failed++;
        await delay(100);
        continue;
      }
    } catch (e) {
      console.log(`✗ API error for ${chainName}: ${e.message}`);
      failed++;
      await delay(100);
      continue;
    }

    try {
      const success = await downloadImage(logoUrl, logoPath);

      if (success) {
        // Verify the file was actually created and has content
        const stats = fs.statSync(logoPath);
        if (stats.size > 0) {
          console.log(`✓ Downloaded: ${chainName} (${geckoId})`);
          downloaded++;
        } else {
          // File is empty, delete it
          fs.unlinkSync(logoPath);
          console.log(`✗ Failed (empty): ${chainName}`);
          failed++;
        }
      } else {
        console.log(`✗ Failed: ${chainName}`);
        failed++;
      }

      // Add delay to avoid rate limiting (100ms between requests)
      await delay(100);

    } catch (error) {
      console.error(`Error downloading logo for ${chainName}:`, error.message);
      failed++;
    }
  }

  console.log('\n✅ Chain logo download complete!');
  console.log(`  - Downloaded: ${downloaded}`);
  console.log(`  - Failed: ${failed}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total chain logos: ${fs.readdirSync(LOGOS_DIR).length}`);
}

downloadAllChainLogos().catch(console.error);
