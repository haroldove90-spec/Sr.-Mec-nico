import React from 'react';
import { LogOut, UserCircle2, Menu, Sparkles } from 'lucide-react';
import { RoleId } from '../../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeRole: RoleId;
  onLogout: () => void;
  onToggleSidebar?: () => void;
  onOpen16Steps?: () => void;
  activeOrderNumber?: string;
}

const ROLE_DISPLAY_NAMES: Record<RoleId, string> = {
  front_desk: 'Recepción y Asesor',
  mechanic: 'Jefe de Taller',
  admin: 'Administración y Caja',
  director: 'Director General',
  client: 'Cliente (Propietario)',
};

const ROLE_FULL_NAMES: Record<RoleId, string> = {
  front_desk: 'Recepción y Asesor de Servicio (Front-Desk)',
  mechanic: 'Jefe de Taller y Mecánico (Técnico)',
  admin: 'Administración y Caja (Compras y Contabilidad)',
  director: 'Director General y CRM (Dirección)',
  client: 'Cliente (Monitoreo en Vivo de mi Auto)',
};

export const Header: React.FC<HeaderProps> = ({
  activeRole,
  onLogout,
  onToggleSidebar,
  onOpen16Steps,
  activeOrderNumber,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 h-16 sm:h-18 md:h-20 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Menu Toggle + Full-Size System Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
              aria-label="Abrir menú"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#1A253B]" />
            </button>
          )}

          {/* Logo sin encapsular, tamaño completo responsivo */}
          <div className="flex items-center py-1 shrink min-w-0">
            <img
              src="https://kabris.com.mx/srmecanicologo.png"
              alt="Sr. Mecánico"
              className="h-8 sm:h-11 md:h-13 w-auto max-w-[130px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-[300px] object-contain select-none"
            />
          </div>
        </div>

        {/* Right Action Bar: Role, 16 Steps, PWA Install, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick 16-Step Protocol Launcher (Desktop / Tablet) - solo para personal técnico de taller */}
          {onOpen16Steps && activeRole !== 'client' && activeRole !== 'front_desk' && (
            <button
              onClick={onOpen16Steps}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 text-[#D05E28] border border-[#D05E28]/30 hover:bg-[#D05E28]/10 text-xs font-bold transition cursor-pointer"
              title="Abrir Flujo Continuo de 16 Pasos"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>16 Pasos {activeOrderNumber ? `(${activeOrderNumber})` : ''}</span>
            </button>
          )}

          {/* Identificación del Rol Activo (Adaptable a pantallas pequeñas) */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80"
            title={`Rol Activo: ${ROLE_FULL_NAMES[activeRole]}`}
          >
            <UserCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#D05E28] shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:block leading-none">
                Rol Activo
              </span>
              {/* Short title on mobile, full on desktop */}
              <span className="text-xs sm:text-sm font-bold text-[#1A253B] truncate max-w-[80px] xs:max-w-[110px] sm:max-w-[150px] md:max-w-none">
                {ROLE_DISPLAY_NAMES[activeRole]}
              </span>
            </div>
          </div>

          {/* Botón de instalación rápida de la aplicación (Responsive) */}
          <div className="shrink-0">
            <PWAInstallButton />
          </div>

          {/* Botón de cierre de sesión */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs sm:text-sm font-medium transition cursor-pointer shrink-0"
            title="Cerrar sesión y cambiar de rol"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
