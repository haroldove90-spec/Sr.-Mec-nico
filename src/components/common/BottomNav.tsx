import React from 'react';
import {
  ClipboardList,
  CheckSquare,
  Calculator,
  Wrench,
  ShieldCheck,
  Receipt,
  Car,
  TrendingUp,
  Workflow,
  MessageCircle,
  History,
  Camera,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { RoleId } from '../../types';

interface BottomNavProps {
  activeRole: RoleId;
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  onOpen16Steps: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeRole,
  activeModule,
  onSelectModule,
  onOpen16Steps,
}) => {
  // Configuración estricta por rol (únicamente módulos asignados)
  const getNavItems = () => {
    switch (activeRole) {
      case 'front_desk':
        return [
          { id: 'advisor_registration', label: 'Registro Auto', icon: ClipboardList },
          { id: 'advisor_delivery', label: 'Entrega Auto', icon: CheckCircle2 },
          { id: 'advisor_history', label: 'Historial', icon: History },
          { id: 'role_manual', label: 'Manual', icon: BookOpen },
        ];
      case 'mechanic':
        return [
          { id: 'm2_inspection', label: '55 Puntos', icon: CheckSquare },
          { id: 'm4_workshop', label: 'Taller/Reloj', icon: Wrench },
          { id: 'linear_16_steps', label: '16 Pasos', icon: Workflow, isSpecial: true },
          { id: 'role_manual', label: 'Manual', icon: BookOpen },
        ];
      case 'admin':
        return [
          { id: 'm4_purchases', label: 'Anti-Robo', icon: ShieldCheck },
          { id: 'm5_billing', label: 'Caja/CFDI', icon: Receipt },
          { id: 'role_manual', label: 'Manual', icon: BookOpen },
        ];
      case 'director':
        return [
          { id: 'm6_crm_director', label: 'Productividad', icon: TrendingUp },
          { id: 'm6_crm_followup', label: 'CRM WhatsApp', icon: MessageCircle },
          { id: 'role_manual', label: 'Manual', icon: BookOpen },
        ];
      case 'client':
        return [
          { id: 'client_live', label: 'Mi Auto', icon: Car },
          { id: 'client_quote', label: 'Cotización', icon: Calculator },
          { id: 'client_evidence', label: 'Fotos', icon: Camera },
          { id: 'role_manual', label: 'Manual', icon: BookOpen },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl pb-safe ${
        activeRole === 'client' ? 'block' : 'lg:hidden'
      }`}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isSpecial
            ? activeModule === 'linear_16_steps'
            : activeModule === item.id ||
              (activeRole === 'client' &&
                item.id === 'client_live' &&
                (!activeModule || activeModule === 'client' || !activeModule.startsWith('client_')));

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (item.isSpecial) {
                  onOpen16Steps();
                } else {
                  onSelectModule(item.id);
                }
              }}
              className={`flex-1 h-full flex flex-col items-center justify-center py-1 px-1 transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-[#D05E28] font-black'
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl pointer-events-none transition-colors ${
                  isActive ? 'bg-[#D05E28]/15 text-[#D05E28]' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-xs mt-0.5 font-bold leading-tight pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
