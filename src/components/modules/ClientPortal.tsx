import React, { useState } from 'react';
import {
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  MessageCircle,
  Receipt,
  Sparkles,
  ChevronRight,
  User,
  Wrench,
  Check,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder } from '../../types';

interface ClientPortalProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  orders: VehicleServiceOrder[];
  onSelectOrder: (orderId: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  order,
  onUpdateOrder,
  orders,
  onSelectOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'quote' | 'evidence'>('status');

  const parts = order.parts || [];

  const handleTogglePartApproval = (partId: string) => {
    const updated = parts.map((p) => (p.id === partId ? { ...p, approved: !p.approved } : p));
    onUpdateOrder({
      ...order,
      parts: updated,
    });
  };

  const handleApproveAll = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const updatedParts = parts.map((p) => ({ ...p, approved: true }));
    onUpdateOrder({
      ...order,
      parts: updatedParts,
      clientAuthorized: true,
      clientAuthTimestamp: new Date().toLocaleString('es-MX'),
      currentStep: Math.max(order.currentStep, 8),
    });
  };

  // Etapas del taller simplificadas para el cliente
  const getStageInfo = () => {
    const step = order.currentStep || 1;
    if (step <= 2) {
      return {
        stage: 'Recepción y Registro',
        description: 'Tu auto ha ingresado al taller. Se documentó el estado estético y niveles iniciales.',
        progress: 15,
        badge: 'En Recepción',
      };
    }
    if (step <= 5) {
      return {
        stage: 'Diagnóstico e Inspección 55 Puntos',
        description: 'Nuestros técnicos especializados están evaluando los 55 puntos de seguridad y ruidos.',
        progress: 35,
        badge: 'En Diagnóstico',
      };
    }
    if (step <= 7) {
      return {
        stage: 'Cotización y Autorización',
        description: 'Revisa las piezas dañadas con fotografías y autoriza la reparación desde tu pantalla.',
        progress: 50,
        badge: 'Requiere tu Autorización',
      };
    }
    if (step <= 11) {
      return {
        stage: 'Reparación en Taller',
        description: 'El mecánico está trabajando en el auto. Instalando refacciones nuevas con evidencia fotográfica.',
        progress: 75,
        badge: 'En Reparación',
      };
    }
    if (step <= 13) {
      return {
        stage: 'Prueba de Calidad y Liquidación',
        description: 'Prueba de manejo aprobada. Tu cuenta y factura electrónica CFDI están listas.',
        progress: 90,
        badge: 'Por Liquidar',
      };
    }
    return {
      stage: 'Listo para Entrega',
      description: 'Tu auto está listo para entrega física con tus piezas usadas empacadas.',
      progress: 100,
      badge: 'Listo para Recoger',
    };
  };

  const stageInfo = getStageInfo();

  // Cálculos financieros de la cotización
  const approvedParts = parts.filter((p) => p.approved);
  const partsSubtotal = approvedParts.reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = approvedParts.reduce((acc, p) => acc + p.laborCost, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Contactar asesor por WhatsApp
  const handleContactAdvisor = () => {
    const message = encodeURIComponent(
      `Hola, soy ${order.customer.name}. Tengo una consulta sobre el servicio de mi auto ${order.vehicle.make} ${order.vehicle.model} (Placas: ${order.vehicle.plate}, Folio: ${order.orderNumber}).`
    );
    window.open(`https://wa.me/525541928831?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-20">
      {/* Selector de vehículo para el cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05E28] block mb-1">
            Portal del Cliente • Monitoreo en Tiempo Real
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            Mi {order.vehicle.make} {order.vehicle.model} ({order.vehicle.year})
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Placas: <strong className="text-[#1A253B] font-mono">{order.vehicle.plate}</strong> • Folio de Orden: <strong className="text-[#1A253B]">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Si hay más autos para cambiar de vehículo */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Vehículo:</span>
            <select
              value={order.id}
              onChange={(e) => onSelectOrder(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28]"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.vehicle.plate} ({o.vehicle.make} {o.vehicle.model})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tarjeta Principal de Estado en Vivo (Live Tracker) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Monitoreo Activo en Taller
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
              {stageInfo.stage}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {stageInfo.description}
            </p>
          </div>

          <span className="px-4 py-2 rounded-xl text-sm font-extrabold bg-[#D05E28]/10 text-[#D05E28] border border-[#D05E28]/20 self-start sm:self-auto shrink-0">
            {stageInfo.badge}
          </span>
        </div>

        {/* Barra de Progreso */}
        <div>
          <div className="flex justify-between text-sm font-semibold text-slate-500 mb-2">
            <span>Progreso General del Servicio</span>
            <span className="text-[#D05E28] font-bold">{stageInfo.progress}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D05E28] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stageInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Fases Gráficas del Proceso */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: '1. Recepción', done: order.currentStep >= 2, current: order.currentStep <= 2 },
            { label: '2. Diagnóstico', done: order.currentStep >= 5, current: order.currentStep > 2 && order.currentStep <= 5 },
            { label: '3. En Taller', done: order.currentStep >= 11, current: order.currentStep > 5 && order.currentStep <= 11 },
            { label: '4. Entrega', done: order.delivered, current: order.currentStep > 11 },
          ].map((f, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border text-center transition ${
                f.current
                  ? 'border-[#D05E28] bg-[#D05E28]/10 text-[#D05E28] font-bold shadow-xs'
                  : f.done
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-xs font-bold">{f.label}</div>
              <div className="text-[11px] mt-0.5">
                {f.done ? '✓ Completado' : f.current ? '● En Proceso' : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>

        {/* Datos clave: Asesor y Mecánico */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Wrench className="w-5 h-5 text-[#D05E28]" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Técnico Asignado</span>
              <strong className="text-base text-[#1A253B]">
                {order.assignedMechanicName || 'Jefe de Taller Certificado'}
              </strong>
            </div>
          </div>

          <button
            onClick={handleContactAdvisor}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Consultar con mi Asesor (WhatsApp)</span>
          </button>
        </div>
      </div>

      {/* Navegación por Pestañas del Cliente */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-5 py-2.5 rounded-xl text-base font-bold transition cursor-pointer ${
            activeTab === 'status'
              ? 'bg-[#1A253B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Resumen General
        </button>
        <button
          onClick={() => setActiveTab('quote')}
          className={`px-5 py-2.5 rounded-xl text-base font-bold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'quote'
              ? 'bg-[#D05E28] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Cotización y Refacciones</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-white text-[#D05E28] font-black">
            {approvedParts.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`px-5 py-2.5 rounded-xl text-base font-bold transition cursor-pointer ${
            activeTab === 'evidence'
              ? 'bg-[#1A253B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fotos de Recepción
        </button>
      </div>

      {/* Pestaña 1: Resumen General */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Alerta de Cotización Pendiente si aplica */}
          {!order.clientAuthorized && parts.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#D05E28] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-amber-950">
                    Tu auto requiere autorización de refacciones
                  </h3>
                  <p className="text-sm text-amber-900 mt-0.5">
                    Se detectaron componentes urgentes durante la inspección. Puedes revisar la foto de la falla y autorizar en línea.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('quote')}
                className="px-5 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm font-bold shadow-xs transition cursor-pointer shrink-0"
              >
                Revisar y Autorizar
              </button>
            </div>
          )}

          {/* Comparador Rápido: Falla Documentada vs Instalada */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-[#1A253B] flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-[#D05E28]" />
              <span>Diagnóstico Visual de tu Auto</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {parts.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-[#1A253B]">{p.name}</h4>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                      {p.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{p.description}</p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-red-700 block">Pieza Dañada:</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                        <img src={p.damagedPhotoUrl} alt="Dañada" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-700 block">Nueva Instalada:</span>
                      <div className="h-28 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                        {p.installedPhotoUrl ? (
                          <img src={p.installedPhotoUrl} alt="Nueva" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400 text-center p-2">En proceso de montaje</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 2: Cotización y Autorización Interactiva por el Cliente */}
      {activeTab === 'quote' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B]">Presupuesto Detallado</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Puedes seleccionar las piezas que deseas autorizar para iniciar el trabajo en taller.
                </p>
              </div>

              {!order.clientAuthorized ? (
                <button
                  onClick={handleApproveAll}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-extrabold shadow-xs transition cursor-pointer"
                >
                  ✓ Autorizar Todo el Trabajo
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Autorizado el {order.clientAuthTimestamp}</span>
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-200">
              {parts.map((part) => (
                <div key={part.id} className="py-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={part.approved}
                        onChange={() => handleTogglePartApproval(part.id)}
                        className="w-5 h-5 mt-1 accent-[#D05E28] cursor-pointer"
                      />
                      <div>
                        <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">{part.name}</h4>
                        <p className="text-sm text-slate-500">{part.description}</p>
                      </div>
                    </div>

                    <strong className="text-lg font-black text-[#1A253B] self-end sm:self-center">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </strong>
                  </div>

                  {/* Comparativa Gráfica para el cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 flex items-center gap-3">
                      <img src={part.damagedPhotoUrl} alt="Dañada" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                      <div className="text-xs text-red-900">
                        <strong className="block text-sm">Evidencia de Falla</strong>
                        <span>Foto capturada en taller de inspección.</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center gap-3">
                      {part.installedPhotoUrl ? (
                        <>
                          <img src={part.installedPhotoUrl} alt="Instalada" className="w-20 h-20 object-cover rounded-lg shrink-0" />
                          <div className="text-xs text-emerald-900">
                            <strong className="block text-sm">Pieza Nueva Montada</strong>
                            <span>Verificada por el jefe de taller.</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 p-2">
                          <strong className="block text-sm text-slate-700">Pendiente de Montar</strong>
                          <span>El mecánico subirá la foto al instalar la refacción nueva.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Inversión */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                <span>Subtotal: ${subtotal.toLocaleString('es-MX')} • IVA: ${iva.toLocaleString('es-MX')}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-400 block font-semibold">Inversión Autorizada</span>
                <span className="text-2xl font-black text-[#D05E28]">
                  ${total.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 3: Fotos de Entrada */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-xl text-[#1A253B]">Inspección Estética Perimetral</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Fotografías tomadas por el asesor al momento en que entregaste tu vehículo.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {order.aestheticPhotos.map((photo, i) => (
              <div key={i} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="h-40 bg-slate-100">
                  <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <span className="text-sm font-bold text-[#1A253B] block">{photo.label}</span>
                  <span className="text-xs text-slate-400">{photo.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
