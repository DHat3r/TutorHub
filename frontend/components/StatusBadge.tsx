// Etiqueta de estado con un color por estado, en vez de mostrar "PENDING" o "CONFIRMED" en crudo.
// Un solo lugar para los textos y colores: si se agrega un estado, se cambia solo aquí.
const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "bg-teal-100 text-teal-800 ring-teal-200" },
  PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-800 ring-amber-200" },
  CONFIRMED: { label: "Confirmada", className: "bg-brand-100 text-brand-800 ring-brand-200" },
  CANCELLED: { label: "Cancelada", className: "bg-rose-100 text-rose-800 ring-rose-200" },
};

export default function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? { label: status, className: "bg-slate-100 text-slate-700 ring-slate-200" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.className} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {style.label}
    </span>
  );
}
