
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Cliente = {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
};

type DatosCliente = Omit<Cliente, "id">;

const API = "http://localhost:3001/api/clientes";
const POR_PAGINA = 10;

const formularioVacio: DatosCliente = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
};

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nuevoCliente, setNuevoCliente] =
    useState<DatosCliente>({ ...formularioVacio });

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);
  const [mostrarPolitica, setMostrarPolitica] =
    useState(false);
  const [autorizacionConfirmada, setAutorizacionConfirmada] =
    useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargarClientes = async () => {
    try {
      setError("");

      const respuesta = await fetch(API);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los clientes.");
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error("La respuesta del servidor no es válida.");
      }

      setClientes(datos);
    } catch {
      setError(
        "No se pudo conectar con el servidor. Verificá que el backend esté encendido."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarClientes();
  }, []);

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setMostrarPolitica(false);
    setAutorizacionConfirmada(false);
    setNuevoCliente({ ...formularioVacio });
    setError("");
  };

  const guardarCliente = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (guardando) return;

    if (
      !nuevoCliente.nombre.trim() ||
      !nuevoCliente.apellido.trim() ||
      !nuevoCliente.telefono.trim() ||
      !nuevoCliente.email.trim()
    ) {
      setError("Completá todos los datos del cliente.");
      return;
    }

    if (!autorizacionConfirmada) {
      setError(
        "Debés confirmar que el cliente fue informado sobre el tratamiento de sus datos personales."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const respuesta = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoCliente),
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo guardar el cliente.");
      }

      await cargarClientes();
      setPagina(1);
      setBusqueda("");
      cerrarFormulario();
    } catch {
      setError(
        "No se pudo guardar el cliente. Revisá la conexión con el backend."
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminarCliente = async (id: number) => {
    const confirmar = window.confirm(
      "¿Estás segura de que querés eliminar este cliente?"
    );

    if (!confirmar) return;

    try {
      setError("");

      const respuesta = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo eliminar el cliente.");
      }

      await cargarClientes();
    } catch {
      setError(
        "No se pudo eliminar el cliente. Revisá la conexión con el servidor."
      );
    }
  };

  // BUSCADOR
  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = [
      cliente.nombre,
      cliente.apellido,
      cliente.telefono,
      cliente.email,
    ]
      .join(" ")
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase().trim());
  });

  // PAGINACIÓN
  const totalPaginas = Math.max(
    1,
    Math.ceil(clientesFiltrados.length / POR_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA
  );

  const campo = (
    nombre: keyof DatosCliente,
    etiqueta: string,
    tipo: string = "text"
  ) => (
    <div>
      <label
        htmlFor={nombre}
        className="mb-2 block text-sm font-semibold text-[#493326]"
      >
        {etiqueta}
      </label>

      <input
        id={nombre}
        type={tipo}
        required
        value={nuevoCliente[nombre]}
        onChange={(e) =>
          setNuevoCliente({
            ...nuevoCliente,
            [nombre]: e.target.value,
          })
        }
        className="w-full rounded-xl border border-[#D8B89C] bg-white px-4 py-3 text-[#493326] outline-none focus:ring-2 focus:ring-[#D8B89C]"
        placeholder={`Ingresá ${etiqueta.toLowerCase()}`}
      />
    </div>
  );

  return (
    <div className="w-full space-y-6 text-[#493326]">
      {/* ENCABEZADO */}
      <section className="rounded-2xl border border-[#E8D9CA] bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#A98B76]">
          Administración de clientes
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Gestión de Clientes
            </h1>

            <p className="mt-2 text-sm text-[#806D60]">
              Registrá, consultá y administrá los clientes de
              Lúmina Estética.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (mostrarFormulario) {
                cerrarFormulario();
              } else {
                setError("");
                setMostrarFormulario(true);
              }
            }}
            className="rounded-xl bg-[#6A4A38] px-5 py-3 font-semibold text-white transition hover:bg-[#493326]"
          >
            {mostrarFormulario
              ? "Cancelar"
              : "+ Nuevo cliente"}
          </button>
        </div>
      </section>

      {/* MENSAJES */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* RESUMEN */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#806D60]">
            Clientes registrados
          </p>
          <p className="mt-3 text-3xl font-bold">
            {clientes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#E8D9CA] bg-white p-6 shadow-sm">
          <p className="text-sm text-[#806D60]">
            Resultados de búsqueda
          </p>
          <p className="mt-3 text-3xl font-bold">
            {clientesFiltrados.length}
          </p>
        </div>
      </div>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <section className="rounded-2xl border border-[#E8D9CA] bg-white p-5 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-bold">
            Registrar nuevo cliente
          </h2>

          <form onSubmit={guardarCliente}>
            <div className="grid gap-5 sm:grid-cols-2">
              {campo("nombre", "Nombre")}
              {campo("apellido", "Apellido")}
              {campo("telefono", "Teléfono", "tel")}
              {campo("email", "Email", "email")}
            </div>

            {/* POLÍTICA DE PRIVACIDAD */}
            <div className="mt-7 rounded-2xl border border-[#E8D9CA] bg-[#FAF7F2] p-5">
              <h3 className="font-semibold">
                Protección de datos personales
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-[#806D60]">
                Los datos personales se registran para
                administrar clientes, turnos y servicios
                de Lúmina Estética.
              </p>

              <button
                type="button"
                onClick={() =>
                  setMostrarPolitica(!mostrarPolitica)
                }
                className="mt-4 text-sm font-semibold text-[#795548] underline"
              >
                {mostrarPolitica
                  ? "Ocultar política de privacidad"
                  : "Leer política de privacidad"}
              </button>

              {mostrarPolitica && (
                <div className="mt-5 space-y-4 rounded-xl border border-[#E8D9CA] bg-white p-5 text-sm leading-relaxed text-[#6A4A38]">
                  <h4 className="text-base font-bold">
                    Política de privacidad
                  </h4>

                  <div>
                    <p className="font-semibold">
                      1. Datos recopilados
                    </p>
                    <p>
                      El sistema registra nombre, apellido,
                      teléfono y correo electrónico del cliente.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      2. Finalidad
                    </p>
                    <p>
                      Los datos se utilizan para gestionar
                      clientes, servicios y turnos.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      3. Almacenamiento
                    </p>
                    <p>
                      Los datos se almacenan en la base de
                      datos del sistema. El acceso debe
                      limitarse a personas autorizadas.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      4. Uso de la información
                    </p>
                    <p>
                      Los datos deben utilizarse únicamente
                      para las finalidades informadas y
                      tratarse de manera responsable.
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      5. Derechos del cliente
                    </p>
                    <p>
                      El cliente puede solicitar información,
                      corrección o eliminación de sus datos
                      a la persona responsable del sistema,
                      según corresponda.
                    </p>
                  </div>

                  <p className="border-t border-[#E8D9CA] pt-4 text-xs text-[#A98B76]">
                    Esta política es una versión académica.
                    Antes de utilizar el sistema con clientes
                    reales, se deben completar los datos del
                    responsable y revisar las medidas de
                    protección de la información.
                  </p>
                </div>
              )}

              <label className="mt-6 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={autorizacionConfirmada}
                  onChange={(e) =>
                    setAutorizacionConfirmada(
                      e.target.checked
                    )
                  }
                  className="mt-1 h-5 w-5 accent-[#8A6752]"
                />

                <span className="text-sm leading-relaxed text-[#6A4A38]">
                  Confirmo que el cliente fue informado
                  sobre el tratamiento de sus datos
                  personales y que se obtuvo su
                  autorización cuando corresponde.
                </span>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  guardando || !autorizacionConfirmada
                }
                className="rounded-xl bg-[#8A6752] px-6 py-3 font-semibold text-white transition hover:bg-[#6A4A38] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando
                  ? "Guardando..."
                  : "Guardar cliente"}
              </button>

              <button
                type="button"
                onClick={cerrarFormulario}
                className="rounded-xl border border-[#D8B89C] bg-white px-6 py-3 font-semibold text-[#6A4A38]"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      {/* LISTADO */}
      <section className="overflow-hidden rounded-2xl border border-[#E8D9CA] bg-white shadow-sm">
        <div className="border-b border-[#E8D9CA] p-5 sm:p-6">
          <h2 className="text-xl font-bold">
            Clientes registrados
          </h2>

          <p className="mt-1 text-sm text-[#806D60]">
            Consultá los datos de tus clientes.
          </p>

          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por nombre, apellido, teléfono o email..."
            className="mt-5 w-full rounded-xl border border-[#D8B89C] bg-[#FAF7F2] px-4 py-3 outline-none focus:ring-2 focus:ring-[#D8B89C]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#EEE2D6] text-sm text-[#493326]">
              <tr>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Teléfono</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-[#806D60]"
                  >
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientesPaginados.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-[#806D60]"
                  >
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                clientesPaginados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-t border-[#F0E8E0]"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {cliente.nombre} {cliente.apellido}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#806D60]">
                      {cliente.telefono}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#806D60]">
                      {cliente.email}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          void eliminarCliente(cliente.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E8D9CA] p-5">
          <p className="text-sm text-[#806D60]">
            {clientesFiltrados.length === 0
              ? "0 clientes"
              : `Mostrando ${
                  (paginaActual - 1) * POR_PAGINA + 1
                } a ${Math.min(
                  paginaActual * POR_PAGINA,
                  clientesFiltrados.length
                )} de ${clientesFiltrados.length} clientes`}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={paginaActual === 1}
              onClick={() =>
                setPagina(paginaActual - 1)
              }
              className="rounded-xl border border-[#D8B89C] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>

            <span className="text-sm font-semibold">
              Página {paginaActual} de {totalPaginas}
            </span>

            <button
              type="button"
              disabled={paginaActual === totalPaginas}
              onClick={() =>
                setPagina(paginaActual + 1)
              }
              className="rounded-xl border border-[#D8B89C] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      <p className="text-center text-xs text-[#A98B76]">
        Lúmina Estética · Gestión de clientes
      </p>
    </div>
  );
}

export default Clientes;
