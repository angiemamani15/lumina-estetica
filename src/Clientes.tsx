function Clientes() {
  return (
    <div className="min-h-screen bg-pink-50 p-8">

      {/* Encabezado */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Clientes
          </h1>
          <p className="mt-1 text-gray-500">
            Gestión de clientes de Bella Estética
          </p>
        </div>

        <button className="rounded-lg bg-pink-500 px-5 py-3 font-semibold text-white shadow hover:bg-pink-600">
          + Nuevo cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-md">
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-pink-400"
        />
      </div>

      {/* Tabla de clientes */}
      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <table className="w-full">
          <thead className="bg-pink-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Teléfono
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t">
              <td className="px-6 py-4 text-gray-600">
                María López
              </td>
              <td className="px-6 py-4 text-gray-600">
                381 555-1234
              </td>
              <td className="px-6 py-4 text-gray-600">
                maria@email.com
              </td>
              <td className="px-6 py-4">
                <button className="mr-3 text-blue-500 hover:underline">
                  Editar
                </button>
                <button className="text-red-500 hover:underline">
                  Eliminar
                </button>
              </td>
            </tr>

            <tr className="border-t">
              <td className="px-6 py-4 text-gray-600">
                Ana Pérez
              </td>
              <td className="px-6 py-4 text-gray-600">
                381 555-5678
              </td>
              <td className="px-6 py-4 text-gray-600">
                ana@email.com
              </td>
              <td className="px-6 py-4">
                <button className="mr-3 text-blue-500 hover:underline">
                  Editar
                </button>
                <button className="text-red-500 hover:underline">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Clientes