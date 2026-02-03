import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const morphoFile = path.join(__dirname, '../data/sources/protocols/morpho/blue.json');
const sdkAddressesFile = '/tmp/morpho_addresses.ts';

// Chain mapping from SDK names to our naming convention
const chainMapping = {
  'EthMainnet': { name: 'ethereum', chainId: 1 },
  'BaseMainnet': { name: 'base', chainId: 8453 },
  'ArbitrumMainnet': { name: 'arbitrum', chainId: 42161 },
  'PolygonMainnet': { name: 'polygon', chainId: 137 },
  'OptimismMainnet': { name: 'optimism', chainId: 10 },
  'WorldChainMainnet': { name: 'world-chain', chainId: 480 },
  'FraxtalMainnet': { name: 'fraxtal', chainId: 252 },
  'ScrollMainnet': { name: 'scroll', chainId: 534352 },
  'InkMainnet': { name: 'ink', chainId: 57073 },
  'Unichain': { name: 'unichain', chainId: 1301 },
  'AbstractMainnet': { name: 'abstract', chainId: 2741 },
  'CampMainnet': { name: 'camp', chainId: 325000 },
  'CeloMainnet': { name: 'celo', chainId: 42220 },
  'CornMainnet': { name: 'corn', chainId: 21000000 },
  'CronosMainnet': { name: 'cronos', chainId: 25 },
  'EtherlinkMainnet': { name: 'etherlink', chainId: 42793 },
  'HemiMainnet': { name: 'hemi', chainId: 743111 },
  'HyperliquidMainnet': { name: 'hyperliquid-l1', chainId: 998 },
  'KatanaMainnet': { name: 'katana', chainId: 1088 },
  'LineaMainnet': { name: 'linea', chainId: 59144 },
  'LiskMainnet': { name: 'lisk', chainId: 1135 },
  'ModeMainnet': { name: 'mode', chainId: 34443 },
  'MonadMainnet': { name: 'monad', chainId: null },
  'PlumeMainnet': { name: 'plume-mainnet', chainId: 98865 },
  'SeiMainnet': { name: 'sei', chainId: 1329 },
  'SonicMainnet': { name: 'sonic', chainId: 146 },
  'StableMainnet': { name: 'stable', chainId: 101010 },
  'TacMainnet': { name: 'tac', chainId: 8866 },
  'ZeroGMainnet': { name: 'zerog', chainId: 20240 },
};

console.log('Parsing SDK addresses file...');

const sdkContent = fs.readFileSync(sdkAddressesFile, 'utf8');
const morphoData = JSON.parse(fs.readFileSync(morphoFile, 'utf8'));

// Parse the TypeScript file to extract addresses
const chainBlocks = sdkContent.split(/\[ChainId\./).slice(1);

const deployments = {};

chainBlocks.forEach(block => {
  const chainName = block.match(/^(\w+)\]/)?.[1];
  if (!chainName || !chainMapping[chainName]) {
    console.log(`  Skipping ${chainName} (not in mapping)`);
    return;
  }

  const mappedChain = chainMapping[chainName];
  console.log(`  Parsing ${chainName} -> ${mappedChain.name}...`);

  // Extract addresses
  const morphoMatch = block.match(/morpho:\s*"(0x[a-fA-F0-9]{40})"/);
  const irmMatch = block.match(/adaptiveCurveIrm:\s*"(0x[a-fA-F0-9]{40})"/);
  const bundlerMatch = block.match(/bundler3:\s*"(0x[a-fA-F0-9]{40})"/);

  if (morphoMatch) {
    deployments[mappedChain.name] = {
      chain: mappedChain.name,
      chainId: mappedChain.chainId,
      addresses: {
        morpho: morphoMatch[1],
        adaptiveCurveIrm: irmMatch ? irmMatch[1] : "",
        bundler: bundlerMatch ? bundlerMatch[1] : ""
      },
      deploymentBlocks: {
        morpho: null
      },
      verified: {
        morpho: true,
        adaptiveCurveIrm: irmMatch ? true : false,
        bundler: bundlerMatch ? true : false
      },
      source: "sdk",
      sourceUrl: "https://github.com/morpho-org/sdks",
      updated: new Date().toISOString().split('T')[0]
    };
  }
});

console.log(`\nFound ${Object.keys(deployments).length} chain deployments`);

// Update morpho data
morphoData.deployments = deployments;

// Update tags
const chainNames = Object.keys(deployments).slice(0, 20);
morphoData.tags = ["lending", "peer-to-peer", "permissionless", "immutable", ...chainNames];

// Write updated file
fs.writeFileSync(morphoFile, JSON.stringify(morphoData, null, 2));

console.log(`\n✓ Updated ${morphoFile}`);
console.log(`  Total chains: ${Object.keys(deployments).length}`);
console.log(`  Chains: ${Object.keys(deployments).join(', ')}`);
