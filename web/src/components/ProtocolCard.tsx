import { toast } from "@/hooks/use-toast";

interface Protocol {
  id: string;
  name: string;
  category: string;
  chains: number;
  logo: string;
  tvl?: string;
}

interface ProtocolCardProps {
  protocol: Protocol;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const categoryColors: Record<string, string> = {
  dexs: "category-dexs",
  lending: "category-lending",
  "liquid-staking": "category-staking",
  bridge: "category-bridge",
  derivatives: "category-derivatives",
};

const ProtocolCard = ({ protocol, isFavorite, onToggleFavorite }: ProtocolCardProps) => {
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`0x${protocol.id.slice(0, 8)}...`);
    toast({
      title: "Address copied",
      description: `${protocol.name} address copied to clipboard`,
    });
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.();
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: protocol.name,
    });
  };

  return (
    <a
      href={`/protocol/${protocol.id}`}
      className="block border border-border p-3 hover:border-primary hover:bg-accent transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">&gt;</span>
          {protocol.logo ? (
            <img 
              src={protocol.logo} 
              alt="" 
              className="w-4 h-4 shrink-0"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <span className="w-4 h-4 shrink-0 bg-muted text-[8px] flex items-center justify-center text-muted-foreground font-bold">
              {protocol.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate group-hover:text-primary transition-colors">
            {protocol.name}
          </span>
        </div>
        <span className={`text-xs shrink-0 ${categoryColors[protocol.category] || "text-muted-foreground"}`}>
          [{protocol.category}]
        </span>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>{protocol.chains} chain{protocol.chains > 1 ? "s" : ""}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleFavorite}
            className={`transition-colors ${isFavorite ? "text-primary" : "hover:text-primary"}`}
          >
            [{isFavorite ? "★" : "☆"}]
          </button>
          <button
            onClick={handleCopy}
            className="hover:text-primary transition-colors"
          >
            [copy]
          </button>
        </div>
      </div>
    </a>
  );
};

export default ProtocolCard;
