interface Props {
  count: number;
  className?: string;
}

export function BadgeNaoLidas({ count, className }: Props) {
  if (count <= 0) return null;
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-none ${className ?? ""}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
