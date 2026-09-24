import React, { useState } from 'react';
import {
  TrendingUp,
  Car,
  Camera,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  Filter,
  FileCheck,
  Receipt,
  UserCheck,
  Award,
} from 'lucide-react';
import { VehicleServiceOrder, AdvisorMovement } from '../../../types';

interface AdvisorMetricsProps {
  orders: VehicleServiceOrder[];
  movements: AdvisorMovement[];
}

export const AdvisorMetrics: React.FC<AdvisorMetricsProps> = ({
  orders,
  movements,
}) => {
  const [filterAction, setFilterAction] = useState<string>('todos');

  // Cálculos de métricas
  const totalRegistered = orders.length;
  const totalDelivered = orders.filter((o) => o.delivered).length;
  const totalAuthorized = orders.filter((o) => o.clientAuthorized).length;
  const authorizationRate = totalRegistered > 0 ? Math.round((totalAuthorized / totalRegistered) * 100) : 0;

  const totalQuotedValue = orders.reduce((acc, o) => {
    const partsTotal = (o.parts || []).reduce((sum, p) => sum + p.cost + p.laborCost, 0);
    return acc + partsTotal * 1.16;
  }, 0);

  const averageTicket = totalRegistered > 0 ? totalQuotedValue / totalRegistered : 0;

  const totalPhotosTaken = orders.reduce((acc, o) => acc + (o.aestheticPhotos?.length || 0), 0);

  const filteredMovements = movements.filter((m) => {
    if (filterAction === 'todos') return true;
    return m.action === filterAction;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05E28] block mb-1">
            Recepción y Asesor • Productividad y Trazabilidad
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            Métricas de Desempeño y Movimientos
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Registro cronológico y analítica de todos los autos, fotos, cotizaciones y entregas del asesor.
          </p>
        </div>
      </div>

      {/* Tarjetas Principales de Desempeño */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span className="font-semibold">Autos Registrados</span>
            <Car className="w-5 h-5 text-[#D05E28]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A253B]">{totalRegistered} autos</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalDelivered} entregados exitosamente
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span className="font-semibold">Fotos de Evidencia</span>
            <Camera className="w-5 h-5 text-[#D05E28]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A253B]">{totalPhotosTaken} tomas</div>
          <div className="text-xs text-slate-500 mt-1">Perimetrales y odómetro</div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span className="font-semibold">Tasa de Aprobación</span>
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{authorizationRate}%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            {totalAuthorized} cotizaciones aceptadas
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span className="font-semibold">Ticket Promedio</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A253B]">
            ${averageTicket.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">Por vehículo atendido</div>
        </div>
      </div>

      {/* Bitácora de Movimientos del Asesor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B] flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-[#D05E28]" />
              <span>Bitácora Cronológica de Movimientos Realizados</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Registro auditado de cada acción ejecutada en el taller.
            </p>
          </div>

          {/* Filtro por tipo de acción */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-[#1A253B]"
            >
              <option value="todos">Todos los movimientos</option>
              <option value="registro_auto">Registros de auto</option>
              <option value="fotos_esteticas">Fotos tomadas</option>
              <option value="diagnostico_entregado">Diagnósticos entregados</option>
              <option value="cotizacion_generada">Cotizaciones generadas</option>
              <option value="autorizacion_cliente">Aprobaciones de clientes</option>
              <option value="recorrido_coche">Recorridos de niveles</option>
              <option value="entrega_coche">Entregas de auto</option>
            </select>
          </div>
        </div>

        {/* Lista detallada de movimientos */}
        <div className="divide-y divide-slate-100">
          {filteredMovements.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No hay movimientos registrados en este filtro.
            </div>
          ) : (
            filteredMovements.map((mov) => {
              return (
                <div
                  key={mov.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-[#D05E28] shrink-0 mt-0.5">
                      {mov.action === 'registro_auto' && <Car className="w-5 h-5" />}
                      {mov.action === 'fotos_esteticas' && <Camera className="w-5 h-5" />}
                      {mov.action === 'diagnostico_entregado' && <FileCheck className="w-5 h-5" />}
                      {mov.action === 'cotizacion_generada' && <Receipt className="w-5 h-5" />}
                      {mov.action === 'autorizacion_cliente' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {mov.action === 'recorrido_coche' && <UserCheck className="w-5 h-5" />}
                      {mov.action === 'entrega_coche' && <Award className="w-5 h-5 text-emerald-600" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#1A253B]">
                          {mov.actionLabel}
                        </span>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {mov.plate}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          (Folio: {mov.orderNumber})
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm">{mov.description}</p>
                      <span className="text-xs text-slate-400 font-medium block">
                        Cliente: {mov.customerName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <div className="text-xs text-slate-500 font-mono flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mov.timestamp}</span>
                    </div>
                    {mov.amount && (
                      <span className="text-sm font-black text-emerald-700 block mt-1">
                        +${mov.amount.toLocaleString('es-MX')} MXN
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
