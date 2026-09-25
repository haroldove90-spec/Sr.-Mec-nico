import React from 'react';
import {
  Bell,
  X,
  Car,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Wrench,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { AppNotification } from '../../types/notifications';

interface NotificationToastContainerProps {
  toasts: AppNotification[];
  onDismiss: (id: string) => void;
  onActionClick?: (notification: AppNotification) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
  onActionClick,
}) => {
  if (toasts.length === 0) return null;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'vehicle_registered':
        return <Car className="w-5 h-5 text-sky-600" />;
      case 'new_fault_detected':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'quote_authorized':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'repair_completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'inspection_progress':
        return <Wrench className="w-5 h-5 text-[#D05E28]" />;
      default:
        return <Bell className="w-5 h-5 text-[#D05E28]" />;
    }
  };

  const getBorderColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'new_fault_detected':
        return 'border-amber-400 bg-amber-50/95';
      case 'quote_authorized':
      case 'repair_completed':
        return 'border-emerald-400 bg-emerald-50/95';
      case 'vehicle_registered':
        return 'border-sky-400 bg-sky-50/95';
      default:
        return 'border-[#D05E28]/40 bg-white/95';
    }
  };

  return (
    <div
      className="fixed top-4 right-3 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      style={{ minWidth: '280px' }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto shadow-2xl rounded-2xl border p-3.5 sm:p-4 backdrop-blur-md transition-all transform animate-in slide-in-from-top-4 fade-in duration-200 ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs shrink-0 mt-0.5">
              {getIconForType(toast.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#1A253B] truncate flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#D05E28] animate-pulse" />
                  {toast.title}
                </span>

                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition cursor-pointer"
                  title="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-700 mt-1 leading-snug break-words font-medium">
                {toast.message}
              </p>

              <div className="flex items-center justify-between pt-2">
                {toast.vehiclePlate ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#1A253B] text-white">
                    {toast.vehiclePlate} {toast.vehicleModel ? `• ${toast.vehicleModel}` : ''}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">Sr. Mecánico</span>
                )}

                {onActionClick && (
                  <button
                    type="button"
                    onClick={() => onActionClick(toast)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#D05E28] hover:text-[#b84e1e] cursor-pointer"
                  >
                    <span>Ver detalle</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
