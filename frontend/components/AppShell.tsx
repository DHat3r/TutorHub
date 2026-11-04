"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import { useAuth, type User } from "@/hooks/use-auth";

// Estructura de la app. Con sesión: barra lateral azul marino (en móvil, un menú desplegable).
// Sin sesión: barra superior simple. En las páginas de login y verificación no hay navegación.
// Reemplaza al Header de LinkUDP, que era una barra superior con enlaces de texto.

const AUTH_PAGES = ["/login", "/register", "/verify", "/verify-email-pending", "/reset-password"];

type NavItem = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

function navItemsFor(user: User): NavItem[] {
  const isTutor = user.role === "TUTOR" || user.role === "BOTH";
  const dashboard = isTutor ? "/dashboard/tutor" : "/dashboard/student";
  const profile = isTutor ? "/profile/tutor" : "/profile/student";

  const items: NavItem[] = [
    { href: dashboard, label: "Inicio", icon: LayoutDashboard, match: (p) => p.startsWith("/dashboard") },
    { href: "/tutoring", label: "Explorar tutorías", icon: Search, match: (p) => p === "/tutoring" || /^\/tutoring\/\d+/.test(p) },
    { href: "/calendar", label: "Calendario", icon: CalendarDays, match: (p) => p.startsWith("/calendar") },
  ];
  if (isTutor) {
    items.push(
      { href: "/tutoring/create", label: "Crear tutoría", icon: PlusCircle, match: (p) => p === "/tutoring/create" },
      { href: "/availability/tutor", label: "Disponibilidad", icon: Clock, match: (p) => p.startsWith("/availability") },
    );
  }
  items.push({ href: profile, label: "Mi perfil", icon: UserRound, match: (p) => p.startsWith("/profile") });
  return items;
}

const initials = (name?: string) =>
  (name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

function SidebarContent({ user, pathname, onLogout }: { user: User; pathname: string; onLogout: () => void }) {
  return (
    <div className="flex h-full flex-col bg-brand-950 text-white">
      <div className="px-6 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItemsFor(user).map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-brand-500 text-white shadow-sm" : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.photo_url || undefined} alt={user.full_name} />
            <AvatarFallback className="bg-brand-500 text-white">{initials(user.full_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.full_name}</p>
            <p className="truncate text-xs text-white/50">{user.role === "STUDENT" ? "Estudiante" : "Tutor"}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-950/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="ml-auto flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white">
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400"
          >
            Crear cuenta
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) return <>{children}</>;
  if (loading) return <>{children}</>;

  if (!user) {
    return (
      <>
        <PublicHeader />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Escritorio: barra lateral fija */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent user={user} pathname={pathname} onLogout={logout} />
      </aside>

      {/* Móvil: barra superior con menú desplegable */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-brand-950 px-4 lg:hidden">
        <Link href="/">
          <Logo />
        </Link>
        <Sheet>
          <SheetTrigger className="rounded-lg p-2 text-white hover:bg-white/10" aria-label="Abrir menú">
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-none p-0">
            <SheetTitle className="sr-only">Menú</SheetTitle>
            <SidebarContent user={user} pathname={pathname} onLogout={logout} />
          </SheetContent>
        </Sheet>
      </header>

      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
