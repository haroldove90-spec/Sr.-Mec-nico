import React from 'react';
import {
  ClipboardList,
  Wrench,
  Receipt,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';
import { RoleId } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface RoleSelectorProps {
  onSelectRole: (roleId: RoleId) => void;
}

interface RoleCardData {
  id: RoleId;
  name: string;
  icon: LucideIcon;
}

const ROLES: RoleCardData[] = [
  {
    id: 'front_desk',
    name: 'Recepción y Asesor de Servicio (Front-Desk)',
    icon: ClipboardList,
  },
  {
    id: 'mechanic',
    name: 'Jefe de Taller y Mecánico (Técnico)',
    icon: Wrench,
  },
  {
    id: 'admin',
    name: 'Administración y Caja (Compras y Contabilidad)',
    icon: Receipt,
  },
  {
    id: 'director',
    name: 'Director General y CRM (Dirección)',
    icon: TrendingUp,
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Logo oficial a tamaño completo, sin encapsular */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <img
            src="https://kabris.com.mx/srmecanicologo.png"
            alt="Sr. Mecánico"
            className="h-16 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[360px] md:max-w-[420px] object-contain select-none transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>

        {/* Cuadrícula responsiva de acceso por roles:
            2 Columnas Móvil / 4 Columnas Escritorio.
            Tarjetas más pequeñas y modestas con ícono y nombre de cada rol. */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon;

            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-[#D05E28] hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 cursor-pointer"
              >
                {/* Ícono de cada rol */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-100 group-hover:bg-[#D05E28]/10 text-slate-700 group-hover:text-[#D05E28] flex items-center justify-center mb-3 transition-colors shrink-0">
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                </div>

                {/* Nombre del rol */}
                <span className="text-xs sm:text-sm font-bold text-[#1A253B] group-hover:text-[#D05E28] leading-tight transition-colors line-clamp-3">
                  {role.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Botón sutil de instalación PWA en el inicio */}
        <div className="mt-8">
          <PWAInstallButton />
        </div>
      </div>
    </div>
  );
};
