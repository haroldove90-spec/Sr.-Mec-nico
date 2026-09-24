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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Cotización y Autorización
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Comparador interactivo: Pieza Dañada vs Costo vs Pieza Nueva Instalada.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddPartModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-5 h-5 text-[#D05E28]" />
            <span>Agregar Pieza</span>
          </button>
          {!order.clientAuthorized ? (
            <button
              onClick={handleAuthorizeAll}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Autorizar Reparación</span>
            </button>
          ) : (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm sm:text-base font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Autorizado</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen del Diagnóstico (Diseño limpio y minimalista) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#D05E28]" />
          <h2 className="text-base sm:text-lg font-bold text-[#1A253B]">
            Diagnóstico Técnico de lo Urgente
          </h2>
        </div>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {order.diagnosisSummary || 'Desgaste crítico detectado en la inspección.'}
        </p>
      </div>

      {/* Comparador de Refacciones: Pieza Dañada | Costo | Pieza Nueva */}
      <div className="space-y-5">
        {parts.map((part) => (
          <div
            key={part.id}
            className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-xs p-5 sm:p-6 space-y-5 ${
              part.approved ? 'border-[#D05E28]/50 ring-1 ring-[#D05E28]/20' : 'border-slate-200 opacity-80'
            }`}
          >
            {/* Cabecera de la refacción */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={part.approved}
                  onChange={() => handleTogglePartApproval(part.id)}
                  className="w-5 h-5 mt-1 accent-[#D05E28] cursor-pointer"
                />
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">{part.name}</h3>
                  <p className="text-sm sm:text-base text-slate-500 mt-0.5">{part.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider ${
                    part.urgency === 'urgente' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {part.urgency}
                </span>
                <span className="font-extrabold text-lg sm:text-xl text-[#1A253B]">
                  ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                </span>
              </div>
            </div>

            {/* 3 Columnas Claras: 1. Daño | 2. Inversión | 3. Instalada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* 1. Dañada */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>1. Pieza Dañada (Evidencia)</span>
                </div>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                  <img
                    src={part.damagedPhotoUrl}
                    alt={part.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* 2. Desglose de Inversión */}
              <div className="flex flex-col justify-between p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1A253B] pb-2 border-b border-slate-200">
                  <Calculator className="w-4 h-4 text-[#D05E28]" />
                  <span>2. Desglose de Inversión</span>
                </div>

                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between text-slate-600">
                    <span>Refacción:</span>
                    <strong className="text-[#1A253B]">${part.cost.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Mano de Obra:</span>
                    <strong className="text-[#1A253B]">${part.laborCost.toLocaleString('es-MX')} MXN</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200">
                    <span>Garantía:</span>
                    <span>6 Meses</span>
                  </div>
                </div>

                <button
                  onClick={() => handleTogglePartApproval(part.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                    part.approved
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {part.approved ? '✓ Autorizada' : '+ Agregar a Reparación'}
                </button>
              </div>

              {/* 3. Nueva Instalada */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>3. Pieza Nueva Instalada</span>
                </div>
                <div className="h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                  {part.installedPhotoUrl ? (
                    <img
                      src={part.installedPhotoUrl}
                      alt="Instalada"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-600 block">
                        Pendiente de Instalación
                      </span>
                      <span className="text-xs text-slate-400">
                        Se documentará en bahía del taller
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen Total */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs max-w-md ml-auto space-y-4">
        <h4 className="font-extrabold text-base sm:text-lg text-[#1A253B] pb-3 border-b border-slate-100">
          Resumen de Inversión
        </h4>
        <div className="space-y-2 text-sm sm:text-base text-slate-600">
          <div className="flex justify-between">
            <span>Refacciones:</span>
            <strong className="text-[#1A253B]">${partsSubtotal.toLocaleString('es-MX')} MXN</strong>
          </div>
          <div className="flex justify-between">
            <span>Mano de Obra:</span>
            <strong className="text-[#1A253B]">${laborSubtotal.toLocaleString('es-MX')} MXN</strong>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <strong className="text-[#1A253B]">${iva.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</strong>
          </div>
          <div className="flex justify-between text-lg sm:text-xl font-extrabold text-[#1A253B] pt-3 border-t border-slate-200">
            <span>Total:</span>
            <span className="text-[#D05E28]">${total.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</span>
          </div>
        </div>

        <button
          onClick={order.clientAuthorized ? onNextStep : handleAuthorizeAll}
          className="w-full py-3.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-base shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{order.clientAuthorized ? 'Continuar al Siguiente Paso' : 'Aprobar y Generar Orden'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Agregar Pieza */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">Agregar Refacción</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A253B] mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Balatas Delanteras Wagner"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A253B] mb-1">Diagnóstico</label>
                <textarea
                  placeholder="Motivo del cambio..."
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A253B] mb-1">Costo Pieza ($)</label>
                  <input
                    type="number"
                    value={newPart.cost}
                    onChange={(e) => setNewPart({ ...newPart, cost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A253B] mb-1">Mano de Obra ($)</label>
                  <input
                    type="number"
                    value={newPart.laborCost}
                    onChange={(e) => setNewPart({ ...newPart, laborCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddPartModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPart}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#D05E28] hover:bg-[#b84e1e] rounded-xl cursor-pointer"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
