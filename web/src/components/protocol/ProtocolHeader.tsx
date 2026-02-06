interface ProtocolHeaderProps {
  name: string;
  category: string;
  description?: string;
  logo?: string;
  website?: string;
  totalContracts: number;
  totalChains: number;
}

const categoryColors: Record<string, string> = {
  dexs: "text-[#00ff88]",
  lending: "text-[#ff88ff]",
  "liquid-staking": "text-[#ffaa00]",
  bridge: "text-[#00aaff]",
  derivatives: "text-[#ffff00]",
  yield: "text-[#22C55E]",
};

const ProtocolHeader = ({
  name,
  category,
  description,
  logo,
  website,
  totalContracts,
  totalChains,
}: ProtocolHeaderProps) => {
  return (
    <div className="border border-border mb-6">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt={name}
                className="w-8 h-8"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-foreground">
                <span className="text-primary">&gt;</span> {name}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          <span
            className={`text-sm ${categoryColors[category] || "text-muted-foreground"}`}
          >
            [{category}]
          </span>
        </div>
      </div>

      <div className="p-4 text-xs text-muted-foreground flex flex-wrap gap-4">
        {website && (
          <span>
            <span className="text-primary">WEBSITE:</span>{" "}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {website}
            </a>
          </span>
        )}
        <span>
          <span className="text-primary">CONTRACTS:</span> {totalContracts}
        </span>
        <span>
          <span className="text-primary">CHAINS:</span> {totalChains}
        </span>
      </div>
    </div>
  );
};

export default ProtocolHeader;
