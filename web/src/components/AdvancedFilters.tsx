import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react";
import { Protocol } from "@/lib/api";

const chainMeta: Record<string, { color: string; logo?: string }> = {
  ethereum: { color: "#627EEA", logo: "https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg" },
  arbitrum: { color: "#28A0F0", logo: "https://icons.llamao.fi/icons/chains/rsz_arbitrum.jpg" },
  optimism: { color: "#FF0420", logo: "https://icons.llamao.fi/icons/chains/rsz_optimism.jpg" },
  polygon: { color: "#8247E5", logo: "https://icons.llamao.fi/icons/chains/rsz_polygon.jpg" },
  base: { color: "#0052FF", logo: "https://icons.llamao.fi/icons/chains/rsz_base.jpg" },
  bsc: { color: "#F0B90B", logo: "https://icons.llamao.fi/icons/chains/rsz_binance.jpg" },
  avalanche: { color: "#E84142", logo: "https://icons.llamao.fi/icons/chains/rsz_avalanche.jpg" },
  fantom: { color: "#1969FF", logo: "https://icons.llamao.fi/icons/chains/rsz_fantom.jpg" },
  gnosis: { color: "#04795B", logo: "https://icons.llamao.fi/icons/chains/rsz_xdai.jpg" },
  solana: { color: "#9945FF", logo: "https://icons.llamao.fi/icons/chains/rsz_solana.jpg" },
  celo: { color: "#FCFF52" },
  moonbeam: { color: "#53CBC8" },
  aurora: { color: "#70D44B" },
  linea: { color: "#61DFFF" },
  scroll: { color: "#FFEEDA" },
  zksync: { color: "#8B8DFC" },
  blast: { color: "#FCFC03" },
  mode: { color: "#DFFE00" },
};

const categoryConfig: Record<string, { color: string; label: string }> = {
  dexs: { color: "#00ff88", label: "DEX" },
  lending: { color: "#ff88ff", label: "LEND" },
  "liquid-staking": { color: "#ffaa00", label: "STAKE" },
  bridge: { color: "#00aaff", label: "BRIDGE" },
  derivatives: { color: "#ffff00", label: "DERIV" },
  yield: { color: "#22C55E", label: "YIELD" },
  cdp: { color: "#F97316", label: "CDP" },
  "yield-aggregator": { color: "#8B5CF6", label: "YIELD-AGG" },
  rwa: { color: "#EC4899", label: "RWA" },
  other: { color: "#888888", label: "OTHER" },
};

interface AdvancedFiltersProps {
  protocols: Protocol[];
  activeCategory: string;
  activeChain: string;
  showFavoritesOnly: boolean;
  favoritesCount: number;
  onCategoryChange: (category: string) => void;
  onChainChange: (chain: string) => void;
  onFavoritesChange: (show: boolean) => void;
}

