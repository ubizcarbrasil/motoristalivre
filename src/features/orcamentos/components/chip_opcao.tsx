import { cn } from "@/lib/utils";

interface Props {
  rotulo: string;
  ativo?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChipOpcao({ rotulo, ativo = false, onClick, disabled, className }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all",
        "active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100",
        ativo
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border bg-card text-foreground/80 hover:border-primary/50",
        className,
      )}
    >
      {rotulo}
    </button>
  );
}
