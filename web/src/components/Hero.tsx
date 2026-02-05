import { useState, useEffect } from "react";
import { fetchMetadata } from "@/lib/api";

const asciiLogo = `
    ___    ____  ____  __  ______  ____  ____  __ __
   /   |  / __ \\/ __ \\/ / / / __ )/ __ \\/ __ \\/ //_/
  / /| | / / / / / / / / / / __  / / / / / / / ,<   
 / ___ |/ /_/ / /_/ / /_/ / /_/ / /_/ / /_/ / /| |  
/_/  |_/_____/_____/\\____/_____/\\____/\\____/_/ |_|  
`;

const Hero = () => {
  const [stats, setStats] = useState({
    totalProtocols: 0,
    totalChains: 0,
    populatedProtocols: 0,
  });

  useEffect(() => {
    fetchMetadata()
      .then((data) => {
        setStats({
          totalProtocols: data.stats.totalProtocols,
          totalChains: data.stats.totalChains,
          populatedProtocols: data.stats.populatedProtocols,
        });
      })
      .catch(console.error);
  }, []);

  return (
    <section className="pt-20 pb-8 border-b border-border">
      <div className="container mx-auto px-4">
        <pre className="text-primary text-[8px] sm:text-[10px] md:text-xs leading-tight overflow-x-auto">
          {asciiLogo}
        </pre>
        
        <div className="mt-6 max-w-2xl">
          <p className="text-muted-foreground text-sm">
            <span className="text-primary">$</span> DeFi contract registry
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="text-primary">$</span>{" "}
            {stats.totalProtocols.toLocaleString()} protocols |{" "}
            {stats.populatedProtocols} with contracts |{" "}
            {stats.totalChains} chains
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
          <span className="text-primary">STATUS:</span> ONLINE
          <span className="inline-block w-2 h-2 bg-primary ml-2 blink"></span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
