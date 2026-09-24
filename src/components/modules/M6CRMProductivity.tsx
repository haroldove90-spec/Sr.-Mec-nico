import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  AlertOctagon,
  MessageCircle,
  Calendar,
  DollarSign,
  Clock,
  Car,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder, MechanicPerformance } from '../../types';
import { INITIAL_MECHANICS } from '../../data/initialData';

interface M6CRMProductivityProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  orders: VehicleServiceOrder[];
  defaultTab?: 'productivity' | 'crm';
}

export const M6CRMProductivity: React.FC<M6CRMProductivityProps> = ({
  order,
  onUpdateOrder,
  orders,
  defaultTab = 'productivity',
}) => {
  const [mechanics] = useState<MechanicPerformance[]>(INITIAL_MECHANICS);
  const [activeTab, setActiveTab] = useState<'productivity' | 'crm'>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Disparar WhatsApp de Seguimiento a los 2 días (Paso 15)
  const handleSend2DaysFollowUp = (targetOrder: VehicleServiceOrder) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const cleanPhone = (targetOrder.customer.fiscalData.whatsapp || targetOrder.customer.phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${targetOrder.customer.name}! Te saluda el equipo de Sr. Mecánico. Hace 2 días entregamos tu ${targetOrder.vehicle.make} ${targetOrder.vehicle.model} (${targetOrder.vehicle.plate}). ¿Cómo has sentido el vehículo y los cambios realizados? Estamos a tu servicio.`
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

  // Disparar Alerta 15 días antes de próximo servicio (Paso 16)
  const handleSend15DaysAlert = (targetOrder: VehicleServiceOrder) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const cleanPhone = (targetOrder.customer.fiscalData.whatsapp || targetOrder.customer.phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `Estimado(a) ${targetOrder.customer.name}, en Sr. Mecánico cuidamos tu auto. Faltan 15 días para la próxima revisión preventiva de tu ${targetOrder.vehicle.make} ${targetOrder.vehicle.model}. ¿Deseas agendar tu cita esta semana?`
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            {activeTab === 'productivity' ? 'Productividad y Calidad' : 'CRM Post-Venta (WhatsApp)'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            {activeTab === 'productivity'
              ? 'Evaluación de mecánicos, tiempos invertidos y cálculo automático de comisiones.'
              : 'Disparadores oficiales de WhatsApp a los 2 días y recordatorio 15 días antes.'}
          </p>
        </div>

        {/* Selector de Pestañas minimalista */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-bold transition cursor-pointer ${
              activeTab === 'productivity'
                ? 'bg-white text-[#1A253B] shadow-xs'
                : 'text-slate-600 hover:text-[#1A253B]'
            }`}
          >
            Productividad
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2.5 rounded-lg text-sm sm:text-base font-bold transition cursor-pointer ${
              activeTab === 'crm'
                ? 'bg-[#D05E28] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#1A253B]'
            }`}
          >
            CRM WhatsApp
          </button>
        </div>
      </div>

      {activeTab === 'productivity' ? (
        <>
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span className="font-semibold">Vehículos Atendidos</span>
                <Car className="w-5 h-5 text-[#D05E28]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1A253B]">34 Autos</div>
              <div className="text-sm text-emerald-600 font-semibold mt-1">+18% esta semana</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span className="font-semibold">Tiempo Promedio</span>
                <Clock className="w-5 h-5 text-[#D05E28]" />
              </div>
              <div className="text-3xl font-extrabold text-[#1A253B]">132 min</div>
              <div className="text-sm text-slate-500 mt-1">Estándar: 140 min</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span className="font-semibold">Comisiones a Pagar</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700">$11,220 MXN</div>
              <div className="text-sm text-slate-500 mt-1">Calculadas sobre M.O.</div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
                <span className="font-semibold">Tasa de Garantías</span>
                <AlertOctagon className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600">8.8%</div>
              <div className="text-sm text-slate-500 mt-1">3 retornos por ajuste</div>
            </div>
          </div>

          {/* Lista de Mecánicos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg sm:text-xl text-[#1A253B] flex items-center gap-2.5">
                <Award className="w-6 h-6 text-[#D05E28]" />
                <span>Rendimiento Técnico y Comisiones</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {mechanics.map((mec) => (
                <div key={mec.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">{mec.name}</h4>
                      <p className="text-sm text-slate-500">{mec.specialty}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-sm">
                      <div>
                        <span className="text-slate-400 block text-xs">Completados</span>
                        <strong className="text-[#1A253B] text-base">{mec.carsCompleted} autos</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Tiempo Prom.</span>
                        <strong className="text-[#1A253B] text-base">{mec.avgTimeMinutes} min</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Garantías</span>
                        <strong className="text-slate-700 text-base">{mec.warrantyCount} ({mec.warrantyRatePercent}%)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-xs">Comisión</span>
                        <strong className="text-emerald-700 text-base font-extrabold">
                          ${mec.totalCommissions.toLocaleString('es-MX')} MXN
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* CRM Post-Venta */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B] flex items-center gap-2.5">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
              <span>Mensajes de Seguimiento y Próxima Visita</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 sm:p-6 hover:bg-slate-50/50 transition">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">
                      {ord.customer.name}
                    </h4>
                    <p className="text-sm text-slate-600 mt-0.5">
                      {ord.vehicle.plate} • {ord.vehicle.make} {ord.vehicle.model}
                    </p>
                    <p className="text-sm text-slate-500 font-mono mt-0.5">
                      WhatsApp: {ord.customer.fiscalData.whatsapp || ord.customer.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleSend2DaysFollowUp(ord)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                        ord.followUp2DaysSent
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{ord.followUp2DaysSent ? 'Enviado (2 Días)' : 'Enviar WhatsApp (2 Días)'}</span>
                    </button>

                    <button
                      onClick={() => handleSend15DaysAlert(ord)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                        ord.alert15DaysSent
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-[#1A253B] hover:bg-[#273756] text-white shadow-xs'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-[#D05E28]" />
                      <span>{ord.alert15DaysSent ? 'Alerta Programada' : 'Alerta 15 Días Antes'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
