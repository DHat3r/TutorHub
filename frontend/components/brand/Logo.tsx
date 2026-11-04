// Logo de TutorHub: un nodo central (el tutor) conectado a tres nodos de colores
// (los estudiantes). Es la idea de "hub" dibujada en SVG, sin imágenes externas.
type LogoProps = {
  className?: string;
  /** "light" para fondos oscuros (texto blanco), "dark" para fondos claros. */
  tone?: "light" | "dark";
  showText?: boolean;
};

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#0EA5DB" />
      <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round">
        <line x1="20" y1="21" x2="20" y2="9.5" />
        <line x1="20" y1="21" x2="10" y2="28" />
        <line x1="20" y1="21" x2="30" y2="28" />
      </g>
      <circle cx="20" cy="9" r="4" fill="#FBBF24" />
      <circle cx="9.5" cy="28.5" r="4" fill="#2DD4BF" />
      <circle cx="30.5" cy="28.5" r="4" fill="#FB7185" />
      <circle cx="20" cy="21" r="5.5" fill="#071C33" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

export default function Logo({ className = "", tone = "light", showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark />
      {showText && (
        <span className={`text-xl font-bold tracking-tight ${tone === "light" ? "text-white" : "text-brand-950"}`}>
          Tutor<span className="text-brand-400">Hub</span>
        </span>
      )}
    </span>
  );
}
