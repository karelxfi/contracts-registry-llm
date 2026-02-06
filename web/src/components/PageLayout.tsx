import { useState, useEffect, ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onSearchClick={() => setSearchOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default PageLayout;
