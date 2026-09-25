import { RoleId } from './index';

export type NotificationTargetRole = RoleId | 'all';

export type NotificationType =
  | 'vehicle_registered'     // Asesor ingresa auto -> notifica a mecánico, cliente, administración
  | 'inspection_progress'    // Jefe de taller inspecciona / toma fotos -> notifica a cliente
  | 'new_fault_detected'     // Mecánico detecta falla nueva / refacción -> notifica a asesor, cliente
  | 'quote_authorized'       // Cliente firma y autoriza -> notifica a asesor, mecánico
  | 'repair_completed'       // Mecánico finaliza reparación -> notifica a cliente, asesor, administración
  | 'system';

export interface AppNotification {
  id: string;
  orderId?: string;
  orderNumber?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  targetRoles: NotificationTargetRole[];
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  actionModule?: string;
}
