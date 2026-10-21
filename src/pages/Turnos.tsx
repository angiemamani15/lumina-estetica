
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Turno = {
  id: number;
  cliente: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: "Pendiente" | "Cancelado";
};

const API_URL = "http://localhost:3001/api/turnos";
const TURNOS_POR_PAGINA = 10;

function Turnos() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cliente, setCliente] = useState("");
  const [servicio, setServicio] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [pagina, setPagina] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // CARGAR TURNOS DESDE EL BACKEND
  const cargarTurnos = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los turnos.");
      }

      const datos: Turno[] = await respuesta.json();
      setTurnos(datos);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Revisá que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarTurnos();
  }, []);

  // GUARDAR TURNO
  const guardarTurno = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (guardando) return;

    if (
      !cliente.trim() ||
      !servicio.trim() ||
      !fecha ||
      !hora
    ) {
      setError("Completá todos los datos del turno.");
      return;
    }

    setGuardando(true);
    setError("");

    try {
      const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: cliente.trim(),
          servicio: servicio.trim(),
          fecha,
          hora,
        }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);

        throw new Error(
          datos?.error || "No se pudo guardar el turno."
        );
      }

      const turnoGuardado: Turno = await respuesta.json();

      setTurnos((anteriores) => [
        turnoGuardado,
        ...anteriores,
      ]);

      setCliente("");
      setServicio("");
      setFecha("");
      setHora("");
      setMostrarFormulario(false);
      setBusqueda("");
      setPagina(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el turno."
      );
    } finally {
      setGuardando(false);
    }
  };

  // CANCELAR TURNO
  const cancelarTurno = async (id: number) => {
    if (procesandoId !== null) return;

    setProcesandoId(id);
    setError("");

    try {
      const respuesta = await fetch(
        `${API_URL}/${id}/cancelar`,
        { method: "PATCH" }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo cancelar el turno.");
      }

      const turnoActualizado: Turno = await respuesta.json();

      setTurnos((anteriores) =>
        anteriores.map((turno) =>
          turno.id === id ? turnoActualizado : turno
        )
      );
    } catch {
      setError("No se pudo cancelar el turno.");
    } finally {
      setProcesandoId(null);
    }
  };

  // ELIMINAR TURNO
  const eliminarTurno = async (id: number) => {
    if (procesandoId !== null) return;

    if (!window.confirm("¿Querés eliminar este turno?")) {
      return;
    }

    setProcesandoId(id);
    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el turno.");
      }

      setTurnos((anteriores) =>
        anteriores.filter((turno) => turno.id !== id)
      );
    } catch {
      setError("No se pudo eliminar el turno.");
    } finally {
      setProcesandoId(null);
    }
  };

  // BUSCADOR
  const turnosFiltrados = turnos.filter((turno) => {
    const texto =
      `${turno.cliente} ${turno.servicio}`.toLowerCase();

    return texto.includes(busqueda.trim().toLowerCase());
  });

  // PAGINACIÓN
  const totalPaginas = Math.max(
    1,
    Math.ceil(turnosFiltrados.length / TURNOS_POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const turnosPaginados = turnosFiltrados.slice(
    (paginaActual - 1) * TURNOS_POR_PAGINA,
    paginaActual * TURNOS_POR_PAGINA
  );

  const primerRegistro =
    turnosFiltrados.length === 0
      ? 0
      : (paginaActual - 1) * TURNOS_POR_PAGINA + 1;

  const ultimoRegistro = Math.min(
    paginaActual * TURNOS_POR_PAGINA,
    turnosFiltrados.length
  );

  // ESTADÍSTICAS
  const turnosPendientes = turnos.filter(
    (turno) => turno.estado === "Pendiente"
  ).length;

  const turnosCancelados = turnos.filter(
    (turno) => turno.estado === "Cancelado"
  ).length;

  const inputClass =
    "w-full rounded-xl border border-[#E8D9CA] bg-[#FDFBF8] px-4 py-3 text-[#493326] outline-none transition placeholder:text-[#B7A394] focus:border-[#A98B76] focus:ring-2 focus:ring-[#D8B89C]/30";

  const formatearFecha = (valor: string) => {
    const partes = valor.split("-");

    if (partes.length !== 3) return valor;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  return (
    <div className="min-h-screen w-full min-w-0 text-[#493326]">
      {/* ENCABEZADO */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B76]">
            Organización de citas
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Gestión de Turnos
          </h1>

          <p className="mt-2 text-sm text-[#806D60] sm:text-base">
            Organizá las citas y los horarios de Lúmina Estética.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMostrarFormulario((anterior) => !anterior);
            setError("");
          }}
          className="w-full shrink-0 rounded-xl bg-[#795548] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5D4037] sm:w-auto"
        >
          {mostrarFormulario
            ? "✕ Cerrar formulario"
            : "＋ Nuevo turno"}
        </button>
      </div>

      {/* MENSAJES DE ERROR */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* TARJETAS DE RESUMEN */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Total de turnos
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DF] text-xl">
              📅
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold">
            {turnos.length}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Citas registradas en el sistema
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Turnos pendientes
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
              ✓
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-green-700">
            {turnosPendientes}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Citas que siguen activas
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Turnos cancelados
            </p>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
              ✕
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-red-700">
            {turnosCancelados}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Citas que fueron canceladas
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
          <div className="border-b border-[#EFE5DB] bg-[#FBF7F2] px-5 py-5 sm:px-7">
            <h2 className="text-xl font-bold">
              Registrar nuevo turno
            </h2>

            <p className="mt-1 text-sm text-[#806D60]">
              Completá los datos de la cita.
            </p>
          </div>

          <form
            onSubmit={guardarTurno}
            className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7"
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Nombre del cliente
              </span>

              <input
                type="text"
                placeholder="Ej. María López"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Servicio solicitado
              </span>

              <input
                type="text"
                placeholder="Ej. Limpieza facial"
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Fecha del turno
              </span>

              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Hora del turno
              </span>

              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-xl bg-[#795548] px-7 py-3 font-semibold text-white transition hover:bg-[#5D4037] disabled:opacity-60"
              >
                {guardando
                  ? "Guardando..."
                  : "＋ Guardar turno"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setCliente("");
                  setServicio("");
                  setFecha("");
                  setHora("");
                  setError("");
                }}
                className="rounded-xl border border-[#D8B89C] bg-white px-7 py-3 font-semibold text-[#795548] transition hover:bg-[#F4E9DF]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* LISTADO DE TURNOS */}
      <section className="overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFE5DB] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h2 className="text-xl font-bold">
              Turnos registrados
            </h2>

            <p className="mt-1 text-sm text-[#806D60]">
              Consultá y administrá las citas.
            </p>
          </div>

          <input
            type="search"
            placeholder="Buscar cliente o servicio..."
            aria-label="Buscar turno"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            className={`${inputClass} sm:max-w-xs`}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4E9DF] text-sm text-[#795548]">
                <th className="px-5 py-4 font-semibold">
                  Cliente
                </th>
                <th className="px-5 py-4 font-semibold">
                  Servicio
                </th>
                <th className="px-5 py-4 font-semibold">
                  Fecha
                </th>
                <th className="px-5 py-4 font-semibold">
                  Hora
                </th>
                <th className="px-5 py-4 font-semibold">
                  Estado
                </th>
                <th className="px-5 py-4 font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                turnosPaginados.map((turno) => (
                  <tr
                    key={turno.id}
                    className="border-t border-[#F0E8E0] transition hover:bg-[#FDF9F5]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold">
                      {turno.cliente}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#806D60]">
                      {turno.servicio}
                    </td>

                    <td className="px-5 py-4 text-sm">
                      {formatearFecha(turno.fecha)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium">
                      {turno.hora}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          turno.estado === "Pendiente"
                            ? "inline-flex rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                            : "inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        }
                      >
                        {turno.estado}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {turno.estado === "Pendiente" && (
                          <button
                            type="button"
                            disabled={procesandoId !== null}
                            onClick={() =>
                              void cancelarTurno(turno.id)
                            }
                            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                          >
                            Cancelar
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={procesandoId !== null}
                          onClick={() =>
                            void eliminarTurno(turno.id)
                          }
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {cargando && (
            <p className="p-8 text-center text-[#806D60]">
              Cargando turnos...
            </p>
          )}

          {!cargando && turnosFiltrados.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-4xl">📅</div>

              <p className="font-semibold">
                {busqueda
                  ? "No se encontraron turnos."
                  : "Todavía no hay turnos registrados."}
              </p>

              <p className="mt-2 text-sm text-[#806D60]">
                {busqueda
                  ? "Probá buscando otro cliente o servicio."
                  : "Agregá tu primer turno utilizando el botón Nuevo turno."}
              </p>
            </div>
          )}
        </div>

        {/* PAGINACIÓN */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EFE5DB] px-5 py-5 sm:px-7">
          <p className="text-sm text-[#806D60]">
            {turnosFiltrados.length === 0
              ? "0 turnos"
              : `Mostrando ${primerRegistro} a ${ultimoRegistro} de ${turnosFiltrados.length} turnos`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() =>
                setPagina(paginaActual - 1)
              }
              className="rounded-xl border border-[#D8B89C] bg-white px-4 py-2 text-sm font-semibold text-[#795548] transition hover:bg-[#F4E9DF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>

            <span className="text-sm font-semibold text-[#493326]">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() =>
                setPagina(paginaActual + 1)
              }
              className="rounded-xl border border-[#D8B89C] bg-white px-4 py-2 text-sm font-semibold text-[#795548] transition hover:bg-[#F4E9DF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-[#A98B76]">
        Lúmina Estética · Gestión de turnos
      </p>
    </div>
  );
}

export default Turnos;
