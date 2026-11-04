"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, CalendarCheck, LayoutDashboard, ShieldCheck, Star, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { LogoMark } from "@/components/brand/Logo";

// Landing de TutorHub. Reemplaza el hero celeste de LinkUDP por uno azul marino
// con una ilustración del "hub" (un tutor conectado a varios estudiantes).

const STEPS = [
  { icon: UserPlus, title: "Crea tu cuenta", text: "Regístrate como estudiante, tutor o ambos.", color: "bg-brand-500" },
  { icon: BookOpen, title: "Encuentra tu ramo", text: "Busca tutorías por ramo y revisa el perfil del tutor.", color: "bg-amber-400" },
  { icon: CalendarCheck, title: "Reserva tu hora", text: "El tutor confirma y la sesión queda en tu calendario.", color: "bg-teal-400" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "Cuentas verificadas", text: "Cada cuenta confirma su correo antes de entrar." },
  { icon: CalendarCheck, title: "Horarios a tu medida", text: "Los tutores publican su disponibilidad y tú eliges el bloque." },
  { icon: Star, title: "Calificaciones", text: "Después de cada sesión, estudiante y tutor se califican." },
];

function HubIllustration() {
  // Nodos alrededor de un centro, unidos por líneas: la misma idea del logo, en grande.
  const nodes = [
    { x: 60, y: 60, c: "#FBBF24", label: "Cálculo" },
    { x: 300, y: 50, c: "#2DD4BF", label: "Programación" },
    { x: 330, y: 230, c: "#FB7185", label: "Física" },
    { x: 50, y: 250, c: "#33B8E6", label: "Álgebra" },
  ];
  return (
    <svg viewBox="0 0 380 300" className="w-full max-w-md" aria-hidden="true">
      {nodes.map((n) => (
        <line key={n.label} x1="190" y1="150" x2={n.x} y2={n.y} stroke="#33B8E6" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="6 6" />
      ))}
      {nodes.map((n) => (
        <g key={`${n.label}-node`}>
          <circle cx={n.x} cy={n.y} r="26" fill={n.c} />
          <text x={n.x} y={n.y + 46} textAnchor="middle" fontSize="13" fill="#FFFFFF" fillOpacity="0.75">
            {n.label}
          </text>
        </g>
      ))}
      <circle cx="190" cy="150" r="58" fill="#0EA5DB" fillOpacity="0.15" />
      <circle cx="190" cy="150" r="40" fill="#0EA5DB" />
      <text x="190" y="156" textAnchor="middle" fontSize="16" fontWeight="700" fill="#FFFFFF">
        Tutor
      </text>
    </svg>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const dashboardHref = user ? (user.role === "STUDENT" ? "/dashboard/student" : "/dashboard/tutor") : "/login";

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-950 text-white">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="container relative grid items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-200">
                <span className="h-2 w-2 rounded-full bg-teal-400" /> Tutorías entre estudiantes
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Aprende con quien ya <span className="text-brand-400">aprobó el ramo</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-white/70">
                TutorHub conecta a estudiantes con tutores de su misma universidad. Busca un ramo, reserva una hora y
                prepárate para la prueba.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {!loading &&
                  (user ? (
                    <Link
                      href={dashboardHref}
                      className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 font-semibold hover:bg-brand-400"
                    >
                      Ir a mi inicio <LayoutDashboard className="ml-2 h-5 w-5" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="inline-flex items-center rounded-full bg-brand-500 px-6 py-3 font-semibold hover:bg-brand-400"
                      >
                        Crear cuenta gratis <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 font-semibold text-white/90 hover:bg-white/10"
                      >
                        Ya tengo cuenta
                      </Link>
                    </>
                  ))}
              </div>
            </div>
            <div className="flex justify-center">
              <HubIllustration />
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-brand-950 md:text-4xl">Así funciona</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text, color }, i) => (
                <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">Paso {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brand-950">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="pb-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 rounded-3xl bg-brand-950 p-8 text-white md:grid-cols-3 md:p-12">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="h-7 w-7 text-brand-400" />
                  <h3 className="mt-3 text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-white/65">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container flex items-center justify-between px-4 text-sm text-muted-foreground md:px-6">
          <span className="inline-flex items-center gap-2">
            <LogoMark className="h-6 w-6" /> TutorHub
          </span>
          <span>© 2026 TutorHub</span>
        </div>
      </footer>
    </div>
  );
}
