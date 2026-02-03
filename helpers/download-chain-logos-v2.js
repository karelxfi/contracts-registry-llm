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

// Direct mappings to various public icon sources
const chainLogoUrls = {
  // Major chains from cryptologos.cc and official sources
  'ethereum': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  'bitcoin': 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  'bnb': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'bsc': 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
  'polygon': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
  'avalanche': 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  'arbitrum': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  'arbitrum-one': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png',
  'optimism': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  'base': 'https://avatars.githubusercontent.com/u/108554348',
  'fantom': 'https://cryptologos.cc/logos/fantom-ftm-logo.png',
  'cronos': 'https://cryptologos.cc/logos/cronos-cro-logo.png',
  'gnosis': 'https://cryptologos.cc/logos/gnosis-gno-gno-logo.png',
  'celo': 'https://cryptologos.cc/logos/celo-celo-logo.png',
  'solana': 'https://cryptologos.cc/logos/solana-sol-logo.png',
  'near': 'https://cryptologos.cc/logos/near-protocol-near-logo.png',
  'cardano': 'https://cryptologos.cc/logos/cardano-ada-logo.png',
  'aptos': 'https://cryptologos.cc/logos/aptos-apt-logo.png',
  'sui': 'https://avatars.githubusercontent.com/u/101885482',
  'starknet': 'https://avatars.githubusercontent.com/u/82661887',
  'zksync-era': 'https://avatars.githubusercontent.com/u/98789600',
  'linea': 'https://avatars.githubusercontent.com/u/112853756',
  'scroll': 'https://avatars.githubusercontent.com/u/105452847',
  'mantle': 'https://avatars.githubusercontent.com/u/115684445',
  'manta': 'https://avatars.githubusercontent.com/u/79961260',
  'blast': 'https://avatars.githubusercontent.com/u/144372976',
  'mode': 'https://avatars.githubusercontent.com/u/133971019',
  'metis': 'https://cryptologos.cc/logos/metis-metis-logo.png',
  'kava': 'https://cryptologos.cc/logos/kava-kava-logo.png',
  'osmosis': 'https://cryptologos.cc/logos/osmosis-osmo-logo.png',
  'injective': 'https://cryptologos.cc/logos/injective-inj-logo.png',
  'sei': 'https://avatars.githubusercontent.com/u/88926539',
  'berachain': 'https://avatars.githubusercontent.com/u/107969949',
  'algorand': 'https://cryptologos.cc/logos/algorand-algo-logo.png',
  'tezos': 'https://cryptologos.cc/logos/tezos-xtz-logo.png',
  'ton': 'https://cryptologos.cc/logos/toncoin-ton-logo.png',
  'tron': 'https://cryptologos.cc/logos/tron-trx-logo.png',
  'hedera': 'https://cryptologos.cc/logos/hedera-hbar-logo.png',
  'stellar': 'https://cryptologos.cc/logos/stellar-xlm-logo.png',
  'flow': 'https://cryptologos.cc/logos/flow-flow-logo.png',
  'waves': 'https://cryptologos.cc/logos/waves-waves-logo.png',
  'stacks': 'https://cryptologos.cc/logos/stacks-stx-logo.png',
  'cosmos': 'https://cryptologos.cc/logos/cosmos-atom-logo.png',
  'moonbeam': 'https://cryptologos.cc/logos/moonbeam-glmr-logo.png',
  'aurora': 'https://avatars.githubusercontent.com/u/82196348',
  'harmony': 'https://cryptologos.cc/logos/harmony-one-logo.png',
  'boba': 'https://avatars.githubusercontent.com/u/82149024',
  'zora': 'https://avatars.githubusercontent.com/u/109799729',
  'bob': 'https://avatars.githubusercontent.com/u/148655905',
  'core': 'https://avatars.githubusercontent.com/u/117485300',
  'icp': 'https://cryptologos.cc/logos/internet-computer-icp-logo.png',
  'dydx': 'https://cryptologos.cc/logos/dydx-dydx-logo.png',
  'flare': 'https://cryptologos.cc/logos/flare-network-flr-logo.png',
  'ronin': 'https://avatars.githubusercontent.com/u/59308072',
  'immutable-zkevm': 'https://avatars.githubusercontent.com/u/40951242',
  'abstract': 'https://avatars.githubusercontent.com/u/161158862',
  'fraxtal': 'https://avatars.githubusercontent.com/u/47942654',
  'xdc': 'https://cryptologos.cc/logos/xdc-network-xdc-logo.png',
  'doge': 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
  'lisk': 'https://cryptologos.cc/logos/lisk-lsk-logo.png',
  'neutron': 'https://avatars.githubusercontent.com/u/114851854',
  'world-chain': 'https://avatars.githubusercontent.com/u/131346029',
  'sonic': 'https://avatars.githubusercontent.com/u/153693670',
  'unichain': 'https://avatars.githubusercontent.com/u/177718467',
  'merlin': 'https://avatars.githubusercontent.com/u/153775237',
  'botanix': 'https://avatars.githubusercontent.com/u/126550203',
  'bitlayer': 'https://avatars.githubusercontent.com/u/141922060',
  'zircuit': 'https://avatars.githubusercontent.com/u/136351747',
  'mezo': 'https://avatars.githubusercontent.com/u/160012449',
  'camp': 'https://avatars.githubusercontent.com/u/169849263',
  'x-layer': 'https://cryptologos.cc/logos/okb-okb-logo.png',
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
        file.on('error', (err) => {
          fs.unlinkSync(filepath);
          resolve(false);
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

    const logoUrl = chainLogoUrls[chainName];

    if (!logoUrl) {
      console.log(`⚠️  No logo URL for: ${chainName}`);
      failed++;
      continue;
    }

    try {
      console.log(`Downloading: ${chainName}...`);
      const success = await downloadImage(logoUrl, logoPath);

      if (success) {
        // Verify the file was actually created and has content
        const stats = fs.statSync(logoPath);
        if (stats.size > 0) {
          console.log(`✓ Downloaded: ${chainName}`);
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

      // Add delay to avoid rate limiting (200ms between requests)
      await delay(200);

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
