import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";

const glitchFrames = [
  "ERROR 404",
  "ERR0R 4O4",
  "3RR0R 404",
  "ERROR 4O4",
  "ERR0R 404",
];

const NotFound = () => {
  const location = useLocation();
  const [glitchIndex, setGlitchIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchIndex((prev) => (prev + 1) % glitchFrames.length);
    }, 150);
    
    const timeout = setTimeout(() => clearInterval(interval), 1500);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      <div className="pt-20 pb-12 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="border border-border max-w-2xl mx-auto">
            {/* Terminal header */}
            <div className="border-b border-border p-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-muted" />
                <div className="w-3 h-3 rounded-full bg-muted" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">terminal — error</span>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono space-y-4">
              {/* ASCII art error */}
              <pre className="text-destructive text-xs sm:text-sm leading-tight overflow-x-auto">
{`
 ▄▄▄   ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ 
█   █ █  ▄    █       █
█   █ █ █ █   █   ▄   █
█   █ █ █▄█   █  █ █  █
█   █ █       █  █▄█  █
█   █ █   ▄   █       █
█▄▄▄█ █▄▄█ █▄▄█▄▄▄▄▄▄▄█
`}
              </pre>

              {/* Error message */}
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-destructive">{glitchFrames[glitchIndex]}</span>
                  <span className="text-muted-foreground"> — page not found</span>
                </p>
                <p className="text-muted-foreground">
                  <span className="text-primary">$</span> cat {location.pathname}
                </p>
                <p className="text-destructive">
                  cat: {location.pathname}: No such file or directory
                </p>
              </div>

              {/* Suggested actions */}
              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="text-primary">$</span> suggested actions:
                </p>
                <div className="pl-4 space-y-1">
                  <p>
                    <span className="text-muted-foreground">[1]</span>{" "}
                    <Link to="/" className="text-primary hover:underline">
                      cd /home
                    </Link>
                    <span className="text-muted-foreground"> — return to homepage</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">[2]</span>{" "}
                    <button 
                      onClick={() => window.history.back()} 
                      className="text-primary hover:underline"
                    >
                      cd ..
                    </button>
                    <span className="text-muted-foreground"> — go back</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">[3]</span>{" "}
                    <span className="text-foreground">ctrl+k</span>
                    <span className="text-muted-foreground"> — search protocols</span>
                  </p>
                </div>
              </div>

              {/* Prompt */}
              <div className="pt-4 text-sm">
                <span className="text-primary">$</span>{" "}
                <span className={showCursor ? "opacity-100" : "opacity-0"}>▊</span>
              </div>
            </div>

            {/* Status bar */}
            <div className="border-t border-border p-2 text-xs text-muted-foreground flex justify-between">
              <span>exit code: 404</span>
              <span>███░░░░░░░ lost</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default NotFound;
