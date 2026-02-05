import { Search } from "lucide-react";

interface HeaderProps {
  onSearchClick: () => void;
}

const Header = ({ onSearchClick }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:text-primary transition-colors">
          <span className="text-primary">[</span>
          <span className="font-bold">ADDYBOOK</span>
          <span className="text-primary">]</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#protocols" className="hover:text-foreground transition-colors">/protocols</a>
          <a href="https://addybook.apidocumentation.com/addybook-api" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">/api-docs</a>
        </nav>

        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">[ctrl+k]</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
