import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Filter,
  Layers,
  Save,
  Wrench,
  CheckCheck,
} from 'lucide-react';
import { VehicleServiceOrder, InspectionItem, InspectionStatus } from '../../types';

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

  // Group categories
  const categories = Array.from(new Set(points.map((p) => p.category)));

  // Stats
  const greenCount = points.filter((p) => p.status === 'green').length;
  const yellowCount = points.filter((p) => p.status === 'yellow').length;
  const redCount = points.filter((p) => p.status === 'red').length;
  const inspectedCount = greenCount + yellowCount + redCount;
  const progressPercent = Math.round((inspectedCount / points.length) * 100);

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
      notes: p.status === 'red' ? p.notes : 'En condiciones adecuadas de operación',
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

  // Filtered points
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
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M2
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Inspección de 55 Puntos y Calidad Operativa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Checklist técnico con semaforización y toma de fotografías de evidencia para diagnóstico de piezas dañadas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSetAllGreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition"
            title="Marcar todos en verde por defecto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Verificar Todo Óptimo</span>
          </button>
          {onNextStep && (
            <button
              onClick={onNextStep}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Avanzar al Diagnóstico</span>
            </button>
          )}
        </div>
      </div>

      {/* Traffic Light Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#1A253B] font-bold text-sm">
            55
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Puntos Totales</div>
            <div className="text-base sm:text-lg font-extrabold text-[#1A253B]">
              {inspectedCount} / {points.length} ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-3 bg-emerald-50/30">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-emerald-800">🟢 Buen Estado</div>
            <div className="text-base sm:text-lg font-extrabold text-emerald-700">{greenCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-3 bg-amber-50/30">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-800">🟡 Precaución</div>
            <div className="text-base sm:text-lg font-extrabold text-amber-700">{yellowCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-xs flex items-center gap-3 bg-red-50/30">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-red-800">🔴 Daño Crítico</div>
            <div className="text-base sm:text-lg font-extrabold text-red-700">{redCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Category Pill Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#1A253B] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Traffic Light filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterStatus === 'todos' ? 'bg-white text-[#1A253B] shadow-xs' : 'text-slate-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('red')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'red' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700'
              }`}
            >
              🔴 Rojos ({redCount})
            </button>
            <button
              onClick={() => setFilterStatus('yellow')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'yellow' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700'
              }`}
            >
              🟡 Amarillos ({yellowCount})
            </button>
            <button
              onClick={() => setFilterStatus('green')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                filterStatus === 'green' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
              }`}
            >
              🟢 Verdes ({greenCount})
            </button>
          </div>
        </div>
      </div>

      {/* Points Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredPoints.map((item) => {
          const isRed = item.status === 'red';
          const isYellow = item.status === 'yellow';
          const isGreen = item.status === 'green';

          return (
            <div
              key={item.id}
              className={`p-4 transition hover:bg-slate-50/80 ${
                isRed ? 'bg-red-50/20' : isYellow ? 'bg-amber-50/20' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isGreen && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isYellow && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    {isRed && <XCircle className="w-5 h-5 text-red-600" />}
                    {item.status === 'uninspected' && (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {item.category}
                      </span>
                      {item.photoUrl && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 flex items-center gap-1">
                          <Camera className="w-3 h-3" /> Con foto
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#1A253B]">{item.name}</h4>
                    {item.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </div>

                {/* Semaforización + Botones de Acción */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleSetStatus(item.id, 'green')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isGreen ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Buen estado"
                    >
                      <span>Verde</span>
                    </button>
                    <button
                      onClick={() => handleSetStatus(item.id, 'yellow')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isYellow ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Precaución / Medio uso"
                    >
                      <span>Amarillo</span>
                    </button>
                    <button
                      onClick={() => handleSetStatus(item.id, 'red')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        isRed ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Dañado urgente"
                    >
                      <span>Rojo</span>
                    </button>
                  </div>

                  {/* Tomar foto de evidencia */}
                  <button
                    onClick={() => handleAddEvidencePhoto(item.id)}
                    className="p-2 rounded-xl border border-slate-200 hover:border-[#D05E28] hover:text-[#D05E28] text-slate-600 transition cursor-pointer"
                    title="Capturar foto de evidencia"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  {/* Editar nota */}
                  <button
                    onClick={() => {
                      setEditingPointId(editingPointId === item.id ? null : item.id);
                      setTempNotes(item.notes || '');
                    }}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition cursor-pointer"
                    title="Agregar notas de diagnóstico"
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo preview if attached */}
              {item.photoUrl && (
                <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-red-600">Evidencia de Falla Registrada</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Esta fotografía se incluirá en el comparador interactivo para la autorización del cliente y auditoría de compras.
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Note Drawer */}
              {editingPointId === item.id && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-700">Observaciones del Técnico:</label>
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                    placeholder="Escribe el diagnóstico técnico exacto..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPointId(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleSaveNotes(item.id)}
                      className="px-3 py-1 text-xs bg-[#1A253B] text-white font-semibold rounded-lg hover:bg-[#273756] cursor-pointer"
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
