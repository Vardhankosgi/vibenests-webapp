import { useState } from "react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dataByMonth: Record<string, { name: string; bookings: number; revenue: string; occupancy: number }[]> = {
  Jan: [
    { name: "Royal Celebration Suite", bookings: 32, revenue: "₹1,60,000", occupancy: 78 },
    { name: "Starlight Romance Suite", bookings: 24, revenue: "₹1,20,000", occupancy: 65 },
    { name: "Garden Bliss Suite", bookings: 18, revenue: "₹72,000", occupancy: 52 },
    { name: "Midnight Luxe Suite", bookings: 14, revenue: "₹56,000", occupancy: 40 },
  ],
  Feb: [
    { name: "Starlight Romance Suite", bookings: 38, revenue: "₹1,90,000", occupancy: 85 },
    { name: "Royal Celebration Suite", bookings: 30, revenue: "₹1,50,000", occupancy: 72 },
    { name: "Midnight Luxe Suite", bookings: 20, revenue: "₹80,000", occupancy: 58 },
    { name: "Garden Bliss Suite", bookings: 15, revenue: "₹60,000", occupancy: 44 },
  ],
  Mar: [
    { name: "Royal Celebration Suite", bookings: 40, revenue: "₹2,00,000", occupancy: 88 },
    { name: "Garden Bliss Suite", bookings: 28, revenue: "₹1,12,000", occupancy: 70 },
    { name: "Starlight Romance Suite", bookings: 22, revenue: "₹1,10,000", occupancy: 60 },
    { name: "Midnight Luxe Suite", bookings: 16, revenue: "₹64,000", occupancy: 45 },
  ],
  Apr: [
    { name: "Midnight Luxe Suite", bookings: 35, revenue: "₹1,40,000", occupancy: 80 },
    { name: "Royal Celebration Suite", bookings: 29, revenue: "₹1,45,000", occupancy: 68 },
    { name: "Starlight Romance Suite", bookings: 25, revenue: "₹1,25,000", occupancy: 62 },
    { name: "Garden Bliss Suite", bookings: 19, revenue: "₹76,000", occupancy: 50 },
  ],
  May: [
    { name: "Royal Celebration Suite", bookings: 48, revenue: "₹2,40,000", occupancy: 92 },
    { name: "Starlight Romance Suite", bookings: 36, revenue: "₹1,80,000", occupancy: 78 },
    { name: "Garden Bliss Suite", bookings: 29, revenue: "₹1,16,000", occupancy: 65 },
    { name: "Midnight Luxe Suite", bookings: 22, revenue: "₹88,000", occupancy: 54 },
  ],
  Jun: [
    { name: "Garden Bliss Suite", bookings: 42, revenue: "₹1,68,000", occupancy: 90 },
    { name: "Royal Celebration Suite", bookings: 38, revenue: "₹1,90,000", occupancy: 82 },
    { name: "Midnight Luxe Suite", bookings: 27, revenue: "₹1,08,000", occupancy: 66 },
    { name: "Starlight Romance Suite", bookings: 21, revenue: "₹1,05,000", occupancy: 55 },
  ],
  Jul: [
    { name: "Starlight Romance Suite", bookings: 44, revenue: "₹2,20,000", occupancy: 91 },
    { name: "Royal Celebration Suite", bookings: 36, revenue: "₹1,80,000", occupancy: 80 },
    { name: "Garden Bliss Suite", bookings: 26, revenue: "₹1,04,000", occupancy: 63 },
    { name: "Midnight Luxe Suite", bookings: 18, revenue: "₹72,000", occupancy: 48 },
  ],
  Aug: [
    { name: "Royal Celebration Suite", bookings: 50, revenue: "₹2,50,000", occupancy: 95 },
    { name: "Midnight Luxe Suite", bookings: 33, revenue: "₹1,32,000", occupancy: 75 },
    { name: "Starlight Romance Suite", bookings: 28, revenue: "₹1,40,000", occupancy: 68 },
    { name: "Garden Bliss Suite", bookings: 20, revenue: "₹80,000", occupancy: 52 },
  ],
  Sep: [
    { name: "Garden Bliss Suite", bookings: 38, revenue: "₹1,52,000", occupancy: 84 },
    { name: "Royal Celebration Suite", bookings: 34, revenue: "₹1,70,000", occupancy: 76 },
    { name: "Starlight Romance Suite", bookings: 26, revenue: "₹1,30,000", occupancy: 64 },
    { name: "Midnight Luxe Suite", bookings: 19, revenue: "₹76,000", occupancy: 50 },
  ],
  Oct: [
    { name: "Midnight Luxe Suite", bookings: 45, revenue: "₹1,80,000", occupancy: 93 },
    { name: "Royal Celebration Suite", bookings: 40, revenue: "₹2,00,000", occupancy: 86 },
    { name: "Garden Bliss Suite", bookings: 30, revenue: "₹1,20,000", occupancy: 70 },
    { name: "Starlight Romance Suite", bookings: 23, revenue: "₹1,15,000", occupancy: 58 },
  ],
  Nov: [
    { name: "Royal Celebration Suite", bookings: 46, revenue: "₹2,30,000", occupancy: 90 },
    { name: "Starlight Romance Suite", bookings: 35, revenue: "₹1,75,000", occupancy: 77 },
    { name: "Midnight Luxe Suite", bookings: 28, revenue: "₹1,12,000", occupancy: 67 },
    { name: "Garden Bliss Suite", bookings: 22, revenue: "₹88,000", occupancy: 55 },
  ],
  Dec: [
    { name: "Royal Celebration Suite", bookings: 55, revenue: "₹2,75,000", occupancy: 98 },
    { name: "Starlight Romance Suite", bookings: 42, revenue: "₹2,10,000", occupancy: 88 },
    { name: "Midnight Luxe Suite", bookings: 34, revenue: "₹1,36,000", occupancy: 78 },
    { name: "Garden Bliss Suite", bookings: 27, revenue: "₹1,08,000", occupancy: 65 },
  ],
};

export function TopSuites() {
  const currentMonth = months[new Date().getMonth()];
  const [selected, setSelected] = useState(currentMonth);
  const suites = dataByMonth[selected];

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium text-foreground">Top Performing Suites</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="luxury-input rounded-lg px-3 py-1.5 text-xs text-foreground bg-transparent cursor-pointer"
        >
          {months.map((m) => (
            <option key={m} value={m} className="bg-[oklch(0.13_0.025_260)]">{m}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {suites.map((suite, i) => (
          <div key={suite.name} className="flex items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{suite.name}</p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06]">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                  style={{ width: `${suite.occupancy}%` }}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gold font-medium">{suite.revenue}</p>
              <p className="text-[11px] text-muted-foreground">{suite.bookings} bookings</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
