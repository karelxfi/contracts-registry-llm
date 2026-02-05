import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import { fetchProtocol, ProtocolDetail as ProtocolDetailType, Contract } from "@/lib/api";

const chainColors: Record<string, string> = {
  ethereum: "text-[#627EEA]",
  arbitrum: "text-[#28A0F0]",
  optimism: "text-[#FF0420]",
  polygon: "text-[#8247E5]",
  base: "text-[#0052FF]",
  bsc: "text-[#F0B90B]",
  avalanche: "text-[#E84142]",
  fantom: "text-[#1969FF]",
  gnosis: "text-[#04795B]",
};

const categoryColors: Record<string, string> = {
  dexs: "text-[#00ff88]",
  lending: "text-[#ff88ff]",
  "liquid-staking": "text-[#ffaa00]",
  bridge: "text-[#00aaff]",
  derivatives: "text-[#ffff00]",
  yield: "text-[#22C55E]",
};

const ProtocolDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<ProtocolDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    fetchProtocol(id)
      .then((data) => {
        if (data) {
          setProtocol(data);
        } else {
          setError("Protocol not found");
        }
      })
      .catch(() => setError("Failed to load protocol"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchClick={() => setSearchOpen(true)} />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="border border-border p-8 text-center">
              <p className="text-muted-foreground">
                <span className="text-primary">$</span> loading...
                <span className="blink ml-1">_</span>
              </p>
            </div>
          </div>
        </main>
        <Footer />
        <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    );
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearchClick={() => setSearchOpen(true)} />
        <main className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="border border-border p-8 text-center">
              <p className="text-muted-foreground">
                <span className="text-destructive">ERROR:</span> {error || "Protocol not found"}
              </p>
              <Link to="/" className="text-primary hover:underline mt-4 inline-block">
                &lt; back to home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      </div>
    );
  }

  // Flatten contracts from the contracts object
  const allContracts: { chain: string; contracts: Contract[] }[] = Object.entries(
    protocol.contracts || {}
  ).map(([chain, contracts]) => ({
    chain,
    contracts: Array.isArray(contracts) ? contracts : [],
  }));

  const totalContracts = allContracts.reduce((sum, c) => sum + c.contracts.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchClick={() => setSearchOpen(true)} />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">/protocols</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">{id}</span>
          </div>

          {/* Protocol Header */}
          <div className="border border-border mb-6">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  {protocol.logo && (
                    <img 
                      src={protocol.logo} 
                      alt={protocol.name}
                      className="w-8 h-8"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      <span className="text-primary">&gt;</span> {protocol.name}
                    </h1>
                    {protocol.description && (
                      <p className="text-sm text-muted-foreground mt-1">{protocol.description}</p>
                    )}
                  </div>
                </div>
                <span className={`text-sm ${categoryColors[protocol.category] || "text-muted-foreground"}`}>
                  [{protocol.category}]
                </span>
              </div>
            </div>
            
            <div className="p-4 text-xs text-muted-foreground flex flex-wrap gap-4">
              {protocol.website && (
                <span>
                  <span className="text-primary">WEBSITE:</span>{" "}
                  <a 
                    href={protocol.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {protocol.website}
                  </a>
                </span>
              )}
              <span>
                <span className="text-primary">CONTRACTS:</span> {totalContracts}
              </span>
              <span>
                <span className="text-primary">CHAINS:</span> {protocol.chains?.length || allContracts.length}
              </span>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="border border-border">
            <div className="border-b border-border p-3">
              <div className="text-xs text-muted-foreground">
                <span className="text-primary">$</span> cat /contracts/{id}
              </div>
            </div>

            {totalContracts === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                <span className="text-primary">&gt;</span> no contract data available yet
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-3 border-b border-border text-xs text-muted-foreground">
                  <div className="col-span-2">CHAIN</div>
                  <div className="col-span-3">NAME</div>
                  <div className="col-span-5">ADDRESS</div>
                  <div className="col-span-2 text-right">ACTIONS</div>
                </div>

                {/* Contracts */}
                {allContracts.map(({ chain, contracts }) =>
                  contracts.map((contract, idx) => (
                    <div
                      key={`${chain}-${idx}`}
                      className="grid grid-cols-12 gap-2 p-3 border-b border-border last:border-0 hover:bg-accent transition-colors text-sm"
                    >
                      <div className="col-span-2">
                        <span className={`${chainColors[chain.toLowerCase()] || "text-muted-foreground"}`}>
                          [{chain.toUpperCase().slice(0, 5)}]
                        </span>
                      </div>
                      <div className="col-span-3 text-foreground truncate">
                        {contract.name || "Contract"}
                      </div>
                      <div className="col-span-5 font-mono text-xs text-muted-foreground truncate">
                        {contract.address}
                      </div>
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => handleCopy(contract.address)}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedAddr === contract.address ? "[copied]" : "[copy]"}
                        </button>
                        {contract.verified && (
                          <span className="ml-2 text-primary text-xs">✓</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* Footer */}
            <div className="border-t border-border p-3 text-xs text-muted-foreground text-center">
              <span className="text-primary">&gt;</span> {totalContracts} contracts across {allContracts.length} chains
            </div>
          </div>

          {/* Back link */}
          <div className="mt-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              &lt; back to protocols
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default ProtocolDetail;
