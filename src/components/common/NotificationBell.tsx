import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Volume2,
  Trash2,
  X,
  Car,
  AlertTriangle,
  FileCheck,
  Wrench,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppNotification, NotificationTargetRole } from '../../types/notifications';
import { RoleId } from '../../types';
import { playNotificationBeep } from '../../utils/sound';

interface NotificationBellProps {
  activeRole: RoleId;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  activeRole,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar notificaciones correspondientes al rol activo o a 'all'
  const roleNotifications = notifications.filter(
    (n) => n.targetRoles.includes(activeRole as NotificationTargetRole) || n.targetRoles.includes('all')
  );

  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'vehicle_registered':
        return <Car className="w-4 h-4 text-sky-600" />;
      case 'new_fault_detected':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'quote_authorized':
        return <FileCheck className="w-4 h-4 text-emerald-600" />;
      case 'repair_completed':
        return <Check className="w-4 h-4 text-emerald-600" />;
      case 'inspection_progress':
        return <Wrench className="w-4 h-4 text-[#D05E28]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D05E28]" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Campana */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200 hover:border-[#D05E28]/40 hover:bg-amber-50/50 text-slate-700 hover:text-[#D05E28] transition cursor-pointer shrink-0"
        title="Notificaciones en tiempo real"
        aria-label="Abrir notificaciones"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />

        {/* Indicador de No Leídas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#D05E28] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header del Centro de Notificaciones */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#D05E28]/10 text-[#D05E28]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1A253B]">Notificaciones</h4>
                <p className="text-[11px] text-slate-500">
                  {unreadCount} sin leer • Rol {activeRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Botón Probar Sonido Beep */}
              <button
                type="button"
                onClick={() => playNotificationBeep()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#D05E28] hover:bg-slate-200 transition text-xs font-semibold cursor-pointer"
                title="Probar sonido Beep"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Marcar todas leídas */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition text-xs font-semibold cursor-pointer"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}

              {/* Limpiar */}
              {roleNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition text-xs cursor-pointer"
                  title="Limpiar historial de notificaciones"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
            {roleNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">Sin notificaciones pendientes</p>
                <p className="text-[11px] text-slate-400">
                  Las actualizaciones de taller, refacciones y firmas se mostrarán aquí con alerta sonora.
                </p>
              </div>
            ) : (
              roleNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (onSelectNotification) {
                      onSelectNotification(notif);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 transition cursor-pointer hover:bg-slate-50 flex items-start gap-3 ${
                    !notif.read ? 'bg-amber-50/40 font-semibold' : 'opacity-80'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
                    {getIconForType(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-[#1A253B] truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTime(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug break-words">
                      {notif.message}
                    </p>

                    {notif.vehiclePlate && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-slate-200 text-slate-800">
                          {notif.vehiclePlate}
                        </span>
                        {notif.vehicleModel && (
                          <span className="text-[10px] text-slate-500 truncate">
                            {notif.vehicleModel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[#D05E28] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
