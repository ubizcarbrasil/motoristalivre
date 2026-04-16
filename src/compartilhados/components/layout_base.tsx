import type { ReactNode } from "react";

interface LayoutBaseProps {
  children: ReactNode;
}

export function LayoutBase({ children }: LayoutBaseProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">{children}</main>
    </div>
  );
}
