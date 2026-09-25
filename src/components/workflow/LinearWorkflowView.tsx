import React from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Car,
  Camera,
  ClipboardList,
  Wrench,
  Receipt,
  FileCheck,
  PenTool,
  MessageCircle,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder } from '../../types';

// Componentes reutilizados en los 16 pasos
import { M1Reception } from '../modules/M1Reception';
import { M2Inspection55 } from '../modules/M2Inspection55';
import { M2DiagnosisTechnical } from '../modules/M2DiagnosisTechnical';
import { M3QuoteAuthorization } from '../modules/M3QuoteAuthorization';
import { M4WorkshopEvidence } from '../modules/M4WorkshopEvidence';
import { M4PurchasesAudit } from '../modules/M4PurchasesAudit';
import { M5CashierBilling } from '../modules/M5CashierBilling';
import { M5VehicleDelivery } from '../modules/M5VehicleDelivery';
import { M6CRMProductivity } from '../modules/M6CRMProductivity';

interface LinearWorkflowViewProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  orders: VehicleServiceOrder[];
  onBackToDashboard: () => void;
}

export const PROTOCOL_STEPS = [
  { step: 1, name: 'Datos del cliente e historial', short: '1. Cliente', icon: ClipboardList },
  { step: 2, name: 'Fotos del estado estético', short: '2. Fotos', icon: Camera },
  { step: 3, name: 'Prueba de manejo (Inicial)', short: '3. Prueba Ini.', icon: Car },
  { step: 4, name: 'Inspección de 55 puntos', short: '4. 55 Puntos', icon: ClipboardList },
  { step: 5, name: 'Entrega de diagnóstico con fotos', short: '5. Diagnóstico', icon: AlertCircle },
  { step: 6, name: 'Cotización de lo urgente', short: '6. Cotización', icon: Receipt },
  { step: 7, name: 'Autorización del cliente', short: '7. Aprobación', icon: CheckCircle2 },
  { step: 8, name: 'Compra de piezas y orden', short: '8. Compra OT', icon: FileCheck },
  { step: 9, name: 'Evidencia de piezas instaladas', short: '9. Foto Nueva', icon: Camera },
  { step: 10, name: 'Prueba de manejo (Final)', short: '10. Prueba Fin.', icon: Car },
  { step: 11, name: 'Corrección y ajustes finales', short: '11. Ajustes', icon: Wrench },
  { step: 12, name: 'Recorrido por el coche', short: '12. Recorrido', icon: Car },
  { step: 13, name: 'Cobro y facturación CFDI', short: '13. Cobro', icon: Receipt },
  { step: 14, name: 'Entrega de auto y firma digital', short: '14. Firma', icon: PenTool },
  { step: 15, name: 'Seguimiento a los 2 días', short: '15. CRM 2 Días', icon: MessageCircle },
  { step: 16, name: 'Alerta 15 días antes', short: '16. Alerta 15D', icon: Calendar },
];

export const LinearWorkflowView: React.FC<LinearWorkflowViewProps> = ({
  order,
  onUpdateOrder,
  orders,
  onBackToDashboard,
}) => {
  const currentStep = order.currentStep || 1;

  const goToStep = (stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > 16) return;
    onUpdateOrder({
      ...order,
      currentStep: stepNumber,
    });
  };

  const handleNextStepAuto = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    if (currentStep < 16) {
      onUpdateOrder({
        ...order,
        currentStep: currentStep + 1,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      onUpdateOrder({
        ...order,
        currentStep: currentStep - 1,
      });
    }
  };

  const currentStepData = PROTOCOL_STEPS[currentStep - 1];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24">
      {/* Header del Protocolo Lineal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#D05E28] text-white font-bold text-xs">
              Protocolo Lineal
            </span>
            <span className="text-sm font-mono font-bold text-slate-500">
              Paso {currentStep} de 16
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            {currentStepData.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Vehículo: <strong>{order.vehicle.plate}</strong> • {order.vehicle.make} {order.vehicle.model} (Folio: {order.orderNumber})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onBackToDashboard}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer transition text-center"
          >
            Volver a Módulos
          </button>

          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`p-2.5 rounded-xl border border-slate-300 transition ${
              currentStep === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
            }`}
            title="Paso Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <button
            onClick={handleNextStepAuto}
            disabled={currentStep === 16}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer whitespace-nowrap"
          >
            <span>Avanzar ({currentStep < 16 ? `Paso ${currentStep + 1}` : 'Fin'})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra de progreso de 16 pasos horizontal */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">
          {PROTOCOL_STEPS.map((stepItem) => {
            const isDone = stepItem.step < currentStep;
            const isCurrent = stepItem.step === currentStep;

            return (
              <button
                key={stepItem.step}
                onClick={() => goToStep(stepItem.step)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#1A253B] text-white shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-[#D05E28] text-white'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isDone ? '✓' : stepItem.step}
                </span>
                <span>{stepItem.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenedor del paso activo */}
      <div>
        {currentStep === 1 && (
          <M1Reception
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 2 && (
          <M1Reception
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 3 && (
          <M4WorkshopEvidence
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 4 && (
          <M2Inspection55
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 5 && (
          <M2DiagnosisTechnical
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
            onPrevStep={() => goToStep(4)}
          />
        )}
        {currentStep === 6 && (
          <M3QuoteAuthorization
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 7 && (
          <M3QuoteAuthorization
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 8 && (
          <M4PurchasesAudit
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 9 && (
          <M4WorkshopEvidence
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 10 && (
          <M4WorkshopEvidence
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 11 && (
          <M4WorkshopEvidence
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 12 && (
          <M5VehicleDelivery
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 13 && (
          <M5CashierBilling
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 14 && (
          <M5VehicleDelivery
            order={order}
            onUpdateOrder={onUpdateOrder}
            onNextStep={handleNextStepAuto}
          />
        )}
        {currentStep === 15 && (
          <M6CRMProductivity
            order={order}
            onUpdateOrder={onUpdateOrder}
            orders={orders}
            defaultTab="crm"
          />
        )}
        {currentStep === 16 && (
          <M6CRMProductivity
            order={order}
            onUpdateOrder={onUpdateOrder}
            orders={orders}
            defaultTab="crm"
          />
        )}
      </div>

      {/* Barra fija inferior de navegación entre pasos */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 z-30 shadow-xl flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500 hidden sm:inline">Paso Actual:</span>
          <span className="text-sm sm:text-base font-bold text-[#1A253B]">
            {currentStep}. {currentStepData.name}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
          >
            Anterior
          </button>

          {currentStep < 16 ? (
            <button
              onClick={handleNextStepAuto}
              className="px-5 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>Avanzar al Paso {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                confetti({ particleCount: 150 });
                alert('¡Protocolo de 16 Pasos completado exitosamente!');
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Concluir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
