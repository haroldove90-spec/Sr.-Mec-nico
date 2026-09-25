import React, { useState, useEffect } from 'react';
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
  Fuel,
  Gauge,
  ShieldAlert,
  Sliders,
  FileText,
  AlertTriangle,
  X,
  Layers,
  ShieldCheck,
  Copy,
  ExternalLink,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  VehicleServiceOrder,
  AestheticPhoto,
  DamagedPart,
  AdvisorMovement,
  VehicleIntakeInventory,
} from '../../../types';
import { CameraCaptureModal } from '../../common/CameraCaptureModal';
import { ClientSignatureAuthModal } from '../../common/ClientSignatureAuthModal';
import { M2DiagnosisTechnical } from '../M2DiagnosisTechnical';

interface AdvisorRegistrationFlowProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNewOrder: () => void;
  onRecordMovement?: (movement: Omit<AdvisorMovement, 'id' | 'timestamp'>) => void;
}

type AdvisorStep = 1 | 2 | 5 | 6 | 7 | 12 | 14;

const ADVISOR_STEPS_CONFIG = [
  { step: 1 as AdvisorStep, label: 'Paso 1: Datos e Inventario', short: '1. Registro e Inventario' },
  { step: 2 as AdvisorStep, label: 'Paso 2: Fotos Estéticas', short: '2. Fotos' },
  { step: 5 as AdvisorStep, label: 'Paso 5: Diagnóstico y Evidencias', short: '5. Diagnóstico' },
  { step: 6 as AdvisorStep, label: 'Paso 6: Cotización de lo Urgente', short: '6. Cotización' },
  { step: 7 as AdvisorStep, label: 'Paso 7: Autorización del Cliente', short: '7. Autorización' },
  { step: 12 as AdvisorStep, label: 'Paso 12: Recorrido por el Coche', short: '12. Recorrido' },
  { step: 14 as AdvisorStep, label: 'Paso 14: Entrega de Auto', short: '14. Entrega' },
];

const SAMPLE_AESTHETIC_PHOTOS: Record<string, string> = {
  frontal: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
  trasera: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  lateral_izq: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  lateral_der: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  odometro_gas: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
};

