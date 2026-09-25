import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Save,
  MessageCircle,
  ArrowRight,
  Camera,
  Car,
  ShieldAlert,
  Sliders,
  Plus,
  Trash2,
  Sparkles,
  ClipboardList,
  Check,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { VehicleServiceOrder, TechnicalDiagnosisRecord } from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';

interface M2DiagnosisTechnicalProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

// Presets o plantillas comunes para agilizar el diagnóstico del admin/jefe de taller
const DIAGNOSIS_PRESETS = [
  {
    title: 'Frenos Críticos (Balatas al 5% y Discos Rayados)',
    severity: 'critico' as const,
    systems: ['Sistema de Frenos'],
    summary:
      'Se detecta desgaste crítico en el sistema de frenos delanteros. Las pastillas tocaron metal con metal, generando surcos profundos en ambos rotores. Pérdida notable de agarre y alto riesgo de fallo de frenado.',
    rootCause:
      'Vida útil de material de fricción excedida sin cambio oportuno en el último intervalo de servicio.',
    recommendation:
      'Reemplazo inmediato de juego de balatas cerámicas delanteras, rectificado o cambio de discos de freno y purga completa del líquido DOT 4.',
    dtc: '',
    tests: [
      'Medición de Desgaste con Calibrador (Balata < 1.5mm)',
      'Inspección Visual en Elevador',
      'Prueba Dinámica de Manejo en Ruta',
    ],
  },
  {
    title: 'Suspensión Delantera con Holgura y Ruidos',
    severity: 'urgente' as const,
    systems: ['Suspensión y Dirección'],
    summary:
      'Juego excesivo en rótulas y bieletas estabilizadoras delanteras. Amortiguador delantero derecho presenta fuga de aceite hidráulico y pérdida de amortiguación en compresión.',
    rootCause:
      'Fatiga de cauchos y sellos hidráulicos por impacto continuo en irregularidades del asfalto.',
    recommendation:
      'Reemplazar amortiguadores delanteros en par, terminales de dirección y bujes de horquilla, seguido de alineación y balanceo.',
    dtc: '',
    tests: [
      'Inspección Visual en Elevador',
      'Prueba de Carga en Banco de Suspensión',
      'Prueba Dinámica de Manejo en Ruta',
    ],
  },
  {
    title: 'Falla de Encendido / Misfire en Cilindro',
    severity: 'urgente' as const,
    systems: ['Motor y Admisión', 'Sistema Eléctrico y Batería'],
    summary:
      'Testigo Check Engine activo. El motor cascabelea en ralentí y pierde potencia al acelerar. Escáner reporta código P0301 (Falla de combustión en cilindro 1).',
    rootCause:
      'Bujía con electrodo erosionado y bobina de encendido #1 con pérdida de aislamiento de alta tensión.',
    recommendation:
      'Reemplazo del juego de 4 bujías de iridio, sustitución de bobina de ignición cilindro 1 y reprogramación de ralentí.',
    dtc: 'P0301 (Cilindro 1 con falla de encendido detectada)',
    tests: [
      'Escaneo Computarizado OBD-II',
      'Prueba de Compresión de Cilindros',
      'Inspección de Bujías con Lámpara',
    ],
  },
  {
    title: 'Fuga de Refrigerante / Sobrecalentamiento',
    severity: 'critico' as const,
    systems: ['Enfriamiento y Radiador', 'Motor y Admisión'],
    summary:
      'Pérdida continua de líquido refrigerante. Manguera superior de radiador cuarteada con fisura activa por presión térmica. Depósito de expansión por debajo del mínimo.',
    rootCause:
      'Envejecimiento térmico del hule de la manguera y tapón de radiador con válvula de alivio vencida.',
    recommendation:
      'Cambio de manguera superior de radiador, sustitución de tapón de presión y recarga de anticongelante orgánico con purgado de aire.',
    dtc: 'P0128 (Temperatura refrigerante motor por debajo del umbral)',
    tests: [
      'Detección de Fugas con Presurizador de Radiador',
      'Inspección Visual en Elevador',
    ],
  },
  {
    title: 'Batería Descargada y Caída de Tensión',
    severity: 'moderado' as const,
    systems: ['Sistema Eléctrico y Batería'],
    summary:
      'Arranque lento por las mañanas. La batería arroja 11.9V en reposo y cae a 9.2V en marcha. Alternador cargando correctamente a 14.2V.',
    rootCause:
      'Fin de ciclo de vida del acumulador de plomo-ácido (más de 3 años de uso continuo).',
    recommendation:
      'Instalación de batería nueva de 12V con capacidad recomendada por fabricante (CCA 600+) y limpieza de terminales sulfatadas.',
    dtc: '',
    tests: [
      'Prueba de Batería y Alternador con Multímetro / Analizador',
      'Escaneo Computarizado OBD-II',
    ],
  },
  {
    title: 'Afinación Mayor y Servicio Preventivo OK',
    severity: 'leve' as const,
    systems: ['Motor y Admisión'],
    summary:
      'Vehículo ingresa para afinación de rutina. Sin códigos de falla en memoria de la ECU. Desgaste normal programado en filtros y fluidos.',
    rootCause: 'Intervalo de servicio regular alcanzado por kilometraje.',
    recommendation:
      'Realizar afinación mayor completa: cambio de aceite sintético, filtro de aceite, filtro de aire, filtro de cabina y lavado de inyectores.',
    dtc: 'Sin códigos DTC registrados en ECU',
    tests: [
      'Escaneo Computarizado OBD-II',
      'Inspección Visual en Elevador',
    ],
  },
];

