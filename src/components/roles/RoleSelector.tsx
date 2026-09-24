import React from 'react';
import { RoleId } from '../../types';

interface RoleSelectorProps {
  onSelectRole: (roleId: RoleId) => void;
}

interface RoleCardData {
  id: RoleId;
  name: string;
}

const ROLES: RoleCardData[] = [
  {
    id: 'front_desk',
    name: 'Recepción y Asesor de Servicio (Front-Desk)',
  },
  {
    id: 'mechanic',
    name: 'Jefe de Taller y Mecánico (Técnico)',
  },
  {
    id: 'admin',
    name: 'Administración y Caja (Compras y Contabilidad)',
  },
  {
    id: 'director',
    name: 'Director General y CRM (Dirección)',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-6xl mx-auto">
        {/* Cuadrícula 2 Columnas Móvil / 4 Columnas Escritorio:
            Selector limpio con tarjetas independientes para cada rol.
            Sin header, sin descripciones, solo nombre del rol. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="group relative flex items-center justify-center text-center p-6 sm:p-8 md:p-10 min-h-[160px] sm:min-h-[200px] md:min-h-[240px] rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#D05E28] hover:-translate-y-1 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span className="text-base sm:text-lg md:text-xl font-bold text-[#1A253B] group-hover:text-[#D05E28] transition-colors leading-snug">
                {role.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
