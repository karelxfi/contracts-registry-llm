import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import zlib from "zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.join(__dirname, "../docs/api");
const DATA_DIR = path.join(__dirname, "../data");

export async function buildSearchIndexes() {
  console.log("\nBuilding enhanced search indexes...");

  // Load required data
  const protocolsData = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "generated/protocols.json"), "utf8"),
  );
  const populatedProtocols = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, "populated-protocols.json"), "utf8"),
  );

  // Convert protocols object to array
  const protocols = [];
  Object.keys(protocolsData).forEach((protocolKey) => {
    Object.keys(protocolsData[protocolKey]).forEach((versionKey) => {
      protocols.push(protocolsData[protocolKey][versionKey]);
    });
  });

  // Generate all search indexes
  generateNameIndex(protocols, populatedProtocols);
  generateVerifiedIndex(protocols);
  generateChainIndexes(protocols);
  generateMultiChainIndex(protocols, populatedProtocols);
  generateContractTypeIndexes(protocols);
  generateRecentUpdatesIndex(protocols);

  // Compress large indexes
  compressIndexes();

  console.log("Enhanced search indexes complete!");
}

function generateNameIndex(protocols, populatedProtocols) {
  console.log("  Generating name search index...");

  const nameIndex = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split("T")[0],
    protocols: [],
  };

  // Build protocol list with normalized names
  protocols.forEach((protocol) => {
    // Skip protocols without names
    if (!protocol.name || !protocol.id) return;

    // Find if this protocol is populated
    const populated = populatedProtocols.populatedList.find(
      (p) => p.id === protocol.id,
    );

    // Get chain list
    const chains = [];
    let chainCount = 0;
    if (protocol.deployments) {
      Object.keys(protocol.deployments).forEach((chain) => {
        chains.push(chain);
        chainCount++;
      });
    }

    nameIndex.protocols.push({
      id: protocol.id,
      name: protocol.name,
      nameNormalized: protocol.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      type: protocol.type || "",
      chains: chains.slice(0, 5), // First 5 chains for preview
      chainCount: chainCount,
      status: populated ? populated.status : "placeholder",
    });
  });

  writeJSON("v1/search/by-name.json", nameIndex);
  console.log(
    `    by-name.json (${nameIndex.protocols.length} protocols)`,
  );
}

function generateVerifiedIndex(protocols) {
  console.log("  Generating verified contracts index...");

  const verifiedIndex = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split("T")[0],
    byProtocol: {},
    byChain: {},
    stats: {
      totalVerified: 0,
      byChain: {},
    },
  };

  protocols.forEach((protocol) => {
    if (!protocol.deployments) return;

    Object.entries(protocol.deployments).forEach(([chain, deployment]) => {
      if (!deployment.verified) return;

      const verifiedContracts = Object.entries(deployment.verified)
        .filter(([_, isVerified]) => isVerified === true)
        .map(([contractName, _]) => contractName);

      if (verifiedContracts.length === 0) return;

      // Add to byProtocol index
      if (!verifiedIndex.byProtocol[protocol.id]) {
        verifiedIndex.byProtocol[protocol.id] = {};
      }
      verifiedIndex.byProtocol[protocol.id][chain] = verifiedContracts;

      // Add to byChain index
      if (!verifiedIndex.byChain[chain]) {
        verifiedIndex.byChain[chain] = {};
      }
      verifiedIndex.byChain[chain][protocol.id] = verifiedContracts;

      // Update stats
      verifiedIndex.stats.totalVerified += verifiedContracts.length;
      verifiedIndex.stats.byChain[chain] =
        (verifiedIndex.stats.byChain[chain] || 0) + verifiedContracts.length;
    });
  });

  writeJSON("v1/search/verified.json", verifiedIndex);
  console.log(
    `    verified.json (${verifiedIndex.stats.totalVerified} verified contracts)`,
  );
}

