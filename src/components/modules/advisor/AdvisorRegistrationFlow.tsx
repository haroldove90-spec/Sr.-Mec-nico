import React, { useState } from 'react';
import {
  User,
  Car,
  Camera,
  AlertCircle,
  Receipt,
  CheckCircle2,
  PackageCheck,
  PenTool,
  Save,
  ArrowRight,
  Plus,
  MessageCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  RotateCcw,
  Check,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VehicleServiceOrder, AestheticPhoto, DamagedPart, AdvisorMovement } from '../../../types';
import { CameraCaptureModal } from '../../common/CameraCaptureModal';

interface AdvisorRegistrationFlowProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNewOrder: () => void;
  onRecordMovement?: (movement: Omit<AdvisorMovement, 'id' | 'timestamp'>) => void;
}

type AdvisorStep = 1 | 2 | 5 | 6 | 7 | 12 | 14;

const ADVISOR_STEPS_CONFIG = [
  { step: 1 as AdvisorStep, label: 'Paso 1: Datos del Cliente', short: '1. Registro' },
  { step: 2 as AdvisorStep, label: 'Paso 2: Fotos Estéticas', short: '2. Fotos' },
  { step: 5 as AdvisorStep, label: 'Paso 5: Diagnóstico y Evidencias', short: '5. Diagnóstico' },
  { step: 6 as AdvisorStep, label: 'Paso 6: Cotización de lo Urgente', short: '6. Cotización' },
  { step: 7 as AdvisorStep, label: 'Paso 7: Autorización del Cliente', short: '7. Autorización' },
  { step: 12 as AdvisorStep, label: 'Paso 12: Recorrido por el Coche', short: '12. Recorrido' },
  { step: 14 as AdvisorStep, label: 'Paso 14: Entrega de Auto', short: '14. Entrega' },
];

