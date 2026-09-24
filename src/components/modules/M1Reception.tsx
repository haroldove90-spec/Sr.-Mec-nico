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
  FileText,
  Search,
  Upload,
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
        'Historial Clínico Encontrado: 12/Jun/2025 - Servicio de 50,000 km, cambio de aceite sintético. Se advirtió desgaste en balatas delanteras (4mm). Cotización anterior folio #COT-412.'
      );
    } else if (query.includes('RBH') || query.includes('74')) {
      setHistoryResult(
        'Historial Clínico Encontrado: 20/Ene/2026 - Cambio de batería LTH y afinación menor. No se reportaron fallas de suspensión previas.'
      );
    } else {
      setHistoryResult(
        `Vehículo placa ${query}: Primera vez en el taller. No hay registros previos de fallas ni cotizaciones anteriores en la base clínica.`
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
    <div className="space-y-6 pb-12">
      {/* Module Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#D05E28]/10 text-[#D05E28] font-bold text-xs">
              Módulo M1
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A253B]">
              Recepción e Historial Clínico
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro de cliente, datos fiscales SAT, consulta de expediente histórico y fotos perimetrales.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#D05E28]" />
            <span>Guardar Cambios</span>
          </button>
          {onNextStep && (
            <button
              onClick={() => {
                handleSave();
                onNextStep();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <span>Avanzar al Paso 2</span>
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Datos del cliente, vehículo y datos fiscales actualizados correctamente!</span>
        </div>
      )}

      {/* Historial Clínico de Autos (Consulta Rápida) */}
      <div className="bg-gradient-to-br from-slate-900 to-[#1A253B] rounded-2xl p-4 sm:p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-[#D05E28]" />
          <h2 className="text-base sm:text-lg font-bold">
            Expediente e Historial Clínico de Fallas Previas
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Ingresa placas o serie VIN para verificar qué se le ha cotizado, cambiado o diagnosticado con anterioridad en este taller.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchPlateQuery}
              onChange={(e) => setSearchPlateQuery(e.target.value)}
              placeholder="Ej: NCY-58-21 o RBH-74-19..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D05E28]"
            />
          </div>
          <button
            onClick={handleSearchHistory}
            className="px-4 py-2 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-xs sm:text-sm font-bold cursor-pointer transition"
          >
            Consultar Historial
          </button>
        </div>

        {historyResult && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs text-amber-200">
            {historyResult}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Datos del Cliente y Datos Fiscales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-[#D05E28]" />
            <h3 className="font-bold text-sm text-[#1A253B]">Datos de Contacto y Facturación SAT</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Nombre Completo del Cliente</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">WhatsApp / Teléfono Móvil</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value, customerPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">RFC con Homoclave</label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Razón Social Fiscal</label>
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Código Postal Fiscal</label>
              <input
                type="text"
                value={formData.codigoPostal}
                onChange={(e) => setFormData({ ...formData, codigoPostal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Uso de CFDI</label>
              <input
                type="text"
                value={formData.usoCFDI}
                onChange={(e) => setFormData({ ...formData, usoCFDI: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Régimen Fiscal SAT</label>
              <input
                type="text"
                value={formData.regimenFiscal}
                onChange={(e) => setFormData({ ...formData, regimenFiscal: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-500 font-semibold mb-1">Domicilio Fiscal Completo</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Datos del Auto, Odómetro y Combustible */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Car className="w-4 h-4 text-[#D05E28]" />
            <h3 className="font-bold text-sm text-[#1A253B]">Información del Vehículo</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Marca</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Modelo</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Año</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Placas</label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Color</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">No. Serie / VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-[11px] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>

          {/* Odómetro & Combustible */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Gauge className="w-4 h-4 text-[#D05E28]" />
                  <span>Kilometraje Actual</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-sm bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">km</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-[#D05E28]" />
                    <span>Nivel de Combustible</span>
                  </span>
                  <span className="font-mono text-[#D05E28]">{formData.fuelLevelPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.fuelLevelPercent}
                  onChange={(e) => setFormData({ ...formData, fuelLevelPercent: Number(e.target.value) })}
                  className="w-full accent-[#D05E28] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Vacío (E)</span>
                  <span>1/4</span>
                  <span>1/2</span>
                  <span>3/4</span>
                  <span>Lleno (F)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Captura de Fotos del Estado Estético del Coche */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#D05E28]" />
            <h3 className="font-bold text-sm text-[#1A253B]">
              Fotografías Perimetrales del Estado Estético
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {order.aestheticPhotos.length} fotos registradas
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Documentación gráfica preventiva antes de ingresar a bahía de servicio para proteger al cliente y al taller contra reclamos estéticos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { view: 'frontal' as const, label: 'Frontal y Cofre' },
            { view: 'trasera' as const, label: 'Fascia Trasera y Cajuela' },
            { view: 'lateral_izq' as const, label: 'Costado Izquierdo' },
            { view: 'lateral_der' as const, label: 'Costado Derecho' },
            { view: 'odometro_gas' as const, label: 'Tablero (Km / Gas)' },
          ].map((item) => {
            const photo = order.aestheticPhotos.find((p) => p.view === item.view);

            return (
              <div
                key={item.view}
                className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col group"
              >
                <div className="h-32 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                  {photo ? (
                    <img
                      src={photo.url}
                      alt={item.label}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <Camera className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px]">Sin foto</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleAddAestheticPhoto(item.view, item.label)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-xs font-semibold gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{photo ? 'Cambiar' : 'Tomar'}</span>
                  </button>
                </div>

                <div className="p-2 bg-white flex flex-col justify-between flex-1">
                  <span className="text-xs font-bold text-[#1A253B] truncate">{item.label}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{photo ? photo.timestamp : 'Pendiente'}</span>
                    {photo && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
