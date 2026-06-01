import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: LucideIcon;
  onClick?: () => void;
}

export function StatsCard({ title, value, change, positive = true, icon: Icon, onClick }: StatsCardProps) {
  return (
    <div
      className={`glass-card rounded-2xl p-5 flex items-start justify-between gap-4 ${onClick ? "cursor-pointer hover:border-[var(--gold)]/40 transition" : ""}`}
      onClick={onClick}
    >
      <div>
        <p className="text-xs text-muted-foreground tracking-wide uppercase">{title}</p>
        <p className="font-display text-3xl font-semibold text-foreground mt-1">{value}</p>
        <p className={`text-xs mt-2 ${positive ? "text-emerald-400" : "text-destructive"}`}>
          {change} vs last month
        </p>
      </div>
      <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-gold" />
      </div>
    </div>
  );
}