const AdvancedFilters = ({
  protocols,
  activeCategory,
  activeChain,
  showFavoritesOnly,
  favoritesCount,
  onCategoryChange,
  onChainChange,
  onFavoritesChange,
}: AdvancedFiltersProps) => {
  const [expanded, setExpanded] = useState(false);
  const [chainSearch, setChainSearch] = useState("");

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  protocols.forEach((p) => {
    if (p.hasContracts) {
      const cat = p.category || "other";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  });

  const categories = Object.entries(categoryCounts)
    .map(([id, count]) => ({
      id,
      label: categoryConfig[id]?.label || id.toUpperCase().slice(0, 6),
      color: categoryConfig[id]?.color || "#888888",
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const totalWithContracts = protocols.filter((p) => p.hasContracts).length;

  // Calculate chain counts
  const chainCounts: Record<string, number> = {};
  protocols.forEach((p) => {
    if (p.chains && p.hasContracts) {
      p.chains.forEach((chain) => {
        const normalized = chain.toLowerCase();
        chainCounts[normalized] = (chainCounts[normalized] || 0) + 1;
      });
    }
  });

  const chains = Object.entries(chainCounts)
    .map(([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      count,
      ...chainMeta[id],
    }))
    .sort((a, b) => b.count - a.count);

  const filteredChains = chainSearch
    ? chains.filter((c) => c.name.toLowerCase().includes(chainSearch.toLowerCase()))
    : chains;

  const hasActiveFilters = activeCategory !== "all" || activeChain !== "all" || showFavoritesOnly;

  const clearFilters = () => {
    onCategoryChange("all");
    onChainChange("all");
    onFavoritesChange(false);
  };

  return (
    <div className="border-b border-border">
      {/* Filter Header */}
      <div className="p-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="w-3 h-3" />
            <span className="text-primary">$</span>
            <span>filter</span>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
            >
              <X className="w-3 h-3" />
              clear
            </motion.button>
          )}
        </div>

        {/* Active filter badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {showFavoritesOnly && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/30"
            >
              ★ favorites
            </motion.span>
          )}
          {activeCategory !== "all" && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs px-2 py-0.5 border border-border"
              style={{ color: categoryConfig[activeCategory]?.color }}
            >
              {categoryConfig[activeCategory]?.label || activeCategory}
            </motion.span>
          )}
          {activeChain !== "all" && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs px-2 py-0.5 border border-border flex items-center gap-1"
            >
              {chainMeta[activeChain]?.logo && (
                <img src={chainMeta[activeChain].logo} alt="" className="w-3 h-3 rounded-sm" />
              )}
              <span style={{ color: chainMeta[activeChain]?.color }}>
                {activeChain.toUpperCase()}
              </span>
            </motion.span>
          )}
        </div>
      </div>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-4">
              {/* Categories Section */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">├──</span>
                  <span>CATEGORY</span>
                  <span className="text-primary/50">────────────────</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  <button
                    onClick={() => onCategoryChange("all")}
                    className={`px-2 py-1 text-xs transition-all border ${
                      activeCategory === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    ALL [{totalWithContracts}]
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id)}
                      className={`px-2 py-1 text-xs transition-all border ${
                        activeCategory === cat.id
                          ? "border-current bg-accent"
                          : "border-border hover:border-current"
                      }`}
                      style={{ color: activeCategory === cat.id ? cat.color : undefined }}
                    >
                      <span style={{ color: cat.color }}>{cat.label}</span>
                      <span className="text-muted-foreground ml-1">[{cat.count}]</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chains Section */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">├──</span>
                  <span>NETWORK</span>
                  <span className="text-primary/50">─────────────────</span>
                </div>
                
                {/* Chain search */}
                <div className="pl-6 flex items-center gap-2 text-xs">
                  <span className="text-primary">$</span>
                  <span className="text-muted-foreground">grep</span>
                  <input
                    type="text"
                    placeholder="search chains..."
                    value={chainSearch}
                    onChange={(e) => setChainSearch(e.target.value)}
                    className="flex-1 max-w-48 bg-transparent border-b border-border focus:border-primary outline-none px-1 py-0.5 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pl-6 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => onChainChange("all")}
                    className={`px-2 py-1 text-xs transition-all border ${
                      activeChain === "all"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    ALL
                  </button>
                  {filteredChains.map((chain) => (
                    <motion.button
                      key={chain.id}
                      layout
                      onClick={() => onChainChange(chain.id)}
                      className={`px-2 py-1 text-xs transition-all border flex items-center gap-1.5 ${
                        activeChain === chain.id
                          ? "border-current bg-accent"
                          : "border-border hover:border-muted-foreground"
                      }`}
                      style={{
                        color: activeChain === chain.id ? chain.color : undefined,
                        borderColor: activeChain === chain.id ? chain.color : undefined,
                      }}
                    >
                      {chain.logo ? (
                        <img
                          src={chain.logo}
                          alt=""
                          className="w-3 h-3 rounded-sm"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <span
                          className="w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-bold"
                          style={{ backgroundColor: chain.color, color: "#000" }}
                        >
                          {chain.name.charAt(0)}
                        </span>
                      )}
                      <span style={{ color: chain.color }}>{chain.name}</span>
                      <span className="text-muted-foreground">[{chain.count}]</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Favorites Toggle */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">└──</span>
                  <span>OPTIONS</span>
                  <span className="text-primary/50">─────────────────</span>
                </div>
                <div className="pl-6">
                  <button
                    onClick={() => onFavoritesChange(!showFavoritesOnly)}
                    className={`px-2 py-1 text-xs transition-all border flex items-center gap-2 ${
                      showFavoritesOnly
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <span>{showFavoritesOnly ? "★" : "☆"}</span>
                    <span>FAVORITES ONLY</span>
                    {favoritesCount > 0 && (
                      <span className={showFavoritesOnly ? "" : "text-primary"}>
                        [{favoritesCount}]
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedFilters;
