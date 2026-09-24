import React from 'react';
import {
  ShieldCheck,
  FileCheck,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { VehicleServiceOrder } from '../../types';

interface M4PurchasesAuditProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M4PurchasesAudit: React.FC<M4PurchasesAuditProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const parts = order.parts || [];

  const handleUpdatePartPurchase = (
    partId: string,
    field: 'supplier' | 'purchaseCost' | 'invoiceNumber',
    value: string | number
  ) => {
    const updated = parts.map((p) => {
      if (p.id === partId) {
        return {
          ...p,
          [field]: value,
        };
      }
      return p;
    });

    onUpdateOrder({
      ...order,
      parts: updated,
    });
  };

  const handleToggleAudit = (partId: string) => {
    const updated = parts.map((p) => {
      if (p.id === partId) {
        return {
          ...p,
          auditVerified: !p.auditVerified,
        };
      }
      return p;
    });

    onUpdateOrder({
      ...order,
      parts: updated,
    });
  };

  const handleGenerateWorkOrder = () => {
    onUpdateOrder({
      ...order,
      workOrderGenerated: true,
      currentStep: Math.max(order.currentStep, 9),
    });
  };

  const totalCharged = parts.reduce((acc, p) => acc + p.cost, 0);
  const totalPurchaseCost = parts.reduce((acc, p) => acc + (p.purchaseCost || 0), 0);
  const grossProfit = totalCharged - totalPurchaseCost;
  const verifiedCount = parts.filter((p) => p.auditVerified).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Compras y Auditoría Anti-Robo
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Validación contable de refacciones adquiridas contra la foto del mecánico en bahía.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!order.workOrderGenerated ? (
            <button
              onClick={handleGenerateWorkOrder}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <FileCheck className="w-5 h-5" />
              <span>Emitir Orden de Compra</span>
            </button>
          ) : (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm sm:text-base font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Orden Emitida</span>
            </div>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <span>Ir a Caja</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Resumen Financiero Minimalista */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-1">
            <span className="font-semibold">Costo de Insumos</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-3xl font-extrabold text-[#1A253B]">
            ${totalPurchaseCost.toLocaleString('es-MX')} MXN
          </div>
          <div className="text-xs text-slate-400 mt-1">Costo proveedores</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-1">
            <span className="font-semibold">Cobrado al Cliente</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            ${totalCharged.toLocaleString('es-MX')} MXN
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Margen bruto: +${grossProfit.toLocaleString('es-MX')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-1">
            <span className="font-semibold">Auditoría Visual</span>
            <ShieldCheck className="w-5 h-5 text-[#D05E28]" />
          </div>
          <div className="text-3xl font-extrabold text-[#D05E28]">
            {verifiedCount} de {parts.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Conciliadas contra foto</div>
        </div>
      </div>

      {/* Matriz de Auditoría de Refacciones */}
      <div className="space-y-5">
        {parts.map((part) => (
          <div
            key={part.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">{part.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Vehículo: {order.vehicle.make} {order.vehicle.model} ({order.vehicle.plate})
                </p>
              </div>

              <button
                onClick={() => handleToggleAudit(part.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center gap-2 self-start sm:self-auto ${
                  part.auditVerified
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-[#D05E28] text-white hover:bg-[#b84e1e]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{part.auditVerified ? '✓ Conciliado' : 'Aprobar Auditoría'}</span>
              </button>
            </div>

            {/* Cruce Contable y Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* 1. Compra */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-sm font-bold text-[#1A253B] block pb-1 border-b border-slate-200">
                  1. Factura Proveedor
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={part.supplier || ''}
                    onChange={(e) => handleUpdatePartPurchase(part.id, 'supplier', e.target.value)}
                    placeholder="AutoZone, etc..."
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Costo Compra ($)</label>
                  <input
                    type="number"
                    value={part.purchaseCost || 0}
                    onChange={(e) => handleUpdatePartPurchase(part.id, 'purchaseCost', Number(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-bold text-base"
                  />
                </div>
              </div>

              {/* 2. Venta */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-sm font-bold text-[#1A253B] block pb-1 border-b border-slate-200">
                  2. Cobro al Cliente
                </span>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-600">Precio Cobrado:</span>
                  <strong className="text-base text-[#1A253B]">${part.cost.toLocaleString('es-MX')} MXN</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Costo Insumo:</span>
                  <strong className="text-base text-slate-700">${(part.purchaseCost || 0).toLocaleString('es-MX')} MXN</strong>
                </div>
                <div className="flex justify-between text-sm font-bold text-emerald-700 pt-2 border-t border-slate-200">
                  <span>Ganancia:</span>
                  <span>+${(part.cost - (part.purchaseCost || 0)).toLocaleString('es-MX')} MXN</span>
                </div>
              </div>

              {/* 3. Foto de Instalación Real */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <span className="text-sm font-bold text-[#1A253B] block pb-1 border-b border-slate-200">
                  3. Evidencia del Mecánico
                </span>
                <div className="h-36 rounded-lg overflow-hidden bg-white border border-slate-200 relative flex items-center justify-center my-2">
                  {part.installedPhotoUrl ? (
                    <img
                      src={part.installedPhotoUrl}
                      alt="Instalada"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                      <span className="text-xs font-semibold block text-slate-600">Sin foto aún</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  Técnico: {part.installedBy || order.assignedMechanicName || 'En bahía'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
