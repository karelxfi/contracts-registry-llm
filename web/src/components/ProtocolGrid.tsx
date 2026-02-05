import { useState, useEffect } from "react";
import ProtocolCard from "./ProtocolCard";
import CategoryTabs from "./CategoryTabs";
import ChainFilter from "./ChainFilter";
import { fetchSearchIndex, fetchMetadata, Protocol } from "@/lib/api";

interface ProtocolGridProps {
  onSearchClick: () => void;
}

const ProtocolGrid = ({ onSearchClick }: ProtocolGridProps) => {
  const [category, setCategory] = useState("all");
  const [chain, setChain] = useState("all");
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProtocols: 0, totalChains: 0 });

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onSearchClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSearchClick]);

  const filteredProtocols = protocols.filter((p) => {
    // Only show protocols with contracts
    if (!p.hasContracts) return false;
    if (category !== "all" && p.category !== category) return false;
    if (chain !== "all" && !p.chains?.some(c => c.toLowerCase().includes(chain))) return false;
    return true;
  });

  return (
    <section className="py-6" id="protocols">
      <div className="container mx-auto px-4">
        <div className="border border-border">
          {/* Header */}
          <div className="border-b border-border p-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs text-muted-foreground">
                <span className="text-primary">$</span> ls /protocols
                <span className="text-muted-foreground ml-2">
                  ({loading ? "..." : filteredProtocols.length} of {stats.totalProtocols})
                </span>
              </div>
              <ChainFilter activeChain={chain} onChainChange={setChain} />
            </div>
          </div>

          {/* Categories */}
          <div className="border-b border-border p-2 overflow-x-auto">
            <CategoryTabs activeCategory={category} onCategoryChange={setCategory} />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="text-primary">$</span> loading protocols...
              <span className="blink ml-1">_</span>
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <span className="text-primary">&gt;</span> no protocols found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border">
              {filteredProtocols.slice(0, 24).map((protocol) => (
                <ProtocolCard
                  key={protocol.id}
                  protocol={{
                    id: protocol.id,
                    name: protocol.name,
                    category: protocol.category,
                    chains: protocol.chains?.length || 0,
                    logo: protocol.logo || "",
                  }}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border p-3 text-xs text-muted-foreground text-center">
            <span className="text-primary">&gt;</span> showing {Math.min(filteredProtocols.length, 24)} of {filteredProtocols.length} filtered
            {filteredProtocols.length > 24 && <span className="ml-4">[use search for more]</span>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolGrid;
