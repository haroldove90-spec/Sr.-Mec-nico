import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Calculator,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder, DamagedPart } from '../../types';

interface M3QuoteAuthorizationProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M3QuoteAuthorization: React.FC<M3QuoteAuthorizationProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPart, setNewPart] = useState<Partial<DamagedPart>>({
    name: '',
    description: '',
    cost: 0,
    laborCost: 0,
    urgency: 'urgente',
    damagedPhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    approved: true,
  });

  const parts = order.parts || [];

  const handleTogglePartApproval = (partId: string) => {
    const updated = parts.map((p) => (p.id === partId ? { ...p, approved: !p.approved } : p));
    onUpdateOrder({
      ...order,
      parts: updated,
    });
  };

  const handleAddPart = () => {
    if (!newPart.name) return;
    const created: DamagedPart = {
      id: `p-${Date.now()}`,
      name: newPart.name || 'Refacción Adicional',
      description: newPart.description || '',
      cost: Number(newPart.cost) || 0,
      laborCost: Number(newPart.laborCost) || 0,
      urgency: (newPart.urgency as 'urgente' | 'preventivo' | 'recomendado') || 'urgente',
      damagedPhotoUrl: newPart.damagedPhotoUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      installedPhotoUrl: '',
      approved: true,
    };

    onUpdateOrder({
      ...order,
      parts: [...parts, created],
    });
    setShowAddPartModal(false);
    setNewPart({
      name: '',
      description: '',
      cost: 0,
      laborCost: 0,
      urgency: 'urgente',
      damagedPhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    });
  };

  const handleAuthorizeAll = () => {
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

    if (onNextStep) {
      setTimeout(onNextStep, 600);
    }
  };

  // Calculations
  const approvedParts = parts.filter((p) => p.approved);
  const partsSubtotal = approvedParts.reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = approvedParts.reduce((acc, p) => acc + p.laborCost, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M3
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Cotización Dinámica y Autorización Interactiva
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Vista comparativa en una sola página: Pieza Dañada vs Costo vs Pieza Nueva Instalada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setShowAddPartModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
          >
            <Plus className="w-4 h-4 text-[#D05E28]" />
            <span>Agregar Pieza</span>
          </button>
          {!order.clientAuthorized ? (
            <button
              onClick={handleAuthorizeAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Autorizar Reparación</span>
            </button>
          ) : (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Autorizado {order.clientAuthTimestamp}</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis Summary Banner */}
      <div className="bg-gradient-to-r from-[#1A253B] to-[#273756] rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-[#D05E28]" />
          <h2 className="text-base sm:text-lg font-bold">Diagnóstico Técnico y Reporte de Urgencia</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-4xl">
          {order.diagnosisSummary ||
            'Diagnóstico preventivo y correctivo realizado tras inspección de los 55 puntos. Se presentan las refacciones con daño mecánico directo.'}
        </p>
      </div>

      {/* Interactive Visual Comparison: Pieza Dañada | Costo Reemplazo | Pieza Nueva Instalada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[#1A253B] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D05E28]" />
            <span>Comparador Visual Interactivo de Refacciones</span>
          </h3>
          <span className="text-xs text-slate-500">
            {approvedParts.length} de {parts.length} refacciones autorizadas
          </span>
        </div>

        {parts.map((part) => (
          <div
            key={part.id}
            className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs ${
              part.approved ? 'border-[#D05E28]/40 ring-1 ring-[#D05E28]/20' : 'border-slate-200 opacity-80'
            }`}
          >
            <div className="p-4 sm:p-5">
              {/* Header of the Part */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={part.approved}
                    onChange={() => handleTogglePartApproval(part.id)}
                    className="w-4.5 h-4.5 rounded accent-[#D05E28] cursor-pointer"
                  />
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1A253B]">{part.name}</h4>
                    <p className="text-xs text-slate-500">{part.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      part.urgency === 'urgente'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {part.urgency}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block sm:inline mr-1">Costo Total:</span>
                    <span className="font-bold text-sm sm:text-base text-[#1A253B]">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* 3-Column Interactive Comparison:
                  Column 1: Pieza Dañada
                  Column 2: Costo y Desglose
                  Column 3: Pieza Nueva Instalada */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-center">
                {/* 1. Pieza Dañada */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-red-700">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> 1. Pieza Dañada (Evidencia)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Taller</span>
                  </div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-red-200 group">
                    <img
                      src={part.damagedPhotoUrl}
                      alt={part.name}
                      className="w-full h-full object-cover transition group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs p-1.5 text-white text-[10px] text-center font-medium">
                      Falla documentada en diagnóstico
                    </div>
                  </div>
                </div>

                {/* 2. Costo y Cotización */}
                <div className="flex flex-col justify-center p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A253B] pb-1 border-b border-slate-200">
                    <Calculator className="w-3.5 h-3.5 text-[#D05E28]" />
                    <span>2. Desglose de Inversión</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Refacción Original / OEM:</span>
                    <span className="font-semibold text-slate-800">${part.cost.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Mano de Obra Certificada:</span>
                    <span className="font-semibold text-slate-800">${part.laborCost.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-200">
                    <span>Garantía de Reparación:</span>
                    <span className="font-bold text-emerald-600">6 Meses / 10,000 km</span>
                  </div>

                  <button
                    onClick={() => handleTogglePartApproval(part.id)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      part.approved
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {part.approved ? '✓ Autorizada por Cliente' : '+ Incluir en Reparación'}
                  </button>
                </div>

                {/* 3. Pieza Nueva Instalada */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> 3. Pieza Nueva Instalada
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Auditoría</span>
                  </div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-emerald-200 group flex items-center justify-center">
                    {part.installedPhotoUrl ? (
                      <>
                        <img
                          src={part.installedPhotoUrl}
                          alt="Pieza Nueva"
                          className="w-full h-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-emerald-950/80 backdrop-blur-xs p-1.5 text-emerald-100 text-[10px] text-center font-medium">
                          Instalada por: {part.installedBy || 'Técnico asignado'}
                        </div>
                      </>
                    ) : (
                      <div className="p-4 text-center text-slate-400">
                        <Clock className="w-6 h-6 mx-auto mb-1 opacity-50 text-amber-500" />
                        <span className="text-xs font-semibold block text-slate-600">
                          Pendiente de Instalación
                        </span>
                        <span className="text-[10px] text-slate-400">
                          El mecánico capturará la foto obligatoria en el Paso 9 del taller.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Total Summary Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs max-w-md ml-auto space-y-3">
        <h4 className="font-extrabold text-sm text-[#1A253B] pb-2 border-b border-slate-100">
          Resumen de Presupuesto Autorizado
        </h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Refacciones autorizadas:</span>
            <span className="font-semibold">${partsSubtotal.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Mano de obra:</span>
            <span className="font-semibold">${laborSubtotal.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold">${subtotal.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>IVA (16%):</span>
            <span className="font-semibold">${iva.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
          </div>
          <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#1A253B] pt-2 border-t border-slate-200">
            <span>Inversión Total:</span>
            <span className="text-[#D05E28]">${total.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
          </div>
        </div>

        <div className="pt-2">
          {!order.clientAuthorized ? (
            <button
              onClick={handleAuthorizeAll}
              className="w-full py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Aprobar y Generar Orden de Trabajo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onNextStep}
              className="w-full py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continuar al Paso Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Add Part */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-[#1A253B]">Agregar Refacción a Cotizar</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nombre de la Refacción</label>
                <input
                  type="text"
                  placeholder="Ej: Amortiguador Delantero Monroe Gas..."
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Diagnóstico / Motivo de Daño</label>
                <textarea
                  placeholder="Motivo del cambio..."
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Costo Refacción ($)</label>
                  <input
                    type="number"
                    value={newPart.cost}
                    onChange={(e) => setNewPart({ ...newPart, cost: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mano de Obra ($)</label>
                  <input
                    type="number"
                    value={newPart.laborCost}
                    onChange={(e) => setNewPart({ ...newPart, laborCost: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddPartModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPart}
                className="px-4 py-2 text-xs font-bold text-white bg-[#D05E28] hover:bg-[#b84e1e] rounded-lg cursor-pointer"
              >
                Guardar y Cotizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
