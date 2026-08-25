import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "size-7 text-[0.45rem] gap-px rounded-md p-0.5",
  md: "size-8 text-[0.55rem] gap-px rounded-lg p-0.5",
  lg: "size-10 text-[0.65rem] gap-1 rounded-xl p-1",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center bg-primary text-primary-foreground shadow-glow",
        sizes[size],
        className,
      )}
      aria-label="Timely logo"
    >
      {/* Tiny tick-table: 3 columns x 3 rows */}
      <div className="grid w-full grid-cols-3 grid-rows-3 gap-px">
        <span className="flex items-center justify-center border-b border-r border-primary-foreground/30">✓</span>
        <span className="flex items-center justify-center border-b border-r border-primary-foreground/30">✓</span>
        <span className="flex items-center justify-center border-b border-primary-foreground/30">·</span>
        <span className="flex items-center justify-center border-b border-r border-primary-foreground/30">·</span>
        <span className="flex items-center justify-center border-b border-r border-primary-foreground/30">✓</span>
        <span className="flex items-center justify-center border-b border-primary-foreground/30">✓</span>
        <span className="flex items-center justify-center border-r border-primary-foreground/30">✓</span>
        <span className="flex items-center justify-center border-r border-primary-foreground/30">·</span>
        <span className="flex items-center justify-center">✓</span>
      </div>
    </div>
  );
}
