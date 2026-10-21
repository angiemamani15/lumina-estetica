
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  duracion: number;
};

const API_URL = "http://localhost:3001/api/servicios";
const SERVICIOS_POR_PAGINA = 10;

const formatoPesos = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Servicios() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [pagina, setPagina] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // CARGAR SERVICIOS DESDE SQLITE
  const cargarServicios = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los servicios.");
      }

      const datos: Servicio[] = await respuesta.json();
      setServicios(datos);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Revisá que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarServicios();
  }, []);

  // GUARDAR SERVICIO
  const guardarServicio = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (guardando) return;

    const precioNumero = Number(precio);
    const duracionNumero = Number(duracion);

    if (
      !nombre.trim() ||
      precio.trim() === "" ||
      duracion.trim() === "" ||
      !Number.isFinite(precioNumero) ||
      precioNumero < 0 ||
      !Number.isInteger(duracionNumero) ||
      duracionNumero <= 0
    ) {
      setError("Completá correctamente los datos del servicio.");
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
          nombre: nombre.trim(),
          precio: precioNumero,
          duracion: duracionNumero,
        }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);

        throw new Error(
          datos?.error || "No se pudo guardar el servicio."
        );
      }

      const servicioGuardado: Servicio =
        await respuesta.json();

      setServicios((anteriores) => [
        servicioGuardado,
        ...anteriores,
      ]);

      setNombre("");
      setPrecio("");
      setDuracion("");
      setMostrarFormulario(false);
      setBusqueda("");
      setPagina(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar el servicio."
      );
    } finally {
      setGuardando(false);
    }
  };

  // ELIMINAR SERVICIO
  const eliminarServicio = async (id: number) => {
    if (eliminandoId !== null) return;

    if (!window.confirm("¿Querés eliminar este servicio?")) {
      return;
    }

    setEliminandoId(id);
    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el servicio.");
      }

      setServicios((anteriores) =>
        anteriores.filter((servicio) => servicio.id !== id)
      );
    } catch {
      setError(
        "No se pudo eliminar el servicio. Revisá la conexión."
      );
    } finally {
      setEliminandoId(null);
    }
  };

  // BUSCADOR
  const serviciosFiltrados = servicios.filter((servicio) =>
    servicio.nombre
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase())
  );

  // PAGINACIÓN
  const totalPaginas = Math.max(
    1,
    Math.ceil(serviciosFiltrados.length / SERVICIOS_POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const serviciosPaginados = serviciosFiltrados.slice(
    (paginaActual - 1) * SERVICIOS_POR_PAGINA,
    paginaActual * SERVICIOS_POR_PAGINA
  );

  const primerRegistro =
    serviciosFiltrados.length === 0
      ? 0
      : (paginaActual - 1) * SERVICIOS_POR_PAGINA + 1;

  const ultimoRegistro = Math.min(
    paginaActual * SERVICIOS_POR_PAGINA,
    serviciosFiltrados.length
  );

  const inputClass =
    "w-full rounded-xl border border-[#E8D9CA] bg-[#FDFBF8] px-4 py-3 text-[#493326] outline-none transition placeholder:text-[#B7A394] focus:border-[#A98B76] focus:ring-2 focus:ring-[#D8B89C]/30";

  return (
    <div className="min-h-screen w-full min-w-0 text-[#493326]">
      {/* ENCABEZADO */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B76]">
            Administración de tratamientos
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Gestión de Servicios
          </h1>

          <p className="mt-2 text-sm text-[#806D60] sm:text-base">
            Organizá los tratamientos, precios y duraciones de
            Lúmina Estética.
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
            : "＋ Nuevo servicio"}
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
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Servicios registrados
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DF] text-xl">
              ✨
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold">
            {servicios.length}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Tratamientos disponibles en el sistema
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Resultados de búsqueda
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DF] text-xl">
              🔎
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold">
            {serviciosFiltrados.length}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Servicios que coinciden con tu búsqueda
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
          <div className="border-b border-[#EFE5DB] bg-[#FBF7F2] px-5 py-5 sm:px-7">
            <h2 className="text-xl font-bold">
              Registrar nuevo servicio
            </h2>

            <p className="mt-1 text-sm text-[#806D60]">
              Completá la información del tratamiento.
            </p>
          </div>

          <form
            onSubmit={guardarServicio}
            className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7"
          >
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold">
                Nombre del tratamiento
              </span>

              <input
                type="text"
                placeholder="Ej. Limpieza facial profunda"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Precio en pesos
              </span>

              <input
                type="number"
                placeholder="Ej. 18000"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                min="0"
                step="0.01"
                required
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Duración en minutos
              </span>

              <input
                type="number"
                placeholder="Ej. 60"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                min="1"
                step="1"
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
                  : "＋ Guardar servicio"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setNombre("");
                  setPrecio("");
                  setDuracion("");
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

      {/* LISTADO DE SERVICIOS */}
      <section className="overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFE5DB] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h2 className="text-xl font-bold">
              Servicios registrados
            </h2>

            <p className="mt-1 text-sm text-[#806D60]">
              Consultá los tratamientos y sus precios.
            </p>
          </div>

          <input
            type="search"
            placeholder="Buscar servicio..."
            aria-label="Buscar servicio"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            className={`${inputClass} sm:max-w-xs`}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4E9DF] text-sm text-[#795548]">
                <th className="px-5 py-4 font-semibold">
                  Servicio
                </th>
                <th className="px-5 py-4 font-semibold">
                  Precio
                </th>
                <th className="px-5 py-4 font-semibold">
                  Duración
                </th>
                <th className="px-5 py-4 font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                serviciosPaginados.map((servicio) => (
                  <tr
                    key={servicio.id}
                    className="border-t border-[#F0E8E0] transition hover:bg-[#FDF9F5]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold">
                      {servicio.nombre}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      {formatoPesos(servicio.precio)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F4E9DF] px-3 py-1.5 text-xs font-medium text-[#795548]">
                        {servicio.duracion} min
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={eliminandoId !== null}
                        onClick={() =>
                          void eliminarServicio(servicio.id)
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {cargando && (
            <p className="p-8 text-center text-[#806D60]">
              Cargando servicios...
            </p>
          )}

          {!cargando && serviciosFiltrados.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-4xl">✨</div>

              <p className="font-semibold">
                {busqueda
                  ? "No se encontraron servicios."
                  : "Todavía no hay servicios registrados."}
              </p>

              <p className="mt-2 text-sm text-[#806D60]">
                {busqueda
                  ? "Probá con otro nombre de tratamiento."
                  : "Agregá tu primer servicio utilizando el botón Nuevo servicio."}
              </p>
            </div>
          )}
        </div>

        {/* PAGINACIÓN */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EFE5DB] px-5 py-5 sm:px-7">
          <p className="text-sm text-[#806D60]">
            {serviciosFiltrados.length === 0
              ? "0 servicios"
              : `Mostrando ${primerRegistro} a ${ultimoRegistro} de ${serviciosFiltrados.length} servicios`}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() => setPagina(paginaActual - 1)}
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
              onClick={() => setPagina(paginaActual + 1)}
              className="rounded-xl border border-[#D8B89C] bg-white px-4 py-2 text-sm font-semibold text-[#795548] transition hover:bg-[#F4E9DF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-[#A98B76]">
        Lúmina Estética · Gestión de servicios
      </p>
    </div>
  );
}

export default Servicios;
