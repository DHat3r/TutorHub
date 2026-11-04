import type { LucideIcon } from "lucide-react";

// Tarjeta de estadística con color de fondo según la variante.
const VARIANTS = {
  cyan: "bg-brand-500 text-white",
  navy: "bg-brand-950 text-white",
  amber: "bg-amber-400 text-brand-950",
  teal: "bg-teal-400 text-brand-950",
} as const;

type StatTileProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  variant?: keyof typeof VARIANTS;
};

export default function StatTile({ label, value, icon: Icon, variant = "cyan" }: StatTileProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 shadow-sm ${VARIANTS[variant]}`}>
      {/* Círculo decorativo en la esquina */}
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/15" />
      <Icon className="h-5 w-5 opacity-80" />
      <p className="mt-3 text-3xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}
