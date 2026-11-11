import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Encabezado común de las páginas internas: título, bajada opcional, flecha para volver
// (a una ruta fija con backHref, o al historial con onBack) y acciones a la derecha.
// Es el mismo formato de los dashboards, así todas las páginas se ven iguales sin repetir clases.
type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  actions?: ReactNode;
};

export default function PageHeader({ title, description, backHref, onBack, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-2">
        {backHref && (
          <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
            <Link href={backHref} aria-label="Volver">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        {!backHref && onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Volver" className="mt-0.5 shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-brand-950 dark:text-white">{title}</h1>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
