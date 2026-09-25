import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  CheckCircle2,
  RotateCcw,
  X,
  MessageCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  FileText,
  Check,
  Car,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder } from '../../types';
import { getClientTrackingUrl, buildAuthorizedWhatsAppMessage } from '../../utils/trackingUrl';

interface ClientSignatureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: VehicleServiceOrder;
  onConfirmAuthorization: (
    signatureUrl: string,
    signerName: string,
    trackingUrl: string
  ) => void;
}

export const ClientSignatureAuthModal: React.FC<ClientSignatureAuthModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirmAuthorization,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(order.customer.name || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [authorizedSuccess, setAuthorizedSuccess] = useState(false);

  // Cálculos financieros
  const approvedParts = order.parts.filter((p) => p.approved);
  const partsSubtotal = approvedParts.reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = approvedParts.reduce((acc, p) => acc + p.laborCost, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // URL Personalizada para el Cliente (dinámica para desarrollo y producción Vercel)
  const trackingUrl = getClientTrackingUrl(order);

  // Si la orden ya tiene firma guardada, cargarla en el canvas si existe
  useEffect(() => {
    if (isOpen) {
      setSignerName(order.clientAuthSignerName || order.customer.name || '');
      setAuthorizedSuccess(false);
      setCopiedLink(false);

      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ajustar resolución del canvas para evitar borrosidad en pantallas retina
        const containerWidth = canvas.parentElement?.clientWidth || 500;
        canvas.width = containerWidth;
        canvas.height = 180;

        ctx.strokeStyle = '#1A253B';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (order.clientAuthSignatureUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setHasSignature(true);
          };
          img.src = order.clientAuthSignatureUrl;
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setHasSignature(false);
        }
      }, 100);
    }
  }, [isOpen, order]);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Dibujo táctil y ratón responsivo
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Enviar mensaje de WhatsApp con la orden firmada y el enlace de monitoreo
  const sendWhatsAppNotification = (url: string, signer: string) => {
    const message = buildAuthorizedWhatsAppMessage(order, signer, url, total);
    const targetPhone = order.customer.phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleConfirmSignature = () => {
    if (!hasSignature && !order.clientAuthSignatureUrl) {
      alert('Por favor dibuja tu firma en el recuadro para poder autorizar el servicio.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas
      ? canvas.toDataURL('image/png')
      : order.clientAuthSignatureUrl || '';

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    setAuthorizedSuccess(true);

    // Notificar al componente padre para actualizar el estado global de la orden
    onConfirmAuthorization(signatureDataUrl, signerName, trackingUrl);

    // Enviar WhatsApp al cliente con la orden firmada y el enlace de monitoreo
    sendWhatsAppNotification(trackingUrl, signerName);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[96vh]">
        {/* Cabecera del Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#1A253B] to-[#273756] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D05E28] text-white shadow-md">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  Paso 7: Autorización
                </span>
                <span className="text-xs font-bold text-amber-300">
                  Orden #{order.orderNumber}
                </span>
              </div>
              <h3 className="font-black text-lg sm:text-xl mt-0.5">
                Firma Digital y Autorización de Orden de Servicio
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-800 flex-1">
          {/* Ficha Resumen del Auto y Monto Autorizado */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Vehículo Autorizado:
              </span>
              <strong className="text-base sm:text-lg text-[#1A253B]">
                {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
              </strong>
              <div className="text-xs text-slate-500 mt-0.5">
                Placas: <span className="font-mono font-bold text-[#1A253B]">{order.vehicle.plate}</span> • Cliente: <span className="font-bold text-[#1A253B]">{order.customer.name}</span>
              </div>
            </div>

            <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Total de Reparación (con IVA):
              </span>
              <strong className="text-2xl font-black text-[#D05E28]">
                ${total.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
              </strong>
              <span className="text-[11px] text-emerald-700 font-bold block">
                ✓ {approvedParts.length} refacciones aprobadas
              </span>
            </div>
          </div>

          {/* Nombre de quien firma */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Nombre de la Persona que Autoriza: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Nombre completo del cliente o persona responsable"
              className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-bold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          {/* Lienzo / Canvas de Firma Digital */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-[#D05E28]" />
                <span>Traza la Firma Digital en el Recuadro:</span>
              </label>

              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Borrar Firma</span>
              </button>
            </div>

            {/* Canvas Interactivo Táctil */}
            <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/70 overflow-hidden cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[180px] block"
              />

              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 gap-1 select-none">
                  <PenTool className="w-8 h-8 opacity-30 text-[#D05E28]" />
                  <span className="text-xs font-semibold">
                    Firme aquí con el dedo (celular/tablet) o mouse
                  </span>
                  <span className="text-[11px] opacity-70">
                    Línea de firma legal electrónica
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>X __________________________________________</span>
              <span>Firma de conformidad</span>
            </div>
          </div>

          {/* Cláusula Legal de Aceptación */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-[#D05E28]" />
              <span>Términos de Autorización del Servicio:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Al firmar, el cliente autoriza al taller mecánico a suministrar las refacciones presupuestadas, realizar el desarmado e instalación, y efectuar pruebas de manejo en ruta para verificación de calidad.
            </p>
          </div>

          {/* Caja con el Enlace Personalizado que se Enviará */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Link Personalizado de Monitoreo para el Cliente:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] sm:text-xs text-amber-200 break-all select-all">
              {trackingUrl}
            </div>

            <p className="text-[11px] text-slate-300">
              📲 <strong>Envío Inmediato:</strong> Al confirmar, este link se le enviará automáticamente por <strong>WhatsApp</strong> al número <strong>{order.customer.phone}</strong> para que el cliente ingrese con su correo o celular y monitoree el auto en tiempo real.
            </p>
          </div>

          {/* Mensaje de Éxito si ya fue autorizado */}
          {authorizedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>¡Orden Autorizada y Notificación de WhatsApp Preparada!</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Se ha registrado la firma electrónica con validez y se ha enviado la orden de servicio con el enlace de monitoreo en tiempo real.
              </p>
            </div>
          )}
        </div>

        {/* Barra de Botones Inferiores */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleConfirmSignature}
              className="flex-1 sm:flex-none px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer transform active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              <span>Autorizar con Firma y Enviar por WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
