import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Wrench,
  ShieldCheck,
  Receipt,
  Car,
  TrendingUp,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Workflow,
  Sparkles,
  HelpCircle,
  Clock,
  Camera,
  MessageCircle,
  FileText,
  UserCheck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { RoleId } from '../../types';

interface UserManualModuleProps {
  activeRole: RoleId;
}

export const UserManualModule: React.FC<UserManualModuleProps> = ({ activeRole }) => {
  // En rol admin permite alternar entre su rol y la vista global completa
  const [selectedRoleView, setSelectedRoleView] = useState<RoleId>(activeRole);
  const [viewMode, setViewMode] = useState<'role' | 'global'>(activeRole === 'admin' ? 'global' : 'role');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16 print:p-0 print:m-0">
      {/* Header Institucional del Manual */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1A253B] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 print:bg-none print:text-black print:p-0 print:border-b">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D05E28]/20 text-[#D05E28] border border-[#D05E28]/40 text-xs font-bold uppercase tracking-wider print:hidden">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guía Oficial de Operación • Sr. Mecánico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Manual de Usuario y Operación
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl print:text-slate-600">
            Aprende a dominar el sistema de taller paso a paso. Guía visual, sencilla y sin complicaciones para garantizar transparencia y servicio de primer nivel.
          </p>
        </div>

        {/* Acciones de Impresión y Descarga */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
          {activeRole === 'admin' && (
            <div className="flex bg-white/10 p-1 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => {
                  setViewMode('role');
                  setSelectedRoleView('admin');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'role' ? 'bg-[#D05E28] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Mi Rol
              </button>
              <button
                type="button"
                onClick={() => setViewMode('global')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  viewMode === 'global' ? 'bg-[#D05E28] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Manual Global (Todos)
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[#1A253B] hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            title="Descargar o imprimir manual oficial en PDF"
          >
            <Printer className="w-4 h-4 text-[#D05E28]" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas de Rol (Si está en modo admin global o para consultar otros roles) */}
      {(viewMode === 'global' || activeRole === 'admin') && (
        <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto print:hidden">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 shrink-0">
            Ver Rol:
          </span>
          {[
            { id: 'front_desk' as RoleId, label: 'Asesor de Servicio', icon: ClipboardList },
            { id: 'mechanic' as RoleId, label: 'Jefe de Taller / Mecánico', icon: Wrench },
            { id: 'admin' as RoleId, label: 'Administración y Caja', icon: Receipt },
            { id: 'director' as RoleId, label: 'Director General y CRM', icon: TrendingUp },
            { id: 'client' as RoleId, label: 'Cliente (Propietario)', icon: Car },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedRoleView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedRoleView(tab.id);
                  if (activeRole !== 'admin') setViewMode('role');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#1A253B] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#D05E28]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Vista de Contenido del Manual */}
      {viewMode === 'global' ? (
        <div className="space-y-12">
          <GlobalWorkshopOverview />
          <AdvisorManualSection />
          <MechanicManualSection />
          <AdminManualSection />
          <DirectorManualSection />
          <ClientManualSection />
        </div>
      ) : (
        <div>
          {selectedRoleView === 'front_desk' && <AdvisorManualSection />}
          {selectedRoleView === 'mechanic' && <MechanicManualSection />}
          {selectedRoleView === 'admin' && <AdminManualSection />}
          {selectedRoleView === 'director' && <DirectorManualSection />}
          {selectedRoleView === 'client' && <ClientManualSection />}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
 * 1. RESUMEN GLOBAL DEL FLUJO DEL TALLER (16 PASOS)
 * ========================================================================= */
const GlobalWorkshopOverview: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A253B] flex items-center gap-2.5">
          <Workflow className="w-6 h-6 text-[#D05E28]" />
          <span>El Ciclo Completo de Servicio (Protocolo Institucional)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Cómo se comunican los 4 roles del taller y el cliente de forma sincronizada y en tiempo real.
        </p>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
        100% Trazable
      </span>
    </div>

    {/* Diagrama de los 5 Bloques Clave */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-sm">
          1
        </div>
        <h4 className="font-bold text-sm text-[#1A253B]">Recepción & Fotos</h4>
        <p className="text-[11px] text-slate-600">
          El asesor registra inventario, nivel de gasolina y fotos perimetrales.
        </p>
        <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-md">
          Rol: Asesor
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm">
          2
        </div>
        <h4 className="font-bold text-sm text-[#1A253B]">55 Puntos & Fallas</h4>
        <p className="text-[11px] text-slate-600">
          Mecánico inspecciona, escanea la ECU y toma foto de cada pieza rota.
        </p>
        <span className="inline-block text-[10px] font-bold text-blue-900 bg-blue-200/60 px-2 py-0.5 rounded-md">
          Rol: Mecánico
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-[#D05E28] text-white font-black flex items-center justify-center text-sm">
          3
        </div>
        <h4 className="font-bold text-sm text-[#1A253B]">Firma del Cliente</h4>
        <p className="text-[11px] text-slate-600">
          El cliente ve las fotos desde su celular y firma para autorizar refacciones.
        </p>
        <span className="inline-block text-[10px] font-bold text-[#D05E28] bg-orange-200/60 px-2 py-0.5 rounded-md">
          Rol: Cliente
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-sm">
          4
        </div>
        <h4 className="font-bold text-sm text-[#1A253B]">Almacén & Taller</h4>
        <p className="text-[11px] text-slate-600">
          Admin coteja facturas anti-robo; mecánico monta y sube foto de pieza nueva.
        </p>
        <span className="inline-block text-[10px] font-bold text-purple-900 bg-purple-200/60 px-2 py-0.5 rounded-md">
          Rol: Admin + Taller
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm">
          5
        </div>
        <h4 className="font-bold text-sm text-[#1A253B]">Caja, Entrega & CRM</h4>
        <p className="text-[11px] text-slate-600">
          Factura CFDI, entrega de piezas viejas en caja y seguimiento por WhatsApp.
        </p>
        <span className="inline-block text-[10px] font-bold text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded-md">
          Rol: Caja + Asesor
        </span>
      </div>
    </div>
  </div>
);

/* =========================================================================
 * 2. MANUAL DEL ASESOR DE SERVICIO (RECEPCIÓN Y FRONT-DESK)
 * ========================================================================= */
const AdvisorManualSection: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2.5 rounded-2xl bg-amber-50 text-[#D05E28]">
        <ClipboardList className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
          Manual del Asesor de Servicio (Recepción y Front-Desk)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          El primer y último contacto del cliente. Responsable de la recepción transparente y la entrega impecable.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Paso 1: Ingreso de Auto */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#D05E28]">
          <span className="w-6 h-6 rounded-full bg-[#D05E28] text-white flex items-center justify-center text-xs">1</span>
          <span>Registrar un Automóvil Nuevo</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Haz clic en <strong>"+ Registrar Nuevo Auto"</strong> en la parte superior.
          </li>
          <li>
            Llena los datos del cliente (nombre, teléfono y WhatsApp para alertas).
          </li>
          <li>
            Registra placas, kilometraje actual y marca el nivel exacto de gasolina (1/4, 1/2, 3/4 o lleno).
          </li>
          <li>
            <strong>Al guardar:</strong> El sistema emite un <em>Beep sonoro</em> y notifica automáticamente al Jefe de Taller, a Administración y al Cliente.
          </li>
        </ul>
      </div>

      {/* Paso 2: Inventario y Fotos */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#D05E28]">
          <span className="w-6 h-6 rounded-full bg-[#D05E28] text-white flex items-center justify-center text-xs">2</span>
          <span>Fotos Perimetrales de Protección</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Toma fotos de los 4 costados (Frente, Trasera, Izquierdo, Derecho) y Tablero con odómetro.
          </li>
          <li>
            Marca cualquier rayón, golpe o faltante previo en el diagrama de carrocería.
          </li>
          <li>
            Esto protege al taller de reclamos injustificados y le da seguridad al cliente.
          </li>
        </ul>
      </div>

      {/* Paso 3: Monitoreo y Fallas del Mecánico */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#D05E28]">
          <span className="w-6 h-6 rounded-full bg-[#D05E28] text-white flex items-center justify-center text-xs">3</span>
          <span>Atención a Fallas Imprevistas</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Si el mecánico detecta una falla adicional en bahía, sonará la campana con un <em>Beep</em>.
          </li>
          <li>
            Revisa la foto enviada por el mecánico en el expediente del auto.
          </li>
          <li>
            Comunícate con el cliente o avísale que ya tiene la cotización en su portal para firmar en línea.
          </li>
        </ul>
      </div>

      {/* Paso 4: Entrega y Retorno de Piezas Usadas */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[#D05E28]">
          <span className="w-6 h-6 rounded-full bg-[#D05E28] text-white flex items-center justify-center text-xs">4</span>
          <span>Entrega de Auto y Retorno de Piezas (Paso 15)</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Verifica que Administración haya cobrado y liberado la orden.
          </li>
          <li>
            Realiza el recorrido 360 walk-around junto al cliente.
          </li>
          <li>
            <strong>Regla de Oro:</strong> Entrega físicamente en una caja las refacciones viejas cambiadas.
          </li>
          <li>
            Pide al cliente su firma digital de satisfacción para concluir la orden.
          </li>
        </ul>
      </div>
    </div>
  </div>
);

/* =========================================================================
 * 3. MANUAL DEL JEFE DE TALLER Y MECÁNICO
 * ========================================================================= */
const MechanicManualSection: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
        <Wrench className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
          Manual del Jefe de Taller y Mecánico (Área Técnica)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Diagnóstico riguroso, pruebas de manejo, reloj de bahía y captura obligatoria de piezas nuevas.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 55 Puntos */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
          <span>Inspección de 55 Puntos de Seguridad</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">
          Ingresa al módulo <strong>"55 Puntos"</strong>. Revisa frenos, suspensión, fugas, batería, niveles y escaneo OBD-II. Marca cada punto como <em>Aprobado</em>, <em>Atención</em> o <em>Urgente</em>.
        </p>
        <p className="text-xs text-slate-500">
          Al guardar, el cliente recibe una notificación de que su vehículo está siendo evaluado técnicamente.
        </p>
      </div>

      {/* Reloj y Cronómetro */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
          <span>Cronómetro de Trabajo en Bahía</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">
          En el módulo <strong>"Taller, Evidencias y Cronómetro"</strong>, dale <em>"Iniciar Reloj"</em> al comenzar la mano de obra.
        </p>
        <p className="text-xs text-slate-500">
          Esto registra los minutos reales de trabajo para medir productividad y eficiencia del equipo mecánico.
        </p>
      </div>

      {/* Reportar Falla Imprevista */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
          <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">3</span>
          <span>¿Detectaste una Falla Nueva en Bahía?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">
          Haz clic en <strong>"Reportar Falla Nueva con Foto"</strong>.
        </p>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-1 list-disc pl-4">
          <li>Describe la falla (ej. amortiguador chorreado o balata en el fierro).</li>
          <li>Adjunta la fotografía nítida tomada con el celular o tablet.</li>
          <li>Presiona <em>"Enviar y Notificar"</em>. El asesor y el cliente recibirán el aviso con sonido Beep para cotizar y firmar en línea.</li>
        </ul>
      </div>

      {/* Foto de Pieza Nueva y Fin */}
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
          <span>Montaje Nuevo y Finalizar Auto</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">
          <strong>Requisito Indispensable:</strong> Presiona <em>"Subir Foto de Refacción Nueva Instalada"</em> en la pieza correspondiente antes de cerrar el capó.
        </p>
        <p className="text-xs sm:text-sm text-slate-700">
          Al terminar la prueba final, presiona <strong>"Finalizar Auto y Notificar Listo"</strong>. Se avisará a Administración para cobrar y a Asesor para entregar.
        </p>
      </div>
    </div>
  </div>
);

/* =========================================================================
 * 4. MANUAL DE ADMINISTRACIÓN Y CAJA (COMPRAS, FACTURAS Y COBRO)
 * ========================================================================= */
const AdminManualSection: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700">
        <Receipt className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
          Manual de Administración y Caja (Compras y Cobro)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Auditoría anti-robo de refacciones, comprobantes SAT CFDI 4.0 y liquidación en caja.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Compras y Anti-Robo */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-800">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <span>Auditoría de Refacciones y Anti-Robo (Paso 9)</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Accede a <strong>"Compras y Auditoría Anti-Robo"</strong>.
          </li>
          <li>
            Verifica el proveedor, número de factura de refaccionaria y costo de compra contra precio autorizado.
          </li>
          <li>
            Valida que ninguna refacción salga de almacén a la bahía sin estar ligada a una orden autorizada.
          </li>
        </ul>
      </div>

      {/* Facturación y Cobro */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-purple-800">
          <Receipt className="w-5 h-5 text-purple-600" />
          <span>Caja, Cobro y Factura SAT (Paso 14)</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            Cuando el mecánico termina el auto, recibirás una notificación sonora.
          </li>
          <li>
            Entra a <strong>"Caja y Facturación CFDI"</strong>.
          </li>
          <li>
            Revisa el desglose (Mano de obra + Refacciones + IVA).
          </li>
          <li>
            Selecciona método de pago (Tarjeta, Transferencia o Efectivo) y presiona <em>"Cobrar y Emitir Factura CFDI"</em>.
          </li>
          <li>
            Esto desbloquea la orden para que el asesor pueda entregar el auto.
          </li>
        </ul>
      </div>
    </div>
  </div>
);

/* =========================================================================
 * 5. MANUAL DEL DIRECTOR GENERAL Y CRM
 * ========================================================================= */
const DirectorManualSection: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
        <TrendingUp className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
          Manual de Dirección General y CRM (Control y Retención)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Métricas de productividad de mecánicos, tiempos en bahía y seguimiento post-servicio por WhatsApp.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Productividad y Tiempos de Bahía</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700">
          En <strong>"Productividad y Calidad"</strong> consulta el ticket promedio por auto, margen de utilidad por refacción y minutos promedio invertidos por cada técnico.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>CRM Automatizado por WhatsApp</span>
        </div>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc pl-4">
          <li>
            <strong>Alerta de 2 Días:</strong> Mensaje cordial para confirmar que el auto anda perfecto y pedir calificación de servicio.
          </li>
          <li>
            <strong>Alerta de 15 Días / 6 Meses:</strong> Recordatorio preventivo de rotación de llantas, afinación o cambio de balatas pendientes no autorizadas previamente.
          </li>
        </ul>
      </div>
    </div>
  </div>
);

/* =========================================================================
 * 6. MANUAL DEL CLIENTE (PROPIETARIO DEL VEHÍCULO)
 * ========================================================================= */
const ClientManualSection: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
      <div className="p-2.5 rounded-2xl bg-orange-50 text-[#D05E28]">
        <Car className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#1A253B]">
          Guía de Monitoreo para el Cliente (Propietario)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Cómo dar seguimiento a tu automóvil en vivo, revisar evidencias fotográficas y firmar tu presupuesto.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1A253B]">
          <Car className="w-5 h-5 text-[#D05E28]" />
          <span>Pestaña "Mi Auto"</span>
        </div>
        <p className="text-xs text-slate-600">
          Muestra la barra de progreso en vivo: Recepción, Diagnóstico de 55 puntos, En reparación en bahía o Listo para entrega.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1A253B]">
          <Camera className="w-5 h-5 text-[#D05E28]" />
          <span>Pestaña "Fotos"</span>
        </div>
        <p className="text-xs text-slate-600">
          Revisa las fotos perimetrales tomadas al recibir tu auto para constatar su estado estético y kilometraje de entrada.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex items-center gap-2 text-sm font-bold text-[#1A253B]">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Pestaña "Cotización" y Firma</span>
        </div>
        <p className="text-xs text-slate-600">
          Compara la foto de la pieza rota vs la pieza nueva. Dibuja tu firma digital con tu dedo en la pantalla para iniciar el trabajo con total transparencia.
        </p>
      </div>
    </div>
  </div>
);
