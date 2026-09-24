import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  CheckCheck,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import { VehicleServiceOrder, InspectionStatus } from '../../types';

interface M2Inspection55Props {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M2Inspection55: React.FC<M2Inspection55Props> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const points = order.inspectionPoints || [];
  const categories = Array.from(new Set(points.map((p) => p.category)));

  // Estadísticas
  const greenCount = points.filter((p) => p.status === 'green').length;
  const yellowCount = points.filter((p) => p.status === 'yellow').length;
  const redCount = points.filter((p) => p.status === 'red').length;
  const inspectedCount = greenCount + yellowCount + redCount;

  const handleSetStatus = (id: string, status: InspectionStatus) => {
    const updated = points.map((p) => (p.id === id ? { ...p, status } : p));
    onUpdateOrder({
      ...order,
      inspectionPoints: updated,
    });
  };

  const handleSetAllGreen = () => {
    const updated = points.map((p) => ({
      ...p,
      status: 'green' as const,
      notes: p.status === 'red' ? p.notes : 'Inspección conforme',
    }));
    onUpdateOrder({
      ...order,
      inspectionPoints: updated,
    });
  };

  const handleSaveNotes = (id: string) => {
    const updated = points.map((p) => (p.id === id ? { ...p, notes: tempNotes } : p));
    onUpdateOrder({
      ...order,
      inspectionPoints: updated,
    });
    setEditingPointId(null);
  };

  const handleAddEvidencePhoto = (id: string) => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
    ];
    const chosen = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];

    const updated = points.map((p) => (p.id === id ? { ...p, photoUrl: chosen, status: 'red' as const } : p));
    onUpdateOrder({
      ...order,
      inspectionPoints: updated,
    });
  };

  const filteredPoints = points.filter((p) => {
    const matchCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchStatus =
      filterStatus === 'todos' ||
      (filterStatus === 'green' && p.status === 'green') ||
      (filterStatus === 'yellow' && p.status === 'yellow') ||
      (filterStatus === 'red' && p.status === 'red');
    return matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Inspección de 55 Puntos
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Checklist semaforizado y evidencias fotográficas de fallas mecánicas.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSetAllGreen}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
          >
            <CheckCheck className="w-5 h-5 text-emerald-600" />
            <span>Todo Óptimo</span>
          </button>
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

      {/* Resumen Semaforizado (Limpio y minimalista) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-sm font-semibold text-slate-500 block mb-1">Inspeccionados</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            {inspectedCount} / {points.length}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-sm font-semibold text-emerald-800 block mb-1">🟢 Buen Estado</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{greenCount}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-sm font-semibold text-amber-800 block mb-1">🟡 Precaución</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">{yellowCount}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs bg-red-50/20">
          <span className="text-sm font-semibold text-red-800 block mb-1">🔴 Dañado</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-red-700">{redCount}</span>
        </div>
      </div>

      {/* Filtros de Categorías */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('todos')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              selectedCategory === 'todos'
                ? 'bg-[#1A253B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({points.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1A253B] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Puntos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredPoints.map((item) => {
          const isRed = item.status === 'red';
          const isYellow = item.status === 'yellow';
          const isGreen = item.status === 'green';

          return (
            <div
              key={item.id}
              className={`p-5 transition hover:bg-slate-50/70 ${
                isRed ? 'bg-red-50/20' : isYellow ? 'bg-amber-50/20' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="mt-1">
                    {isGreen && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                    {isYellow && <AlertTriangle className="w-6 h-6 text-amber-500" />}
                    {isRed && <XCircle className="w-6 h-6 text-red-600" />}
                    {item.status === 'uninspected' && (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-[#1A253B]">{item.name}</h4>
                    {item.notes && (
                      <p className="text-sm text-slate-500 mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Semáforo en grande y táctil */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                    <button
                      onClick={() => handleSetStatus(item.id, 'green')}
                      className={`px-3.5 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                        isGreen ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Verde
                    </button>
                    <button
                      onClick={() => handleSetStatus(item.id, 'yellow')}
                      className={`px-3.5 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                        isYellow ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Amarillo
                    </button>
                    <button
                      onClick={() => handleSetStatus(item.id, 'red')}
                      className={`px-3.5 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                        isRed ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Rojo
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddEvidencePhoto(item.id)}
                    className="p-2.5 rounded-xl border border-slate-300 hover:border-[#D05E28] hover:text-[#D05E28] text-slate-600 transition cursor-pointer"
                    title="Foto de Evidencia"
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      setEditingPointId(editingPointId === item.id ? null : item.id);
                      setTempNotes(item.notes || '');
                    }}
                    className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                    title="Agregar Notas"
                  >
                    <Wrench className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Vista previa de evidencia fotográfica si existe */}
              {item.photoUrl && (
                <div className="mt-4 flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="text-sm">
                    <span className="font-bold text-red-600 block">Evidencia de Falla</span>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      Integrada automáticamente en la cotización y comparador del cliente.
                    </p>
                  </div>
                </div>
              )}

              {/* Editor de Notas */}
              {editingPointId === item.id && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-sm font-bold text-slate-700">Observación Técnica:</label>
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    rows={2}
                    className="w-full p-3 text-base rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                    placeholder="Escribe el diagnóstico exacto..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingPointId(null)}
                      className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveNotes(item.id)}
                      className="px-5 py-2 text-sm bg-[#1A253B] text-white font-bold rounded-lg hover:bg-[#273756] cursor-pointer"
                    >
                      Guardar Nota
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
