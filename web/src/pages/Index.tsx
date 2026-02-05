import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchModal from "@/components/SearchModal";
import ProtocolGrid from "@/components/ProtocolGrid";
import Footer from "@/components/Footer";

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onSearchClick={() => setSearchOpen(true)} />
      <main>
        <Hero />
        <ProtocolGrid onSearchClick={() => setSearchOpen(true)} />
      </main>
      <Footer />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default Index;