const DIAGNOSIS_PRESETS = [
  {
    id: 'frenos',
    title: 'Frenos Desgastados',
    severity: 'urgente' as const,
    systems: ['Frenos'],
    summary: 'Desgaste crítico en pastillas de freno delanteras (menos de 3mm de vida útil restante). Discos con ceja pronunciada y cristalización. Requiere rectificado y cambio de pastillas cerámicas.',
    recommendation: 'Recomendamos autorizar cambio de balatas y rectificado para garantizar distancia de frenado segura y evitar dañar los discos.',
  },
  {
    id: 'afinacion',
    title: 'Afinación Mayor Preventiva',
    severity: 'preventivo' as const,
    systems: ['Motor'],
    summary: 'Servicio de afinación mayor preventiva: bujías con carbón en electrodos, filtro de aire saturado de impurezas y aceite de motor degradado con viscosidad reducida.',
    recommendation: 'Realizar servicio de afinación completa: aceite sintético 5W-30, filtro de aceite, filtro de aire y bujías de platino.',
  },
  {
    id: 'suspension',
    title: 'Suspensión y Dirección',
    severity: 'urgente' as const,
    systems: ['Suspensión', 'Dirección'],
    summary: 'Juego excesivo en terminales de dirección exteriores y bujes de horquilla cuarteados. Provoca vibración en volante a más de 80 km/h y desgaste disparejo en llantas.',
    recommendation: 'Reemplazo de terminales y bujes con posterior alineación y balanceo computarizado.',
  },
  {
    id: 'anticongelante',
    title: 'Fuga de Anticongelante',
    severity: 'critico' as const,
    systems: ['Enfriamiento', 'Motor'],
    summary: 'Fuga activa de refrigerante en manguera superior de radiador y nivel en depósito de reserva peligrosamente por debajo del mínimo.',
    recommendation: 'No circular trayectos largos hasta sustituir manguera y purgar sistema para evitar sobrecalentamiento del motor.',
  },
  {
    id: 'bateria',
    title: 'Batería y Carga',
    severity: 'urgente' as const,
    systems: ['Eléctrico'],
    summary: 'Batería con bajo voltaje de reposo (11.8V) y 45% de capacidad de arranque en frío (CCA). Bornes con sulfatación moderada.',
    recommendation: 'Sustitución preventiva de acumulador para evitar fallas de encendido.',
  },
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

  // Step 5: Formulario Editable de Diagnóstico Manual
  const [diagnosisData, setDiagnosisData] = useState({
    summary: order.diagnosisSummary || 'Desgaste crítico detectado en balatas y discos de freno delanteros.',
    severity: 'urgente' as 'preventivo' | 'urgente' | 'critico',
    recommendation: 'Recomendamos autorizar el reemplazo de pastillas cerámicas y rectificado antes de salir a carretera.',
    affectedSystems: ['Frenos', 'Suspensión'] as string[],
    technicianName: 'Carlos Mendoza Ruiz',
  });
  const [diagnosisSavedSuccess, setDiagnosisSavedSuccess] = useState(false);

  // Form State for Step 1: Client & Vehicle
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
    fuelLevelPercent: order.vehicle.fuelLevelPercent || 50,
  });

  // Comprehensive Inventory State (Gas, Tapetes, Rayones, Golpes, Accesorios faltantes)
  const [inventory, setInventory] = useState<VehicleIntakeInventory>({
    fuelLevelPercent: order.intakeInventory?.fuelLevelPercent ?? (order.vehicle.fuelLevelPercent || 50),
    fuelLevelLabel: order.intakeInventory?.fuelLevelLabel ?? '1/2',

    // Accesorios
    hasFloorMats: order.intakeInventory?.hasFloorMats ?? true,
    floorMatsDetails: order.intakeInventory?.floorMatsDetails ?? 'Completos (delanteros y traseros)',
    hasSpareTire: order.intakeInventory?.hasSpareTire ?? true,
    hasJack: order.intakeInventory?.hasJack ?? true,
    hasLugWrench: order.intakeInventory?.hasLugWrench ?? true,
    hasWheelLocks: order.intakeInventory?.hasWheelLocks ?? false,
    hasJumperCables: order.intakeInventory?.hasJumperCables ?? false,
    hasExtinguisherTriangles: order.intakeInventory?.hasExtinguisherTriangles ?? true,
    hasAntenna: order.intakeInventory?.hasAntenna ?? true,
    hasSideMirrorsGood: order.intakeInventory?.hasSideMirrorsGood ?? true,
    hasGasCap: order.intakeInventory?.hasGasCap ?? true,
    hasWheelCaps: order.intakeInventory?.hasWheelCaps ?? true,
    hasRadioStereo: order.intakeInventory?.hasRadioStereo ?? true,
    hasLighterCharger: order.intakeInventory?.hasLighterCharger ?? true,
    missingAccessoriesNotes: order.intakeInventory?.missingAccessoriesNotes ?? '',

    // Carrocería y Daños
    hasScratches: order.intakeInventory?.hasScratches ?? true,
    scratchesDetails: order.intakeInventory?.scratchesDetails ?? 'Rayón leve en fascia trasera y puerta copiloto',
    hasDents: order.intakeInventory?.hasDents ?? false,
    dentsDetails: order.intakeInventory?.dentsDetails ?? 'Sin abolladuras mayores',
    windshieldGlassStatus: order.intakeInventory?.windshieldGlassStatus ?? 'intacto',
    lightsStatus: order.intakeInventory?.lightsStatus ?? 'intactos',
    tiresStatus: order.intakeInventory?.tiresStatus ?? 'buen_estado',
    valuablesDeclared: order.intakeInventory?.valuablesDeclared ?? 'Ninguno reportado',
  });

  // Sync state when active order changes
  useEffect(() => {
    setFormData({
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
      fuelLevelPercent: order.vehicle.fuelLevelPercent || 50,
    });

    if (order.intakeInventory) {
      setInventory(order.intakeInventory);
    }
  }, [order.id]);

  // Step 6: Modal new part
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

  // Step 7: Modal de Firma Digital y Autorización
  const [showAuthSignatureModal, setShowAuthSignatureModal] = useState(false);

  // Gasolina preset click handler
  const handleSetFuelPreset = (pct: number, label: VehicleIntakeInventory['fuelLevelLabel']) => {
    setInventory((prev) => ({ ...prev, fuelLevelPercent: pct, fuelLevelLabel: label }));
    setFormData((prev) => ({ ...prev, fuelLevelPercent: pct }));
  };

  // Toggle zonas con rayones
  const handleToggleScratchZone = (zone: string) => {
    const currentZones = inventory.scratchesZones || [];
    const updatedZones = currentZones.includes(zone)
      ? currentZones.filter((z) => z !== zone)
      : [...currentZones, zone];

    setInventory((prev) => ({
      ...prev,
      hasScratches: updatedZones.length > 0 ? true : prev.hasScratches,
      scratchesZones: updatedZones,
      scratchesDetails: updatedZones.length > 0
        ? `Rayones detectados en: ${updatedZones.join(', ')}`
        : prev.scratchesDetails,
    }));
  };

  // Toggle zonas con golpes
  const handleToggleDentZone = (zone: string) => {
    const currentZones = inventory.dentsZones || [];
    const updatedZones = currentZones.includes(zone)
      ? currentZones.filter((z) => z !== zone)
      : [...currentZones, zone];

    setInventory((prev) => ({
      ...prev,
      hasDents: updatedZones.length > 0 ? true : prev.hasDents,
      dentsZones: updatedZones,
      dentsDetails: updatedZones.length > 0
        ? `Golpes/abolladuras en: ${updatedZones.join(', ')}`
        : prev.dentsDetails,
    }));
  };

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
        fuelLevelPercent: Number(inventory.fuelLevelPercent),
      },
      intakeInventory: inventory,
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
      actionLabel: 'Registro e Inventario de Auto',
      description: `Registro e inventario de accesorios/daños de ${formData.make} ${formData.model} (${formData.plate.toUpperCase()})`,
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

  // Captura directa desde archivo o cámara nativa sin pedir permisos
  const handleDirectFileCapture = (view: AestheticPhoto['view'], label: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhoto: AestheticPhoto = {
          view,
          label,
          url: reader.result,
          timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedPhotos = [
          ...order.aestheticPhotos.filter((p) => p.view !== view),
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
          actionLabel: 'Foto Capturada',
          description: `Foto agregada directamente: ${label}`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Cargar foto de demostración inmediata con 1 clic
  const handleUseSamplePhotoDirectly = (view: AestheticPhoto['view'], label: string) => {
    const sampleUrl = SAMPLE_AESTHETIC_PHOTOS[view] || SAMPLE_AESTHETIC_PHOTOS.frontal;
    const newPhoto: AestheticPhoto = {
      view,
      label,
      url: sampleUrl,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedPhotos = [
      ...order.aestheticPhotos.filter((p) => p.view !== view),
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
      actionLabel: 'Foto de Inspección Agregada',
      description: `Foto de inspección asignada: ${label}`,
    });
  };

  // Paso 5: Guardar Diagnóstico Manual del Admin / Asesor
  const handleSaveDiagnosis = () => {
    onUpdateOrder({
      ...order,
      diagnosisSummary: diagnosisData.summary,
      currentStep: Math.max(order.currentStep, 5),
    });
    setDiagnosisSavedSuccess(true);
    setTimeout(() => setDiagnosisSavedSuccess(false), 2500);

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'diagnostico_entregado',
      actionLabel: 'Diagnóstico Técnico Registrado',
      description: `Dictamen técnico registrado: ${diagnosisData.summary.slice(0, 60)}... (${diagnosisData.severity})`,
    });
  };

  const handleApplyDiagnosisPreset = (preset: (typeof DIAGNOSIS_PRESETS)[0]) => {
    setDiagnosisData((prev) => ({
      ...prev,
      summary: preset.summary,
      severity: preset.severity,
      recommendation: preset.recommendation,
      affectedSystems: preset.systems,
    }));
  };

  const handleToggleDiagnosisSystem = (system: string) => {
    setDiagnosisData((prev) => {
      const exists = prev.affectedSystems.includes(system);
      return {
        ...prev,
        affectedSystems: exists
          ? prev.affectedSystems.filter((s) => s !== system)
          : [...prev.affectedSystems, system],
      };
    });
  };

  // Paso 5: Enviar diagnóstico por WhatsApp al cliente con dictamen personalizado
  const handleSendDiagnosisWhatsApp = () => {
    handleSaveDiagnosis();
    const cleanPhone = (order.customer.fiscalData.whatsapp || order.customer.phone).replace(/\D/g, '');
    const severityEmoji =
      diagnosisData.severity === 'critico'
        ? '🔴 RIESGO CRÍTICO / NO CIRCULAR'
        : diagnosisData.severity === 'urgente'
        ? '🟡 DESGASTE MODERADO / ATENCIÓN URGENTE'
        : '🟢 SERVICIO PREVENTIVO';

    const message = encodeURIComponent(
      `Hola ${order.customer.name}, te saluda tu Asesor de Servicio de Sr. Mecánico.\n\n` +
      `📋 DICTAMEN TÉCNICO REGISTRADO:\n` +
      `Vehículo: ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.plate})\n` +
      `Folio de Orden: ${order.orderNumber}\n` +
      `Nivel de Prioridad: ${severityEmoji}\n` +
      `Sistemas Afectados: ${diagnosisData.affectedSystems.join(', ')}\n\n` +
      `Diagnóstico del Especialista:\n"${diagnosisData.summary}"\n\n` +
      `Recomendación del Taller:\n${diagnosisData.recommendation}\n\n` +
      `Puedes consultar las fotos de evidencia y autorizar tu cotización en tu portal en vivo.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
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

  // Paso 7: Autorización del Cliente con Firma Digital
  const handleAuthorizeAll = () => {
    setShowAuthSignatureModal(true);
  };

  const handleConfirmClientAuth = (
    signatureUrl: string,
    signerName: string,
    trackingUrl: string
  ) => {
    const updatedParts = (order.parts || []).map((p) => ({ ...p, approved: true }));
    onUpdateOrder({
      ...order,
      parts: updatedParts,
      clientAuthorized: true,
      clientAuthTimestamp: new Date().toLocaleString('es-MX'),
      clientAuthSignatureUrl: signatureUrl,
      clientAuthSignerName: signerName,
      currentStep: Math.max(order.currentStep, 8),
    });

    onRecordMovement?.({
      orderNumber: order.orderNumber,
      plate: order.vehicle.plate,
      customerName: order.customer.name,
      action: 'autorizacion_cliente',
      actionLabel: 'Orden Autorizada con Firma Digital',
      description: `Autorizada por ${signerName}. Orden firmada y link de monitoreo enviados por WhatsApp.`,
    });

    setShowAuthSignatureModal(false);
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
            Registro de Automóviles e Inventario
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

      {/* PASO 1: Formulario Completo de Datos, Vehículo, Gasolina, Accesorios y Daños */}
      {currentAdvisorStep === 1 && (
        <div className="space-y-6">
          {/* Bloque 1: Cliente y Facturación */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#D05E28]" />
                <h3 className="font-bold text-xl text-[#1A253B]">
                  1. Datos del Cliente y Facturación SAT
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Nombre Completo del Cliente *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Ej: Alejandro Morales Fuentes"
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  WhatsApp / Teléfono Móvil *
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value, customerPhone: e.target.value })}
                  placeholder="+52 55 1234 5678"
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
                  placeholder="cliente@ejemplo.com"
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
                  placeholder="XAXX010101000"
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
                  placeholder="Nombre de la persona o empresa para factura CFDI"
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Ficha Técnica del Automóvil */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Car className="w-5 h-5 text-[#D05E28]" />
              <h3 className="font-bold text-xl text-[#1A253B]">
                2. Ficha Técnica del Automóvil
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Marca *</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  placeholder="Volkswagen, Nissan, etc."
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Modelo *</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Jetta, Versa, etc."
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Año *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Placas *</label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  placeholder="NCY-58-21"
                  className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Plata, Blanco, Rojo..."
                  className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Kilometraje (km) *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-bold">KM</span>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Número de Serie / VIN (17 dígitos)
                </label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="3N1CN7AP5PL..."
                  className="w-full px-4 py-3 text-base font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Nivel de Gasolina Exacto (Visual e Interactivo) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-[#D05E28]">
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1A253B]">
                    3. Nivel de Gasolina al Ingresar al Taller
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Registra la cantidad exacta de combustible para constancia en el expediente.
                  </p>
                </div>
              </div>
              <span className="px-4 py-2 rounded-xl text-base sm:text-lg font-extrabold bg-[#D05E28]/10 text-[#D05E28] border border-[#D05E28]/20">
                {inventory.fuelLevelPercent}% • {inventory.fuelLevelLabel}
              </span>
            </div>

            {/* Presets rápidos con un solo toque */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Selección Rápida de Nivel de Tanque:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Reserva' as const, pct: 10, color: 'text-rose-600' },
                  { label: '1/4' as const, pct: 25, color: 'text-amber-600' },
                  { label: '1/2' as const, pct: 50, color: 'text-blue-600' },
                  { label: '3/4' as const, pct: 75, color: 'text-emerald-600' },
                  { label: 'Lleno' as const, pct: 100, color: 'text-emerald-700' },
                ].map((item) => {
                  const isSelected = inventory.fuelLevelPercent === item.pct;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSetFuelPreset(item.pct, item.label)}
                      className={`py-3.5 px-3 rounded-xl text-sm font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#1A253B] text-white border-[#1A253B] shadow-md scale-[1.02]'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <Fuel className={`w-4 h-4 ${isSelected ? 'text-[#D05E28]' : item.color}`} />
                      <span>{item.label}</span>
                      <span className="text-xs opacity-75 font-mono">({item.pct}%)</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Gauge Bar y Slider fluido */}
            <div className="space-y-2 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span className="text-rose-600">Vacío (E)</span>
                <span>1/4</span>
                <span className="text-[#D05E28]">1/2 Tanque</span>
                <span>3/4</span>
                <span className="text-emerald-600">Lleno (F)</span>
              </div>
              <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    inventory.fuelLevelPercent <= 15
                      ? 'bg-rose-500'
                      : inventory.fuelLevelPercent <= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${inventory.fuelLevelPercent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={inventory.fuelLevelPercent}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  let label: VehicleIntakeInventory['fuelLevelLabel'] = '1/2';
                  if (val <= 15) label = 'Reserva';
                  else if (val <= 35) label = '1/4';
                  else if (val <= 65) label = '1/2';
                  else if (val <= 85) label = '3/4';
                  else label = 'Lleno';
                  setInventory({ ...inventory, fuelLevelPercent: val, fuelLevelLabel: label });
                  setFormData({ ...formData, fuelLevelPercent: val });
                }}
                className="w-full accent-[#D05E28] h-3 bg-slate-200 rounded-lg cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Bloque 4: ¿Tiene Tapetes? (Inventario Detallado de Tapetes) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1A253B]">
                    4. Tapetes del Automóvil
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Verifica si el auto cuenta con tapetes, tipo de material y si están completos.
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  inventory.hasFloorMats
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {inventory.hasFloorMats ? 'CON TAPETES' : 'SIN TAPETES'}
              </span>
            </div>

            {/* Selector Grande Si / No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasFloorMats: true,
                    floorMatsDetails: inventory.floorMatsDetails || 'Completos (4 piezas)',
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  inventory.hasFloorMats
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      inventory.hasFloorMats ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      SÍ CUENTA CON TAPETES
                    </div>
                    <div className="text-xs text-slate-500">El vehículo ingresa con tapetes en cabina</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasFloorMats: false,
                    floorMatsDetails: 'No ingresó con tapetes (retirados por el cliente o ausentes)',
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  !inventory.hasFloorMats
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      !inventory.hasFloorMats ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      NO TIENE TAPETES
                    </div>
                    <div className="text-xs text-slate-500">Sin tapetes o retirados previamente</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Opciones cuando SÍ tiene tapetes */}
            {inventory.hasFloorMats && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Cobertura de Tapetes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Juego completo (4 piezas)',
                        'Solo delanteros (2 piezas)',
                        'Faltan traseros',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setInventory({ ...inventory, floorMatsDetails: item })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            inventory.floorMatsDetails?.includes(item)
                              ? 'bg-[#1A253B] text-white border-[#1A253B]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Material del Tapete
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'hule' as const, label: 'Hule / Uso Rudo' },
                        { id: 'alfombra' as const, label: 'Alfombra / Tela Original' },
                      ].map((mat) => (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => setInventory({ ...inventory, floorMatsType: mat.id })}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                            inventory.floorMatsType === mat.id
                              ? 'bg-[#D05E28] text-white border-[#D05E28]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Detalles u Observaciones de Tapetes:
                  </label>
                  <input
                    type="text"
                    value={inventory.floorMatsDetails || ''}
                    onChange={(e) => setInventory({ ...inventory, floorMatsDetails: e.target.value })}
                    placeholder="Ej: Tapete conductor con desgaste normal, tapetes traseros originales impecables..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bloque 5: ¿Presenta Rayones? (Inspección de Pintura y Carrocería) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1A253B]">
                    5. Inspección de Rayones y Raspones
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Marca las partes del vehículo que presentan rayones previos para proteger al taller.
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  inventory.hasScratches
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {inventory.hasScratches ? 'SÍ TIENE RAYONES' : 'SIN RAYONES'}
              </span>
            </div>

            {/* Selector Grande Si / No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasScratches: true,
                    scratchesDetails: inventory.scratchesDetails || 'Rayón visible registrado',
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  inventory.hasScratches
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      inventory.hasScratches ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      SÍ PRESENTA RAYONES / RASPONES
                    </div>
                    <div className="text-xs text-slate-500">Rayones superficiales o profundos en pintura</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasScratches: false,
                    scratchesDetails: 'Pintura y carrocería sin rayones visibles',
                    scratchesZones: [],
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  !inventory.hasScratches
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      !inventory.hasScratches ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      SIN RAYONES (PINTURA LIMPIA)
                    </div>
                    <div className="text-xs text-slate-500">Pintura impecable sin raspones reportados</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Zonas de Rayones */}
            {inventory.hasScratches && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selecciona las Zonas con Rayones (Toca para marcar):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Fascia Delantera',
                    'Fascia Trasera',
                    'Cofre',
                    'Toldo / Techo',
                    'Cajuela',
                    'Puerta Piloto',
                    'Puerta Copiloto',
                    'Puerta Trasera Izq.',
                    'Puerta Trasera Der.',
                    'Salpicadera Del. Izq.',
                    'Salpicadera Del. Der.',
                    'Salpicadera Tras. Izq.',
                    'Salpicadera Tras. Der.',
                  ].map((zone) => {
                    const isMarked = inventory.scratchesZones?.includes(zone);
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => handleToggleScratchZone(zone)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                          isMarked
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isMarked ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{zone}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Descripción y Severidad de Rayones:
                  </label>
                  <textarea
                    value={inventory.scratchesDetails || ''}
                    onChange={(e) => setInventory({ ...inventory, scratchesDetails: e.target.value })}
                    rows={2}
                    placeholder="Ej: Rayón superficial en fascia trasera derecha por roce de estacionamiento..."
                    className="w-full p-3 bg-white rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bloque 6: ¿Presenta Golpes o Abolladuras? */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#1A253B]">
                    6. Inspección de Golpes y Abolladuras
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Documenta abolladuras, portazos o deformaciones de lámina antes del servicio.
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                  inventory.hasDents
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {inventory.hasDents ? 'SÍ TIENE GOLPES' : 'SIN GOLPES'}
              </span>
            </div>

            {/* Selector Grande Si / No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasDents: true,
                    dentsDetails: inventory.dentsDetails || 'Abolladura previa reportada',
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  inventory.hasDents
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      inventory.hasDents ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      SÍ PRESENTA GOLPES / ABOLLADURAS
                    </div>
                    <div className="text-xs text-slate-500">Lámina sumida o golpe preexistente</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setInventory({
                    ...inventory,
                    hasDents: false,
                    dentsDetails: 'Lámina perfectamente alineada sin golpes visibles',
                    dentsZones: [],
                  })
                }
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                  !inventory.hasDents
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      !inventory.hasDents ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-base text-[#1A253B]">
                      SIN GOLPES (LÁMINA ALINEADA)
                    </div>
                    <div className="text-xs text-slate-500">Carrocería sin hundimientos ni abolladuras</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Zonas con Golpes */}
            {inventory.hasDents && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selecciona las Zonas con Golpes o Abolladuras:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Fascia Delantera',
                    'Fascia Trasera',
                    'Cofre',
                    'Salpicadera Del. Izq.',
                    'Salpicadera Del. Der.',
                    'Salpicadera Tras. Izq.',
                    'Salpicadera Tras. Der.',
                    'Puerta Piloto',
                    'Puerta Copiloto',
                    'Puertas Traseras',
                    'Cajuela',
                    'Marco / Postes',
                    'Estribo Inferior',
                  ].map((zone) => {
                    const isMarked = inventory.dentsZones?.includes(zone);
                    return (
                      <button
                        key={zone}
                        type="button"
                        onClick={() => handleToggleDentZone(zone)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                          isMarked
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isMarked ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{zone}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Descripción y Severidad de Golpes:
                  </label>
                  <textarea
                    value={inventory.dentsDetails || ''}
                    onChange={(e) => setInventory({ ...inventory, dentsDetails: e.target.value })}
                    rows={2}
                    placeholder="Ej: Portazo leve en puerta copiloto, sumidero pequeño en salpicadera..."
                    className="w-full p-3 bg-white rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bloque 7: ¿Le Hace Falta Algún Accesorio? (Inventario de Accesorios) */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#1A253B]">
                  7. ¿Le Hace Falta Algún Accesorio al Vehículo?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Inventario físico de accesorios, herramientas y refacciones al ingresar al taller.
                </p>
              </div>
            </div>

            {/* Grid Interactivo de 12 Accesorios Esenciales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { key: 'hasAntenna', label: 'Antena de Radio' },
                { key: 'hasGasCap', label: 'Tapón de Gasolina' },
                { key: 'hasSpareTire', label: 'Llanta de Refacción' },
                { key: 'hasJack', label: 'Gato Hidráulico' },
                { key: 'hasLugWrench', label: 'Llave de Cruz / Maneral' },
                { key: 'hasWheelLocks', label: 'Birlo / Dado de Seguridad' },
                { key: 'hasExtinguisherTriangles', label: 'Extintor y Triángulos' },
                { key: 'hasJumperCables', label: 'Cables Pasa-corriente' },
                { key: 'hasSideMirrorsGood', label: 'Espejos Laterales (Lunas)' },
                { key: 'hasWheelCaps', label: 'Copas / Tapones de Rueda' },
                { key: 'hasRadioStereo', label: 'Estéreo / Pantalla Original' },
                { key: 'hasLighterCharger', label: 'Encendedor / Toma 12V' },
              ].map((acc) => {
                const isPresent = Boolean((inventory as any)[acc.key]);
                return (
                  <div
                    key={acc.key}
                    onClick={() =>
                      setInventory({
                        ...inventory,
                        [acc.key]: !isPresent,
                      })
                    }
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      isPresent
                        ? 'border-emerald-300 bg-emerald-50/40 text-[#1A253B]'
                        : 'border-rose-300 bg-rose-50/40 text-rose-900'
                    }`}
                  >
                    <span className="text-sm font-bold">{acc.label}</span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                        isPresent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Presente</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5" />
                          <span>Falta</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Campo Específico Resaltado: Accesorios Faltantes */}
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-300 space-y-2">
              <label className="block text-sm font-bold text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>¿Le hace falta algún otro accesorio o pieza al vehículo? Especifique:</span>
              </label>
              <input
                type="text"
                value={inventory.missingAccessoriesNotes || ''}
                onChange={(e) => setInventory({ ...inventory, missingAccessoriesNotes: e.target.value })}
                placeholder="Ej: Sin tapón de gasolina, falta birlo de seguridad rueda trasera izquierda, sin antena..."
                className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-white text-base text-[#1A253B] font-semibold focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
              <p className="text-xs text-amber-800">
                Esta nota aparecerá en el comprobante de recepción para deslindar responsabilidades del taller.
              </p>
            </div>

            {/* Objetos de Valor */}
            <div>
              <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                Objetos de Valor o Pertenencias Declaradas en Guantera o Cajuela:
              </label>
              <input
                type="text"
                value={inventory.valuablesDeclared || ''}
                onChange={(e) => setInventory({ ...inventory, valuablesDeclared: e.target.value })}
                placeholder="Ej: Lentes graduados en guantera, silla de bebé en asiento trasero, sin dinero en efectivo..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>

          {/* Bloque 8: Inspección de Cristales, Faros y Neumáticos */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <ShieldCheck className="w-6 h-6 text-[#D05E28]" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-[#1A253B]">
                  8. Estado de Cristales, Luces y Neumáticos
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Condición de parabrisas, calaveras y vida útil de llantas.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Parabrisas y Cristales
                </label>
                <select
                  value={inventory.windshieldGlassStatus}
                  onChange={(e) => setInventory({ ...inventory, windshieldGlassStatus: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28]"
                >
                  <option value="intacto">Intacto / Sin fisuras</option>
                  <option value="estrellado">Estrellado / Fisura visible</option>
                  <option value="picado">Picadura por piedra</option>
                  <option value="polarizado">Polarizado sin daños</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Faros y Calaveras
                </label>
                <select
                  value={inventory.lightsStatus}
                  onChange={(e) => setInventory({ ...inventory, lightsStatus: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28]"
                >
                  <option value="intactos">Intactos / Funcionando</option>
                  <option value="rotos">Mica rota / Estrellada</option>
                  <option value="opacos">Micas opacas / Amarillentas</option>
                  <option value="foco_fundido">Foco fundido</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Estado de Neumáticos
                </label>
                <select
                  value={inventory.tiresStatus}
                  onChange={(e) => setInventory({ ...inventory, tiresStatus: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-base font-semibold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28]"
                >
                  <option value="buen_estado">Buen Estado (&gt;50% vida)</option>
                  <option value="desgaste_irregular">Desgaste Irregular / Lisa</option>
                  <option value="chipote">Con chipote / deformación</option>
                  <option value="ponchada">Baja presión / ponchada</option>
                </select>
              </div>
            </div>

            {/* Botones de acción del paso 1 */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSaveStep1}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] font-bold text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-5 h-5 text-[#D05E28]" />
                <span>Guardar Registro e Inventario</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSaveStep1();
                  setCurrentAdvisorStep(2);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Avanzar al Paso 2: Fotos Estéticas</span>
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenCameraForPhoto(pos.view, pos.label)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#D05E28]" />
                          <span>{photo ? 'Reemplazar' : 'Tomar Foto'}</span>
                        </button>
                        <label
                          title="Abrir cámara nativa del celular o galería sin pedir permisos"
                          className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer transition flex items-center justify-center shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDirectFileCapture(pos.view, pos.label, file);
                            }}
                          />
                        </label>
                      </div>
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
        <M2DiagnosisTechnical
          order={order}
          onUpdateOrder={onUpdateOrder}
          onNextStep={() => setCurrentAdvisorStep(6)}
          onPrevStep={() => setCurrentAdvisorStep(2)}
        />
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

      {/* PASO 7: Autorización del cliente con Firma Digital */}
      {currentAdvisorStep === 7 && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl sm:text-2xl text-[#1A253B] flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-[#D05E28]" />
                  <span>Paso 7: Autorización con Firma Digital del Cliente</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  El cliente firma en pantalla y se envía automáticamente la orden con su enlace personalizado de monitoreo por WhatsApp.
                </p>
              </div>

              {!order.clientAuthorized ? (
                <button
                  type="button"
                  onClick={() => setShowAuthSignatureModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition cursor-pointer flex items-center gap-2.5 transform active:scale-98"
                >
                  <PenTool className="w-5 h-5" />
                  <span>Abrir Firma Digital y Autorizar</span>
                </button>
              ) : (
                <div className="px-5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Autorizado el {order.clientAuthTimestamp}</span>
                </div>
              )}
            </div>

            {/* Si ya está autorizada, mostrar ficha de comprobante con firma y WhatsApp */}
            {order.clientAuthorized ? (
              <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-300 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                      Comprobante de Autorización Registrado:
                    </span>
                    <h4 className="text-lg font-black text-emerald-950 mt-0.5">
                      Firmado por: {order.clientAuthSignerName || order.customer.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-emerald-900 mt-1">
                      Fecha y Hora: <strong>{order.clientAuthTimestamp}</strong> • Inversión Aprobada: <strong>${totalQuote.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN</strong>
                    </p>
                  </div>

                  {order.clientAuthSignatureUrl && (
                    <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-xs text-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Firma Digital del Cliente
                      </span>
                      <img
                        src={order.clientAuthSignatureUrl}
                        alt="Firma del Cliente"
                        className="h-14 max-w-[180px] object-contain mx-auto"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-emerald-200 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAuthSignatureModal(true)}
                    className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Ver o Cambiar Firma</span>
                  </button>

                  <a
                    href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Hola ${order.customer.name}, te confirmamos que tu orden #${order.orderNumber} para tu ${order.vehicle.make} ${order.vehicle.model} está en taller. Puedes seguir el avance en vivo aquí: https://sr-mec-nico.vercel.app/?tracking=${order.orderNumber}&phone=${order.customer.phone.replace(/\D/g, '')}&email=${encodeURIComponent(order.customer.email)}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Reenviar WhatsApp con Link de Monitoreo</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://sr-mec-nico.vercel.app/?tracking=${order.orderNumber}&phone=${order.customer.phone.replace(/\D/g, '')}&email=${encodeURIComponent(order.customer.email)}`;
                      navigator.clipboard.writeText(link);
                      alert('¡Enlace de monitoreo del cliente copiado al portapapeles!');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link de Monitoreo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-[#D05E28] rounded-2xl">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#1A253B]">
                      Paso Requerido: Firma del Cliente
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Abre la ventana de firma en tu tablet o móvil para que el cliente plasme su firma con el dedo o puntero.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Total a Autorizar con IVA:</span>
                    <strong className="text-xl font-black text-[#D05E28]">
                      ${totalQuote.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAuthSignatureModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Firmar Ahora</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentAdvisorStep(6)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Volver al Paso 6
              </button>
              <button
                type="button"
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
                  Muestra física de niveles, tapones cerrados y entrega de piezas reemplazadas en taller.
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
                { key: 'aestheticOk', label: 'Carrocería sin rayones nuevos respecto al inventario de recepción' },
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
                    El cliente manifiesta haber recibido su vehículo a entera satisfacción, con recorrido físico verificado y recepción física de sus piezas usadas sustituidas en el taller.
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

      {/* Modal de Firma Digital y Autorización (Paso 7) */}
      <ClientSignatureAuthModal
        isOpen={showAuthSignatureModal}
        onClose={() => setShowAuthSignatureModal(false)}
        order={order}
        onConfirmAuthorization={handleConfirmClientAuth}
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
