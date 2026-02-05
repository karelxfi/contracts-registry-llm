import { useState } from "react";

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
}

const categoryColors: Record<string, string> = {
  dexs: "category-dexs",
  lending: "category-lending",
  "liquid-staking": "category-staking",
  bridge: "category-bridge",
  derivatives: "category-derivatives",
};

const ProtocolCard = ({ protocol }: ProtocolCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`0x${protocol.id.slice(0, 8)}...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={`/protocol/${protocol.id}`}
      className="block border border-border p-3 hover:border-primary hover:bg-accent transition-colors group"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-muted-foreground shrink-0">&gt;</span>
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
        <button
          onClick={handleCopy}
          className="hover:text-primary transition-colors"
        >
          {copied ? "[copied]" : "[copy addr]"}
        </button>
      </div>
    </a>
  );
};

export default ProtocolCard;
