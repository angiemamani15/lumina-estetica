
import { useState } from "react";
import Login from "./Login";
import Clientes from "./pages/Clientes";
import Servicios from "./pages/Servicios";
import Turnos from "./pages/Turnos";
import Ventas from "./pages/Ventas";

type Pagina =
  | "inicio"
  | "clientes"
  | "turnos"
  | "servicios"
  | "ventas";

type Seccion = {
  id: Exclude<Pagina, "inicio">;
  titulo: string;
  descripcion: string;
  icono: string;
};

const secciones: Seccion[] = [
  {
    id: "clientes",
    titulo: "Clientes",
    descripcion: "Administrá la información de tus clientes.",
    icono: "👥",
  },
  {
    id: "turnos",
    titulo: "Turnos",
    descripcion: "Organizá las citas y los horarios.",
    icono: "📅",
  },
  {
    id: "servicios",
    titulo: "Servicios",
    descripcion: "Gestioná tratamientos y precios.",
    icono: "✨",
  },
  {
    id: "ventas",
    titulo: "Ventas",
    descripcion: "Registrá pagos y controlá tus ingresos.",
    icono: "💳",
  },
];

function App() {
  const [logueada, setLogueada] = useState(false);
  const [pagina, setPagina] = useState<Pagina>("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const navegar = (destino: Pagina) => {
    setPagina(destino);
    setMenuAbierto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cerrarSesion = () => {
    setLogueada(false);
    setPagina("inicio");
    setMenuAbierto(false);
  };

  if (!logueada) {
    return <Login onLogin={() => setLogueada(true)} />;
  }

  const contenido = () => {
    switch (pagina) {
      case "clientes":
        return <Clientes />;
      case "turnos":
        return <Turnos />;
      case "servicios":
        return <Servicios />;
      case "ventas":
        return <Ventas />;
      default:
        return null;
    }
  };

  const tituloActual =
    pagina === "inicio"
      ? "Panel principal"
      : secciones.find((seccion) => seccion.id === pagina)
          ?.titulo || "Panel principal";

  return (
    <div className="min-h-screen bg-[#F7F2EC] text-[#493326]">
      {/* FONDO DEL MENÚ EN CELULARES */}
      {menuAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* MENÚ LATERAL */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-[#E8D9CA]
          bg-[#493326] text-[#F8EDE0]
          shadow-2xl transition-transform duration-300
          lg:translate-x-0
          ${
            menuAbierto
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO PERSONALIZADO */}
        <div className="border-b border-white/10 px-6 py-7">
          <button
            type="button"
            onClick={() => navegar("inicio")}
            className="flex w-full items-center gap-3 text-left"
            aria-label="Ir al inicio de Lúmina Estética"
          >
            <img
              src="/log.jpg"
              alt="Logo de Lúmina Estética"
              className="h-16 w-16 shrink-0 rounded-2xl border border-[#D8B89C]/50 bg-[#F8EDE0] object-contain shadow-md"
            />

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-wide">
                Lúmina
              </h1>

              <p className="text-xs uppercase tracking-[0.2em] text-[#D8B89C]">
                Estética
              </p>
            </div>
          </button>

          <p className="mt-5 text-xs tracking-wide text-[#D8B89C]">
            SISTEMA DE GESTIÓN
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <nav
          aria-label="Navegación principal"
          className="flex-1 space-y-2 overflow-y-auto px-4 py-6"
        >
          <p className="mb-4 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#C9AC95]">
            Administración
          </p>

          <button
            type="button"
            onClick={() => navegar("inicio")}
            aria-current={
              pagina === "inicio" ? "page" : undefined
            }
            className={`
              flex w-full items-center gap-4 rounded-xl
              px-4 py-3 text-left font-medium transition
              ${
                pagina === "inicio"
                  ? "bg-[#D8B89C] text-[#493326] shadow-md"
                  : "text-[#F8EDE0] hover:bg-white/10"
              }
            `}
          >
            <span className="text-xl">⌂</span>
            <span>Inicio</span>
          </button>

          {secciones.map((seccion) => (
            <button
              key={seccion.id}
              type="button"
              onClick={() => navegar(seccion.id)}
              aria-current={
                pagina === seccion.id ? "page" : undefined
              }
              className={`
                flex w-full items-center gap-4 rounded-xl
                px-4 py-3 text-left font-medium transition
                ${
                  pagina === seccion.id
                    ? "bg-[#D8B89C] text-[#493326] shadow-md"
                    : "text-[#F8EDE0] hover:bg-white/10"
                }
              `}
            >
              <span className="text-xl">
                {seccion.icono}
              </span>

              <span>{seccion.titulo}</span>
            </button>
          ))}
        </nav>

        {/* ADMINISTRADORA */}
        <div className="border-t border-white/10 p-5">
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8B89C] font-bold text-[#493326]">
              A
            </div>

            <div>
              <p className="text-sm font-semibold">
                Administradora
              </p>

              <p className="text-xs text-[#D8B89C]">
                Panel de control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="w-full rounded-xl border border-[#D8B89C]/50 px-4 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            ↪ Cerrar sesión
          </button>

          <p className="mt-5 text-center text-xs text-[#C9AC95]">
            © 2026 Lúmina Estética
          </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <div className="min-h-screen min-w-0 lg:ml-72">
        {/* ENCABEZADO */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E8D9CA] bg-[#FDFBF8]/95 px-4 shadow-sm backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="rounded-xl border border-[#E8D9CA] bg-white px-3 py-2 text-2xl lg:hidden"
            >
              ☰
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-[#A98B76]">
                Lúmina Estética
              </p>

              <h2 className="text-lg font-bold sm:text-xl">
                {tituloActual}
              </h2>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-sm text-[#795548]">
              Panel de administración
            </span>
          </div>
        </header>

        {/* INICIO */}
        {pagina === "inicio" ? (
          <main>
            {/* VIDEO DE FONDO */}
            <section className="relative flex min-h-[520px] items-center overflow-hidden bg-[#493326] sm:min-h-[600px]">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source
                  src="/fondo.mp4"
                  type="video/mp4"
                />
              </video>

              <div className="absolute inset-0 bg-gradient-to-r from-[#24140D]/85 via-[#493326]/55 to-[#493326]/15" />

              <div className="relative z-10 w-full px-6 py-20 sm:px-12 lg:px-16">
                <div className="max-w-2xl">
                  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[#F8EDE0] backdrop-blur-md">
                    ✦ Bienvenida a Lúmina
                  </span>

                  <h1 className="mt-7 text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
                    La belleza de
                    <span className="block font-semibold text-[#E8C9AE]">
                      tener todo
                    </span>
                    organizado.
                  </h1>

                  <p className="mt-6 max-w-lg text-base leading-relaxed text-[#F4E8DC] sm:text-lg">
                    Un espacio pensado para gestionar
                    clientes, turnos, servicios y ventas
                    de manera simple y elegante.
                  </p>

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => navegar("turnos")}
                      className="rounded-xl bg-[#D8B89C] px-7 py-4 font-semibold text-[#493326] shadow-lg transition hover:-translate-y-1 hover:bg-[#F8EDE0]"
                    >
                      Ver turnos →
                    </button>

                    <button
                      type="button"
                      onClick={() => navegar("clientes")}
                      className="rounded-xl border border-white/50 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                    >
                      Gestionar clientes
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ACCESOS RÁPIDOS */}
            <section className="px-5 py-12 sm:px-8 lg:px-12">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A98B76]">
                  Panel de administración
                </p>

                <h2 className="mt-3 text-2xl font-semibold text-[#493326] sm:text-3xl">
                  Accesos rápidos
                </h2>

                <p className="mt-3 text-sm text-[#806D60] sm:text-base">
                  Seleccioná una sección para comenzar a trabajar.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {secciones.map((seccion) => (
                  <button
                    key={seccion.id}
                    type="button"
                    onClick={() => navegar(seccion.id)}
                    className="group flex min-h-52 flex-col rounded-2xl border border-[#E8D9CA] bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#D8B89C] hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4E9DF] text-2xl">
                      {seccion.icono}
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#493326]">
                      {seccion.titulo}
                    </h3>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#806D60]">
                      {seccion.descripcion}
                    </p>

                    <span className="mt-5 self-end text-xl font-bold text-[#A77C60] transition group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="mx-5 mb-12 rounded-2xl border border-[#E8D9CA] bg-[#EEE2D6] p-6 sm:mx-8 sm:p-8 lg:mx-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#A77C60]">
                Lúmina Estética
              </p>

              <h3 className="mt-2 text-xl font-semibold text-[#493326]">
                Todo tu negocio en un solo lugar.
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#795548]">
                Organizá tu trabajo diario desde un sistema
                diseñado para facilitar la administración
                de tu centro de estética.
              </p>
            </section>
          </main>
        ) : (
          /* PANTALLAS INTERNAS */
          <main className="min-h-[calc(100vh-80px)] bg-[#F7F2EC] px-3 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#A98B76]">
                  Administración
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#493326]">
                  {tituloActual}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navegar("inicio")}
                className="rounded-xl border border-[#D8B89C] bg-white px-5 py-3 text-sm font-semibold text-[#493326] shadow-sm transition hover:bg-[#EEE2D6]"
              >
                ← Volver al inicio
              </button>
            </div>

            <div className="min-w-0">
              {contenido()}
            </div>
          </main>
        )}

        {/* PIE DE PÁGINA */}
        <footer className="border-t border-[#E8D9CA] bg-[#FDFBF8] px-6 py-5 text-center text-xs text-[#8A6752]">
          © 2026 Lúmina Estética · Sistema de Gestión
        </footer>
      </div>
    </div>
  );
}

export default App;
