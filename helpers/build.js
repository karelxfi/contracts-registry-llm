#!/usr/bin/env node
/**
 * Main build script for contracts registry
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const ROOT_DIR = path.join(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT_DIR, 'data/schemas');
const SOURCES_DIR = path.join(ROOT_DIR, 'data/sources');
const GENERATED_DIR = path.join(ROOT_DIR, 'data/generated');

// Load schemas
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Register all schemas
const contractSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'contract.schema.json'), 'utf8'));
const deploymentSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'deployment.schema.json'), 'utf8'));
const protocolSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'protocol.schema.json'), 'utf8'));
const chainSchema = JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'chain.schema.json'), 'utf8'));

ajv.addSchema(contractSchema);
ajv.addSchema(deploymentSchema);
ajv.addSchema(chainSchema);

const validateProtocol = ajv.compile(protocolSchema);
const validateChain = ajv.compile(chainSchema);

// Main build function
async function build() {
  console.log('🔨 Building contracts registry...\n');

  try {
    const protocols = loadProtocols();
    const chains = loadChains();
    
    generateCombinedProtocols(protocols);
    generateContractAddresses(protocols);
    generateProtocolMetadata(protocols);
    generateByChainViews(protocols, chains);
    generateByCategoryViews(protocols);
    generateSearchIndexes(protocols);
    
    console.log('\n✅ Build complete!\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

function loadProtocols() {
  console.log('📂 Loading protocols...');
  const protocols = {};
  const protocolsPath = path.join(SOURCES_DIR, 'protocols');
  
  if (!fs.existsSync(protocolsPath)) {
    console.log('  ⚠️  No protocols directory found');
    return protocols;
  }
  
  const protocolDirs = fs.readdirSync(protocolsPath);
  
  for (const protocolDir of protocolDirs) {
    const protocolPath = path.join(protocolsPath, protocolDir);
    const stat = fs.statSync(protocolPath);
    
    if (!stat.isDirectory()) continue;
    
    const files = fs.readdirSync(protocolPath).filter(f => f.endsWith('.json'));
    
    protocols[protocolDir] = {};
    
    for (const file of files) {
      const version = path.basename(file, '.json');
      const data = JSON.parse(fs.readFileSync(path.join(protocolPath, file), 'utf8'));
      
      const valid = validateProtocol(data);
      if (!valid) {
        console.error(`  ❌ Validation failed for ${protocolDir}/${version}:`);
        console.error(validateProtocol.errors);
        throw new Error(`Invalid protocol data: ${protocolDir}/${version}`);
      }
      
      protocols[protocolDir][version] = data;
      console.log(`  ✓ ${protocolDir}/${version}`);
    }
  }
  
  return protocols;
}

function loadChains() {
  console.log('\n📍 Loading chains...');
  const chains = {};
  const chainsPath = path.join(SOURCES_DIR, 'chains');
  
  if (!fs.existsSync(chainsPath)) {
    console.log('  ⚠️  No chains directory found');
    return chains;
  }
  
  const files = fs.readdirSync(chainsPath).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    const chainId = path.basename(file, '.json');
    const data = JSON.parse(fs.readFileSync(path.join(chainsPath, file), 'utf8'));
    
    const valid = validateChain(data);
    if (!valid) {
      console.error(`  ❌ Validation failed for chain ${chainId}:`);
      console.error(validateChain.errors);
      throw new Error(`Invalid chain data: ${chainId}`);
    }
    
    chains[chainId] = data;
    console.log(`  ✓ ${chainId}`);
  }
  
  return chains;
}

function generateCombinedProtocols(protocols) {
  console.log('\n📦 Generating combined protocols...');
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(GENERATED_DIR, 'protocols.json'),
    JSON.stringify(protocols, null, 2)
  );
  console.log('  ✓ protocols.json');
}

function generateContractAddresses(protocols) {
  console.log('\n📋 Generating contract addresses...');
  const addresses = {};
  
  for (const [protocolId, versions] of Object.entries(protocols)) {
    addresses[protocolId] = {};
    
    for (const [versionId, data] of Object.entries(versions)) {
      if (!data.deployments) continue;
      
      addresses[protocolId][versionId] = {};
      
      for (const [chainId, deployment] of Object.entries(data.deployments)) {
        addresses[protocolId][versionId][chainId] = {
          ...deployment.addresses,
          verified: deployment.verified || {},
          source: deployment.source,
          updated: deployment.updated
        };
      }
    }
  }
  
  fs.writeFileSync(
    path.join(GENERATED_DIR, 'contract-addresses.json'),
    JSON.stringify(addresses, null, 2)
  );
  console.log('  ✓ contract-addresses.json');
}

function generateProtocolMetadata(protocols) {
  console.log('\n📝 Generating protocol metadata...');
  const metadata = {};
  
  for (const [protocolId, versions] of Object.entries(protocols)) {
    metadata[protocolId] = {};
    
    for (const [versionId, data] of Object.entries(versions)) {
      metadata[protocolId][versionId] = {
        id: data.id,
        name: data.name,
        type: data.type,
        website: data.website,
        github: data.github,
        docs: data.docs,
        tags: data.tags,
        contracts: data.contracts
      };
    }
  }
  
  fs.writeFileSync(
    path.join(GENERATED_DIR, 'protocol-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  console.log('  ✓ protocol-metadata.json');
}

function generateByChainViews(protocols, chains) {
  console.log('\n🌐 Generating chain-specific views...');
  const byChain = {};
  
  for (const [protocolId, versions] of Object.entries(protocols)) {
    for (const [versionId, data] of Object.entries(versions)) {
      if (!data.deployments) continue;
      
      for (const [chainId, deployment] of Object.entries(data.deployments)) {
        if (!byChain[chainId]) {
          byChain[chainId] = {
            chain: chainId,
            chainId: deployment.chainId,
            chainInfo: chains[chainId] || null,
            protocols: {}
          };
        }
        
        if (!byChain[chainId].protocols[protocolId]) {
          byChain[chainId].protocols[protocolId] = {};
        }
        
        byChain[chainId].protocols[protocolId][versionId] = {
          name: data.name,
          type: data.type,
          addresses: deployment.addresses,
          deploymentBlocks: deployment.deploymentBlocks || {},
          verified: deployment.verified || {}
        };
      }
    }
  }
  
  const byChainDir = path.join(GENERATED_DIR, 'by-chain');
  fs.mkdirSync(byChainDir, { recursive: true });
  
  for (const [chainId, data] of Object.entries(byChain)) {
    fs.writeFileSync(
      path.join(byChainDir, `${chainId}.json`),
      JSON.stringify(data, null, 2)
    );
    console.log(`  ✓ by-chain/${chainId}.json`);
  }
}

function generateByCategoryViews(protocols) {
  console.log('\n📊 Generating category views...');
  const byCategory = {};
  
  for (const [protocolId, versions] of Object.entries(protocols)) {
    for (const [versionId, data] of Object.entries(versions)) {
      const type = data.type;
      
      if (!byCategory[type]) {
        byCategory[type] = {
          category: type,
          protocols: {}
        };
      }
      
      if (!byCategory[type].protocols[protocolId]) {
        byCategory[type].protocols[protocolId] = {};
      }
      
      byCategory[type].protocols[protocolId][versionId] = {
        name: data.name,
        contracts: data.contracts,
        deployments: data.deployments || {}
      };
    }
  }
  
  const byCategoryDir = path.join(GENERATED_DIR, 'by-category');
  fs.mkdirSync(byCategoryDir, { recursive: true });
  
  for (const [category, data] of Object.entries(byCategory)) {
    fs.writeFileSync(
      path.join(byCategoryDir, `${category}.json`),
      JSON.stringify(data, null, 2)
    );
    console.log(`  ✓ by-category/${category}.json`);
  }
}

function generateSearchIndexes(protocols) {
  console.log('\n🔍 Generating search indexes...');
  const byAddress = {};
  const byEvent = {};
  
  for (const [protocolId, versions] of Object.entries(protocols)) {
    for (const [versionId, data] of Object.entries(versions)) {
      if (data.deployments) {
        for (const [chainId, deployment] of Object.entries(data.deployments)) {
          for (const [contractName, address] of Object.entries(deployment.addresses)) {
            const key = `${chainId}:${address.toLowerCase()}`;
            byAddress[key] = {
              protocol: protocolId,
              version: versionId,
              contract: contractName,
              chain: chainId
            };
          }
        }
      }
      
      if (data.contracts) {
        for (const [contractName, contract] of Object.entries(data.contracts)) {
          if (!contract.keyEvents) continue;
          
          for (const event of contract.keyEvents) {
            if (!byEvent[event.name]) {
              byEvent[event.name] = [];
            }
            
            byEvent[event.name].push({
              protocol: protocolId,
              version: versionId,
              contract: contractName,
              signature: event.signature || null
            });
          }
        }
      }
    }
  }
  
  const indexesDir = path.join(GENERATED_DIR, 'indexes');
  fs.mkdirSync(indexesDir, { recursive: true });
  
  fs.writeFileSync(
    path.join(indexesDir, 'by-address.json'),
    JSON.stringify(byAddress, null, 2)
  );
  console.log('  ✓ indexes/by-address.json');
  
  fs.writeFileSync(
    path.join(indexesDir, 'by-event.json'),
    JSON.stringify(byEvent, null, 2)
  );
  console.log('  ✓ indexes/by-event.json');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}

export { build };
