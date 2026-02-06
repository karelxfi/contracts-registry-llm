import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import ProtocolHeader from "@/components/protocol/ProtocolHeader";
import ContractTable from "@/components/protocol/ContractTable";
import { fetchProtocol, ProtocolDetail as ProtocolDetailType, Contract } from "@/lib/api";

const ProtocolDetail = () => {
  const { id } = useParams<{ id: string }>();
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

  // Flatten contracts from the contracts object
  const allContracts: { chain: string; contracts: Contract[] }[] = protocol
    ? Object.entries(protocol.contracts || {}).map(([chain, contracts]) => ({
        chain,
        contracts: Array.isArray(contracts) ? contracts : [],
      }))
    : [];

  const totalContracts = allContracts.reduce((sum, c) => sum + c.contracts.length, 0);

  if (loading) {
    return (
      <PageLayout>
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4">
            <div className="border border-border p-8 text-center">
              <p className="text-muted-foreground">
                <span className="text-primary">$</span> loading...
                <span className="blink ml-1">_</span>
              </p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !protocol) {
    return (
      <PageLayout>
        <div className="pt-20 pb-12">
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
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              /protocols
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground">{id}</span>
          </div>

          {/* Protocol Header */}
          <ProtocolHeader
            name={protocol.name}
            category={protocol.category}
            description={protocol.description}
            logo={protocol.logo}
            website={protocol.website}
            totalContracts={totalContracts}
            totalChains={protocol.chains?.length || allContracts.length}
          />

          {/* Contracts Table */}
          <ContractTable protocolId={id || ""} contracts={allContracts} />

          {/* Back link */}
          <div className="mt-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              &lt; back to protocols
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProtocolDetail;
