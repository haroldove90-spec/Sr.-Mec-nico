import React, { useState } from 'react';
import {
  User,
  Car,
  Camera,
  History,
  Save,
  Fuel,
  Gauge,
  CheckCircle2,
  Search,
  Upload,
  ArrowRight,
} from 'lucide-react';
import { VehicleServiceOrder, AestheticPhoto } from '../../types';

interface M1ReceptionProps {
  order: VehicleServiceOrder;
  onUpdateOrder: (updated: VehicleServiceOrder) => void;
  onNextStep?: () => void;
}

export const M1Reception: React.FC<M1ReceptionProps> = ({
  order,
  onUpdateOrder,
  onNextStep,
}) => {
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

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchPlateQuery, setSearchPlateQuery] = useState('');
  const [historyResult, setHistoryResult] = useState<string | null>(null);

  const handleSave = () => {
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
    };

    onUpdateOrder(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSearchHistory = () => {
    if (!searchPlateQuery.trim()) return;
    const query = searchPlateQuery.trim().toUpperCase();
    if (query.includes('NCY') || query.includes('58')) {
      setHistoryResult(
        'Historial Encontrado: Servicio de 50,000 km, cambio de aceite sintético. Se advirtió desgaste en balatas delanteras (4mm).'
      );
    } else if (query.includes('RBH') || query.includes('74')) {
      setHistoryResult(
        'Historial Encontrado: Cambio de batería LTH y afinación menor. No se reportaron fallas mecánicas adicionales.'
      );
    } else {
      setHistoryResult(
        `Vehículo ${query}: Primera vez en el taller. Sin registros previos en la plataforma.`
      );
    }
  };

  const handleAddAestheticPhoto = (view: AestheticPhoto['view'], label: string) => {
    const sampleUrls: Record<string, string> = {
      frontal: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      trasera: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      lateral_izq: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      lateral_der: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
      odometro_gas: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    };

    const newPhoto: AestheticPhoto = {
      view,
      label,
      url: sampleUrls[view] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedPhotos = [...order.aestheticPhotos.filter((p) => p.view !== view), newPhoto];
    onUpdateOrder({
      ...order,
      aestheticPhotos: updatedPhotos,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header del Módulo: Minimalista y con tipografía amplia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Recepción e Historial Clínico
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Registro de cliente, facturación SAT y fotografías perimetrales.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-sm sm:text-base font-bold shadow-xs transition cursor-pointer"
          >
            <Save className="w-5 h-5 text-[#D05E28]" />
            <span>Guardar</span>
          </button>
          {onNextStep && (
            <button
              onClick={() => {
                handleSave();
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

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm sm:text-base font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Datos guardados correctamente.</span>
        </div>
      )}

      {/* Consulta Rápida de Historial Clínico (Minimalista) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#D05E28]" />
          <h2 className="text-base sm:text-lg font-bold text-[#1A253B]">
            Historial de Servicios Anteriores
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchPlateQuery}
              onChange={(e) => setSearchPlateQuery(e.target.value)}
              placeholder="Buscar por placa o número de serie VIN..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-base text-[#1A253B] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D05E28] focus:bg-white"
            />
          </div>
          <button
            onClick={handleSearchHistory}
            className="px-6 py-3 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-sm sm:text-base font-bold cursor-pointer transition shrink-0"
          >
            Buscar Historial
          </button>
        </div>

        {historyResult && (
          <div className="mt-2 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm sm:text-base text-slate-800 font-medium">
            {historyResult}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* 1. Datos del Cliente y Facturación */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg text-[#1A253B]">Cliente y Datos Fiscales SAT</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value, customerPhone: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
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
                  className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  RFC
                </label>
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 text-base sm:text-lg font-mono font-bold rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Código Postal Fiscal
                </label>
                <input
                  type="text"
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-lg font-mono rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                Razón Social
              </label>
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                Régimen Fiscal
              </label>
              <input
                type="text"
                value={formData.regimenFiscal}
                onChange={(e) => setFormData({ ...formData, regimenFiscal: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Información del Vehículo */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Car className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg text-[#1A253B]">Datos del Vehículo</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Año
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Placas
                </label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-3 text-base sm:text-lg font-mono font-bold rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-3 text-base sm:text-lg rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
                Número de Serie / VIN
              </label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 text-base font-mono rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>

            {/* Kilometraje y Gasolina */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700 mb-2">
                  <Gauge className="w-5 h-5 text-[#D05E28]" />
                  <span>Kilometraje</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-mono font-bold text-lg bg-white"
                  />
                  <span className="absolute right-3 top-3 text-sm text-slate-400">km</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-sm sm:text-base font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-[#D05E28]" />
                    <span>Gasolina</span>
                  </span>
                  <span className="font-bold text-[#D05E28] text-base">{formData.fuelLevelPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.fuelLevelPercent}
                  onChange={(e) => setFormData({ ...formData, fuelLevelPercent: Number(e.target.value) })}
                  className="w-full accent-[#D05E28] cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fotos Perimetrales: Diseño claro y legible */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">
              Fotografías del Estado Físico
            </h3>
          </div>
          <span className="text-sm font-semibold text-slate-500">
            {order.aestheticPhotos.length} registradas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { view: 'frontal' as const, label: 'Frente' },
            { view: 'trasera' as const, label: 'Trasera' },
            { view: 'lateral_izq' as const, label: 'Costado Izq.' },
            { view: 'lateral_der' as const, label: 'Costado Der.' },
            { view: 'odometro_gas' as const, label: 'Tablero' },
          ].map((item) => {
            const photo = order.aestheticPhotos.find((p) => p.view === item.view);

            return (
              <div
                key={item.view}
                className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col"
              >
                <div className="h-36 bg-slate-100 relative flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 text-center p-3">
                      <Camera className="w-7 h-7 mx-auto mb-1 opacity-40" />
                      <span className="text-xs">Sin foto</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddAestheticPhoto(item.view, item.label)}
                    className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition text-sm font-bold gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{photo ? 'Cambiar' : 'Subir'}</span>
                  </button>
                </div>

                <div className="p-3 bg-white flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A253B]">{item.label}</span>
                  {photo && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
