export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden">
        <img src="/logo.png" alt="VibeNests" className="h-full w-full object-contain" />
      </div>
      <div className="leading-tight">
        <div className="font-display text-xl font-semibold tracking-[0.18em] text-gradient-gold">
          VIBENESTS
        </div>
        <div className="text-[10px] tracking-[0.35em] text-muted-foreground uppercase">
          Private Luxury Suites
        </div>
      </div>
    </div>
  );
}
