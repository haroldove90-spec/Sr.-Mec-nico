import React, { useState } from 'react';
import {
  Car,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Search,
  MessageCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { VehicleServiceOrder } from '../../types';

interface ClientLoginViewProps {
  orders: VehicleServiceOrder[];
  onLoginSuccess: (orderId: string) => void;
  onBackToRoles: () => void;
}

export const ClientLoginView: React.FC<ClientLoginViewProps> = ({
  orders,
  onLoginSuccess,
  onBackToRoles,
}) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [loginMode, setLoginMode] = useState<'credentials' | 'orderNumber'>('credentials');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [matchingOrders, setMatchingOrders] = useState<VehicleServiceOrder[]>([]);

  const handleSearchVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setMatchingOrders([]);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const cleanOrder = orderNumber.trim().toUpperCase();

    if (loginMode === 'credentials') {
      if (!cleanEmail && !cleanPhone) {
        setErrorMsg('Por favor ingresa tu correo electrónico o tu número de teléfono celular.');
        return;
      }

      // Buscar por teléfono o correo registrado en la orden
      const found = orders.filter((o) => {
        const orderPhone = o.customer.phone.replace(/\D/g, '');
        const orderEmail = o.customer.email.trim().toLowerCase();

        const matchPhone = cleanPhone && (orderPhone.includes(cleanPhone) || cleanPhone.includes(orderPhone));
        const matchEmail = cleanEmail && orderEmail === cleanEmail;

        return matchPhone || matchEmail;
      });

      if (found.length === 1) {
        onLoginSuccess(found[0].id);
      } else if (found.length > 1) {
        setMatchingOrders(found);
      } else {
        setErrorMsg(
          'No se encontró ningún vehículo activo registrado con esas credenciales. Verifica que coincidan con los datos proporcionados al asesor de servicio en la recepción del taller.'
        );
      }
    } else {
      if (!cleanOrder) {
        setErrorMsg('Por favor ingresa tu número de orden de servicio (ej: SM-2026-0842).');
        return;
      }

      const found = orders.find(
        (o) =>
          o.orderNumber.toUpperCase().includes(cleanOrder) ||
          o.vehicle.plate.toUpperCase().replace(/\s|-/g, '') === cleanOrder.replace(/\s|-/g, '')
      );

      if (found) {
        onLoginSuccess(found.id);
      } else {
        setErrorMsg(
          `No encontramos la orden "${cleanOrder}". Verifica el folio en tu comprobante o busca por tu número de teléfono celular.`
        );
      }
    }
  };

  // Cargar credenciales de prueba del taller con 1 clic
  const handleUsePreset = (ord: VehicleServiceOrder) => {
    setEmail(ord.customer.email);
    setPhone(ord.customer.phone);
    setOrderNumber(ord.orderNumber);
    onLoginSuccess(ord.id);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg mx-auto space-y-6">
        {/* Logo oficial */}
        <div className="text-center space-y-3">
          <img
            src="https://kabris.com.mx/srmecanicologo.png"
            alt="Sr. Mecánico"
            className="h-16 sm:h-20 mx-auto object-contain select-none"
          />
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#D05E28] bg-[#D05E28]/10 px-3 py-1 rounded-full border border-[#D05E28]/20">
              Portal del Cliente
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A253B] mt-2">
              Monitoreo en Tiempo Real
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Consulta en vivo el avance técnico, fotos de refacciones instaladas y dictamen de tu vehículo.
            </p>
          </div>
        </div>

        {/* Tarjeta de Formulario de Acceso */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5">
          {/* Selector de modo de acceso */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('credentials');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMode === 'credentials'
                  ? 'bg-white text-[#1A253B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#D05E28]" />
              <span>Correo y Teléfono</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('orderNumber');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMode === 'orderNumber'
                  ? 'bg-white text-[#1A253B] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#D05E28]" />
              <span>Número de Folio / Orden</span>
            </button>
          </div>

          <form onSubmit={handleSearchVehicle} className="space-y-4">
            {loginMode === 'credentials' ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Correo Electrónico Registrado:
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-semibold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Teléfono Celular (WhatsApp):
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10 dígitos (ej: 55 4192 8831)"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-semibold text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    * Ingresa el teléfono o correo proporcionado al registrar el auto.
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Folio de Orden o Placas:
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ej: SM-2026-0842 o NCY-58-21"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-bold uppercase text-[#1A253B] focus:ring-2 focus:ring-[#D05E28] focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  * Viene impreso en tu hoja de servicio o en el WhatsApp de recepción.
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Múltiples órdenes encontradas para el mismo cliente */}
            {matchingOrders.length > 1 && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-[#1A253B] block">
                  Encontramos {matchingOrders.length} autos registrados a tu nombre. Selecciona cuál deseas monitorear:
                </span>
                <div className="space-y-2">
                  {matchingOrders.map((ord) => (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => onLoginSuccess(ord.id)}
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 hover:border-[#D05E28] text-left flex items-center justify-between text-xs transition cursor-pointer"
                    >
                      <div>
                        <strong className="block text-sm text-[#1A253B]">
                          {ord.vehicle.year} {ord.vehicle.make} {ord.vehicle.model}
                        </strong>
                        <span className="text-slate-500">
                          Placas: {ord.vehicle.plate} • Orden #{ord.orderNumber}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#D05E28]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-black text-base flex items-center justify-center gap-2 shadow-md transition cursor-pointer transform active:scale-98"
            >
              <span>Ingresar a Monitorear mi Auto</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Ayuda y Soporte por WhatsApp */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>¿Problemas para acceder?</span>
            <a
              href="https://wa.me/525541928831?text=Hola,%20tengo%20problemas%20para%20acceder%20al%20portal%20de%20monitoreo%20de%20mi%20auto"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contactar a Recepción</span>
            </a>
          </div>
        </div>

        {/* Cuentas de Demostración del Taller */}
        <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Accesos Rápidos de Prueba (Vehículos en Taller):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {orders.slice(0, 3).map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => handleUsePreset(ord)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition cursor-pointer"
              >
                <strong className="block text-[11px] text-[#1A253B] truncate">
                  {ord.vehicle.make} {ord.vehicle.model}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  {ord.customer.name.split(' ')[0]} • #{ord.orderNumber}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Volver al Selector de Roles */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBackToRoles}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            ← Volver a Selección de Roles del Sistema
          </button>
        </div>
      </div>
    </div>
  );
};
