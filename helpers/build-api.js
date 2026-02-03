import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import zlib from "zlib";
import { buildSearchIndexes } from "./build-search-indexes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.join(__dirname, "../docs/api");
const DATA_DIR = path.join(__dirname, "../data");

// Ensure API directory exists
if (!fs.existsSync(API_DIR)) {
  fs.mkdirSync(API_DIR, { recursive: true });
}

// Load all data
console.log("Loading data...");
const protocolsData = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "generated/protocols.json"), "utf8"),
);
const populatedProtocols = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, "populated-protocols.json"), "utf8"),
);
const byAddress = JSON.parse(
  fs.readFileSync(
    path.join(DATA_DIR, "generated/indexes/by-address.json"),
    "utf8",
  ),
);

// Convert protocols object to array
const protocols = [];
Object.keys(protocolsData).forEach((protocolKey) => {
  Object.keys(protocolsData[protocolKey]).forEach((versionKey) => {
    protocols.push(protocolsData[protocolKey][versionKey]);
  });
});

// 1. Metadata endpoint
console.log("Building metadata endpoint...");
const chains = fs
  .readdirSync(path.join(DATA_DIR, "sources/chains"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""));

const categories = [...new Set(protocols.map((p) => p.type))]
  .filter(Boolean)
  .sort();

const metadata = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString().split("T")[0],
  stats: {
    totalProtocols: protocols.length,
    populatedProtocols: populatedProtocols.populatedProtocols,
    totalChains: chains.length,
    totalCategories: categories.length,
  },
  chains: chains.sort(),
  categories,
  endpoints: {
    metadata: "/api/v1/metadata.json",
    protocols: "/api/v1/protocols.json",
    search: "/api/v1/search",
    searchByAddress: "/api/v1/search/by-address.json",
    searchByName: "/api/v1/search/by-name.json",
    searchVerified: "/api/v1/search/verified.json",
    searchByChain: "/api/v1/search/chain/{chain}.json",
    searchMultiChain: "/api/v1/search/multi-chain.json",
    searchByContractType: "/api/v1/search/by-contract-type/{type}.json",
    searchRecent: "/api/v1/search/recent.json",
    protocol: "/api/v1/protocol/{id}",
    updates: "/api/v1/updates.json",
    openapi: "/api/v1/openapi.json",
    queries: "/api/v1/queries.json",
    rss: "/api/updates.rss",
  },
};

writeJSON("v1/metadata.json", metadata);

// 2. Search by address
console.log("Building search endpoints...");
const searchByAddress = {};

// Add both formats: "chain:address" and just "address"
Object.entries(byAddress).forEach(([key, info]) => {
  const keyLower = key.toLowerCase();

  // Add the original chain:address format
  searchByAddress[keyLower] = info;

  // Extract and add just the address part (if it contains a colon)
  if (keyLower.includes(":")) {
    const address = keyLower.split(":")[1];
    if (address) {
      // If we already have this address (collision), convert to array
      if (searchByAddress[address]) {
        if (Array.isArray(searchByAddress[address])) {
          searchByAddress[address].push(info);
        } else {
          searchByAddress[address] = [searchByAddress[address], info];
        }
      } else {
        searchByAddress[address] = info;
      }
    }
  }
});

writeJSON("v1/search/by-address.json", searchByAddress);

// 3. Search by protocol and chain combinations
const searchIndex = {};
protocols.forEach((protocol) => {
  const key = protocol.id;
  if (!searchIndex[key]) {
    searchIndex[key] = protocol;
  }
});

writeJSON("v1/search/index.json", searchIndex);

// 3.5. Enhanced search indexes
await buildSearchIndexes();

// 4. Individual protocol endpoints
console.log("Building protocol endpoints...");
const protocolsDir = path.join(DATA_DIR, "sources/protocols");
const protocolDirs = fs.readdirSync(protocolsDir).filter((f) => {
  const stat = fs.statSync(path.join(protocolsDir, f));
  return stat.isDirectory();
});

protocolDirs.forEach((protocolDir) => {
  const protocolPath = path.join(protocolsDir, protocolDir);
  const files = fs.readdirSync(protocolPath).filter((f) => f.endsWith(".json"));

  files.forEach((file) => {
    try {
      const protocolData = JSON.parse(
        fs.readFileSync(path.join(protocolPath, file), "utf8"),
      );
      const protocolId = file.replace(".json", "");

      // Create endpoint for each protocol
      writeJSON(`v1/protocol/${protocolId}.json`, protocolData);
    } catch (e) {
      console.warn(`  Warning: Could not process ${protocolDir}/${file}`);
    }
  });
});

