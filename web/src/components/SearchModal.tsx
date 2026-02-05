import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { searchProtocols, Protocol } from "@/lib/api";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryColors: Record<string, string> = {
  dexs: "text-[#00ff88]",
  lending: "text-[#ff88ff]",
  "liquid-staking": "text-[#ffaa00]",
  bridge: "text-[#00aaff]",
  derivatives: "text-[#ffff00]",
};

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      searchProtocols(query)
        .then((data) => setResults(data.protocols))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-background border-border">
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary">$</span>
            <input
              type="text"
              placeholder="search protocols..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <span className="text-xs text-muted-foreground">[esc]</span>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              searching...<span className="blink">_</span>
            </div>
          ) : !query.trim() ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              type to search {">"}4400 protocols
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              no results found
            </div>
          ) : (
            results.slice(0, 10).map((result) => (
              <a
                key={result.id}
                href={`/protocol/${result.id}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center justify-between p-3 hover:bg-accent transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">&gt;</span>
                  {result.logo && (
                    <img 
                      src={result.logo} 
                      alt="" 
                      className="w-4 h-4"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <span>{result.name}</span>
                </div>
                <span className={`text-xs ${categoryColors[result.category] || "text-muted-foreground"}`}>
                  [{result.category}]
                </span>
              </a>
            ))
          )}
        </div>

        <div className="border-t border-border p-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>↑↓ navigate</span>
          <span>⏎ select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
