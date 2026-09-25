import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  RotateCcw,
  Car,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder } from '../../types';

interface M5VehicleDeliveryProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M5VehicleDelivery: React.FC<M5VehicleDeliveryProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(order.digitalSignatureUrl));
  const [oldPartsAccepted, setOldPartsAccepted] = useState(order.oldPartsReturned);
  const [walkAroundCheck, setWalkAroundCheck] = useState({
    levelsChecked: true,
    aestheticChecked: true,
    cleanlinessChecked: true,
  });
  const [receiverName, setReceiverName] = useState(
    order.receiverName || order.customer.name
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (order.digitalSignatureUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = order.digitalSignatureUrl;
    }
  }, [order.digitalSignatureUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1A253B';
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleCompleteDelivery = () => {
    if (!oldPartsAccepted) {
      alert('Por favor confirma la entrega física de refacciones usadas al cliente.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : order.digitalSignatureUrl;

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    onUpdateOrder({
      ...order,
      walkAroundCompleted: true,
      delivered: true,
      deliveryTimestamp: new Date().toLocaleString('es-MX'),
      oldPartsReturned: true,
      digitalSignatureUrl: signatureDataUrl,
      receiverName,
      currentStep: Math.max(order.currentStep, 15),
    });

    if (onNextStep) {
      setTimeout(onNextStep, 800);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Entrega de Vehículo y Firma Digital
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Verificación de niveles y firma de conformidad de refacciones usadas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {order.delivered && (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm sm:text-base font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Entregado ({order.deliveryTimestamp})</span>
            </div>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* 1. Verificación Física de Entrega */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Car className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg text-[#1A253B]">Verificación de Niveles y Piezas</h3>
          </div>

          <div className="space-y-4 text-sm sm:text-base">
            <label className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={walkAroundCheck.levelsChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, levelsChecked: e.target.checked })}
                className="w-5 h-5 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Revisión de Niveles y Tapones</span>
                <span className="text-slate-500 text-sm">
                  Aceite verificado en bayoneta máxima, refrigerante y líquido de frenos.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={walkAroundCheck.aestheticChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, aestheticChecked: e.target.checked })}
                className="w-5 h-5 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Inspección de Carrocería</span>
                <span className="text-slate-500 text-sm">
                  Sin rayones ni daños nuevos contra las fotos de recepción.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={walkAroundCheck.cleanlinessChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, cleanlinessChecked: e.target.checked })}
                className="w-5 h-5 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Limpieza y Acabado en Taller</span>
                <span className="text-slate-500 text-sm">
                  Vehículo limpio y sin plásticos protectores.
                </span>
              </div>
            </label>
          </div>

          {/* Entrega de Refacciones Usadas */}
          <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
              <PackageCheck className="w-5 h-5 text-[#D05E28]" />
              <span>Devolución de Piezas Usadas</span>
            </div>
            <p className="text-sm text-slate-700">
              Entrega en mano de los componentes reemplazados (bujías, filtros viejos, balatas gastadas).
            </p>
            <label className="flex items-center gap-3 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={oldPartsAccepted}
                onChange={(e) => setOldPartsAccepted(e.target.checked)}
                className="w-5 h-5 accent-[#D05E28]"
              />
              <span className="text-sm sm:text-base font-bold text-[#1A253B]">
                El cliente confirma recepción de sus piezas usadas
              </span>
            </label>
          </div>
        </div>

        {/* 2. Recolección de Firma Digital */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <PenTool className="w-5 h-5 text-[#D05E28]" />
                <h3 className="font-bold text-lg text-[#1A253B]">Firma Digital del Cliente</h3>
              </div>
              <button
                onClick={handleClearSignature}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                Nombre de quien Recibe el Vehículo
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold text-[#1A253B]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                Firma en pantalla (Táctil o Mouse):
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden h-52 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={210}
                  className="w-full h-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasSignature && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-sm font-medium">
                    Firma aquí
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleCompleteDelivery}
              disabled={!hasSignature || !oldPartsAccepted}
              className={`w-full py-4 rounded-xl font-bold text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                hasSignature && oldPartsAccepted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Concluir Entrega de Auto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