console.log(`  Generated ${protocolDirs.length} protocol endpoints`);

// 5. Updates/Changelog
console.log("Building updates endpoint...");
const updates = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString().split("T")[0],
  recentUpdates: [
    {
      date: "2025-02-02",
      type: "initial_release",
      description: "Initial release with 5 populated protocols",
      protocols: ["aave-v2", "aave-v3", "morpho-blue", "gmx-v1", "jupiter"],
    },
  ],
  populatedProtocols: populatedProtocols.populatedList,
};

writeJSON("v1/updates.json", updates);

// 6. OpenAPI specification
console.log("Building OpenAPI spec...");
const openapi = {
  openapi: "3.0.0",
  info: {
    title: "DeFi Contracts Registry API",
    version: "1.0.0",
    description:
      "Static JSON API for querying DeFi protocol contract addresses across multiple chains",
    contact: {
      url: "https://github.com/karelxfi/contracts-registry-llm",
    },
    license: {
      name: "MIT",
      url: "https://github.com/karelxfi/contracts-registry-llm/blob/main/LICENSE",
    },
  },
  servers: [
    {
      url: "https://karelxfi.github.io/contracts-registry-llm",
      description: "Production server",
    },
  ],
  "x-rateLimit": "None",
  "x-cors": "Enabled",
  paths: {
    "/api/v1/metadata.json": {
      get: {
        summary: "Get API metadata",
        description:
          "Returns metadata about the API including stats, available chains, and categories",
        tags: ["Meta"],
        responses: {
          200: {
            description: "Successful response",
            headers: {
              "Cache-Control": {
                schema: { type: "string" },
                description: "max-age=3600",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string", example: "1.0.0" },
                    lastUpdated: {
                      type: "string",
                      format: "date",
                      example: "2025-02-02",
                    },
                    stats: {
                      type: "object",
                      properties: {
                        totalProtocols: { type: "integer", example: 4442 },
                        populatedProtocols: { type: "integer", example: 5 },
                        totalChains: { type: "integer", example: 106 },
                        totalCategories: { type: "integer", example: 93 },
                      },
                    },
                    chains: { type: "array", items: { type: "string" } },
                    categories: { type: "array", items: { type: "string" } },
                    endpoints: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/protocol/{id}.json": {
      get: {
        summary: "Get protocol details",
        description:
          "Returns complete details for a specific protocol including all deployments",
        tags: ["Protocols"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Protocol ID (e.g., aave-v3)",
            schema: { type: "string" },
            example: "aave-v3",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Protocol" },
              },
            },
          },
          404: {
            description: "Protocol not found",
          },
        },
      },
    },
    "/api/v1/search/by-address.json": {
      get: {
        summary: "Search by contract address",
        description:
          "Returns a map of contract addresses to protocol information. Supports both 'address' and 'chain:address' formats for lookups.",
        tags: ["Search"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      protocol: { type: "string", example: "aave-v3" },
                      chain: { type: "string", example: "ethereum" },
                      contract: { type: "string", example: "pool" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/by-name.json": {
      get: {
        summary: "Search protocols by name (fuzzy search)",
        description:
          "Returns a lightweight index of all protocols with normalized names for client-side fuzzy searching. Use with fast-levenshtein or similar library for typo-tolerant search.",
        tags: ["Search"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    lastUpdated: { type: "string", format: "date" },
                    protocols: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          nameNormalized: { type: "string" },
                          type: { type: "string" },
                          chains: { type: "array", items: { type: "string" } },
                          chainCount: { type: "integer" },
                          status: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/verified.json": {
      get: {
        summary: "Get verified contracts only",
        description:
          "Returns only contracts that have been verified on block explorers, organized by protocol and by chain.",
        tags: ["Search"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    lastUpdated: { type: "string", format: "date" },
                    byProtocol: { type: "object" },
                    byChain: { type: "object" },
                    stats: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/chain/{chain}.json": {
      get: {
        summary: "Get protocols deployed on a specific chain",
        description:
          "Returns a lightweight summary of all protocols deployed on the specified chain.",
        tags: ["Search"],
        parameters: [
          {
            name: "chain",
            in: "path",
            required: true,
            description: "Chain name (e.g., ethereum, base, arbitrum)",
            schema: { type: "string" },
            example: "base",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    chain: { type: "string" },
                    chainId: { type: "integer" },
                    protocols: { type: "array" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/multi-chain.json": {
      get: {
        summary: "Get protocols deployed on multiple chains",
        description:
          "Returns protocols deployed on 2 or more chains, categorized by chain count.",
        tags: ["Search"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    lastUpdated: { type: "string", format: "date" },
                    protocols: { type: "array" },
                    byChainCount: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/by-contract-type/{type}.json": {
      get: {
        summary: "Search protocols by contract type",
        description:
          "Returns protocols containing contracts of a specific type (e.g., oracle, vault, core).",
        tags: ["Search"],
        parameters: [
          {
            name: "type",
            in: "path",
            required: true,
            description: "Contract type (e.g., oracle, vault, core)",
            schema: { type: "string" },
            example: "oracle",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    contractType: { type: "string" },
                    protocols: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/search/recent.json": {
      get: {
        summary: "Get recently updated protocols",
        description:
          "Returns protocols updated in the last 7, 30, and 90 days.",
        tags: ["Search"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    lastUpdated: { type: "string", format: "date" },
                    last7Days: { type: "array" },
                    last30Days: { type: "array" },
                    last90Days: { type: "array" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/updates.json": {
      get: {
        summary: "Get recent updates",
        description: "Returns recent changes and newly populated protocols",
        tags: ["Meta"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "string" },
                    lastUpdated: { type: "string", format: "date" },
                    recentUpdates: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          date: { type: "string", format: "date" },
                          type: { type: "string" },
                          description: { type: "string" },
                          protocols: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                    },
                    populatedProtocols: { type: "array" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/queries.json": {
      get: {
        summary: "Get common query results",
        description:
          "Pre-computed results for common queries like protocols by status, multi-chain protocols, etc.",
        tags: ["Queries"],
        responses: {
          200: {
            description: "Successful response",
          },
        },
      },
    },
    "/api/updates.rss": {
      get: {
        summary: "RSS feed for updates",
        description: "Subscribe to registry updates via RSS",
        tags: ["Meta"],
        responses: {
          200: {
            description: "RSS feed",
            content: {
              "application/rss+xml": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
    "/data/generated/by-chain/{chain}.json": {
      get: {
        summary: "Get protocols by chain",
        description: "Returns all protocols deployed on a specific chain",
        tags: ["Legacy"],
        parameters: [
          {
            name: "chain",
            in: "path",
            required: true,
            description: "Chain name (e.g., ethereum, base, arbitrum)",
            schema: { type: "string" },
            example: "ethereum",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
          },
        },
      },
    },
    "/data/generated/by-category/{category}.json": {
      get: {
        summary: "Get protocols by category",
        description: "Returns all protocols in a specific category",
        tags: ["Legacy"],
        parameters: [
          {
            name: "category",
            in: "path",
            required: true,
            description: "Category name (e.g., lending, dexs, derivatives)",
            schema: { type: "string" },
            example: "lending",
          },
        ],
        responses: {
          200: {
            description: "Successful response",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Protocol: {
        type: "object",
        properties: {
          id: { type: "string", example: "aave-v3" },
          name: { type: "string", example: "Aave V3" },
          type: { type: "string", example: "lending" },
          website: { type: "string", example: "https://aave.com" },
          github: { type: "string", example: "https://github.com/aave" },
          docs: { type: "string" },
          contracts: { type: "object" },
          deployments: { type: "object" },
          status: {
            type: "string",
            enum: ["complete", "partial", "placeholder"],
          },
        },
      },
    },
  },
  tags: [
    { name: "Meta", description: "API metadata and information" },
    { name: "Protocols", description: "Protocol details and lookups" },
    { name: "Search", description: "Search and query endpoints" },
    { name: "Queries", description: "Pre-computed query results" },
    { name: "Legacy", description: "Legacy v0 endpoints" },
  ],
};

writeJSON("v1/openapi.json", openapi);

// 7. Create compressed versions of large files
console.log("Creating compressed versions...");
const largeFiles = [
  "v1/metadata.json",
  "v1/search/by-address.json",
  "v1/search/index.json",
  "v1/updates.json",
  "v1/openapi.json",
  "v1/queries.json",
  "v1/search/by-name.json",
  "v1/search/verified.json",
  "v1/search/multi-chain.json",
  "v1/search/recent.json",
];

largeFiles.forEach((file) => {
  const filePath = path.join(API_DIR, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    const compressed = zlib.gzipSync(content);
    fs.writeFileSync(filePath + ".gz", compressed);
    const savings = ((1 - compressed.length / content.length) * 100).toFixed(1);
    console.log(
      `  ${file}: ${(content.length / 1024).toFixed(1)}KB → ${(compressed.length / 1024).toFixed(1)}KB (${savings}% saved)`,
    );
  }
});

// 8. Create RSS feed for updates
console.log("Building RSS feed...");
const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DeFi Contracts Registry Updates</title>
    <link>https://karelxfi.github.io/contracts-registry-llm</link>
    <description>Recent updates to the DeFi Contracts Registry</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://karelxfi.github.io/contracts-registry-llm/api/updates.rss" rel="self" type="application/rss+xml" />
    <item>
      <title>Initial Release - v1.0.0</title>
      <link>https://github.com/karelxfi/contracts-registry-llm</link>
      <description>Initial release with 5 populated protocols: Aave V2, Aave V3, Morpho Blue, GMX V1, Jupiter</description>
      <pubDate>${new Date("2025-02-02").toUTCString()}</pubDate>
      <guid isPermaLink="false">contracts-registry-llm-v1.0.0</guid>
    </item>
  </channel>
</rss>`;

fs.writeFileSync(path.join(API_DIR, "updates.rss"), rss);

// 9. Create query helpers
console.log("Building query helpers...");
const queryHelpers = {
  version: "1.0.0",
  description: "Pre-computed results for common queries",
  lastUpdated: new Date().toISOString().split("T")[0],
  queries: {
    "protocols-by-status": {
      complete: populatedProtocols.populatedList.filter(
        (p) => p.status === "complete",
      ),
      partial: populatedProtocols.populatedList.filter(
        (p) => p.status === "partial",
      ),
      placeholder: protocols
        .filter((p) => {
          const isPopulated = populatedProtocols.populatedList.find(
            (pp) => pp.id === p.id,
          );
          return !isPopulated;
        })
        .slice(0, 100)
        .map((p) => ({ id: p.id, name: p.name, type: p.type })),
    },
    "multi-chain-protocols": populatedProtocols.populatedList
      .filter((p) => p.chainCount > 1)
      .map((p) => ({
        id: p.id,
        name: p.name,
        chains: p.chains,
        chainCount: p.chainCount,
      })),
    "top-chains-by-protocol-count": (() => {
      const chainCounts = {};
      protocols.forEach((p) => {
        if (p.tags) {
          p.tags.forEach((tag) => {
            if (chains.includes(tag)) {
              chainCounts[tag] = (chainCounts[tag] || 0) + 1;
            }
          });
        }
      });
      return Object.entries(chainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([chain, count]) => ({ chain, protocolCount: count }));
    })(),
    "top-categories-by-protocol-count": (() => {
      const categoryCounts = {};
      protocols.forEach((p) => {
        if (p.type) {
          categoryCounts[p.type] = (categoryCounts[p.type] || 0) + 1;
        }
      });
      return Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([category, count]) => ({ category, protocolCount: count }));
    })(),
    "verified-protocols": populatedProtocols.populatedList
      .filter((p) => {
        // Check if protocol has at least one verified contract
        const protocolData = protocols.find((proto) => proto.id === p.id);
        if (!protocolData || !protocolData.deployments) return false;
        return Object.values(protocolData.deployments).some((deployment) => {
          return (
            deployment.verified &&
            Object.values(deployment.verified).some((v) => v === true)
          );
        });
      })
      .map((p) => ({ id: p.id, name: p.name, chainCount: p.chainCount })),
    "single-chain-protocols": protocols
      .filter((p) => {
        const chainCount = p.deployments ? Object.keys(p.deployments).length : 0;
        return chainCount === 1;
      })
      .slice(0, 50)
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        chain: p.deployments ? Object.keys(p.deployments)[0] : null,
      })),
  },
};

writeJSON("v1/queries.json", queryHelpers);

// 10. Create API index page
console.log("Building API index...");
const apiIndex = {
  name: "DeFi Contracts Registry API",
  version: "1.0.0",
  description:
    "Static JSON API for querying DeFi protocol contract addresses across multiple chains",
  documentation: "https://github.com/karelxfi/contracts-registry-llm",
  baseUrl: "https://karelxfi.github.io/contracts-registry-llm",
  endpoints: metadata.endpoints,
  features: {
    rateLimit: "None",
    cors: "Enabled",
    compression: "gzip available",
    authentication: "Not required",
    versioning: "v1",
  },
  quickStart: {
    metadata: "GET /api/v1/metadata.json",
    protocol: "GET /api/v1/protocol/aave-v3.json",
    search: "GET /api/v1/search/by-address.json",
    updates: "GET /api/v1/updates.json",
    openapi: "GET /api/v1/openapi.json",
  },
};

writeJSON("index.json", apiIndex);

console.log("\n API build complete!");
console.log(` Generated files in: ${API_DIR}`);
console.log(` Total protocols: ${protocols.length}`);
console.log(` Populated protocols: ${populatedProtocols.populatedProtocols}`);
console.log(` Chains: ${chains.length}`);
console.log(` Categories: ${categories.length}`);

function writeJSON(relativePath, data) {
  const fullPath = path.join(API_DIR, relativePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}
