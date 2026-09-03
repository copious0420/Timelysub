import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "size-7",
  md: "size-8",
  lg: "size-10",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <img
      src="/timely-logo.png"
      alt="Timely schedule calendar"
      className={cn(
        "block shrink-0 object-contain",
        sizes[size],
        className,
      )}
    />
  );
}
