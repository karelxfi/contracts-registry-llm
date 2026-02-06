import { cn } from "@/lib/utils";

interface TerminalSkeletonProps {
  className?: string;
  lines?: number;
}

const TerminalSkeleton = ({ className, lines = 1 }: TerminalSkeletonProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-primary">{">"}</span>
          <div className="flex-1 h-4 bg-muted/50 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

const ProtocolCardSkeleton = () => {
  return (
    <div className="border border-border p-3 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-muted-foreground shrink-0">{">"}</span>
          <div className="h-4 bg-muted/50 w-3/4" />
        </div>
        <div className="h-4 bg-muted/30 w-16" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="h-3 bg-muted/30 w-16" />
        <div className="h-3 bg-muted/30 w-12" />
      </div>
    </div>
  );
};

const ProtocolGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border">
      {Array.from({ length: 12 }).map((_, i) => (
        <ProtocolCardSkeleton key={i} />
      ))}
    </div>
  );
};

const TerminalLoader = ({ text = "loading" }: { text?: string }) => {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <span className="text-primary">$</span>
      <span>{text}</span>
      <span className="inline-flex">
        <span className="animate-[blink_1s_0ms_infinite]">.</span>
        <span className="animate-[blink_1s_200ms_infinite]">.</span>
        <span className="animate-[blink_1s_400ms_infinite]">.</span>
      </span>
      <span className="blink ml-1">_</span>
    </div>
  );
};

export { TerminalSkeleton, ProtocolCardSkeleton, ProtocolGridSkeleton, TerminalLoader };
