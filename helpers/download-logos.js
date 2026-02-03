import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTOCOLS_DIR = path.join(__dirname, '../docs/api/v1/protocol');
const LOGOS_DIR = path.join(__dirname, '../docs/logos');

// Create logos directory if it doesn't exist
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
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

async function downloadAllLogos() {
  console.log('Reading protocol files...');

  const protocolFiles = fs.readdirSync(PROTOCOLS_DIR)
    .filter(file => file.endsWith('.json'));

  console.log(`Found ${protocolFiles.length} protocols`);

  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < protocolFiles.length; i++) {
    const file = protocolFiles[i];
    const protocolData = JSON.parse(
      fs.readFileSync(path.join(PROTOCOLS_DIR, file), 'utf8')
    );

    if (!protocolData.defillamaId) {
      skipped++;
      continue;
    }

    const logoFilename = `${protocolData.id}.png`;
    const logoPath = path.join(LOGOS_DIR, logoFilename);

    // Skip if already downloaded
    if (fs.existsSync(logoPath)) {
      skipped++;
      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${protocolFiles.length} (Downloaded: ${downloaded}, Failed: ${failed}, Skipped: ${skipped})`);
      }
      continue;
    }

    const logoUrl = `https://icons.llamao.fi/icons/protocols/${protocolData.defillamaId}?w=96&h=96`;

    try {
      const success = await downloadImage(logoUrl, logoPath);

      if (success) {
        // Verify the file was actually created and has content
        const stats = fs.statSync(logoPath);
        if (stats.size > 0) {
          downloaded++;
        } else {
          // File is empty, delete it
          fs.unlinkSync(logoPath);
          failed++;
        }
      } else {
        failed++;
      }

      // Progress update every 100 protocols
      if ((i + 1) % 100 === 0) {
        console.log(`Progress: ${i + 1}/${protocolFiles.length} (Downloaded: ${downloaded}, Failed: ${failed}, Skipped: ${skipped})`);
      }

      // Add delay to avoid rate limiting (50ms between requests)
      await delay(50);

    } catch (error) {
      console.error(`Error downloading logo for ${protocolData.id}:`, error.message);
      failed++;
    }
  }

  console.log('\n✅ Logo download complete!');
  console.log(`  - Downloaded: ${downloaded}`);
  console.log(`  - Failed: ${failed}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Total logos: ${fs.readdirSync(LOGOS_DIR).length}`);
}

downloadAllLogos().catch(console.error);
