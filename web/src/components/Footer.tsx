const Footer = () => {
  return (
    <footer className="border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            <span className="text-primary">[</span>ADDYBOOK<span className="text-primary">]</span>
            <span className="mx-2">|</span>
            DeFi Contract Registry
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">/github</a>
            <a href="#" className="hover:text-foreground transition-colors">/docs</a>
            <a href="#" className="hover:text-foreground transition-colors">/api</a>
          </div>

          <div className="text-muted-foreground">
            v0.1.0 | MIT
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border text-center text-[10px] text-muted-foreground">
          ████████████████████████████████████████
        </div>
      </div>
    </footer>
  );
};

export default Footer;
