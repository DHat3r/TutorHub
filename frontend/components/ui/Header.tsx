"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (pathname.startsWith('/verify') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "?";
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full bg-brand-950 text-white shadow-md">
        <div className="container flex h-16 items-center">
          <Link href="/" className="text-xl font-bold tracking-tight cursor-default select-none">
            Tutor<span className="text-brand-400">Hub</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link
              href="/login"
              className={`text-sm font-medium ${pathname === '/login' ? 'text-white' : 'text-white/60'} hover:text-white`}
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className={`text-sm font-medium ${pathname === '/register' ? 'text-white' : 'text-white/60'} hover:text-white`}
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  const isTutor = user.role === 'TUTOR' || user.role === 'BOTH';
  const isStudent = user.role === 'STUDENT' || user.role === 'BOTH';

  const dashboardHref = isTutor ? "/dashboard/tutor" : "/dashboard/student";
  const profileHref = isTutor ? "/profile/tutor" : "/profile/student";

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-950 text-white shadow-md">
      <div className="container flex h-16 items-center">
        <Link href="/" className="text-xl font-bold tracking-tight cursor-default select-none">
          Tutor<span className="text-brand-400">Hub</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href="/tutoring"
            className={`text-sm font-medium ${pathname === '/tutoring' ? 'text-white' : 'text-white/60'} hover:text-white`}
          >
            Explorar
          </Link>
          <Link
            href="/calendar"
            className={`text-sm font-medium ${pathname === '/calendar' ? 'text-white' : 'text-white/60'} hover:text-white`}
          >
            Calendario
          </Link>
          <Link
            href={dashboardHref}
            className={`text-sm font-medium ${pathname.startsWith('/dashboard') ? 'text-white' : 'text-white/60'} hover:text-white`}
          >
            Mi Dashboard
          </Link>
          <Link
            href={profileHref}
            className={`text-sm font-medium ${pathname.startsWith('/profile') ? 'text-white' : 'text-white/60'} hover:text-white`}
          >
            Mi Perfil
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photo_url || undefined} alt={user.full_name} />
                  <AvatarFallback className="bg-brand-500 text-white">{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
