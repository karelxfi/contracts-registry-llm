const chains = [
  { id: "all", name: "ALL" },
  { id: "ethereum", name: "ETH" },
  { id: "arbitrum", name: "ARB" },
  { id: "optimism", name: "OP" },
  { id: "polygon", name: "MATIC" },
  { id: "base", name: "BASE" },
  { id: "bsc", name: "BSC" },
];

interface ChainFilterProps {
  activeChain: string;
  onChainChange: (chain: string) => void;
}

const ChainFilter = ({ activeChain, onChainChange }: ChainFilterProps) => {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="text-primary mr-1">CHAIN:</span>
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onChainChange(chain.id)}
          className={`px-1.5 py-0.5 transition-colors ${
            activeChain === chain.id
              ? "text-primary bg-accent"
              : "hover:text-foreground"
          }`}
        >
          {chain.name}
        </button>
      ))}
    </div>
  );
};

export default ChainFilter;
