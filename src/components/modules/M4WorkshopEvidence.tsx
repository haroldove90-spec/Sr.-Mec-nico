import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Camera,
  CheckCircle,
  AlertCircle,
  Car,
  Wrench,
  Sparkles,
  Save,
} from 'lucide-react';
import { VehicleServiceOrder, TestDriveRecord } from '../../types';

interface M4WorkshopEvidenceProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M4WorkshopEvidence: React.FC<M4WorkshopEvidenceProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(order.timeSpentMinutes * 60);
  const [isRunning, setIsRunning] = useState(order.isTimerRunning);

  // Initial & final test drive state
  const [initialDrive, setInitialDrive] = useState<TestDriveRecord>(order.initialTestDrive);
  const [finalDrive, setFinalDrive] = useState<TestDriveRecord>(order.finalTestDrive);
  const [correctionsText, setCorrectionsText] = useState(order.correctionsNotes || '');

  // Live timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleToggleTimer = () => {
    const newRunning = !isRunning;
    setIsRunning(newRunning);
    onUpdateOrder({
      ...order,
      isTimerRunning: newRunning,
      timeSpentMinutes: Math.floor(timerSeconds / 60),
    });
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(0);
    onUpdateOrder({
      ...order,
      isTimerRunning: false,
      timeSpentMinutes: 0,
    });
  };

  const handleSaveTimer = () => {
    onUpdateOrder({
      ...order,
      isTimerRunning: isRunning,
      timeSpentMinutes: Math.floor(timerSeconds / 60),
    });
  };

  const handleAttachInstalledPhoto = (partId: string) => {
    const sampleNewPartPhotos = [
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    ];
    const chosen = sampleNewPartPhotos[Math.floor(Math.random() * sampleNewPartPhotos.length)];

    const updatedParts = (order.parts || []).map((p) => {
      if (p.id === partId) {
        return {
          ...p,
          installedPhotoUrl: chosen,
          installedBy: order.assignedMechanicName || 'Técnico en Bahía 1',
          installedTimestamp: new Date().toLocaleString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
          }),
        };
      }
      return p;
    });

    onUpdateOrder({
      ...order,
      parts: updatedParts,
    });
  };

  const handleSaveDrives = () => {
    onUpdateOrder({
      ...order,
      initialTestDrive: initialDrive,
      finalTestDrive: finalDrive,
      correctionsNotes: correctionsText,
      correctionsCompleted: true,
      timeSpentMinutes: Math.floor(timerSeconds / 60),
    });
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M4
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Taller, Evidencia y Productividad
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pruebas de manejo, activación de cronómetro en tiempo real y captura de foto de refacciones nuevas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleSaveDrives}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs font-semibold cursor-pointer transition"
          >
            <Save className="w-4 h-4 text-[#D05E28]" />
            <span>Guardar Avance</span>
          </button>
          {onNextStep && (
            <button
              onClick={() => {
                handleSaveDrives();
                onNextStep();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Avanzar a Prueba Final</span>
            </button>
          )}
        </div>
      </div>

      {/* Cronómetro del Sistema en Vivo */}
      <div className="bg-gradient-to-br from-[#1A253B] to-[#273756] rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#D05E28] text-white shadow-lg">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Control de Productividad por Vehículo
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold">
                Cronómetro de Trabajo Activo
              </h2>
              <p className="text-xs text-slate-300">
                Técnico asignado: <strong className="text-white">{order.assignedMechanicName || 'No asignado'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 self-center sm:self-auto">
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-amber-300 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/10 shadow-inner">
              {formatTime(timerSeconds)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTimer}
                className={`p-3 rounded-xl font-bold text-white shadow-md transition cursor-pointer ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                title={isRunning ? 'Pausar Reloj' : 'Iniciar Reloj'}
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                onClick={handleResetTimer}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                title="Reiniciar cronómetro"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Captura Obligatoria de Pieza Nueva Instalada */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-sm sm:text-base text-[#1A253B]">
              Captura Obligatoria de Foto: Pieza Nueva Instalada (Paso 9)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Comprobante anti-robo y transparencia hacia el cliente
          </span>
        </div>

        <p className="text-xs text-slate-500">
          El técnico debe subir la evidencia fotográfica de cada refacción montada y ajustada en el coche antes de cerrar la bahía.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(order.parts || []).map((part) => (
            <div
              key={part.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1A253B]">{part.name}</h4>
                  <span className="text-xs text-slate-500 block">Proveedor: {part.supplier || 'AutoZone'}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    part.installedPhotoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {part.installedPhotoUrl ? '✓ Foto Cargada' : 'Pendiente'}
                </span>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-white border border-slate-200 relative flex items-center justify-center">
                {part.installedPhotoUrl ? (
                  <>
                    <img
                      src={part.installedPhotoUrl}
                      alt="Instalada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Montada con éxito
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Camera className="w-8 h-8 mx-auto mb-1 opacity-40 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-500 block">
                      Sin evidencia de montaje
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Presiona el botón para registrar la foto del componente nuevo
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAttachInstalledPhoto(part.id)}
                className="w-full py-2 px-3 rounded-lg bg-[#1A253B] hover:bg-[#273756] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Camera className="w-3.5 h-3.5 text-[#D05E28]" />
                <span>{part.installedPhotoUrl ? 'Tomar Otra Foto' : 'Capturar Foto de Pieza Montada'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pruebas de Manejo: Inicial (Paso 3) y Final (Paso 10) + Correcciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paso 3: Prueba Inicial */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-[#D05E28]" />
              <h3 className="font-bold text-sm text-[#1A253B]">
                Paso 3: Prueba de Manejo Inicial
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Pre-Reparación</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialDrive.vibrations}
                  onChange={(e) => setInitialDrive({ ...initialDrive, vibrations: e.target.checked })}
                  className="accent-[#D05E28]"
                />
                <span className="font-semibold text-slate-700">Presenta Vibraciones</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialDrive.noises}
                  onChange={(e) => setInitialDrive({ ...initialDrive, noises: e.target.checked })}
                  className="accent-[#D05E28]"
                />
                <span className="font-semibold text-slate-700">Ruidos Extraños</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Observaciones Dinámicas</label>
              <textarea
                value={initialDrive.notes}
                onChange={(e) => setInitialDrive({ ...initialDrive, notes: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Paso 10: Prueba Final y Paso 11: Corrección */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D05E28]" />
              <h3 className="font-bold text-sm text-[#1A253B]">
                Paso 10: Prueba de Manejo Final y Corrección
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-bold">Validación Dinámica</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalDrive.brakingGood}
                  onChange={(e) => setFinalDrive({ ...finalDrive, brakingGood: e.target.checked })}
                  className="accent-emerald-600"
                />
                <span className="font-semibold text-emerald-800">Frenado Firme y Parejo</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalDrive.steeringAlignment}
                  onChange={(e) => setFinalDrive({ ...finalDrive, steeringAlignment: e.target.checked })}
                  className="accent-emerald-600"
                />
                <span className="font-semibold text-emerald-800">Alineación y Sin Ruidos</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">
                Paso 11: Ajustes o Correcciones Finales
              </label>
              <textarea
                value={correctionsText}
                onChange={(e) => setCorrectionsText(e.target.value)}
                placeholder="Ajustes de torque, purgado complementario, etc..."
                rows={2}
                className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
