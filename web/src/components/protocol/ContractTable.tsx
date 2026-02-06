import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Contract } from "@/lib/api";

interface ContractTableProps {
  protocolId: string;
  contracts: { chain: string; contracts: Contract[] }[];
}

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

const ContractTable = ({ protocolId, contracts }: ContractTableProps) => {
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    toast({
      title: "Address copied",
      description: address.slice(0, 10) + "..." + address.slice(-8),
    });
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const totalContracts = contracts.reduce((sum, c) => sum + c.contracts.length, 0);

  return (
    <div className="border border-border">
      <div className="border-b border-border p-3">
        <div className="text-xs text-muted-foreground">
          <span className="text-primary">$</span> cat /contracts/{protocolId}
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

          {/* Contract Rows */}
          {contracts.map(({ chain, contracts: chainContracts }) =>
            chainContracts.map((contract, idx) => (
              <div
                key={`${chain}-${idx}`}
                className="grid grid-cols-12 gap-2 p-3 border-b border-border last:border-0 hover:bg-accent transition-colors text-sm"
              >
                <div className="col-span-2">
                  <span
                    className={`${chainColors[chain.toLowerCase()] || "text-muted-foreground"}`}
                  >
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
        <span className="text-primary">&gt;</span> {totalContracts} contracts across{" "}
        {contracts.length} chains
      </div>
    </div>
  );
};

export default ContractTable;
