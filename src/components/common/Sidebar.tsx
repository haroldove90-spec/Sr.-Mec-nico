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
  roles: RoleId[];
  description?: string;
}

const ALL_MODULES: NavMenuItem[] = [
  {
    id: 'm1_reception',
    label: 'Recepción e Historial Clínico',
    moduleCode: 'M1',
    icon: ClipboardList,
    roles: ['front_desk', 'admin', 'director'],
    description: 'Datos cliente, fiscal, historial y fotos',
  },
  {
    id: 'm2_inspection',
    label: 'Inspección 55 Puntos',
    moduleCode: 'M2',
    icon: CheckSquare,
    roles: ['mechanic', 'front_desk', 'director'],
    description: 'Checklist semaforizado y evidencias',
  },
  {
    id: 'm3_quote',
    label: 'Cotización y Autorización',
    moduleCode: 'M3',
    icon: Calculator,
    roles: ['front_desk', 'mechanic', 'admin', 'director'],
    description: 'Vista interactiva comparativa de piezas',
  },
  {
    id: 'm4_workshop',
    label: 'Taller, Evidencia y Reloj',
    moduleCode: 'M4',
    icon: Wrench,
    roles: ['mechanic', 'director'],
    description: 'Pruebas de manejo, cronómetro y pieza nueva',
  },
  {
    id: 'm4_purchases',
    label: 'Compras y Auditoría Anti-Robo',
    moduleCode: 'M4-A',
    icon: ShieldCheck,
    roles: ['admin', 'director'],
    description: 'Auditoría refacciones vs fotos mecánicas',
  },
  {
    id: 'm5_billing',
    label: 'Caja y Facturación CFDI',
    moduleCode: 'M5-C',
    icon: Receipt,
    roles: ['admin', 'director', 'front_desk'],
    description: 'Cobro de orden y timbrado CFDI 4.0',
  },
  {
    id: 'm5_delivery',
    label: 'Entrega de Vehículo y Firma',
    moduleCode: 'M5-E',
    icon: Car,
    roles: ['front_desk', 'director'],
    description: 'Recorrido físico y firma de piezas usadas',
  },
  {
    id: 'm6_crm_director',
    label: 'Productividad y CRM Post-Venta',
    moduleCode: 'M6',
    icon: TrendingUp,
    roles: ['director', 'admin', 'front_desk'],
    description: 'Evaluación de mecánicos, garantías y WhatsApp',
  },
];

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

  // Filter modules to prioritize active role's modules, but allow viewing all
  const roleModules = ALL_MODULES.filter((m) => m.roles.includes(activeRole));
  const otherModules = ALL_MODULES.filter((m) => !m.roles.includes(activeRole));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-18 sm:top-20 bottom-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Active Order Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CarFront className="w-3.5 h-3.5 text-[#D05E28]" />
              Vehículo en Trabajo
            </span>
            <button
              onClick={onNewOrder}
              className="flex items-center gap-1 text-xs font-semibold text-[#D05E28] hover:text-[#b84e1e] cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nuevo</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <select
              value={selectedOrderId}
              onChange={(e) => onSelectOrder(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#1A253B] focus:outline-none focus:ring-2 focus:ring-[#D05E28]"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.vehicle.plate} - {o.vehicle.make} {o.vehicle.model} ({o.orderNumber})
                </option>
              ))}
            </select>

            {selectedOrder && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="font-medium text-slate-700">
                  {selectedOrder.customer.name.split(' ')[0]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D05E28]/10 text-[#D05E28]">
                  Paso {selectedOrder.currentStep} / 16
                </span>
              </div>
            )}
          </div>

          {/* 16-step continuous linear protocol launcher */}
          <button
            onClick={() => {
              onOpen16Steps();
              onClose();
            }}
            className="w-full mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#1A253B] to-[#273756] text-white hover:shadow-md transition text-xs font-bold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-[#D05E28]" />
              <span>Protocolo Lineal 16 Pasos</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Modules List (Clean, without duplicate tabs) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos de tu Rol
          </div>

          {roleModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;

            return (
              <button
                key={module.id}
                onClick={() => {
                  onSelectModule(module.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-[#1A253B] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#1A253B]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    isActive
                      ? 'bg-[#D05E28] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate">
                      {module.label}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {module.moduleCode}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {otherModules.length > 0 && (
            <>
              <div className="pt-4 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Otros Módulos del Taller
              </div>

              {otherModules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;

                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      onSelectModule(module.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                      isActive
                        ? 'bg-[#1A253B] text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isActive
                          ? 'bg-[#D05E28] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">
                          {module.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {module.moduleCode}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Mobile close button */}
        <div className="p-3 border-t border-slate-200 lg:hidden flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Menú</span>
          </button>
        </div>
      </aside>
    </>
  );
};
