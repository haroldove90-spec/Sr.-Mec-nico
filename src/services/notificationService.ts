import { AppNotification, NotificationTargetRole, NotificationType } from '../types/notifications';
import { VehicleServiceOrder } from '../types';

export const STORAGE_KEY_NOTIFICATIONS = 'sr_mecanico_notifications_v1';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-init-1',
    orderNumber: 'SM-2026-0842',
    vehiclePlate: 'PLK-99-34',
    vehicleModel: 'Mazda CX-5 Signature',
    targetRoles: ['mechanic', 'admin'],
    type: 'vehicle_registered',
    title: 'Nuevo Auto en Taller',
    message: 'Asesor ingresó Mazda CX-5 (PLK-99-34). Esperando asignación e inspección técnica.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    read: false,
    actionModule: 'm2_inspection',
  },
  {
    id: 'notif-init-2',
    orderNumber: 'SM-2026-0842',
    vehiclePlate: 'PLK-99-34',
    vehicleModel: 'Mazda CX-5 Signature',
    targetRoles: ['client'],
    type: 'vehicle_registered',
    title: 'Tu Auto ha ingresado a taller',
    message: 'Bienvenido a Sr. Mecánico. Tu vehículo ha sido recibido formalmente para servicio.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    read: false,
    actionModule: 'client_live',
  },
  {
    id: 'notif-init-3',
    orderNumber: 'SM-2026-0842',
    vehiclePlate: 'PLK-99-34',
    vehicleModel: 'Mazda CX-5 Signature',
    targetRoles: ['front_desk', 'client'],
    type: 'new_fault_detected',
    title: 'Nueva Falla Detectada por Mecánico',
    message: 'Se detectó fuga en amortiguador delantero derecho con foto de evidencia agregada.',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    read: false,
    actionModule: 'client_quote',
  },
  {
    id: 'notif-init-4',
    orderNumber: 'SM-2026-0842',
    vehiclePlate: 'PLK-99-34',
    vehicleModel: 'Mazda CX-5 Signature',
    targetRoles: ['front_desk', 'mechanic'],
    type: 'quote_authorized',
    title: 'Presupuesto Autorizado por Cliente',
    message: 'El cliente firmó digitalmente la cotización de amortiguadores y afinación mayor.',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    read: true,
    actionModule: 'm4_workshop',
  },
];

export function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  targetRoles: NotificationTargetRole[],
  order?: Partial<VehicleServiceOrder>,
  actionModule?: string
): AppNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    orderId: order?.id,
    orderNumber: order?.orderNumber,
    vehiclePlate: order?.vehicle?.plate,
    vehicleModel: order?.vehicle ? `${order.vehicle.make} ${order.vehicle.model}` : undefined,
    targetRoles,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    actionModule,
  };
}
