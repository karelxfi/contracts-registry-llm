// Use Vite's proxy in development, direct API in production
const API_BASE = import.meta.env.DEV ? "/api/v1" : "https://addybook.xyz/api/v1";

export interface Protocol {
  id: string;
  name: string;
  category: string; // mapped from 'type' in API
  chains: string[]; // mapped from 'deployments' keys in API
  logo: string;
  website?: string;
  twitter?: string;
  description?: string;
  hasContracts?: boolean; // whether protocol has any contract addresses
}

export interface Contract {
  chain: string;
  address: string;
  name: string;
  verified?: boolean;
}

export interface ProtocolDetail {
  id: string;
  name: string;
  category: string;
  chains: string[];
  logo: string;
  website?: string;
  twitter?: string;
  description?: string;
  contracts: Record<string, Contract[]>;
}

export interface Metadata {
  version: string;
  lastUpdated: string;
  stats: {
    totalProtocols: number;
    populatedProtocols: number;
    totalChains: number;
    totalCategories: number;
  };
  chains: string[];
  categories: string[];
}

export interface SearchResult {
  protocols: Protocol[];
  total: number;
}

export async function fetchMetadata(): Promise<Metadata> {
  const res = await fetch(`${API_BASE}/metadata.json`);
  if (!res.ok) throw new Error("Failed to fetch metadata");
  return res.json();
}

export async function fetchProtocol(id: string): Promise<ProtocolDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/search/index.json`);
    if (!res.ok) return null;
    const data = await res.json();
    const protocol = data[id];

    if (!protocol) return null;

    // Convert deployments to contracts format expected by UI
    const contracts: Record<string, any[]> = {};
    if (protocol.deployments) {
      Object.entries(protocol.deployments).forEach(([chain, deployment]: [string, any]) => {
        if (deployment.addresses) {
          contracts[chain] = Object.entries(deployment.addresses).map(([name, address]) => ({
            chain,
            address: address || '',
            name: protocol.contracts?.[name]?.name || name,
            verified: deployment.verified?.[name] || false,
          }));
        }
      });
    }

    return {
      id: protocol.id,
      name: protocol.name,
      category: protocol.type || 'other',
      chains: protocol.deployments ? Object.keys(protocol.deployments) : [],
      logo: '',
      website: protocol.website || '',
      twitter: '',
      description: protocol.contracts?.main?.description || '',
      contracts,
    };
  } catch (err) {
    console.error('Error fetching protocol:', err);
    return null;
  }
}

// Cache for search index
let searchIndexCache: Protocol[] | null = null;

export async function searchProtocols(query: string): Promise<SearchResult> {
  try {
    // Load the full index if not cached
    if (!searchIndexCache) {
      searchIndexCache = await fetchSearchIndex();
    }

    // Filter client-side
    const lowerQuery = query.toLowerCase();
    const filtered = searchIndexCache.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery)
    );

    return {
      protocols: filtered,
      total: filtered.length,
    };
  } catch {
    return { protocols: [], total: 0 };
  }
}

export async function fetchSearchIndex(): Promise<Protocol[]> {
  try {
    console.log('Fetching search index from:', `${API_BASE}/search/index.json`);
    const res = await fetch(`${API_BASE}/search/index.json`);
    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
      console.error('Failed to fetch:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    console.log('Data received, keys:', Object.keys(data).length);

    // Convert object of protocols to array
    const protocols = Object.values(data).map((p: any) => {
      // Check if protocol has any contract addresses
      let hasContracts = false;
      if (p.deployments) {
        hasContracts = Object.values(p.deployments).some((deployment: any) => {
          if (deployment.addresses) {
            return Object.values(deployment.addresses).some((addr) => addr && addr !== '');
          }
          return false;
        });
      }

      return {
        id: p.id,
        name: p.name,
        category: p.type || 'other',
        chains: p.deployments ? Object.keys(p.deployments) : [],
        logo: '', // API doesn't provide logos in index
        website: p.website || '',
        twitter: '',
        description: '',
        hasContracts,
      };
    });

    console.log('Protocols mapped:', protocols.length);
    console.log('Protocols with contracts:', protocols.filter(p => p.hasContracts).length);
    return protocols;
  } catch (err) {
    console.error('Error fetching search index:', err);
    return [];
  }
}

export async function fetchVerifiedProtocols(): Promise<Protocol[]> {
  try {
    const res = await fetch(`${API_BASE}/search/verified.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.protocols || [];
  } catch {
    return [];
  }
}

export async function fetchProtocolsByChain(chain: string): Promise<Protocol[]> {
  try {
    const res = await fetch(`${API_BASE}/search/chain/${chain}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.protocols || [];
  } catch {
    return [];
  }
}
