import React, { useState } from 'react';

interface SchoolOption {
  name: string;
  institution: string;
  requiredCutoff: number;
  area: string;
}

const SCHOOL_CUTOFFS: SchoolOption[] = [
  { name: 'Prepa 6 Antonio Caso', institution: 'UNAM', requiredCutoff: 111, area: 'Coyoacán' },
  { name: 'Prepa 9 Pedro de Alba', institution: 'UNAM', requiredCutoff: 108, area: 'Gustavo A. Madero' },
  { name: 'Prepa 2 Erasmo Castellanos', institution: 'UNAM', requiredCutoff: 107, area: 'Iztacalco' },
  { name: 'Prepa 5 José Vasconcelos', institution: 'UNAM', requiredCutoff: 105, area: 'Tlalpan' },
  { name: 'Prepa 3 Justo Sierra', institution: 'UNAM', requiredCutoff: 103, area: 'Gustavo A. Madero' },
  { name: 'CCH Sur', institution: 'UNAM', requiredCutoff: 96, area: 'Coyoacán' },
  { name: 'CCH Oriente', institution: 'UNAM', requiredCutoff: 94, area: 'Iztapalapa' },
  { name: 'CCH Vallejo', institution: 'UNAM', requiredCutoff: 93, area: 'Gustavo A. Madero' },
  { name: 'CCH Naucalpan', institution: 'UNAM', requiredCutoff: 87, area: 'Edomex' },
  { name: 'CECyT 9 Juan de Dios Bátiz', institution: 'IPN', requiredCutoff: 102, area: 'Miguel Hidalgo' },
  { name: 'CECyT 3 Estanislao Ramírez', institution: 'IPN', requiredCutoff: 91, area: 'Ecatepec' },
  { name: 'CECyT 13 Ricardo Flores Magón', institution: 'IPN', requiredCutoff: 92, area: 'Coyoacán' },
  { name: 'CECyT 5 Benito Juárez', institution: 'IPN', requiredCutoff: 89, area: 'Cuauhtémoc' },
  { name: 'Colegio de Bachilleres Plantel 01', institution: 'COLBACH', requiredCutoff: 65, area: 'El Rosario' },
  { name: 'CONALEP Tlalpan I', institution: 'CONALEP', requiredCutoff: 48, area: 'Tlalpan' },
];

interface SchoolSimulatorProps {
  currentScore: number; // Aciertos obtenidos en el último simulacro (sobre 128)
}

export const SchoolSimulator: React.FC<SchoolSimulatorProps> = ({ currentScore }) => {
  const [filterInstitution, setFilterInstitution] = useState<string>('TODAS');

  const filteredSchools = SCHOOL_CUTOFFS.filter((school) => {
    if (filterInstitution === 'TODAS') return true;
    return school.institution === filterInstitution;
  });

  const getStatusBadge = (required: number) => {
    const diff = currentScore - required;
    if (diff >= 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
          🟢 Zona Verde (Alcanza)
        </span>
      );
    } else if (diff >= -5) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          🟡 Zona Amarilla (En Riesgo -{Math.abs(diff)} aciertos)
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
          🔴 Zona Roja (Faltan {Math.abs(diff)} aciertos)
        </span>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🏫 Semáforo de Asignación Escolar ECOEMS
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Comparación de tu puntaje actual (<strong className="text-blue-600 dark:text-blue-400">{currentScore} / 128 aciertos</strong>) frente a los cortes históricos de ingreso.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {['TODAS', 'UNAM', 'IPN', 'COLBACH'].map((inst) => (
            <button
              key={inst}
              onClick={() => setFilterInstitution(inst)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filterInstitution === inst
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {inst}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">
              <th className="py-3 px-4">Escuela / Plantel</th>
              <th className="py-3 px-4">Institución</th>
              <th className="py-3 px-4 text-center">Corte Histórico</th>
              <th className="py-3 px-4 text-right">Estatus de Ingreso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-sm">
            {filteredSchools.map((school, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white">
                  {school.name}
                  <span className="block text-xs text-gray-400">{school.area}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{school.institution}</span>
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                  {school.requiredCutoff} pts
                </td>
                <td className="py-3.5 px-4 text-right">
                  {getStatusBadge(school.requiredCutoff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};