const AVAILABLE_SYSTEMS = [
  'Sistema de Frenos',
  'Suspensión y Dirección',
  'Motor y Admisión',
  'Transmisión y Embrague',
  'Sistema Eléctrico y Batería',
  'Enfriamiento y Radiador',
  'Escape y Emisiones',
  'Neumáticos y Rines',
  'Aire Acondicionado',
];

const AVAILABLE_TESTS = [
  'Escaneo Computarizado OBD-II',
  'Prueba de Compresión de Cilindros',
  'Prueba de Batería y Alternador con Multímetro',
  'Medición de Desgaste con Calibrador (Vernier)',
  'Inspección Visual en Elevador Hidráulico',
  'Prueba Dinámica de Manejo en Ruta',
  'Detección de Fugas con Presurizador',
  'Prueba de Humo para Vacío y Admisión',
];

export const M2DiagnosisTechnical: React.FC<M2DiagnosisTechnicalProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
  onPrevStep,
}) => {
  // Inicialización de estado con datos de la orden
  const [summary, setSummary] = useState<string>(
    order.technicalDiagnosis?.summary ||
      order.diagnosisSummary ||
      'Se detecta desgaste crítico en sistema de frenos delanteros. Las pastillas tocaron metal con metal, dañando irreversiblemente los discos. Urge reemplazo de balatas y rotores.'
  );

  const [severity, setSeverity] = useState<TechnicalDiagnosisRecord['severity']>(
    order.technicalDiagnosis?.severity || 'critico'
  );

  const [affectedSystems, setAffectedSystems] = useState<string[]>(
    order.technicalDiagnosis?.affectedSystems || ['Sistema de Frenos']
  );

  const [dtcCodes, setDtcCodes] = useState<string>(
    order.technicalDiagnosis?.dtcCodes || ''
  );

  const [testsPerformed, setTestsPerformed] = useState<string[]>(
    order.technicalDiagnosis?.testsPerformed || [
      'Inspección Visual en Elevador Hidráulico',
      'Medición de Desgaste con Calibrador (Vernier)',
    ]
  );

  const [rootCause, setRootCause] = useState<string>(
    order.technicalDiagnosis?.rootCause ||
      'Fricción metal con metal por agotamiento de pastillas de freno.'
  );

  const [recommendations, setRecommendations] = useState<string>(
    order.technicalDiagnosis?.recommendations ||
      'Reemplazo de balatas y rectificado de discos delanteros para garantizar seguridad.'
  );

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activePhotoModal, setActivePhotoModal] = useState<boolean>(false);
  const [customTestInput, setCustomTestInput] = useState<string>('');

  // Manejador para guardar diagnóstico manual
  const handleSaveDiagnosis = () => {
    const diagnosisRecord: TechnicalDiagnosisRecord = {
      summary: summary.trim(),
      severity,
      affectedSystems,
      dtcCodes: dtcCodes.trim(),
      testsPerformed,
      rootCause: rootCause.trim(),
      recommendations: recommendations.trim(),
      diagnosedBy: 'Administrador / Jefe de Taller',
      diagnosedAt: new Date().toISOString(),
    };

    onUpdateOrder({
      ...order,
      diagnosisSummary: summary.trim(),
      technicalDiagnosis: diagnosisRecord,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Alternar sistema mecánico afectado
  const handleToggleSystem = (system: string) => {
    if (affectedSystems.includes(system)) {
      setAffectedSystems(affectedSystems.filter((s) => s !== system));
    } else {
      setAffectedSystems([...affectedSystems, system]);
    }
  };

  // Alternar prueba técnica realizada
  const handleToggleTest = (test: string) => {
    if (testsPerformed.includes(test)) {
      setTestsPerformed(testsPerformed.filter((t) => t !== test));
    } else {
      setTestsPerformed([...testsPerformed, test]);
    }
  };

  const handleAddCustomTest = () => {
    if (customTestInput.trim() && !testsPerformed.includes(customTestInput.trim())) {
      setTestsPerformed([...testsPerformed, customTestInput.trim()]);
      setCustomTestInput('');
    }
  };

  // Cargar una plantilla rápida para editarla
  const handleApplyPreset = (preset: (typeof DIAGNOSIS_PRESETS)[0]) => {
    setSummary(preset.summary);
    setSeverity(preset.severity);
    setAffectedSystems(preset.systems);
    setRootCause(preset.rootCause);
    setRecommendations(preset.recommendation);
    setDtcCodes(preset.dtc);
    setTestsPerformed(preset.tests);
  };

  // Limpiar campos para escribir desde cero
  const handleClearForm = () => {
    setSummary('');
    setSeverity('leve');
    setAffectedSystems([]);
    setDtcCodes('');
    setTestsPerformed([]);
    setRootCause('');
    setRecommendations('');
  };

  // Enviar diagnóstico técnico por WhatsApp al cliente
  const handleSendWhatsApp = () => {
    handleSaveDiagnosis();

    const severityText =
      severity === 'critico'
        ? '🔴 CRÍTICO / URGENTE'
        : severity === 'urgente'
        ? '🟠 ALTA PRIORIDAD'
        : severity === 'moderado'
        ? '🟡 ATENCIÓN PRÓXIMA'
        : '🟢 MANTENIMIENTO PREVENTIVO';

    const message =
      `*DICTAMEN TÉCNICO Y DIAGNÓSTICO DEL TALLER*\n` +
      `*Orden:* #${order.orderNumber}\n` +
      `*Vehículo:* ${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.plate})\n` +
      `*Nivel de Severidad:* ${severityText}\n` +
      `*Sistemas Afectados:* ${affectedSystems.join(', ') || 'Revisión general'}\n\n` +
      `*DIAGNÓSTICO DEL JEFE DE TALLER:*\n"${summary}"\n\n` +
      (rootCause ? `*Causa Raíz:* ${rootCause}\n\n` : '') +
      (recommendations ? `*Recomendación:* ${recommendations}\n\n` : '') +
      (dtcCodes ? `*Códigos OBD-II Escaneados:* ${dtcCodes}\n\n` : '') +
      `Estamos preparando tu cotización formal de refacciones y mano de obra. ¡Cualquier duda estamos a tus órdenes!`;

    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Agregar una foto de evidencia al diagnóstico
  const handleAddDiagnosisPhoto = (dataUrl: string) => {
    const newPart = {
      id: `part-${Date.now()}`,
      name: 'Evidencia Fotográfica de Diagnóstico',
      description: summary.slice(0, 50) || 'Componente inspeccionado en diagnóstico',
      damagedPhotoUrl: dataUrl,
      cost: 0,
      laborCost: 0,
      urgency: severity === 'critico' ? ('urgente' as const) : ('preventivo' as const),
      approved: false,
    };

    onUpdateOrder({
      ...order,
      parts: [...order.parts, newPart],
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior con Ficha del Vehículo */}
      <div className="bg-gradient-to-r from-[#1A253B] to-[#273756] text-white rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#D05E28] rounded-2xl shadow-md text-white">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                  Paso 5 del Protocolo
                </span>
                <span className="text-xs font-bold text-amber-300">
                  Orden #{order.orderNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                Formulario de Diagnóstico Técnico Manual
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Captura manualmente el dictamen oficial del taller, severidad, pruebas y códigos de falla antes de cotizar.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 sm:p-4 border border-white/10 flex items-center gap-4 text-xs">
            <div>
              <div className="text-slate-300">Vehículo:</div>
              <div className="font-bold text-sm text-white">
                {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-slate-300">Placas:</div>
              <div className="font-bold text-sm text-white">{order.vehicle.plate}</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <div className="text-slate-300">Km:</div>
              <div className="font-bold text-sm text-white">{order.vehicle.mileage.toLocaleString()} km</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Plantillas Rápidas del Taller */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D05E28]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1A253B]">
              Atajos de Diagnósticos Comunes (Plantillas Rápidas)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClearForm}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar Formulario (En Blanco)</span>
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Haz clic en cualquier plantilla para autollenar una propuesta y edita o escribe cualquier detalle con total libertad:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {DIAGNOSIS_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-[#D05E28]/40 transition text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-[#1A253B] group-hover:text-[#D05E28] transition">
                  {preset.title}
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    preset.severity === 'critico'
                      ? 'bg-rose-100 text-rose-800'
                      : preset.severity === 'urgente'
                      ? 'bg-amber-100 text-amber-800'
                      : preset.severity === 'moderado'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {preset.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {preset.summary}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* FORMULARIO MANUAL PRINCIPAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        {/* 1. Nivel de Severidad y Riesgo */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider">
              1. Nivel de Severidad y Urgencia del Diagnóstico
            </label>
            <span className="text-xs text-slate-400">Determina el impacto en la seguridad</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                id: 'leve' as const,
                label: 'Leve / Preventivo',
                desc: 'Servicio de rutina o desgaste natural',
                color: 'emerald',
                border: 'border-emerald-500 bg-emerald-50 text-emerald-900',
              },
              {
                id: 'moderado' as const,
                label: 'Moderado',
                desc: 'Atender en próximos 30 días',
                color: 'amber',
                border: 'border-amber-500 bg-amber-50 text-amber-900',
              },
              {
                id: 'urgente' as const,
                label: 'Urgente',
                desc: 'Afecta otros componentes mecánicos',
                color: 'orange',
                border: 'border-orange-500 bg-orange-50 text-orange-900',
              },
              {
                id: 'critico' as const,
                label: 'Crítico / Peligro',
                desc: 'Riesgo grave. Auto NO seguro para circular',
                color: 'rose',
                border: 'border-rose-500 bg-rose-50 text-rose-900',
              },
            ].map((lvl) => {
              const isSelected = severity === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSeverity(lvl.id)}
                  className={`p-3.5 rounded-2xl border-2 transition text-left cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${lvl.border} shadow-sm font-bold`
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-black">{lvl.label}</span>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-current bg-current' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] opacity-80">{lvl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Dictamen Técnico Escrito Manualmente */}
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider">
              2. Dictamen Técnico Oficial del Administrador / Jefe de Taller <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs font-semibold text-slate-400">
              {summary.length} caracteres
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Escribe detalladamente las anomalías detectadas, desgastes visibles, ruidos mecánicos y el estado general de las piezas:
          </p>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Escribe aquí el dictamen técnico manual. Ej: Se identifica holgura crítica en terminales de dirección delanteras..."
            className="w-full p-4 rounded-2xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#D05E28] focus:outline-none leading-relaxed"
          />
        </div>

        {/* 3. Sistemas Mecánicos Afectados */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider">
            3. Sistemas Mecánicos Afectados (Toca para seleccionar)
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SYSTEMS.map((sys) => {
              const isMarked = affectedSystems.includes(sys);
              return (
                <button
                  key={sys}
                  type="button"
                  onClick={() => handleToggleSystem(sys)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    isMarked
                      ? 'bg-[#1A253B] text-white border-[#1A253B] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {isMarked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{sys}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Códigos de Falla OBD-II (DTC) y Escaneo Electrónico */}
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>4. Códigos de Falla Escaneados OBD-II (DTC)</span>
            </label>
            <span className="text-xs text-slate-400">Opcional si se conectó scanner</span>
          </div>
          <input
            type="text"
            value={dtcCodes}
            onChange={(e) => setDtcCodes(e.target.value)}
            placeholder="Ej: P0300 (Falla de encendido aleatoria), P0420 (Eficiencia catalizador baja), C0035..."
            className="w-full p-3.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
          />
        </div>

        {/* 5. Pruebas y Mediciones Técnicas Realizadas */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider">
            5. Pruebas y Mediciones Realizadas en el Taller
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_TESTS.map((test) => {
              const isChecked = testsPerformed.includes(test);
              return (
                <button
                  key={test}
                  type="button"
                  onClick={() => handleToggleTest(test)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition text-left cursor-pointer flex items-center gap-2.5 ${
                    isChecked
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{test}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customTestInput}
              onChange={(e) => setCustomTestInput(e.target.value)}
              placeholder="Agregar otra prueba personalizada..."
              className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomTest();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomTest}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
            >
              Agregar Prueba
            </button>
          </div>
        </div>

        {/* 6. Causa Raíz y Recomendación de Reparación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A253B] uppercase tracking-wider">
              6. Causa Raíz Diagnosticada
            </label>
            <textarea
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="¿Qué originó el problema? Ej: Desgaste excesivo de balatas sin cambio a tiempo..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A253B] uppercase tracking-wider">
              7. Recomendación Técnica del Taller
            </label>
            <textarea
              rows={3}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Solución técnica. Ej: Reemplazo inmediato de pastillas y rectificado de discos..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>
        </div>

        {/* 8. Evidencias Fotográficas del Diagnóstico */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-bold text-[#1A253B] uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D05E28]" />
                <span>8. Evidencias Fotográficas de Piezas Dañadas</span>
              </label>
              <p className="text-xs text-slate-500">
                Fotografías de las piezas o fallas encontradas para sustentar la cotización al cliente.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActivePhotoModal(true)}
              className="px-4 py-2 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#D05E28]" />
              <span>Tomar / Subir Foto de Evidencia</span>
            </button>
          </div>

          {order.parts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-2">
              <Camera className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-sm font-semibold text-slate-700">
                Aún no hay fotos de evidencia agregadas
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Toma fotos de balatas gastadas, fugas de aceite o amortiguadores dañados para compartirlas con el cliente.
              </p>
              <button
                type="button"
                onClick={() => setActivePhotoModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#D05E28] text-white text-xs font-bold hover:bg-[#b84e1e] cursor-pointer"
              >
                Agregar Primera Evidencia
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {order.parts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.damagedPhotoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.urgency === 'urgente'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {p.urgency}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="font-bold text-sm text-[#1A253B] truncate">{p.name}</div>
                    <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Barra de Acciones y Guardado */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onPrevStep && (
              <button
                type="button"
                onClick={onPrevStep}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 cursor-pointer transition"
              >
                Volver
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDiagnosis}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-black text-white'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>¡Diagnóstico Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#D05E28]" />
                  <span>Guardar Dictamen Manual</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition"
              title="Compartir diagnóstico con el cliente por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp Cliente</span>
            </button>
          </div>

          {onNextStep && (
            <button
              type="button"
              onClick={() => {
                handleSaveDiagnosis();
                onNextStep();
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm cursor-pointer transition transform active:scale-98"
            >
              <span>Avanzar a Cotización (Paso 6)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modal de Fotografía de Evidencia */}
      <CameraCaptureModal
        isOpen={activePhotoModal}
        onClose={() => setActivePhotoModal(false)}
        onCapture={handleAddDiagnosisPhoto}
        title="Fotografía de Evidencia de Falla Mecánica"
      />
    </div>
  );
};
