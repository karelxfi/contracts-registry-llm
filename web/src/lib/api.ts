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

// Simple fuzzy match - returns score (higher = better match)
function fuzzyMatch(text: string | undefined | null, query: string): number {
  if (!text) return 0;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match
  if (lowerText === lowerQuery) return 100;
  
  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 80;
  
  // Contains query as substring
  if (lowerText.includes(lowerQuery)) return 60;
  
  // Check if all query chars exist in order (fuzzy)
  let queryIdx = 0;
  let consecutiveBonus = 0;
  let lastMatchIdx = -1;
  
  for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIdx]) {
      if (lastMatchIdx === i - 1) consecutiveBonus += 5;
      lastMatchIdx = i;
      queryIdx++;
    }
  }
  
  if (queryIdx === lowerQuery.length) {
    // All chars matched
    return 30 + consecutiveBonus + (lowerQuery.length / lowerText.length) * 10;
  }
  
  return 0;
}

export async function searchProtocols(query: string): Promise<SearchResult> {
  try {
    // Load the full index if not cached
    if (!searchIndexCache || searchIndexCache.length === 0) {
      console.log('[Search] Cache empty, fetching index...');
      const protocols = await fetchSearchIndex();
      if (protocols.length === 0) {
        console.log('[Search] No protocols fetched');
        return { protocols: [], total: 0 };
      }
      console.log('[Search] Fetched', protocols.length, 'protocols');
    }

    const lowerQuery = query.toLowerCase().trim();
    console.log('[Search] Searching for:', lowerQuery, 'in', searchIndexCache?.length, 'protocols');
    
    if (!searchIndexCache) {
      return { protocols: [], total: 0 };
    }
    
    // Score and filter protocols
    const scored = searchIndexCache
      .map(p => {
        const nameScore = fuzzyMatch(p.name, lowerQuery);
        const idScore = fuzzyMatch(p.id, lowerQuery);
        const categoryScore = p.category.toLowerCase().includes(lowerQuery) ? 20 : 0;
        return {
          protocol: p,
          score: Math.max(nameScore, idScore, categoryScore),
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    console.log('[Search] Found', scored.length, 'results');
    return {
      protocols: scored.map(s => s.protocol),
      total: scored.length,
    };
  } catch (err) {
    console.error('[Search] Error:', err);
    return { protocols: [], total: 0 };
  }
}

export async function fetchSearchIndex(): Promise<Protocol[]> {
  // Return cached if available
  if (searchIndexCache) return searchIndexCache;
  
  try {
    console.log('[fetchSearchIndex] Fetching from:', `${API_BASE}/search/index.json`);
    const res = await fetch(`${API_BASE}/search/index.json`);
    console.log('[fetchSearchIndex] Response status:', res.status);

    if (!res.ok) {
      console.error('Failed to fetch:', res.status, res.statusText);
      return [];
    }

    const data = await res.json();

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

    // Cache the result
    searchIndexCache = protocols;
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
