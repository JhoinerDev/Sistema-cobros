export default function GestionNomina() {
  return (
    <div className="p-8">
      {/* Título */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gestión de Nómina
      </h1>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-5 border">
          <h2 className="text-gray-500 text-sm">Total empleados</h2>
          <p className="text-2xl font-semibold text-blue-600">32</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 border">
          <h2 className="text-gray-500 text-sm">Nómina del mes</h2>
          <p className="text-2xl font-semibold text-green-600">$ 12.450</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 border">
          <h2 className="text-gray-500 text-sm">Pagos pendientes</h2>
          <p className="text-2xl font-semibold text-red-600">4</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Empleados y Pagos
        </h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Empleado</th>
              <th className="p-3 border">Cargo</th>
              <th className="p-3 border">Salario</th>
              <th className="p-3 border">Estado</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-3 border">Juan Pérez</td>
              <td className="p-3 border">Administrador</td>
              <td className="p-3 border">$850</td>
              <td className="p-3 border">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Pagado
                </span>
              </td>
              <td className="p-3 border">
                <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Ver
                </button>
              </td>
            </tr>

            <tr>
              <td className="p-3 border">María Gómez</td>
              <td className="p-3 border">Asistente</td>
              <td className="p-3 border">$600</td>
              <td className="p-3 border">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  Pendiente
                </span>
              </td>
              <td className="p-3 border">
                <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Ver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
