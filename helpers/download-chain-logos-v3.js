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

// Function to download from LlamaO icons CDN
function tryLlamaOIcon(chainName) {
  // LlamaO uses format: https://icons.llamao.fi/icons/chains/rsz_<chainname>.jpg
  return `https://icons.llamao.fi/icons/chains/rsz_${chainName}.jpg`;
}

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
  let updated = 0;

  for (let i = 0; i < chainFiles.length; i++) {
    const file = chainFiles[i];
    const chainName = file.replace('.json', '');
    const logoFilename = `${chainName}.png`;
    const logoPath = path.join(LOGOS_DIR, logoFilename);

    // Check if file exists and if we should update it
    const shouldUpdate = process.argv.includes('--force');

    if (fs.existsSync(logoPath) && !shouldUpdate) {
      skipped++;
      continue;
    }

    const wasUpdate = fs.existsSync(logoPath);

    // Try LlamaO CDN
    const llamaOUrl = tryLlamaOIcon(chainName);

    try {
      console.log(`${wasUpdate ? 'Updating' : 'Downloading'}: ${chainName}...`);
      const success = await downloadImage(llamaOUrl, logoPath);

      if (success) {
        // Verify the file was actually created and has content
        const stats = fs.statSync(logoPath);
        if (stats.size > 0) {
          console.log(`✓ ${wasUpdate ? 'Updated' : 'Downloaded'}: ${chainName}`);
          if (wasUpdate) {
            updated++;
          } else {
            downloaded++;
          }
        } else {
          // File is empty, delete it
          fs.unlinkSync(logoPath);
          console.log(`✗ Failed (empty): ${chainName}`);
          failed++;
        }
      } else {
        console.log(`✗ Failed (404): ${chainName} - no logo at ${llamaOUrl}`);
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
  console.log(`  - Updated: ${updated}`);
  console.log(`  - Failed: ${failed}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total chain logos: ${fs.readdirSync(LOGOS_DIR).filter(f => f.endsWith('.png')).length}`);
  console.log('\nNote: Use --force flag to re-download existing logos');
}

downloadAllChainLogos().catch(console.error);