export const AdvisorRegistrationFlow: React.FC<AdvisorRegistrationFlowProps> = ({
  order,
  onUpdateOrder,
  onNewOrder,
  onRecordMovement,
}) => {
  const [currentAdvisorStep, setCurrentAdvisorStep] = useState<AdvisorStep>(1);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [activePhotoView, setActivePhotoView] = useState<{ view: AestheticPhoto['view']; label: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State for Step 1
  const [formData, setFormData] = useState({
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    rfc: order.customer.fiscalData.rfc,
    razonSocial: order.customer.fiscalData.razonSocial,
    regimenFiscal: order.customer.fiscalData.regimenFiscal,
    codigoPostal: order.customer.fiscalData.codigoPostal,
    direccion: order.customer.fiscalData.direccion,
    whatsapp: order.customer.fiscalData.whatsapp,
    usoCFDI: order.customer.fiscalData.usoCFDI,
    make: order.vehicle.make,
    model: order.vehicle.model,
    year: order.vehicle.year,
    plate: order.vehicle.plate,
    vin: order.vehicle.vin,
    color: order.vehicle.color,
    mileage: order.vehicle.mileage,
    fuelLevelPercent: order.vehicle.fuelLevelPercent,
  });

  // Step 6 & 7: Modal new part
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [newPartData, setNewPartData] = useState<Partial<DamagedPart>>({
    name: '',
    description: '',
    cost: 0,
    laborCost: 0,
    urgency: 'urgente',
    damagedPhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
  });

  // Step 12: Walk around checks
  const [walkAroundLevels, setWalkAroundLevels] = useState({
    oilLevel: true,
    coolantLevel: true,
    brakeFluidLevel: true,
    aestheticOk: true,
    usedPartsHandedOver: order.oldPartsReturned,
  });

  // Step 14: Signature canvas
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(Boolean(order.digitalSignatureUrl));
  const [receiverName, setReceiverName] = useState(order.receiverName || order.customer.name);

  // Guardar Cambios Paso 1
  const handleSaveStep1 = () => {
    const updated: VehicleServiceOrder = {
      ...order,
      customer: {
        name: formData.customerName,
        phone: formData.customerPhone,
        email: formData.customerEmail,
        fiscalData: {
          rfc: formData.rfc,
          razonSocial: formData.razonSocial,
          regimenFiscal: formData.regimenFiscal,
          codigoPostal: formData.codigoPostal,
          direccion: formData.direccion,
          correo: formData.customerEmail,
          whatsapp: formData.whatsapp,
          usoCFDI: formData.usoCFDI,
        },
      },
      vehicle: {
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        plate: formData.plate.toUpperCase(),
        vin: formData.vin.toUpperCase(),
        color: formData.color,
        mileage: Number(formData.mileage),
        fuelLevelPercent: Number(formData.fuelLevelPercent),
      },
      currentStep: Math.max(order.currentStep, 1),
    };

    onUpdateOrder(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: formData.plate.toUpperCase(),
      customerName: formData.customerName,
      action: 'registro_auto',
      actionLabel: 'Registro de Automóvil',
      description: `Registro inicial de ${formData.make} ${formData.model} (${formData.plate.toUpperCase()})`,
    });
  };

  // Abrir cámara con permisos de dispositivo
  const handleOpenCameraForPhoto = (view: AestheticPhoto['view'], label: string) => {
    setActivePhotoView({ view, label });
    setCameraModalOpen(true);
  };

  const handleCapturePhoto = (dataUrl: string) => {
    if (!activePhotoView) return;
    const newPhoto: AestheticPhoto = {
      view: activePhotoView.view,
      label: activePhotoView.label,
      url: dataUrl,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedPhotos = [
      ...order.aestheticPhotos.filter((p) => p.view !== activePhotoView.view),
      newPhoto,
    ];

    onUpdateOrder({
      ...order,
      aestheticPhotos: updatedPhotos,
      currentStep: Math.max(order.currentStep, 2),
    });

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'fotos_esteticas',
      actionLabel: 'Captura de Fotos Estéticas',
      description: `Foto agregada: ${activePhotoView.label}`,
    });
  };

  // Paso 5: Enviar diagnóstico por WhatsApp al cliente
  const handleSendDiagnosisWhatsApp = () => {
    const cleanPhone = (order.customer.fiscalData.whatsapp || order.customer.phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hola ${order.customer.name}, te saluda tu Asesor de Servicio de Sr. Mecánico. Ya concluimos la inspección de tu ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.plate}).\n\nDiagnóstico Técnico:\n${order.diagnosisSummary || 'Se identificaron componentes con desgaste crítico.'}\n\nPuedes autorizar tus refacciones en tu portal en vivo.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'diagnostico_entregado',
      actionLabel: 'Diagnóstico Entregado',
      description: `Diagnóstico y evidencias compartidas con el cliente vía WhatsApp.`,
    });
  };

  // Paso 6: Agregar Pieza
  const handleAddPart = () => {
    if (!newPartData.name) return;
    const created: DamagedPart = {
      id: `p-${Date.now()}`,
      name: newPartData.name || 'Refacción Adicional',
      description: newPartData.description || 'Detectada en diagnóstico',
      cost: Number(newPartData.cost) || 0,
      laborCost: Number(newPartData.laborCost) || 0,
      urgency: (newPartData.urgency as 'urgente' | 'preventivo' | 'recomendado') || 'urgente',
      damagedPhotoUrl: newPartData.damagedPhotoUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      approved: true,
    };

    const updatedParts = [...(order.parts || []), created];
    onUpdateOrder({
      ...order,
      parts: updatedParts,
      currentStep: Math.max(order.currentStep, 6),
    });

    setShowAddPartModal(false);
    setNewPartData({
      name: '',
      description: '',
      cost: 0,
      laborCost: 0,
      urgency: 'urgente',
    });

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'cotizacion_generada',
      actionLabel: 'Cotización Generada',
      description: `Propuesta de refacción agregada: ${created.name} ($${created.cost + created.laborCost} MXN)`,
      amount: created.cost + created.laborCost,
    });
  };

  // Paso 7: Autorización del Cliente
  const handleAuthorizeAll = () => {
    confetti({ particleCount: 70 });
    const updatedParts = (order.parts || []).map((p) => ({ ...p, approved: true }));
    onUpdateOrder({
      ...order,
      parts: updatedParts,
      clientAuthorized: true,
      clientAuthTimestamp: new Date().toLocaleString('es-MX'),
      currentStep: Math.max(order.currentStep, 7),
    });

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'autorizacion_cliente',
      actionLabel: 'Aprobación del Cliente',
      description: `Cliente autorizó la orden completa de reparación.`,
    });
  };

  // Paso 12: Recorrido Guardado
  const handleSaveWalkAround = () => {
    onUpdateOrder({
      ...order,
      walkAroundCompleted: true,
      oldPartsReturned: walkAroundLevels.usedPartsHandedOver,
      currentStep: Math.max(order.currentStep, 12),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'recorrido_coche',
      actionLabel: 'Recorrido Físico de Niveles',
      description: `Recorrido con cliente completado. Niveles verificados y piezas usadas entregadas.`,
    });
  };

  // Paso 14: Firma Digital y Entrega
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
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : order.digitalSignatureUrl;

    confetti({ particleCount: 90 });
    onUpdateOrder({
      ...order,
      delivered: true,
      deliveryTimestamp: new Date().toLocaleString('es-MX'),
      digitalSignatureUrl: signatureDataUrl,
      receiverName,
      oldPartsReturned: true,
      currentStep: 14,
    });

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: receiverName,
      action: 'entrega_coche',
      actionLabel: 'Entrega de Vehículo',
      description: `Entrega formal concluida con firma digital de ${receiverName}.`,
    });
  };

  // Calculations for Step 6 & 7
  const parts = order.parts || [];
  const partsSubtotal = parts.filter((p) => p.approved).reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = parts.filter((p) => p.approved).reduce((acc, p) => acc + p.laborCost, 0);
  const totalQuote = (partsSubtotal + laborSubtotal) * 1.16;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-20">
      {/* Barra Superior del Asesor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-[#D05E28] text-white font-extrabold text-xs">
              Recepción y Asesor
            </span>
            <span className="text-sm font-bold text-slate-500 font-mono">
              Folio: {order.orderNumber}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            Registro y Gestión del Automóvil
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Auto activo: <strong className="text-[#1A253B] font-mono">{order.vehicle.plate}</strong> • {order.vehicle.make} {order.vehicle.model} ({order.customer.name})
          </p>
        </div>

        {/* Botón para registrar un nuevo auto en el taller */}
        <button
          onClick={onNewOrder}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Registrar Nuevo Auto</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm sm:text-base font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Información guardada exitosamente y registrada en métricas.</span>
        </div>
      )}

      {/* Pestañas de los 7 Pasos Asignados al Asesor */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center min-w-max gap-2">
          {ADVISOR_STEPS_CONFIG.map((item) => {
            const isCurrent = currentAdvisorStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setCurrentAdvisorStep(item.step)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#1A253B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isCurrent ? 'bg-[#D05E28] text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {item.step}
                </span>
                <span>{item.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PASO 1: Datos del cliente (Registro) */}
      {currentAdvisorStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#D05E28]" />
                <h3 className="font-bold text-xl text-[#1A253B]">
                  Paso 1: Datos del Cliente y Facturación SAT
                </h3>
              </div>
              <button
                onClick={handleSaveStep1}
                className="px-5 py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4 text-[#D05E28]" />
                <span>Guardar Registro</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Nombre Completo del Cliente
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Teléfono / WhatsApp Móvil
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  RFC con Homoclave
                </label>
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Razón Social Fiscal
                </label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Paso 1 de 7 del Asesor</span>
              <button
                onClick={() => {
                  handleSaveStep1();
                  setCurrentAdvisorStep(2);
                }}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 2: Fotos</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 2: Fotos del estado estético del coche */}
      {currentAdvisorStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <Camera className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 2: Fotos del Estado Estético del Coche</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Toma las evidencias perimetrales activando la cámara del celular o tablet.
                </p>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {order.aestheticPhotos.length} fotos capturadas
              </span>
            </div>

            {/* Grid de 5 tomas estándar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { view: 'frontal' as const, label: 'Frente' },
                { view: 'trasera' as const, label: 'Trasera' },
                { view: 'lateral_izq' as const, label: 'Costado Izq.' },
                { view: 'lateral_der' as const, label: 'Costado Der.' },
                { view: 'odometro_gas' as const, label: 'Tablero / Gas' },
              ].map((pos) => {
                const photo = order.aestheticPhotos.find((p) => p.view === pos.view);

                return (
                  <div
                    key={pos.view}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex flex-col justify-between"
                  >
                    <div className="h-44 bg-slate-100 relative flex items-center justify-center">
                      {photo ? (
                        <img src={photo.url} alt={pos.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-3 text-slate-400">
                          <Camera className="w-8 h-8 mx-auto mb-1 opacity-40 text-slate-500" />
                          <span className="text-xs">Sin captura</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1A253B]">{pos.label}</span>
                        {photo && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>

                      <button
                        onClick={() => handleOpenCameraForPhoto(pos.view, pos.label)}
                        className="w-full py-2 px-3 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#D05E28]" />
                        <span>{photo ? 'Reemplazar' : 'Tomar Foto'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 1
              </button>
              <button
                onClick={() => setCurrentAdvisorStep(5)}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 5: Diagnóstico</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 5: Entrega de diagnóstico con fotos de evidencia al cliente */}
      {currentAdvisorStep === 5 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 5: Entrega de Diagnóstico con Fotos de Evidencia</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Comparte el expediente técnico y las evidencias con el cliente antes de cotizar.
                </p>
              </div>

              <button
                onClick={handleSendDiagnosisWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar al WhatsApp del Cliente</span>
              </button>
            </div>

            {/* Resumen del diagnóstico */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Dictamen Técnico Registrado:
              </span>
              <p className="text-base text-slate-800 leading-relaxed font-medium">
                {order.diagnosisSummary || 'Desgaste crítico detectado en balatas y suspensión delantera.'}
              </p>
            </div>

            {/* Fotos de Evidencia del Diagnóstico */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-[#1A253B] block">
                Evidencias de Componentes Dañados (Inspección):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {parts.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-sm font-bold text-[#1A253B] block">{p.name}</span>
                    <div className="h-36 rounded-lg overflow-hidden bg-slate-200 border border-slate-300">
                      <img src={p.damagedPhotoUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-red-600 font-bold block">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 2
              </button>
              <button
                onClick={() => setCurrentAdvisorStep(6)}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 6: Cotización</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 6: Cotización de lo urgente */}
      {currentAdvisorStep === 6 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 6: Cotización de lo Urgente</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Propuesta con desglose de refacciones y fotos de lo dañado.
                </p>
              </div>

              <button
                onClick={() => setShowAddPartModal(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#1A253B] font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D05E28]" />
                <span>Agregar Refacción</span>
              </button>
            </div>

            {/* Lista de refacciones */}
            <div className="space-y-4">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={part.damagedPhotoUrl}
                      alt={part.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">{part.name}</h4>
                      <p className="text-sm text-slate-500">{part.description}</p>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mt-1">
                        {part.urgency}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Inversión:</span>
                    <strong className="text-lg font-black text-[#1A253B]">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="p-5 rounded-xl bg-slate-100 flex items-center justify-between">
              <span className="text-base font-bold text-slate-700">Inversión Total con IVA (16%):</span>
              <strong className="text-2xl font-black text-[#D05E28]">
                ${totalQuote.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
              </strong>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(5)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 5
              </button>
              <button
                onClick={() => setCurrentAdvisorStep(7)}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 7: Autorización</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 7: Autorización del cliente */}
      {currentAdvisorStep === 7 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 7: Autorización del Cliente</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Recepción y gestión de la aprobación de la cotización.
                </p>
              </div>

              {!order.clientAuthorized ? (
                <button
                  onClick={handleAuthorizeAll}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-xs transition cursor-pointer"
                >
                  ✓ Confirmar Aprobación del Cliente
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Autorizado el {order.clientAuthTimestamp}</span>
                </div>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-600">
              Una vez autorizada, la orden pasa inmediatamente a bahía técnica de taller para el desmontaje y colocación de refacciones nuevas.
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(6)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 6
              </button>
              <button
                onClick={() => setCurrentAdvisorStep(12)}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 12: Recorrido</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 12: Recorrido por el coche con el cliente mostrando niveles y cambios */}
      {currentAdvisorStep === 12 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <Car className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 12: Recorrido por el Coche con el Cliente</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Muestra física de niveles, tapones cerrados y entrega de piezas reemplazadas.
                </p>
              </div>

              <button
                onClick={handleSaveWalkAround}
                className="px-5 py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white font-bold text-sm cursor-pointer shadow-xs"
              >
                Guardar Recorrido
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'oilLevel', label: 'Nivel de aceite en bayoneta máxima y tapón apretado' },
                { key: 'coolantLevel', label: 'Nivel de anticongelante y depósito presurizado cerrado' },
                { key: 'brakeFluidLevel', label: 'Líquido de frenos purgado y nivel adecuado' },
                { key: 'aestheticOk', label: 'Carrocería sin rayones nuevos respecto a las fotos iniciales' },
                { key: 'usedPartsHandedOver', label: 'Entrega física en bolsa de las piezas usadas reemplazadas' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(walkAroundLevels as any)[item.key]}
                    onChange={(e) =>
                      setWalkAroundLevels({
                        ...walkAroundLevels,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-[#D05E28]"
                  />
                  <span className="text-base font-semibold text-[#1A253B]">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(7)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 7
              </button>
              <button
                onClick={() => setCurrentAdvisorStep(14)}
                className="px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Avanzar al Paso 14: Entrega</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASO 14: Entrega de auto */}
      {currentAdvisorStep === 14 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B] flex items-center gap-2.5">
                  <PenTool className="w-5 h-5 text-[#D05E28]" />
                  <span>Paso 14: Entrega de Auto y Firma de Conformidad</span>
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Recolección de firma digital del cliente y cierre formal de la orden.
                </p>
              </div>

              {order.delivered && (
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Entregado el {order.deliveryTimestamp}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                    Nombre de quien Recibe el Auto
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold text-[#1A253B]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-sm text-slate-700">
                  <strong className="text-amber-950 block">Declaración de Entrega:</strong>
                  <p>
                    El cliente manifiesta haber recibido su vehículo a entera satisfacción, con recorrido físico verificado y recepción física de sus piezas usadas sustituidas.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#1A253B]">
                    Firma Digital en Pantalla:
                  </label>
                  <button
                    onClick={handleClearSignature}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden h-48 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={190}
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
                      Firma aquí con el dedo o mouse
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentAdvisorStep(12)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 12
              </button>

              <button
                onClick={handleCompleteDelivery}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Concluir Entrega Formal del Auto</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cámara en Vivo con Permisos */}
      <CameraCaptureModal
        isOpen={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handleCapturePhoto}
        title={`Fotografía: ${activePhotoView?.label || 'Evidencia'}`}
      />

      {/* Modal Agregar Pieza en Paso 6 */}
      {showAddPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-xl text-[#1A253B]">Agregar Refacción a Cotizar</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nombre Refacción</label>
                <input
                  type="text"
                  placeholder="Ej: Balatas Delanteras Cerámica"
                  value={newPartData.name}
                  onChange={(e) => setNewPartData({ ...newPartData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Diagnóstico</label>
                <textarea
                  placeholder="Motivo del cambio..."
                  value={newPartData.description}
                  onChange={(e) => setNewPartData({ ...newPartData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Costo Refacción ($)</label>
                  <input
                    type="number"
                    value={newPartData.cost}
                    onChange={(e) => setNewPartData({ ...newPartData, cost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Mano de Obra ($)</label>
                  <input
                    type="number"
                    value={newPartData.laborCost}
                    onChange={(e) => setNewPartData({ ...newPartData, laborCost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setShowAddPartModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPart}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#D05E28] hover:bg-[#b84e1e] rounded-xl cursor-pointer"
              >
                Agregar Refacción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
