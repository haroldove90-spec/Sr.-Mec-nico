import React, { useState, useEffect } from 'react';
import {
  Car,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  MessageCircle,
  Receipt,
  Sparkles,
  ChevronRight,
  User,
  Wrench,
  Check,
  AlertTriangle,
  PenTool,
  ExternalLink,
  Copy,
  LogOut,
} from 'lucide-react';
import { VehicleServiceOrder } from '../../types';
import { ClientSignatureAuthModal } from '../common/ClientSignatureAuthModal';
import { getClientTrackingUrl } from '../../utils/trackingUrl';

interface ClientPortalProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  orders: VehicleServiceOrder[];
  onSelectOrder: (orderId: string) => void;
  onLogout?: () => void;
  activeModule?: string;
  onSelectModule?: (moduleId: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  order,
  onUpdateOrder,
  orders,
  onSelectOrder,
  onLogout,
  activeModule,
  onSelectModule,
}) => {
  // Sincronización instantánea y reactiva entre la barra inferior (BottomNav) y el portal
  const [activeTab, setActiveTab] = useState<'status' | 'quote' | 'evidence'>(() => {
    if (activeModule === 'client_quote') return 'quote';
    if (activeModule === 'client_evidence') return 'evidence';
    return 'status';
  });

  useEffect(() => {
    if (activeModule === 'client_quote') {
      setActiveTab('quote');
    } else if (activeModule === 'client_evidence') {
      setActiveTab('evidence');
    } else if (activeModule === 'client_live') {
      setActiveTab('status');
    }
  }, [activeModule]);

  const handleTabChange = (tab: 'status' | 'quote' | 'evidence') => {
    setActiveTab(tab);
    if (onSelectModule) {
      const mod =
        tab === 'quote' ? 'client_quote' : tab === 'evidence' ? 'client_evidence' : 'client_live';
      onSelectModule(mod);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const parts = order.parts || [];

  const handleTogglePartApproval = (partId: string) => {
    const updated = parts.map((p) => (p.id === partId ? { ...p, approved: !p.approved } : p));
    onUpdateOrder({
      ...order,
      parts: updated,
    });
  };

  const handleConfirmAuthorization = (
    signatureUrl: string,
    signerName: string,
    trackingUrl: string
  ) => {
    const updatedParts = parts.map((p) => ({ ...p, approved: true }));
    onUpdateOrder({
      ...order,
      parts: updatedParts,
      clientAuthorized: true,
      clientAuthTimestamp: new Date().toLocaleString('es-MX'),
      clientAuthSignatureUrl: signatureUrl,
      clientAuthSignerName: signerName,
      currentStep: Math.max(order.currentStep, 8),
    });
    setIsSignatureModalOpen(false);
  };

  // URL Personalizada para el Cliente (dinámica con origin actual y fallback)
  const trackingUrl = getClientTrackingUrl(order);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Etapas del taller simplificadas para el cliente
  const getStageInfo = () => {
    const step = order.currentStep || 1;
    if (step <= 2) {
      return {
        stage: '1. Recepción y Registro',
        description: 'Tu auto ha ingresado al taller. Se documentó el estado estético, kilometraje, inventario y niveles iniciales.',
        progress: 15,
        badge: 'En Recepción',
      };
    }
    if (step <= 5) {
      return {
        stage: '2. Diagnóstico Técnico de Especialistas',
        description: 'Nuestros técnicos especializados están evaluando los 55 puntos de seguridad, escaneando la ECU y diagnosticando fallas.',
        progress: 35,
        badge: 'En Diagnóstico',
      };
    }
    if (step <= 7) {
      return {
        stage: '3. Cotización y Autorización Firmada',
        description: order.clientAuthorized
          ? 'Has autorizado formalmente la reparación con tu firma digital. Las piezas han sido solicitadas a almacén.'
          : 'Revisa las piezas dañadas con fotografías y autoriza la reparación desde tu pantalla con tu firma digital.',
        progress: 50,
        badge: order.clientAuthorized ? 'Autorizado' : 'Requiere tu Firma',
      };
    }
    if (step <= 11) {
      return {
        stage: '4. En Taller Mecánico (Reparación)',
        description: 'El mecánico está trabajando en el auto. Instalando refacciones nuevas y documentando la evidencia en foto.',
        progress: 75,
        badge: 'En Reparación',
      };
    }
    if (step <= 13) {
      return {
        stage: '5. Prueba de Calidad y Control Final',
        description: 'Prueba de manejo aprobada. Tu cuenta y factura electrónica CFDI están listas para liquidación.',
        progress: 90,
        badge: 'Por Liquidar',
      };
    }
    return {
      stage: '6. Listo para Entrega al Cliente',
      description: 'Tu auto está listo y lavado para entrega física con tus piezas usadas empacadas.',
      progress: 100,
      badge: 'Listo para Recoger',
    };
  };

  const stageInfo = getStageInfo();

  // Cálculos financieros de la cotización
  const approvedParts = parts.filter((p) => p.approved);
  const partsSubtotal = approvedParts.reduce((acc, p) => acc + p.cost, 0);
  const laborSubtotal = approvedParts.reduce((acc, p) => acc + p.laborCost, 0);
  const subtotal = partsSubtotal + laborSubtotal;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Contactar asesor por WhatsApp
  const handleContactAdvisor = () => {
    const message = encodeURIComponent(
      `Hola, soy ${order.customer.name}. Tengo una consulta sobre el servicio de mi auto ${order.vehicle.make} ${order.vehicle.model} (Placas: ${order.vehicle.plate}, Folio: #${order.orderNumber}).`
    );
    const phone = order.customer.phone.replace(/\D/g, '') || '525541928831';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-32 sm:pb-36 lg:pb-16 px-1 sm:px-0">
      {/* Header del Portal del Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-[#D05E28] bg-[#D05E28]/10 px-2.5 py-0.5 rounded-full border border-[#D05E28]/20">
              Portal Oficial de Monitoreo
            </span>
            <span className="text-xs font-bold text-slate-500">
              Cliente: <strong className="text-[#1A253B]">{order.customer.name}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            Mi {order.vehicle.make} {order.vehicle.model} ({order.vehicle.year})
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-0.5">
            Placas: <strong className="text-[#1A253B] font-mono">{order.vehicle.plate}</strong> • Folio de Orden: <strong className="text-[#D05E28]">#{order.orderNumber}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Si hay más autos para cambiar de vehículo */}
          {orders.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">Auto:</span>
              <select
                value={order.id}
                onChange={(e) => onSelectOrder(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28]"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.vehicle.plate} ({o.vehicle.make} {o.vehicle.model})
                  </option>
                ))}
              </select>
            </div>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
              title="Salir del portal de monitoreo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjeta Principal de Estado en Vivo (Live Tracker) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Monitoreo Activo en Tiempo Real
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
              {stageInfo.stage}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {stageInfo.description}
            </p>
          </div>

          <span className="px-4 py-2 rounded-2xl text-sm font-extrabold bg-[#D05E28]/10 text-[#D05E28] border border-[#D05E28]/20 self-start sm:self-auto shrink-0 shadow-xs">
            {stageInfo.badge}
          </span>
        </div>

        {/* Barra de Progreso */}
        <div>
          <div className="flex justify-between text-xs sm:text-sm font-semibold text-slate-500 mb-2">
            <span>Progreso del Protocolo de Servicio</span>
            <span className="text-[#D05E28] font-black">{stageInfo.progress}%</span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#D05E28] to-[#E67E22] rounded-full transition-all duration-700 ease-out shadow-xs"
              style={{ width: `${stageInfo.progress}%` }}
            />
          </div>
        </div>

        {/* 6 Fases Gráficas del Proceso */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {[
            { label: '1. Recepción', done: order.currentStep >= 2, current: order.currentStep <= 2 },
            { label: '2. Diagnóstico', done: order.currentStep >= 5, current: order.currentStep > 2 && order.currentStep <= 5 },
            { label: '3. Autorización', done: order.clientAuthorized, current: !order.clientAuthorized && order.currentStep >= 5 && order.currentStep <= 7 },
            { label: '4. En Taller', done: order.currentStep >= 11, current: order.currentStep > 7 && order.currentStep <= 11 },
            { label: '5. Pruebas', done: order.currentStep >= 13, current: order.currentStep > 11 && order.currentStep <= 13 },
            { label: '6. Entrega', done: order.delivered, current: order.currentStep > 13 },
          ].map((f, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border text-center transition ${
                f.current
                  ? 'border-[#D05E28] bg-[#D05E28]/10 text-[#D05E28] font-bold shadow-xs ring-2 ring-[#D05E28]/20'
                  : f.done
                  ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800 font-semibold'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="text-xs font-black">{f.label}</div>
              <div className="text-[10px] mt-0.5 font-bold">
                {f.done ? '✓ Listo' : f.current ? '● En Proceso' : 'Pendiente'}
              </div>
            </div>
          ))}
        </div>

        {/* Datos clave: Asesor y Soporte */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 text-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-600">
              <Wrench className="w-5 h-5 text-[#D05E28]" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Técnico Asignado en Taller</span>
              <strong className="text-base text-[#1A253B]">
                {order.assignedMechanicName || 'Jefe de Taller Certificado'}
              </strong>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shrink-0"
              title="Copiar link de seguimiento para guardar o compartir"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? '¡Link Copiado!' : 'Copiar mi Link'}</span>
            </button>

            <button
              type="button"
              onClick={handleContactAdvisor}
              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar Asesor (WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprobante de Autorización y Firma Digital si ya fue autorizada */}
      {order.clientAuthorized && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-50/70 border border-emerald-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-base sm:text-lg text-emerald-950">
                Orden de Servicio Autorizada y Firmada Digitalmente
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              Servicio autorizado por <strong>{order.clientAuthSignerName || order.customer.name}</strong> el {order.clientAuthTimestamp}. Garantía de 6 meses o 10,000 km en refacciones y mano de obra.
            </p>
          </div>

          {order.clientAuthSignatureUrl && (
            <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-xs text-center shrink-0 self-start md:self-auto">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                Firma Electrónica Registrada
              </span>
              <img
                src={order.clientAuthSignatureUrl}
                alt="Firma del Cliente"
                className="h-14 max-w-[180px] object-contain mx-auto"
              />
            </div>
          )}
        </div>
      )}

      {/* Navegación por Pestañas del Cliente (Sincronizada con la barra inferior) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => handleTabChange('status')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-base font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'status'
              ? 'bg-[#1A253B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          Resumen y Falla
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('quote')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-base font-bold transition cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quote'
              ? 'bg-[#D05E28] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <span>Presupuesto y Piezas</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'quote'
                ? 'bg-white text-[#D05E28]'
                : 'bg-[#D05E28]/10 text-[#D05E28]'
            }`}
          >
            {approvedParts.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('evidence')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-base font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'bg-[#1A253B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          Fotos de Recepción ({order.aestheticPhotos.length})
        </button>
      </div>

      {/* Pestaña 1: Resumen General */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Banner de Firma Pendiente si no ha firmado */}
          {!order.clientAuthorized && parts.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-[#D05E28] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-amber-950">
                    Tu auto requiere autorización formal de refacciones
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900 mt-0.5">
                    Se detectaron refacciones urgentes durante la inspección técnica. Puedes firmar digitalmente desde tu pantalla para iniciar el trabajo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm font-bold shadow-md transition cursor-pointer shrink-0 flex items-center gap-2 transform active:scale-98"
              >
                <PenTool className="w-4 h-4" />
                <span>Firmar y Autorizar en Línea</span>
              </button>
            </div>
          )}

          {/* Comparador Rápido: Falla Documentada vs Instalada */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-[#1A253B] flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#D05E28]" />
                <span>Evidencias Visuales de tu Vehículo en Taller</span>
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                Transparencia total sin sorpresas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {parts.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-[#1A253B]">{p.name}</h4>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                      {p.urgency}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">{p.description}</p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-red-700 block">Pieza Dañada:</span>
                      <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
                        <img src={p.damagedPhotoUrl} alt="Dañada" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-700 block">Nueva Instalada:</span>
                      <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                        {p.installedPhotoUrl ? (
                          <img src={p.installedPhotoUrl} alt="Nueva" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-400 text-center p-2">En proceso de montaje en taller</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 2: Cotización y Autorización Interactiva por el Cliente */}
      {activeTab === 'quote' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xl text-[#1A253B]">Presupuesto Detallado y Desglose</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Refacciones originales o de equipo original garantizadas por escrito.
                </p>
              </div>

              {!order.clientAuthorized ? (
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-extrabold shadow-md transition cursor-pointer flex items-center gap-2 transform active:scale-98"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Firmar y Autorizar Servicio</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Autorizado formalmente el {order.clientAuthTimestamp}</span>
                </div>
              )}
            </div>

            <div className="divide-y divide-slate-200">
              {parts.map((part) => (
                <div key={part.id} className="py-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={part.approved}
                        onChange={() => handleTogglePartApproval(part.id)}
                        className="w-5 h-5 mt-1 accent-[#D05E28] cursor-pointer"
                      />
                      <div>
                        <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">{part.name}</h4>
                        <p className="text-xs sm:text-sm text-slate-500">{part.description}</p>
                      </div>
                    </div>

                    <strong className="text-lg font-black text-[#1A253B] self-end sm:self-center">
                      ${(part.cost + part.laborCost).toLocaleString('es-MX')} MXN
                    </strong>
                  </div>

                  {/* Comparativa Gráfica para el cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-red-50/50 rounded-2xl border border-red-200 flex items-center gap-3">
                      <img src={part.damagedPhotoUrl} alt="Dañada" className="w-20 h-20 object-cover rounded-xl shrink-0" />
                      <div className="text-xs text-red-900">
                        <strong className="block text-sm">Evidencia de Falla</strong>
                        <span>Foto capturada en taller de inspección.</span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex items-center gap-3">
                      {part.installedPhotoUrl ? (
                        <>
                          <img src={part.installedPhotoUrl} alt="Instalada" className="w-20 h-20 object-cover rounded-xl shrink-0" />
                          <div className="text-xs text-emerald-900">
                            <strong className="block text-sm">Pieza Nueva Montada</strong>
                            <span>Verificada por el jefe de taller.</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500 p-2">
                          <strong className="block text-sm text-slate-700">Pendiente de Montar</strong>
                          <span>El mecánico subirá la foto al instalar la refacción nueva.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Inversión */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-slate-500">
                <span>Subtotal: ${subtotal.toLocaleString('es-MX')} • IVA: ${iva.toLocaleString('es-MX')}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                  Inversión Total Autorizada
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#D05E28]">
                  ${total.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 3: Fotos de Entrada */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-xl text-[#1A253B]">Inspección Estética Perimetral de Recepción</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fotografías tomadas por el asesor al momento en que entregaste tu vehículo en el taller.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            {order.aestheticPhotos.map((photo, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                <div className="h-44 bg-slate-100">
                  <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 bg-white">
                  <span className="text-xs sm:text-sm font-bold text-[#1A253B] block">{photo.label}</span>
                  <span className="text-[11px] text-slate-400">{photo.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Firma Digital y Autorización */}
      <ClientSignatureAuthModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        order={order}
        onConfirmAuthorization={handleConfirmAuthorization}
      />
    </div>
  );
};
