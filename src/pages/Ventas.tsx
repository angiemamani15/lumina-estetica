
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Venta = {
  id: number;
  cliente: string;
  servicio: string;
  monto: number;
  metodoPago: string;
  fecha: string;
};

const API_URL = "http://localhost:3001/api/ventas";
const VENTAS_POR_PAGINA = 10;

const formatoPesos = (valor: number) =>
  valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cliente, setCliente] = useState("");
  const [servicio, setServicio] = useState("");
  const [monto, setMonto] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] =
    useState<number | null>(null);
  const [error, setError] = useState("");

  // CARGAR VENTAS DESDE SQLITE
  const cargarVentas = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(API_URL);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las ventas.");
      }

      const datos: Venta[] = await respuesta.json();
      setVentas(datos);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Revisá que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarVentas();
  }, []);

  // GUARDAR VENTA
  const guardarVenta = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (guardando) return;

    const montoNumero = Number(monto);

    if (
      !cliente.trim() ||
      !servicio.trim() ||
      monto.trim() === "" ||
      !Number.isFinite(montoNumero) ||
      montoNumero <= 0
    ) {
      setError("Completá correctamente los datos de la venta.");
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
          monto: montoNumero,
          metodoPago,
        }),
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);

        throw new Error(
          datos?.error || "No se pudo guardar la venta."
        );
      }

      const ventaGuardada: Venta =
        await respuesta.json();

      setVentas((anteriores) => [
        ventaGuardada,
        ...anteriores,
      ]);

      setCliente("");
      setServicio("");
      setMonto("");
      setMetodoPago("Efectivo");
      setBusqueda("");
      setPagina(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la venta."
      );
    } finally {
      setGuardando(false);
    }
  };

  // ELIMINAR VENTA
  const eliminarVenta = async (id: number) => {
    if (eliminandoId !== null) return;

    if (!window.confirm("¿Querés eliminar esta venta?")) {
      return;
    }

    setEliminandoId(id);
    setError("");

    try {
      const respuesta = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar la venta.");
      }

      setVentas((anteriores) =>
        anteriores.filter((venta) => venta.id !== id)
      );
    } catch {
      setError("No se pudo eliminar la venta.");
    } finally {
      setEliminandoId(null);
    }
  };

  // TOTAL DE INGRESOS
  const totalIngresos = ventas.reduce(
    (total, venta) => total + Number(venta.monto),
    0
  );

  // BUSCADOR DE VENTAS
  const ventasFiltradas = ventas.filter((venta) => {
    const texto = `
      ${venta.cliente}
      ${venta.servicio}
      ${venta.metodoPago}
      ${venta.fecha}
    `.toLowerCase();

    return texto.includes(busqueda.trim().toLowerCase());
  });

  // PAGINACIÓN
  const totalPaginas = Math.max(
    1,
    Math.ceil(ventasFiltradas.length / VENTAS_POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * VENTAS_POR_PAGINA,
    paginaActual * VENTAS_POR_PAGINA
  );

  const primerRegistro =
    ventasFiltradas.length === 0
      ? 0
      : (paginaActual - 1) * VENTAS_POR_PAGINA + 1;

  const ultimoRegistro = Math.min(
    paginaActual * VENTAS_POR_PAGINA,
    ventasFiltradas.length
  );

  const inputClass =
    "w-full rounded-xl border border-[#E8D9CA] bg-[#FDFBF8] px-4 py-3 text-[#493326] outline-none transition placeholder:text-[#B7A394] focus:border-[#A98B76] focus:ring-2 focus:ring-[#D8B89C]/30";

  return (
    <div className="min-h-screen w-full min-w-0 text-[#493326]">
      {/* ENCABEZADO */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A98B76]">
          Administración financiera
        </p>

        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Gestión de Ventas
        </h1>

        <p className="mt-2 text-sm text-[#806D60] sm:text-base">
          Registrá los pagos y llevá un control de los
          ingresos de Lúmina Estética.
        </p>
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
              Ingresos registrados
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DF] text-xl">
              💰
            </span>
          </div>

          <p className="mt-5 break-words text-2xl font-bold text-[#493326] sm:text-3xl">
            {formatoPesos(totalIngresos)}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Total acumulado de ventas
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#806D60]">
              Ventas registradas
            </p>

            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E9DF] text-xl">
              🧾
            </span>
          </div>

          <p className="mt-5 text-3xl font-bold text-[#493326]">
            {ventas.length}
          </p>

          <p className="mt-2 text-xs text-[#A98B76]">
            Operaciones guardadas en el sistema
          </p>
        </div>
      </div>

      {/* FORMULARIO DE VENTAS */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
        <div className="border-b border-[#EFE5DB] bg-[#FBF7F2] px-5 py-5 sm:px-7">
          <h2 className="text-xl font-bold text-[#493326]">
            Registrar nueva venta
          </h2>

          <p className="mt-1 text-sm text-[#806D60]">
            Completá los datos del pago realizado.
          </p>
        </div>

        <form
          onSubmit={guardarVenta}
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
              Servicio realizado
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
              Monto en pesos
            </span>

            <input
              type="number"
              placeholder="Ej. 18000"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min="0.01"
              step="0.01"
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Método de pago
            </span>

            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className={inputClass}
            >
              <option value="Efectivo">
                Efectivo
              </option>

              <option value="Transferencia">
                Transferencia
              </option>

              <option value="Tarjeta">
                Tarjeta
              </option>
            </select>
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-xl bg-[#795548] px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#5D4037] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {guardando
                ? "Guardando venta..."
                : "＋ Guardar venta"}
            </button>
          </div>
        </form>
      </section>

      {/* HISTORIAL DE VENTAS */}
      <section className="overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-[#EFE5DB] px-5 py-5 sm:flex-row sm:items-center sm:px-7">
          <div>
            <h2 className="text-xl font-bold">
              Historial de ventas
            </h2>

            <p className="mt-1 text-sm text-[#806D60]">
              Consultá los pagos registrados.
            </p>
          </div>

          <input
            type="search"
            placeholder="Buscar cliente, servicio o pago..."
            aria-label="Buscar venta"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            className={`${inputClass} sm:max-w-xs`}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#F4E9DF] text-sm text-[#795548]">
                <th className="px-5 py-4 font-semibold">
                  Cliente
                </th>

                <th className="px-5 py-4 font-semibold">
                  Servicio
                </th>

                <th className="px-5 py-4 font-semibold">
                  Monto
                </th>

                <th className="px-5 py-4 font-semibold">
                  Pago
                </th>

                <th className="px-5 py-4 font-semibold">
                  Fecha
                </th>

                <th className="px-5 py-4 font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                ventasPaginadas.map((venta) => (
                  <tr
                    key={venta.id}
                    className="border-t border-[#F0E8E0] transition hover:bg-[#FDF9F5]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold">
                      {venta.cliente}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#806D60]">
                      {venta.servicio}
                    </td>

                    <td className="px-5 py-4 text-sm font-bold">
                      {formatoPesos(Number(venta.monto))}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#F4E9DF] px-3 py-1.5 text-xs font-medium text-[#795548]">
                        {venta.metodoPago}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#806D60]">
                      {venta.fecha}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={eliminandoId !== null}
                        onClick={() =>
                          void eliminarVenta(venta.id)
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
              Cargando ventas...
            </p>
          )}

          {!cargando && ventasFiltradas.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-4xl">🧾</div>

              <p className="font-semibold text-[#493326]">
                {busqueda
                  ? "No se encontraron ventas."
                  : "Todavía no hay ventas registradas."}
              </p>

              <p className="mt-2 text-sm text-[#806D60]">
                {busqueda
                  ? "Probá buscando otro cliente o servicio."
                  : "Registrá tu primera venta utilizando el formulario."}
              </p>
            </div>
          )}
        </div>

        {/* PAGINACIÓN */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EFE5DB] px-5 py-5 sm:px-7">
          <p className="text-sm text-[#806D60]">
            {ventasFiltradas.length === 0
              ? "0 ventas"
              : `Mostrando ${primerRegistro} a ${ultimoRegistro} de ${ventasFiltradas.length} ventas`}
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
        Lúmina Estética · Gestión de ventas
      </p>
    </div>
  );
}

export default Ventas;
