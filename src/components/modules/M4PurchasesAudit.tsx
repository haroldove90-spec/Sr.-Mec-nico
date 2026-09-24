import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  Building2,
  DollarSign,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { VehicleServiceOrder, DamagedPart } from '../../types';

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

  // Financial Stats
  const totalCharged = parts.reduce((acc, p) => acc + p.cost, 0);
  const totalPurchaseCost = parts.reduce((acc, p) => acc + (p.purchaseCost || 0), 0);
  const grossProfit = totalCharged - totalPurchaseCost;
  const marginPercent = totalCharged > 0 ? Math.round((grossProfit / totalCharged) * 100) : 0;
  const verifiedCount = parts.filter((p) => p.auditVerified).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M4 (Administración)
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Compras y Panel Contable Anti-Robo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conversión a Orden de Compra y auditoría visual cruzada de refacciones compradas vs foto instalada por el mecánico.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          {!order.workOrderGenerated ? (
            <button
              onClick={handleGenerateWorkOrder}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Emitir Orden de Compra</span>
            </button>
          ) : (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Orden de Compra Activa</span>
            </div>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Ir a Caja y Facturación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Financial Anti-Theft Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Vehículo Asignado</span>
            <Building2 className="w-4 h-4 text-[#D05E28]" />
          </div>
          <div className="font-bold text-sm text-[#1A253B]">
            {order.vehicle.plate} ({order.vehicle.make} {order.vehicle.model})
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            VIN: {order.vehicle.vin}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Costo de Compra (Insumos)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="font-extrabold text-base sm:text-lg text-slate-800">
            ${totalPurchaseCost.toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pagado a proveedores</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Cobrado al Cliente</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-extrabold text-base sm:text-lg text-[#1A253B]">
            ${totalCharged.toLocaleString('es-MX')} MXN
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Margen bruto: {marginPercent}% (+${grossProfit.toLocaleString('es-MX')})
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Auditoría Visual Anti-Robo</span>
            <ShieldCheck className="w-4 h-4 text-[#D05E28]" />
          </div>
          <div className="font-extrabold text-base sm:text-lg text-[#D05E28]">
            {verifiedCount} / {parts.length} Auditadas
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {verifiedCount === parts.length ? '100% conciliado' : 'Faltan revisiones'}
          </div>
        </div>
      </div>

      {/* Anti-Theft Cross-Audit Table & Visual Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#1A253B] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D05E28]" />
              <span>Matriz de Auditoría Anti-Robo de Refacciones</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cruza factura del proveedor con la fotografía de la pieza nueva instalada por el mecánico en el auto.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Folio OT: {order.orderNumber}
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {parts.map((part) => (
            <div key={part.id} className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-[#1A253B]">{part.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        part.auditVerified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {part.auditVerified ? '✓ Auditoría Aprobada' : 'Auditoría Pendiente'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Asignado a: {order.vehicle.make} {order.vehicle.model} ({order.vehicle.plate}) | VIN: {order.vehicle.vin}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleAudit(part.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer self-start md:self-center flex items-center gap-1.5 ${
                    part.auditVerified
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-[#D05E28] text-white hover:bg-[#b84e1e]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{part.auditVerified ? 'Desmarcar Auditoría' : 'Aprobar Conciliación Anti-Robo'}</span>
                </button>
              </div>

              {/* Data & Photo Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                {/* 1. Datos de Compra al Proveedor */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block pb-1 border-b border-slate-200">
                    1. Registro de Compra (Factura/Ticket)
                  </span>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-0.5">Proveedor Autorizado</label>
                    <input
                      type="text"
                      value={part.supplier || ''}
                      onChange={(e) => handleUpdatePartPurchase(part.id, 'supplier', e.target.value)}
                      placeholder="Ej: AutoZone, Refacciones del Valle..."
                      className="w-full p-2 bg-white rounded border border-slate-200 text-xs font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[11px] mb-0.5">Costo de Compra ($)</label>
                      <input
                        type="number"
                        value={part.purchaseCost || 0}
                        onChange={(e) => handleUpdatePartPurchase(part.id, 'purchaseCost', Number(e.target.value))}
                        className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[11px] mb-0.5">Folio Factura Prov.</label>
                      <input
                        type="text"
                        value={part.invoiceNumber || 'FAC-1002'}
                        onChange={(e) => handleUpdatePartPurchase(part.id, 'invoiceNumber', e.target.value)}
                        className="w-full p-2 bg-white rounded border border-slate-200 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Contabilidad: Cobro al Cliente */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block pb-1 border-b border-slate-200">
                    2. Venta al Cliente
                  </span>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Precio Cobrado:</span>
                    <span className="font-bold text-[#1A253B]">${part.cost.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Costo Adquisición:</span>
                    <span className="font-semibold text-slate-700">${(part.purchaseCost || 0).toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                    <span>Utilidad Bruta:</span>
                    <span>+${(part.cost - (part.purchaseCost || 0)).toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mano de obra asociada: ${part.laborCost.toLocaleString('es-MX')} MXN
                  </div>
                </div>

                {/* 3. Comprobante Fotográfico del Mecánico */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block pb-1 border-b border-slate-200">
                    3. Evidencia de Instalación Real
                  </span>
                  <div className="h-32 rounded-lg overflow-hidden bg-white border border-slate-200 relative flex items-center justify-center">
                    {part.installedPhotoUrl ? (
                      <img
                        src={part.installedPhotoUrl}
                        alt="Instalada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                        <span className="text-[11px] block font-semibold text-slate-600">
                          Foto no cargada aún
                        </span>
                        <span className="text-[10px]">El mecánico no ha cerrado la instalación</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Instalado por: <strong>{part.installedBy || order.assignedMechanicName || 'Mecánico de bahía'}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
