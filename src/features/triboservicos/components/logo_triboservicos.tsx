interface LogoTriboServicosProps {
  className?: string;
}

export function LogoTriboServicos({ className }: LogoTriboServicosProps) {
  return (
    <div className={className}>
      <span className="text-foreground font-bold tracking-tight">Tribo</span>
      <span className="text-primary font-bold tracking-tight">Serviços</span>
    </div>
  );
}
