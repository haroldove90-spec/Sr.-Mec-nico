import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  AlertOctagon,
  MessageCircle,
  Calendar,
  DollarSign,
  Clock,
  Car,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder, MechanicPerformance } from '../../types';
import { INITIAL_MECHANICS } from '../../data/initialData';

interface M6CRMProductivityProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  orders: VehicleServiceOrder[];
}

export const M6CRMProductivity: React.FC<M6CRMProductivityProps> = ({
  order,
  onUpdateOrder,
  orders,
}) => {
  const [mechanics, setMechanics] = useState<MechanicPerformance[]>(INITIAL_MECHANICS);
  const [activeTab, setActiveTab] = useState<'productivity' | 'crm'>('productivity');

  // Trigger WhatsApp Follow-up (2 days) - Step 15
  const handleSend2DaysFollowUp = (targetOrder: VehicleServiceOrder) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const cleanPhone = (targetOrder.customer.fiscalData.whatsapp || targetOrder.customer.phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${targetOrder.customer.name}! Te escribe el equipo de Sr. Mecánico. Hace 2 días entregamos tu ${targetOrder.vehicle.make} ${targetOrder.vehicle.model} (${targetOrder.vehicle.plate}). ¿Cómo has sentido el vehículo y los cambios realizados? Estamos a tu servicio.`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    onUpdateOrder({
      ...targetOrder,
      followUp2DaysSent: true,
      followUp2DaysTimestamp: new Date().toLocaleDateString('es-MX'),
      currentStep: Math.max(targetOrder.currentStep, 16),
    });
  };

  // Trigger 15-day pre-maintenance alert - Step 16
  const handleSend15DaysAlert = (targetOrder: VehicleServiceOrder) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const cleanPhone = (targetOrder.customer.fiscalData.whatsapp || targetOrder.customer.phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `Estimado(a) ${targetOrder.customer.name}, en Sr. Mecánico cuidamos tu inversión. Faltan 15 días para la próxima revisión preventiva de tu ${targetOrder.vehicle.make} ${targetOrder.vehicle.model}. ¿Deseas que te reservemos tu bahía de servicio esta semana?`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    onUpdateOrder({
      ...targetOrder,
      alert15DaysSent: true,
      alert15DaysTimestamp: new Date().toLocaleDateString('es-MX'),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M6 & Dirección
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Dashboard de Productividad, Garantías y CRM
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluación técnica automatizada de comisiones, rastreador de garantías y disparador de WhatsApp post-venta.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'productivity'
                ? 'bg-white text-[#1A253B] shadow-xs'
                : 'text-slate-600 hover:text-[#1A253B]'
            }`}
          >
            Productividad y Garantías
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-[#D05E28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1A253B]'
            }`}
          >
            CRM Post-Venta (WhatsApp)
          </button>
        </div>
      </div>

      {activeTab === 'productivity' ? (
        <>
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Vehículos Atendidos</span>
                <Car className="w-4 h-4 text-[#D05E28]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1A253B]">34 Autos</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                +18% contra semana anterior
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Tiempo Promedio por Auto</span>
                <Clock className="w-4 h-4 text-[#D05E28]" />
              </div>
              <div className="text-2xl font-extrabold text-[#1A253B]">132 min</div>
              <div className="text-[11px] text-slate-500 mt-1">Meta estándar: 140 min</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Comisiones Automatizadas</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700">$11,220 MXN</div>
              <div className="text-[11px] text-slate-500 mt-1">Calculadas sobre mano de obra</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Rastreador de Garantías</span>
                <AlertOctagon className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600">8.8%</div>
              <div className="text-[11px] text-slate-500 mt-1">3 autos con retrabajo este mes</div>
            </div>
          </div>

          {/* Panel de Evaluación de Mecánicos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#1A253B] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#D05E28]" />
                  <span>Panel de Evaluación de Mecánicos y Cálculo de Comisiones</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cruza cuántos carros hizo cada técnico, tiempo invertido y penalizaciones por garantías.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {mechanics.map((mec) => {
                const isExcellent = mec.status === 'excelente';
                const isAlert = mec.status === 'alerta';

                return (
                  <div key={mec.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Name & Specialty */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0 ${
                            isExcellent ? 'bg-emerald-600' : isAlert ? 'bg-red-600' : 'bg-[#1A253B]'
                          }`}
                        >
                          {mec.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-[#1A253B]">{mec.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isExcellent
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isAlert
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isExcellent ? '★ Calidad Óptima' : isAlert ? '⚠ Alerta Garantías' : 'Normal'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{mec.specialty}</p>
                        </div>
                      </div>

                      {/* Productivity Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Carros Terminados</span>
                          <strong className="text-[#1A253B] text-sm">{mec.carsCompleted} vehículos</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Tiempo Promedio</span>
                          <strong className={`text-sm ${mec.avgTimeMinutes <= mec.standardTargetMinutes ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {mec.avgTimeMinutes} min / auto
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Garantías / Retrabajos</span>
                          <strong className={`text-sm ${mec.warrantyCount > 1 ? 'text-red-600' : 'text-slate-700'}`}>
                            {mec.warrantyCount} ({mec.warrantyRatePercent}%)
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Comisión Generada</span>
                          <strong className="text-emerald-700 text-sm font-extrabold">
                            ${mec.totalCommissions.toLocaleString('es-MX')} MXN
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* CRM Post-Venta (Paso 15 y Paso 16) */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>CRM Automatizado:</strong> Dispara los mensajes oficiales de satisfacción a los 2 días y el recordatorio preventivo 15 días antes directamente al WhatsApp del cliente.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-extrabold text-sm sm:text-base text-[#1A253B] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D05E28]" />
                <span>Programación de Mensajes Post-Venta por Vehículo</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#1A253B]">
                          {ord.customer.name}
                        </h4>
                        <span className="text-xs font-mono text-slate-500">
                          {ord.vehicle.plate} ({ord.vehicle.make} {ord.vehicle.model})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        WhatsApp: <strong>{ord.customer.fiscalData.whatsapp || ord.customer.phone}</strong> | Folio: {ord.orderNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Paso 15: Seguimiento a los 2 días */}
                      <button
                        onClick={() => handleSend2DaysFollowUp(ord)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          ord.followUp2DaysSent
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>
                          {ord.followUp2DaysSent ? '✓ Seguimiento 2 Días Enviado' : 'Disparar WhatsApp (2 Días)'}
                        </span>
                      </button>

                      {/* Paso 16: Alerta 15 días antes de próximo mantenimiento */}
                      <button
                        onClick={() => handleSend15DaysAlert(ord)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          ord.alert15DaysSent
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#1A253B] hover:bg-[#273756] text-white'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#D05E28]" />
                        <span>
                          {ord.alert15DaysSent ? '✓ Alerta 15 Días Programada' : 'Alerta 15 Días Antes (Mantenimiento)'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
