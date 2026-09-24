import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Receipt,
  CheckCircle2,
  FileDown,
  QrCode,
  Building2,
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Caja y Facturación Electrónica (CFDI)
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Cobro del servicio y timbrado directo utilizando los datos fiscales guardados.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {order.paymentSettled && (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <Receipt className="w-5 h-5 text-[#D05E28]" />
              <span>Ver CFDI Timbrado</span>
            </button>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <span>Avanzar a Entrega</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Métodos de Pago y Conceptos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-lg text-[#1A253B] flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Banknote className="w-5 h-5 text-[#D05E28]" />
              <span>Forma de Pago</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '01 Efectivo', label: 'Efectivo', icon: Banknote },
                { id: '04 Tarjeta de Crédito', label: 'T. Crédito', icon: CreditCard },
                { id: '28 Tarjeta de Débito', label: 'T. Débito', icon: CreditCard },
                { id: '03 Transferencia SPEI', label: 'SPEI', icon: Building2 },
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
                        : 'border-slate-300 hover:border-slate-400 text-slate-700'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Datos Fiscales SAT */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-sm">
              <div className="flex items-center justify-between font-bold text-[#1A253B]">
                <span className="text-base">Datos para Timbrado Fiscal:</span>
                <span className="text-emerald-700 font-mono font-bold">CFDI 4.0</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                <div>
                  <span className="text-xs text-slate-400 block">RFC Receptor:</span>
                  <strong className="text-base font-mono text-[#1A253B]">{order.customer.fiscalData.rfc}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Razón Social:</span>
                  <strong className="text-base text-[#1A253B] truncate block">{order.customer.fiscalData.razonSocial}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose de Conceptos */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-lg text-[#1A253B] pb-3 border-b border-slate-100">
              Conceptos Facturados (Folio: {order.orderNumber})
            </h3>
            <div className="divide-y divide-slate-100 text-sm sm:text-base">
              {(order.parts || [])
                .filter((p) => p.approved)
                .map((part) => (
                  <div key={part.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#1A253B]">{part.name}</span>
                      <span className="text-slate-500 block text-xs mt-0.5">
                        Refacción: ${part.cost.toLocaleString('es-MX')} + M.O.: ${part.laborCost.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <strong className="text-base sm:text-lg text-[#1A253B]">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </strong>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Resumen Total y Liquidación */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-extrabold text-lg sm:text-xl text-[#1A253B] pb-3 border-b border-slate-100">
              Total a Liquidar
            </h3>

            <div className="space-y-3 text-sm sm:text-base text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong className="text-[#1A253B]">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <strong className="text-[#1A253B]">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</strong>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-xl sm:text-2xl font-black text-[#1A253B]">
                <span>Total:</span>
                <span className="text-[#D05E28]">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <div className="pt-2">
              {!order.paymentSettled ? (
                <button
                  onClick={handleSettlePayment}
                  className="w-full py-4 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-extrabold text-base shadow-xs transition cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Cobrar y Timbrar CFDI</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-sm font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Orden Pagada ({order.paymentMethod})</span>
                  </div>
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="w-full py-3.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white font-bold text-sm sm:text-base cursor-pointer transition flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-5 h-5 text-[#D05E28]" />
                    <span>Ver Factura CFDI 4.0</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal CFDI 4.0 */}
      {showInvoiceModal && order.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl text-[#1A253B]">Factura Electrónica (CFDI 4.0)</h3>
                <span className="text-xs text-slate-500 font-mono">UUID: {order.invoice.uuid}</span>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-sm px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-[#1A253B] block mb-1">Emisor:</span>
                <p className="font-semibold text-slate-800">{order.invoice.razonSocialEmisor}</p>
                <p className="font-mono text-slate-600">RFC: {order.invoice.rfcEmisor}</p>
              </div>

              <div>
                <span className="font-bold text-[#1A253B] block mb-1">Receptor:</span>
                <p className="font-semibold text-slate-800">{order.invoice.razonSocialReceptor}</p>
                <p className="font-mono text-slate-600">RFC: {order.invoice.rfcReceptor}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-[#1A253B] text-white rounded-xl text-base">
              <span>Pago en una sola exhibición ({order.invoice.metodoPago})</span>
              <strong className="text-xl text-[#D05E28]">
                ${order.invoice.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </strong>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <QrCode className="w-16 h-16 text-slate-800 shrink-0" />
              <div className="space-y-1 font-mono overflow-hidden">
                <p className="truncate">Sello SAT: {order.invoice.selloDigital}</p>
                <p className="text-emerald-700 font-sans font-bold text-sm">Timbrado validado ante el SAT.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => alert('Descargando XML SAT...')}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>XML</span>
              </button>
              <button
                onClick={() => alert('Descargando PDF...')}
                className="px-6 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
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
