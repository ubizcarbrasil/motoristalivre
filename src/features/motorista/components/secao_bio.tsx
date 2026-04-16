interface Props {
  bio: string | null;
}

export function SecaoBio({ bio }: Props) {
  if (!bio) return null;

  return (
    <div className="px-6">
      <h2 className="text-sm font-semibold text-foreground mb-2">Sobre</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
    </div>
  );
}
