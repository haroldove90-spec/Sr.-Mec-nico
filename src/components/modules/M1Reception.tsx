import React, { useState, useEffect } from 'react';
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
  PackageCheck,
  ShieldAlert,
  AlertTriangle,
  Layers,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { VehicleServiceOrder, AestheticPhoto, VehicleIntakeInventory } from '../../types';

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
    fuelLevelPercent: order.vehicle.fuelLevelPercent || 50,
  });

  // Comprehensive Inventory State (Gas, Tapetes, Rayones, Golpes, Accesorios faltantes)
  const [inventory, setInventory] = useState<VehicleIntakeInventory>({
    fuelLevelPercent: order.intakeInventory?.fuelLevelPercent ?? (order.vehicle.fuelLevelPercent || 50),
    fuelLevelLabel: order.intakeInventory?.fuelLevelLabel ?? '1/2',
    hasFloorMats: order.intakeInventory?.hasFloorMats ?? true,
    floorMatsDetails: order.intakeInventory?.floorMatsDetails ?? 'Completos (delanteros y traseros)',
    floorMatsType: order.intakeInventory?.floorMatsType ?? 'hule',
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
    hasScratches: order.intakeInventory?.hasScratches ?? true,
    scratchesDetails: order.intakeInventory?.scratchesDetails ?? 'Rayón leve en fascia trasera y puerta copiloto',
    scratchesZones: order.intakeInventory?.scratchesZones ?? ['Fascia Trasera'],
    hasDents: order.intakeInventory?.hasDents ?? false,
    dentsDetails: order.intakeInventory?.dentsDetails ?? 'Sin abolladuras mayores',
    dentsZones: order.intakeInventory?.dentsZones ?? [],
    windshieldGlassStatus: order.intakeInventory?.windshieldGlassStatus ?? 'intacto',
    lightsStatus: order.intakeInventory?.lightsStatus ?? 'intactos',
    tiresStatus: order.intakeInventory?.tiresStatus ?? 'buen_estado',
    valuablesDeclared: order.intakeInventory?.valuablesDeclared ?? 'Ninguno reportado',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [searchPlateQuery, setSearchPlateQuery] = useState('');
  const [historyResult, setHistoryResult] = useState<string | null>(null);

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

  const handleSetFuelPreset = (pct: number, label: VehicleIntakeInventory['fuelLevelLabel']) => {
    setInventory((prev) => ({ ...prev, fuelLevelPercent: pct, fuelLevelLabel: label }));
    setFormData((prev) => ({ ...prev, fuelLevelPercent: pct }));
  };

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
        fuelLevelPercent: Number(inventory.fuelLevelPercent),
      },
      intakeInventory: inventory,
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B] tracking-tight">
            Recepción e Inventario Completo de Automóviles
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Registro del cliente, datos fiscales, inventario de combustible, tapetes, rayones, golpes y accesorios.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSave}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1A253B] text-base font-bold shadow-xs transition cursor-pointer"
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
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-base font-bold shadow-xs transition cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-base font-semibold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Datos e inventario físico guardados correctamente.</span>
        </div>
      )}

      {/* Consulta Rápida de Historial Clínico */}
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
            className="px-6 py-3 rounded-xl bg-[#1A253B] hover:bg-[#273756] text-white text-base font-bold cursor-pointer transition shrink-0"
          >
            Buscar Historial
          </button>
        </div>

        {historyResult && (
          <div className="mt-2 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-base text-slate-800 font-medium">
            {historyResult}
          </div>
        )}
      </div>

      {/* 1. Datos del Cliente y Facturación SAT */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-[#D05E28]" />
          <h3 className="font-bold text-xl text-[#1A253B]">1. Datos del Cliente y Facturación SAT</h3>
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
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
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
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
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
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
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
              className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">
              Razón Social para Factura CFDI
            </label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Ficha Técnica del Vehículo */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <Car className="w-5 h-5 text-[#D05E28]" />
          <h3 className="font-bold text-xl text-[#1A253B]">2. Ficha Técnica del Vehículo</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Marca *</label>
            <input
              type="text"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Modelo *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Año *</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Placas *</label>
            <input
              type="text"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-3 text-base rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-[#1A253B] mb-1.5">Kilometraje (km) *</label>
            <div className="relative">
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                className="w-full px-4 py-3 text-base font-mono font-bold rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
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
              className="w-full px-4 py-3 text-base font-mono rounded-xl border border-slate-300 text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Nivel de Gasolina Exacto (Visual e Interactivo) */}
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

        {/* Presets rápidos */}
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

        {/* Barra y Slider fluido */}
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

      {/* 4. Tapetes del Automóvil */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#1A253B]">4. Tapetes del Automóvil</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Verifica si el auto cuenta con tapetes, tipo de material y si están completos.
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              inventory.hasFloorMats ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {inventory.hasFloorMats ? 'CON TAPETES' : 'SIN TAPETES'}
          </span>
        </div>

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
                <div className="font-bold text-base text-[#1A253B]">SÍ CUENTA CON TAPETES</div>
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
                <div className="font-bold text-base text-[#1A253B]">NO TIENE TAPETES</div>
                <div className="text-xs text-slate-500">Sin tapetes o retirados previamente</div>
              </div>
            </div>
          </button>
        </div>

        {inventory.hasFloorMats && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Cobertura de Tapetes
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Juego completo (4 piezas)', 'Solo delanteros (2 piezas)', 'Faltan traseros'].map(
                    (item) => (
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
                    )
                  )}
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
                placeholder="Ej: Tapete conductor con desgaste normal..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Inspección de Rayones y Raspones */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#1A253B]">5. Inspección de Rayones y Raspones</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Marca las partes del vehículo que presentan rayones previos para proteger al taller.
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              inventory.hasScratches ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {inventory.hasScratches ? 'SÍ TIENE RAYONES' : 'SIN RAYONES'}
          </span>
        </div>

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
                <div className="font-bold text-base text-[#1A253B]">SÍ PRESENTA RAYONES / RASPONES</div>
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
                <div className="font-bold text-base text-[#1A253B]">SIN RAYONES (PINTURA LIMPIA)</div>
                <div className="text-xs text-slate-500">Pintura impecable sin raspones reportados</div>
              </div>
            </div>
          </button>
        </div>

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

      {/* 6. Inspección de Golpes y Abolladuras */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#1A253B]">6. Inspección de Golpes y Abolladuras</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Documenta abolladuras, portazos o deformaciones de lámina antes del servicio.
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              inventory.hasDents ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {inventory.hasDents ? 'SÍ TIENE GOLPES' : 'SIN GOLPES'}
          </span>
        </div>

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
                <div className="font-bold text-base text-[#1A253B]">SÍ PRESENTA GOLPES / ABOLLADURAS</div>
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
                <div className="font-bold text-base text-[#1A253B]">SIN GOLPES (LÁMINA ALINEADA)</div>
                <div className="text-xs text-slate-500">Carrocería sin hundimientos ni abolladuras</div>
              </div>
            </div>
          </button>
        </div>

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

      {/* 7. ¿Le Hace Falta Algún Accesorio? */}
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
                    isPresent ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A253B] mb-1.5">
            Objetos de Valor Declarados en Guantera o Cajuela:
          </label>
          <input
            type="text"
            value={inventory.valuablesDeclared || ''}
            onChange={(e) => setInventory({ ...inventory, valuablesDeclared: e.target.value })}
            placeholder="Ej: Lentes de sol, tarjeta de circulación original..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
          />
        </div>
      </div>

      {/* 8. Estado de Cristales, Faros y Neumáticos */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
            <ShieldCheck className="w-6 h-6 text-[#D05E28]" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-[#1A253B]">8. Estado de Cristales, Luces y Neumáticos</h3>
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
      </div>

      {/* 9. Fotografías Perimetrales */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#D05E28]" />
            <h3 className="font-bold text-lg sm:text-xl text-[#1A253B]">
              9. Fotografías del Estado Físico
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
