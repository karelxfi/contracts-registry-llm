import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProtocolCard from "./ProtocolCard";
import AdvancedFilters from "./AdvancedFilters";
import { ProtocolGridSkeleton, TerminalLoader } from "./ui/terminal-skeleton";
import { fetchSearchIndex, fetchMetadata, Protocol } from "@/lib/api";
import { useFavorites } from "@/hooks/use-favorites";

const ITEMS_PER_PAGE = 24;

const ProtocolGrid = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const chain = searchParams.get("chain") || "all";
  const showFavoritesOnly = searchParams.get("favorites") === "true";

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProtocols: 0, totalChains: 0 });
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const updateFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "all" || value === "false") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  };

  const setCategory = (value: string) => updateFilter("category", value);
  const setChain = (value: string) => updateFilter("chain", value);
  const setShowFavoritesOnly = (value: boolean) => updateFilter("favorites", String(value));

  useEffect(() => {
    Promise.all([fetchSearchIndex(), fetchMetadata()])
      .then(([prots, meta]) => {
        setProtocols(prots);
        setStats({
          totalProtocols: meta.stats.totalProtocols,
          totalChains: meta.stats.totalChains,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [category, chain, showFavoritesOnly]);

  const filteredProtocols = protocols.filter((p) => {
    // Only show protocols with contracts
    if (!p.hasContracts) return false;
    if (showFavoritesOnly && !isFavorite(p.id)) return false;
    if (category !== "all" && p.category !== category) return false;
    if (chain !== "all" && !p.chains?.some(c => c.toLowerCase().includes(chain))) return false;
    return true;
  });

  const visibleProtocols = filteredProtocols.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProtocols.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <section className="py-6" id="protocols">
      <div className="container mx-auto px-4">
        <div className="border border-border">
          {/* Header */}
          <div className="border-b border-border p-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>
                <span className="text-primary">$</span> ls /protocols
                <span className="ml-2">
                  ({loading ? "..." : filteredProtocols.length} of {stats.totalProtocols})
                </span>
              </span>
            </div>
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            protocols={protocols}
            activeCategory={category}
            activeChain={chain}
            showFavoritesOnly={showFavoritesOnly}
            favoritesCount={favorites.length}
            onCategoryChange={setCategory}
            onChainChange={setChain}
            onFavoritesChange={setShowFavoritesOnly}
          />

          {/* Grid */}
          {loading ? (
            <div className="relative">
              <div className="absolute inset-0 terminal-scan pointer-events-none" />
              <div className="p-4 text-center">
                <TerminalLoader text="fetching protocols" />
              </div>
              <ProtocolGridSkeleton />
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="text-primary">&gt;</span> {showFavoritesOnly ? "no favorites yet - star some protocols!" : "no protocols found"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border">
              {visibleProtocols.map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={{
                    id: protocol.id,
                    name: protocol.name,
                    category: protocol.category,
                    chains: protocol.chains?.length || 0,
                    logo: protocol.logo || "",
                  }}
                  isFavorite={isFavorite(protocol.id)}
                  onToggleFavorite={() => toggleFavorite(protocol.id)}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border p-3 text-xs text-muted-foreground text-center">
            <span className="text-primary">&gt;</span> showing {visibleProtocols.length} of {filteredProtocols.length} filtered
            {hasMore && (
              <button
                onClick={handleLoadMore}
                className="ml-4 text-primary hover:underline"
              >
                [load more +{Math.min(ITEMS_PER_PAGE, filteredProtocols.length - visibleCount)}]
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolGrid;
