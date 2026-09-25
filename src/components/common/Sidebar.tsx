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
  PlusCircle,
  X,
  ChevronRight,
  CarFront,
  MessageCircle,
  History,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { RoleId, VehicleServiceOrder } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: RoleId;
  activeModule: string;
  onSelectModule: (moduleId: string) => void;
  orders: VehicleServiceOrder[];
  selectedOrderId: string;
  onSelectOrder: (orderId: string) => void;
  onNewOrder: () => void;
  onOpen16Steps: () => void;
}

interface NavMenuItem {
  id: string;
  label: string;
  moduleCode: string;
  icon: React.ElementType;
}

// Estricta separación de módulos por rol (sin filtrar ni mezclar otros módulos)
const ROLE_MODULES_MAP: Record<RoleId, { roleTitle: string; modules: NavMenuItem[] }> = {
  front_desk: {
    roleTitle: 'Recepción y Asesor de Servicio',
    modules: [
      {
        id: 'advisor_registration',
        label: 'Registro e Inventario de Autos',
        moduleCode: 'REG',
        icon: ClipboardList,
      },
      {
        id: 'advisor_delivery',
        label: 'Entrega y Retorno de Piezas',
        moduleCode: 'ENT',
        icon: CheckCircle2,
      },
      {
        id: 'advisor_history',
        label: 'Historial y Expedientes PDF',
        moduleCode: 'HIST',
        icon: History,
      },
      {
        id: 'advisor_metrics',
        label: 'Métricas de Asesor',
        moduleCode: 'MET',
        icon: TrendingUp,
      },
      {
        id: 'role_manual',
        label: 'Manual del Asesor',
        moduleCode: 'DOC',
        icon: BookOpen,
      },
    ],
  },
  mechanic: {
    roleTitle: 'Jefe de Taller y Mecánico',
    modules: [
      {
        id: 'm2_inspection',
        label: 'Inspección de 55 Puntos',
        moduleCode: 'M2',
        icon: CheckSquare,
      },
      {
        id: 'm4_workshop',
        label: 'Taller, Evidencias y Cronómetro',
        moduleCode: 'M4',
        icon: Wrench,
      },
      {
        id: 'role_manual',
        label: 'Manual del Mecánico',
        moduleCode: 'DOC',
        icon: BookOpen,
      },
    ],
  },
  admin: {
    roleTitle: 'Administración y Caja',
    modules: [
      {
        id: 'm4_purchases',
        label: 'Compras y Auditoría Anti-Robo',
        moduleCode: 'M4',
        icon: ShieldCheck,
      },
      {
        id: 'm5_billing',
        label: 'Caja y Facturación CFDI',
        moduleCode: 'M5',
        icon: Receipt,
      },
      {
        id: 'role_manual',
        label: 'Manual de Administración',
        moduleCode: 'DOC',
        icon: BookOpen,
      },
    ],
  },
  director: {
    roleTitle: 'Director General y CRM',
    modules: [
      {
        id: 'm6_crm_director',
        label: 'Productividad y Calidad',
        moduleCode: 'DIR',
        icon: TrendingUp,
      },
      {
        id: 'm6_crm_followup',
        label: 'CRM Post-Venta (WhatsApp)',
        moduleCode: 'M6',
        icon: MessageCircle,
      },
      {
        id: 'role_manual',
        label: 'Manual del Director',
        moduleCode: 'DOC',
        icon: BookOpen,
      },
    ],
  },
  client: {
    roleTitle: 'Cliente (Propietario)',
    modules: [
      {
        id: 'client_live',
        label: 'Monitoreo en Tiempo Real',
        moduleCode: 'AUTO',
        icon: Car,
      },
      {
        id: 'role_manual',
        label: 'Guía de Monitoreo',
        moduleCode: 'DOC',
        icon: BookOpen,
      },
    ],
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeRole,
  activeModule,
  onSelectModule,
  orders,
  selectedOrderId,
  onSelectOrder,
  onNewOrder,
  onOpen16Steps,
}) => {
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const roleConfig = ROLE_MODULES_MAP[activeRole];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 sm:top-20 bottom-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Selector de Vehículo en Trabajo (EXCLUSIVO para Jefe de Taller / Mecánico. Se retira de Asesor, Cliente, Administración y Director) */}
        {activeRole === 'mechanic' && (
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CarFront className="w-4 h-4 text-[#D05E28]" />
                Auto en Taller
              </span>
              <button
                onClick={onNewOrder}
                className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#D05E28] hover:text-[#b84e1e] cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>

            <div className="space-y-2">
              <select
                value={selectedOrderId}
                onChange={(e) => onSelectOrder(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-[#1A253B] focus:outline-none focus:ring-2 focus:ring-[#D05E28]"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.vehicle.plate} • {o.vehicle.make} {o.vehicle.model}
                  </option>
                ))}
              </select>

              {selectedOrder && (
                <div className="flex items-center justify-between text-xs text-slate-600 px-0.5">
                  <span className="font-semibold truncate max-w-[170px]">
                    {selectedOrder.customer.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D05E28]/10 text-[#D05E28]">
                    Paso {selectedOrder.currentStep} de 16
                  </span>
                </div>
              )}
            </div>

            {/* Botón Acceso Rápido al Protocolo Continuo */}
            <button
              onClick={() => {
                onOpen16Steps();
                onClose();
              }}
              className="w-full mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#1A253B] text-white hover:bg-[#273756] transition text-sm font-bold cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Workflow className="w-4 h-4 text-[#D05E28]" />
                <span>Flujo Continuo (16 Pasos)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        )}

        {/* Lista de Módulos (ÚNICAMENTE los del rol activo) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
            Módulos Asignados
          </div>

          {roleConfig.modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;

            return (
              <button
                key={module.id}
                onClick={() => {
                  onSelectModule(module.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1A253B] text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#1A253B]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-[#D05E28] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate">
                      {module.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {module.moduleCode}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Botón cerrar en móvil */}
        <div className="p-3 border-t border-slate-200 lg:hidden flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Menú</span>
          </button>
        </div>
      </aside>
    </>
  );
};