function generateChainIndexes(protocols) {
  console.log("  Generating chain-specific indexes...");

  const chainData = {};

  protocols.forEach((protocol) => {
    if (!protocol.deployments) return;

    Object.entries(protocol.deployments).forEach(([chain, deployment]) => {
      if (!chainData[chain]) {
        chainData[chain] = {
          version: "1.0.0",
          chain: chain,
          chainId: deployment.chainId || null,
          protocols: [],
        };
      }

      const contractCount = deployment.addresses
        ? Object.keys(deployment.addresses).length
        : 0;

      // Check if any contracts are verified
      const hasVerified =
        deployment.verified &&
        Object.values(deployment.verified).some((v) => v === true);

      chainData[chain].protocols.push({
        id: protocol.id,
        name: protocol.name,
        type: protocol.type || "",
        contractCount: contractCount,
        verified: hasVerified || false,
        updated: deployment.updated || null,
      });
    });
  });

  // Write each chain index
  const chainDir = path.join(API_DIR, "v1/search/chain");
  if (!fs.existsSync(chainDir)) {
    fs.mkdirSync(chainDir, { recursive: true });
  }

  let totalChains = 0;
  Object.entries(chainData).forEach(([chain, data]) => {
    const filePath = path.join(chainDir, `${chain}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    totalChains++;
  });

  console.log(`    chain/*.json (${totalChains} chain indexes)`);
}

function generateMultiChainIndex(protocols, populatedProtocols) {
  console.log("  Generating multi-chain protocols index...");

  const multiChainIndex = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString().split("T")[0],
    protocols: [],
    byChainCount: {
      "10+": [],
      "5-9": [],
      "2-4": [],
    },
  };

  protocols.forEach((protocol) => {
    if (!protocol.deployments) return;

    const chains = Object.keys(protocol.deployments);
    const chainCount = chains.length;

    if (chainCount < 2) return;

    const protocolInfo = {
      id: protocol.id,
      name: protocol.name,
      type: protocol.type || "",
      chainCount: chainCount,
      chains: chains,
    };

    multiChainIndex.protocols.push(protocolInfo);

    // Categorize by chain count
    if (chainCount >= 10) {
      multiChainIndex.byChainCount["10+"].push(protocol.id);
    } else if (chainCount >= 5) {
      multiChainIndex.byChainCount["5-9"].push(protocol.id);
    } else {
      multiChainIndex.byChainCount["2-4"].push(protocol.id);
    }
  });

  // Sort by chain count descending
  multiChainIndex.protocols.sort((a, b) => b.chainCount - a.chainCount);

  writeJSON("v1/search/multi-chain.json", multiChainIndex);
  console.log(
    `    multi-chain.json (${multiChainIndex.protocols.length} multi-chain protocols)`,
  );
}

function generateContractTypeIndexes(protocols) {
  console.log("  Generating contract type indexes...");

  const typeData = {};

  protocols.forEach((protocol) => {
    if (!protocol.contracts) return;

    Object.entries(protocol.contracts).forEach(([contractName, contract]) => {
      const contractType = contract.type || "unknown";

      if (!typeData[contractType]) {
        typeData[contractType] = {
          version: "1.0.0",
          contractType: contractType,
          protocols: {},
        };
      }

      if (!typeData[contractType].protocols[protocol.id]) {
        typeData[contractType].protocols[protocol.id] = {
          name: protocol.name,
          type: protocol.type || "",
          contracts: [],
          chains: [],
        };
      }

      typeData[contractType].protocols[protocol.id].contracts.push(
        contractName,
      );

      // Add chains where this contract is deployed
      if (protocol.deployments) {
        Object.keys(protocol.deployments).forEach((chain) => {
          if (
            !typeData[contractType].protocols[protocol.id].chains.includes(
              chain,
            )
          ) {
            typeData[contractType].protocols[protocol.id].chains.push(chain);
          }
        });
      }
    });
  });

  // Write each contract type index
  const typeDir = path.join(API_DIR, "v1/search/by-contract-type");
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }

  let totalTypes = 0;
  Object.entries(typeData).forEach(([contractType, data]) => {
    const filePath = path.join(typeDir, `${contractType}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    totalTypes++;
  });

  console.log(
    `    by-contract-type/*.json (${totalTypes} contract type indexes)`,
  );
}

function generateRecentUpdatesIndex(protocols) {
  console.log("  Generating recent updates index...");

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recentIndex = {
    version: "1.0.0",
    lastUpdated: now.toISOString().split("T")[0],
    last7Days: [],
    last30Days: [],
    last90Days: [],
  };

  protocols.forEach((protocol) => {
    if (!protocol.deployments) return;

    let latestUpdate = null;

    Object.values(protocol.deployments).forEach((deployment) => {
      if (deployment.updated) {
        const updateDate = new Date(deployment.updated);
        if (!latestUpdate || updateDate > new Date(latestUpdate)) {
          latestUpdate = deployment.updated;
        }
      }
    });

    if (!latestUpdate) return;

    const updateDate = new Date(latestUpdate);
    const protocolInfo = {
      id: protocol.id,
      name: protocol.name,
      type: protocol.type || "",
      updated: latestUpdate,
    };

    if (updateDate >= sevenDaysAgo) {
      recentIndex.last7Days.push(protocolInfo);
    } else if (updateDate >= thirtyDaysAgo) {
      recentIndex.last30Days.push(protocolInfo);
    } else if (updateDate >= ninetyDaysAgo) {
      recentIndex.last90Days.push(protocolInfo);
    }
  });

  // Sort by date descending
  const sortByDate = (a, b) => new Date(b.updated) - new Date(a.updated);
  recentIndex.last7Days.sort(sortByDate);
  recentIndex.last30Days.sort(sortByDate);
  recentIndex.last90Days.sort(sortByDate);

  writeJSON("v1/search/recent.json", recentIndex);
  console.log(
    `    recent.json (${recentIndex.last7Days.length} updates in last 7 days)`,
  );
}

function compressIndexes() {
  console.log("  Compressing search indexes...");

  const filesToCompress = [
    "v1/search/by-name.json",
    "v1/search/verified.json",
    "v1/search/multi-chain.json",
    "v1/search/recent.json",
  ];

  filesToCompress.forEach((file) => {
    const filePath = path.join(API_DIR, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      const compressed = zlib.gzipSync(content);
      fs.writeFileSync(filePath + ".gz", compressed);
      const savings = ((1 - compressed.length / content.length) * 100).toFixed(
        1,
      );
      console.log(
        `    ${file}: ${(content.length / 1024).toFixed(1)}KB → ${(compressed.length / 1024).toFixed(1)}KB (${savings}% saved)`,
      );
    }
  });
}

function writeJSON(relativePath, data) {
  const fullPath = path.join(API_DIR, relativePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}
