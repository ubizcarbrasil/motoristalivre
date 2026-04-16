export function IndicadorDigitando() {
  return (
    <div className="flex justify-start">
      <div className="bg-[#1c1c1c] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
      </div>
    </div>
  );
}
