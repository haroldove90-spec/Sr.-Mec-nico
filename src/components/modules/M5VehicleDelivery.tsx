import React, { useRef, useState, useEffect } from 'react';
import {
  CheckSquare,
  PenTool,
  RotateCcw,
  Car,
  CheckCircle2,
  PackageCheck,
  ShieldCheck,
  Sparkles,
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

  // Initialize canvas if there is an existing signature
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

  // Touch & Mouse Canvas Drawing handlers
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
    ctx.lineWidth = 2.5;
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
      alert('Por favor confirma la entrega física de refacciones usadas (filtros, bujías, etc.) al cliente.');
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
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M5 (Entrega)
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Entrega de Vehículo y Firma Digital
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Recorrido físico con el cliente, muestra de niveles y firma digital aceptando la entrega de piezas usadas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          {order.delivered && (
            <div className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vehículo Entregado ({order.deliveryTimestamp})</span>
            </div>
          )}

          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Ir a CRM y Seguimiento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Recorrido Físico por el Auto */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Car className="w-4 h-4 text-[#D05E28]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1A253B]">
              Paso 12: Recorrido Físico de Entrega
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            El asesor de servicio y el cliente inspeccionan juntos el automóvil para validar que todo quedó según lo prometido.
          </p>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={walkAroundCheck.levelsChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, levelsChecked: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Verificación de Niveles y Tapones</span>
                <span className="text-slate-500 text-[11px]">
                  Varilla de aceite en marca máxima, anticongelante purgado, líquido de frenos y depósito limpiaparabrisas.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={walkAroundCheck.aestheticChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, aestheticChecked: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Inspección Perimetral y Odómetro</span>
                <span className="text-slate-500 text-[11px]">
                  Carrocería en el mismo estado documentado en el Paso 2, sin rayones ni golpes nuevos.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition">
              <input
                type="checkbox"
                checked={walkAroundCheck.cleanlinessChecked}
                onChange={(e) => setWalkAroundCheck({ ...walkAroundCheck, cleanlinessChecked: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-[#D05E28]"
              />
              <div>
                <span className="font-bold text-[#1A253B] block">Protección de Bahía y Limpieza</span>
                <span className="text-slate-500 text-[11px]">
                  Retiro de cubreasientos, fundas de volante y tapetes protectores.
                </span>
              </div>
            </label>
          </div>

          {/* Entrega de Piezas Usadas (Filtros, bujías, balatas) */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <PackageCheck className="w-4 h-4 text-[#D05E28]" />
              <span>Transparencia: Devolución de Refacciones Usadas</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Política institucional obligatoria: Todas las piezas reemplazadas (bujías viejas, balatas gastadas, filtros usados) deben ser empacadas en una bolsa y entregadas al cliente.
            </p>
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={oldPartsAccepted}
                onChange={(e) => setOldPartsAccepted(e.target.checked)}
                className="w-4.5 h-4.5 accent-[#D05E28]"
              />
              <span className="text-xs font-bold text-amber-950">
                El cliente acepta que recibió en mano sus piezas usadas junto con el auto
              </span>
            </label>
          </div>
        </div>

        {/* 2. Recolección de Firma Digital del Cliente */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#D05E28]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1A253B]">
                  Paso 14: Firma Digital de Conformidad
                </h3>
              </div>
              <button
                onClick={handleClearSignature}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar Firma</span>
              </button>
            </div>

            <div className="pt-2 text-xs space-y-2">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nombre de quien Recibe el Auto</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs font-bold text-[#1A253B]"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Dibuja la firma en el recuadro (Táctil o Ratón):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 relative overflow-hidden h-44 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={180}
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
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs font-medium">
                      Firma aquí con tu dedo o mouse
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleCompleteDelivery}
              disabled={!hasSignature || !oldPartsAccepted}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                hasSignature && oldPartsAccepted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Cerrar Orden y Entregar Vehículo al Cliente</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
