import React from 'react';
import {
  ClipboardList,
  Wrench,
  Receipt,
  TrendingUp,
  Car,
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
  badge?: string;
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
  {
    id: 'client',
    name: 'Cliente (Monitoreo en Vivo de mi Auto)',
    icon: Car,
    badge: 'Nuevo',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        {/* Logo oficial a tamaño completo, sin encapsular */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <img
            src="https://kabris.com.mx/srmecanicologo.png"
            alt="Sr. Mecánico"
            className="h-16 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[360px] md:max-w-[420px] object-contain select-none transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>

        {/* Cuadrícula responsiva de acceso por roles:
            2 Columnas Móvil / 3 y 5 Columnas Escritorio.
            Tarjetas compactas con ícono y nombre de cada rol. */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isClient = role.id === 'client';

            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className={`group relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-150 cursor-pointer ${
                  isClient
                    ? 'border-[#D05E28]/40 hover:border-[#D05E28] hover:shadow-lg'
                    : 'border-slate-200/90 hover:border-[#D05E28] hover:shadow-md'
                } hover:-translate-y-0.5 active:scale-[0.98]`}
              >
                {role.badge && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D05E28] text-white">
                    {role.badge}
                  </span>
                )}

                {/* Ícono de cada rol */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 transition-colors shrink-0 ${
                    isClient
                      ? 'bg-[#D05E28]/10 text-[#D05E28] group-hover:bg-[#D05E28] group-hover:text-white'
                      : 'bg-slate-100 group-hover:bg-[#D05E28]/10 text-slate-700 group-hover:text-[#D05E28]'
                  }`}
                >
                  <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
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
