import Link from "next/link";
import Logo from "@/components/brand/Logo";

// Pantalla de login y registro en dos columnas: panel de marca azul marino a la izquierda
// (se oculta en móvil) y el formulario a la derecha.
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <Link href="/" className="relative">
          <Logo />
        </Link>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            Tu próxima prueba,
            <br />
            <span className="text-brand-400">con alguien que ya la dio.</span>
          </h2>
          <div className="mt-8 flex gap-2">
            <span className="h-2 w-10 rounded-full bg-brand-500" />
            <span className="h-2 w-6 rounded-full bg-amber-400" />
            <span className="h-2 w-4 rounded-full bg-teal-400" />
            <span className="h-2 w-3 rounded-full bg-rose-400" />
          </div>
        </div>
        <p className="relative text-sm text-white/50">© 2026 TutorHub</p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo tone="dark" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-brand-950">{title}</h1>
          <p className="mt-1 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
