import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Camera,
  Car,
  Wrench,
  Sparkles,
  Save,
  ArrowRight,
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

  const [initialDrive, setInitialDrive] = useState<TestDriveRecord>(order.initialTestDrive);
  const [finalDrive, setFinalDrive] = useState<TestDriveRecord>(order.finalTestDrive);
  const [correctionsText, setCorrectionsText] = useState(order.correctionsNotes || '');

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
          installedBy: order.assignedMechanicName || 'Técnico en Taller',
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Taller, Evidencias y Cronómetro
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Pruebas de manejo, reloj de taller y captura obligatoria de la refacción nueva montada.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSaveDrives}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
          >
            <Save className="w-5 h-5 text-[#D05E28]" />
            <span>Guardar Avance</span>
          </button>
          {onNextStep && (
            <button
              onClick={() => {
                handleSaveDrives();
                onNextStep();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Cronómetro Minimalista */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#D05E28]/10 text-[#D05E28]">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1A253B]">
              Cronómetro de Trabajo en Taller
            </h2>
            <p className="text-sm text-slate-500">
              Auto: <strong className="text-[#1A253B]">{order.vehicle.plate}</strong> • Técnico: {order.assignedMechanicName || 'Mecánico asignado'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-center sm:self-auto">
          <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#1A253B] bg-slate-100 px-5 py-2.5 rounded-xl border border-slate-200 tracking-wider">
            {formatTime(timerSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleTimer}
              className={`p-3 rounded-xl font-bold text-white shadow-xs transition cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
              title={isRunning ? 'Pausar' : 'Iniciar'}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Reiniciar"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Captura de Foto: Pieza Nueva Instalada */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#D05E28]" />
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">
              Foto Obligatoria: Pieza Nueva Montada
            </h3>
          </div>
          <span className="text-sm text-slate-500 font-semibold">
            Transparencia y control anti-robo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(order.parts || []).map((part) => (
            <div
              key={part.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base sm:text-lg text-[#1A253B]">{part.name}</h4>
                  <span className="text-sm text-slate-500">Proveedor: {part.supplier || 'AutoZone'}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    part.installedPhotoUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {part.installedPhotoUrl ? '✓ Foto Lista' : 'Pendiente'}
                </span>
              </div>

              <div className="h-52 rounded-xl overflow-hidden bg-white border border-slate-200 relative flex items-center justify-center">
                {part.installedPhotoUrl ? (
                  <img
                    src={part.installedPhotoUrl}
                    alt="Instalada"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-600 block">
                      Sin foto de instalación
                    </span>
                    <span className="text-xs text-slate-400">
                      Presiona el botón para capturar la evidencia montada
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAttachInstalledPhoto(part.id)}
                className="w-full py-3 px-4 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <Camera className="w-5 h-5 text-[#D05E28]" />
                <span>{part.installedPhotoUrl ? 'Cambiar Foto de Montaje' : 'Tomar Foto de Pieza Nueva'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pruebas de Manejo (Inicial y Final) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Prueba Inicial */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Car className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg text-[#1A253B]">Prueba de Manejo Inicial</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialDrive.vibrations}
                  onChange={(e) => setInitialDrive({ ...initialDrive, vibrations: e.target.checked })}
                  className="w-5 h-5 accent-[#D05E28]"
                />
                <span className="text-sm sm:text-base font-semibold text-[#1A253B]">Vibraciones</span>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initialDrive.noises}
                  onChange={(e) => setInitialDrive({ ...initialDrive, noises: e.target.checked })}
                  className="w-5 h-5 accent-[#D05E28]"
                />
                <span className="text-sm sm:text-base font-semibold text-[#1A253B]">Ruidos</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                Observaciones Iniciales
              </label>
              <textarea
                value={initialDrive.notes}
                onChange={(e) => setInitialDrive({ ...initialDrive, notes: e.target.value })}
                rows={2}
                className="w-full p-3.5 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Prueba Final y Correcciones */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg text-[#1A253B]">Prueba Final y Ajustes</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalDrive.brakingGood}
                  onChange={(e) => setFinalDrive({ ...finalDrive, brakingGood: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600"
                />
                <span className="text-sm sm:text-base font-semibold text-emerald-900">Frenado Óptimo</span>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={finalDrive.steeringAlignment}
                  onChange={(e) => setFinalDrive({ ...finalDrive, steeringAlignment: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600"
                />
                <span className="text-sm sm:text-base font-semibold text-emerald-900">Alineación</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
                Correcciones o Ajustes Finales
              </label>
              <textarea
                value={correctionsText}
                onChange={(e) => setCorrectionsText(e.target.value)}
                placeholder="Torque de apriete, purgado complementario, etc..."
                rows={2}
                className="w-full p-3.5 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
