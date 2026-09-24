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
          { id: 'm1_reception', label: 'Recepción', icon: ClipboardList },
          { id: 'm3_quote', label: 'Cotización', icon: Calculator },
          { id: 'm5_delivery', label: 'Entrega', icon: Car },
          { id: 'linear_16_steps', label: '16 Pasos', icon: Workflow, isSpecial: true },
        ];
      case 'mechanic':
        return [
          { id: 'm2_inspection', label: '55 Puntos', icon: CheckSquare },
          { id: 'm4_workshop', label: 'Taller/Reloj', icon: Wrench },
          { id: 'linear_16_steps', label: '16 Pasos', icon: Workflow, isSpecial: true },
        ];
      case 'admin':
        return [
          { id: 'm4_purchases', label: 'Anti-Robo', icon: ShieldCheck },
          { id: 'm5_billing', label: 'Caja/CFDI', icon: Receipt },
          { id: 'linear_16_steps', label: '16 Pasos', icon: Workflow, isSpecial: true },
        ];
      case 'director':
        return [
          { id: 'm6_crm_director', label: 'Productividad', icon: TrendingUp },
          { id: 'm6_crm_followup', label: 'CRM WhatsApp', icon: MessageCircle },
          { id: 'linear_16_steps', label: '16 Pasos', icon: Workflow, isSpecial: true },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.isSpecial ? activeModule === 'linear_16_steps' : activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isSpecial) {
                  onOpen16Steps();
                } else {
                  onSelectModule(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#D05E28] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-[#D05E28]/10 text-[#D05E28]' : ''
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-xs sm:text-sm mt-0.5 font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
