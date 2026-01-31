#!/usr/bin/env node
/**
 * Query API for contracts registry
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const GENERATED_DIR = path.join(__dirname, '../data/generated');

/**
 * Find protocol information by contract address
 */
export function findByAddress(chain, address) {
  const indexPath = path.join(GENERATED_DIR, 'indexes/by-address.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const key = `${chain}:${address.toLowerCase()}`;
  
  const result = index[key];
  if (!result) {
    return null;
  }
  
  // Load full protocol data
  const protocolsPath = path.join(GENERATED_DIR, 'protocols.json');
  const protocols = JSON.parse(fs.readFileSync(protocolsPath, 'utf8'));
  const protocol = protocols[result.protocol][result.version];
  
  return {
    protocol: result.protocol,
    version: result.version,
    contract: result.contract,
    chain: chain,
    address: address,
    metadata: protocol.contracts[result.contract],
    deployment: protocol.deployments[chain]
  };
}

/**
 * Find all contracts that emit a specific event
 */
export function findByEvent(eventName) {
  const indexPath = path.join(GENERATED_DIR, 'indexes/by-event.json');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  return index[eventName] || [];
}

/**
 * Get all protocols on a specific chain
 */
export function getProtocolsByChain(chain) {
  const chainPath = path.join(GENERATED_DIR, `by-chain/${chain}.json`);
  
  if (!fs.existsSync(chainPath)) {
    return null;
  }
  
  const data = JSON.parse(fs.readFileSync(chainPath, 'utf8'));
  return data;
}

/**
 * Get all protocols of a specific type
 */
export function getProtocolsByType(type) {
  const categoryPath = path.join(GENERATED_DIR, `by-category/${type}.json`);
  
  if (!fs.existsSync(categoryPath)) {
    return null;
  }
  
  const data = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
  return data;
}

/**
 * Get all available chains
 */
export function getChains() {
  const byChainDir = path.join(GENERATED_DIR, 'by-chain');
  
  if (!fs.existsSync(byChainDir)) {
    return [];
  }
  
  return fs.readdirSync(byChainDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.basename(f, '.json'));
}

/**
 * Get all available protocol types
 */
export function getTypes() {
  const byCategoryDir = path.join(GENERATED_DIR, 'by-category');
  
  if (!fs.existsSync(byCategoryDir)) {
    return [];
  }
  
  return fs.readdirSync(byCategoryDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.basename(f, '.json'));
}

// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Usage:');
    console.log('  node query.js find-address <chain> <address>');
    console.log('  node query.js find-event <eventName>');
    console.log('  node query.js chains');
    console.log('  node query.js types');
    console.log('  node query.js chain <chainName>');
    console.log('  node query.js type <typeName>');
    process.exit(1);
  }
  
  switch (command) {
    case 'find-address': {
      const [chain, address] = args.slice(1);
      const result = findByAddress(chain, address);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'find-event': {
      const eventName = args[1];
      const result = findByEvent(eventName);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'chains': {
      const chains = getChains();
      console.log(JSON.stringify(chains, null, 2));
      break;
    }
    case 'types': {
      const types = getTypes();
      console.log(JSON.stringify(types, null, 2));
      break;
    }
    case 'chain': {
      const chain = args[1];
      const result = getProtocolsByChain(chain);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'type': {
      const type = args[1];
      const result = getProtocolsByType(type);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    default:
      console.error('Unknown command:', command);
      process.exit(1);
  }
}
