import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  FileDown,
  QrCode,
  Building2,
  Send,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder, CFDIInvoice } from '../../types';

interface M5CashierBillingProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M5CashierBilling: React.FC<M5CashierBillingProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>(
    order.paymentMethod || '04 Tarjeta de Crédito'
  );
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Calculations
  const partsSubtotal = (order.parts || [])
    .filter((p) => p.approved)
    .reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = (order.parts || [])
    .filter((p) => p.approved)
    .reduce((acc, p) => acc + p.laborCost, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleSettlePayment = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });

    // Auto-generate CFDI 4.0 Invoice with saved fiscal data
    const newInvoice: CFDIInvoice = {
      uuid: `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-4FA2-9C81-${Date.now().toString(36).toUpperCase()}`,
      folio: order.orderNumber,
      fechaEmision: new Date().toLocaleString('es-MX'),
      rfcEmisor: 'SRM200512AB3',
      razonSocialEmisor: 'SR MECANICO TALLERES AUTOMOTRICES S.A. DE C.V.',
      rfcReceptor: order.customer.fiscalData.rfc || 'XAXX010101000',
      razonSocialReceptor: order.customer.fiscalData.razonSocial || order.customer.name,
      subtotal,
      iva,
      total,
      metodoPago: 'PUE',
      formaPago: paymentMethod as CFDIInvoice['formaPago'],
      selloDigital: 'kPx9Lq2VzN81...mB93aZxR74wE9',
      cadenaOriginal: `||4.0|${order.orderNumber}|${new Date().toISOString()}|04|00001000000504465028|${subtotal.toFixed(2)}|MXN|${total.toFixed(2)}|I|PUE|${order.customer.fiscalData.codigoPostal}||`,
    };

    onUpdateOrder({
      ...order,
      paymentSettled: true,
      paymentMethod,
      invoice: newInvoice,
      currentStep: Math.max(order.currentStep, 14),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M5 (Caja)
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Caja, Liquidación y Facturación Electrónica (CFDI 4.0)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cobro del servicio, selección de forma de pago y timbrado inmediato con datos fiscales preguardados.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {order.paymentSettled && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
            >
              <Receipt className="w-4 h-4 text-[#D05E28]" />
              <span>Ver CFDI Timbrado</span>
            </button>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Avanzar a Entrega de Auto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Payment Methods & Order Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Methods */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-[#1A253B] flex items-center gap-2 pb-2 border-b border-slate-100">
              <Banknote className="w-4 h-4 text-[#D05E28]" />
              <span>Selecciona Método de Pago</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '01 Efectivo', label: 'Efectivo', icon: Banknote },
                { id: '04 Tarjeta de Crédito', label: 'T. Crédito', icon: CreditCard },
                { id: '28 Tarjeta de Débito', label: 'T. Débito', icon: CreditCard },
                { id: '03 Transferencia SPEI', label: 'SPEI / Bancario', icon: Building2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = paymentMethod === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setPaymentMethod(item.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-[#D05E28] bg-[#D05E28]/10 text-[#D05E28] font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Fiscal Data Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Datos Fiscales para Timbrado Automático:</span>
                <span className="text-emerald-700 font-mono">CFDI 4.0 Conforme SAT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[11px]">RFC Receptor:</span>
                  <strong className="font-mono text-slate-800">{order.customer.fiscalData.rfc}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Razón Social:</span>
                  <strong className="text-slate-800 truncate block">{order.customer.fiscalData.razonSocial}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Régimen Fiscal:</span>
                  <span className="text-slate-700">{order.customer.fiscalData.regimenFiscal}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">C.P. Domicilio Fiscal:</span>
                  <span className="font-mono text-slate-700">{order.customer.fiscalData.codigoPostal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown of services & items */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#1A253B] pb-2 border-b border-slate-100">
              Conceptos a Facturar (Folio: {order.orderNumber})
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {(order.parts || [])
                .filter((p) => p.approved)
                .map((part) => (
                  <div key={part.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{part.name}</span>
                      <span className="text-slate-400 block text-[11px]">
                        Refacción: ${part.cost.toLocaleString('es-MX')} + M.O.: ${part.laborCost.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <span className="font-bold text-[#1A253B]">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Col: Total & Settlement Action */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#1A253B] pb-2 border-b border-slate-100">
              Resumen de Cobro
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal Neto:</span>
                <span className="font-semibold text-slate-800">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="flex justify-between">
                <span>IVA Trasladado (16%):</span>
                <span className="font-semibold text-slate-800">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base sm:text-lg font-black text-[#1A253B]">
                <span>Total a Liquidar:</span>
                <span className="text-[#D05E28]">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <div className="pt-2">
              {!order.paymentSettled ? (
                <button
                  onClick={handleSettlePayment}
                  className="w-full py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-extrabold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Cobrar Orden y Timbrar CFDI</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Orden Pagada con Éxito ({order.paymentMethod})</span>
                  </div>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white font-bold text-xs cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4 text-[#D05E28]" />
                    <span>Ver Factura Electrónica CFDI 4.0</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal CFDI 4.0 Preview */}
      {showInvoiceModal && order.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src="https://kabris.com.mx/srmecanicoicono.png"
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-extrabold text-base text-[#1A253B]">Comprobante Fiscal Digital (CFDI 4.0)</h3>
                  <span className="text-xs text-slate-500 font-mono">Folio Fiscal: {order.invoice.uuid}</span>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            {/* CFDI Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Emisor:</span>
                <p className="font-semibold text-[#1A253B]">{order.invoice.razonSocialEmisor}</p>
                <p className="font-mono text-slate-600">RFC: {order.invoice.rfcEmisor}</p>
                <p className="text-slate-500">Régimen: 601 - General de Ley Personas Morales</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Receptor:</span>
                <p className="font-semibold text-[#1A253B]">{order.invoice.razonSocialReceptor}</p>
                <p className="font-mono text-slate-600">RFC: {order.invoice.rfcReceptor}</p>
                <p className="text-slate-500">Uso: {order.customer.fiscalData.usoCFDI || 'G03'}</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-between items-center p-3 bg-[#1A253B] text-white rounded-xl text-xs">
              <span>Método: {order.invoice.metodoPago} - Pago en una sola exhibición</span>
              <span className="text-base font-extrabold text-[#D05E28]">
                Total: ${order.invoice.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>

            {/* SAT Seal & QR Code */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <div className="space-y-1 font-mono overflow-hidden">
                <p className="truncate">Sello SAT: {order.invoice.selloDigital}</p>
                <p className="truncate">Cadena Original: {order.invoice.cadenaOriginal}</p>
                <p className="text-emerald-700 font-sans font-bold">Timbrado con éxito a través del PAC autorizado.</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => alert('Descargando archivo XML oficial SAT...')}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Descargar XML</span>
              </button>
              <button
                onClick={() => alert('Descargando representación impresa en PDF...')}
                className="px-4 py-2 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
