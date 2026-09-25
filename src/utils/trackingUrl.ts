import { VehicleServiceOrder } from '../types';

/**
 * Genera el enlace oficial de monitoreo para el cliente.
 * Detecta automáticamente el origen actual (desarrollo, preview o producción Vercel)
 * para garantizar que el enlace funcione en cualquier entorno.
 */
export const getClientTrackingUrl = (order: VehicleServiceOrder): string => {
  let origin = 'https://sr-mec-nico.vercel.app';
  let path = '/';

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const locOrigin = window.location.origin;
    // Asegurar que no sea about:blank o blob:
    if (!locOrigin.includes('about:blank') && !locOrigin.includes('blob:')) {
      origin = locOrigin;
      path = window.location.pathname || '/';
    }
  }

  const cleanPhone = order.customer.phone.replace(/\D/g, '');
  const cleanEmail = encodeURIComponent(order.customer.email.trim().toLowerCase());
  const cleanOrderNumber = encodeURIComponent(order.orderNumber.trim());
  const cleanOrderId = encodeURIComponent(order.id.trim());
  const cleanPlate = encodeURIComponent(order.vehicle.plate.trim());
  const cleanName = encodeURIComponent(order.customer.name.trim());
  const cleanMake = encodeURIComponent(order.vehicle.make.trim());
  const cleanModel = encodeURIComponent(order.vehicle.model.trim());
  const cleanYear = encodeURIComponent(String(order.vehicle.year || ''));

  // Incluye todos los metadatos necesarios para hidratar la orden si se abre en otro dispositivo/navegador
  const query = [
    'role=client',
    `tracking=${cleanOrderNumber}`,
    `orderId=${cleanOrderId}`,
    `plate=${cleanPlate}`,
    `phone=${cleanPhone}`,
    `email=${cleanEmail}`,
    `name=${cleanName}`,
    `make=${cleanMake}`,
    `model=${cleanModel}`,
    `year=${cleanYear}`,
  ].join('&');

  const base = `${origin}${path}`.replace(/\/+$/, '/');
  return `${base}?${query}`;
};

/**
 * Construye el mensaje oficial para WhatsApp de la orden autorizada.
 */
export const buildAuthorizedWhatsAppMessage = (
  order: VehicleServiceOrder,
  signerName: string,
  trackingUrl: string,
  totalWithTax: number
): string => {
  const approvedParts = (order.parts || []).filter((p) => p.approved);
  const partsList = approvedParts
    .map(
      (p, idx) =>
        `  ${idx + 1}. *${p.name}* - $${(p.cost + p.laborCost).toLocaleString('es-MX')} MXN`
    )
    .join('\n');

  return (
    `📋 *ORDEN DE SERVICIO AUTORIZADA Y FIRMADA*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `¡Hola ${order.customer.name}! Tu orden de servicio ha sido *formalmente autorizada y firmada* para ingresar a taller mecánico.\n\n` +
    `📑 *Folio de Orden:* #${order.orderNumber}\n` +
    `🚗 *Vehículo:* ${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model}\n` +
    `🔢 *Placas:* ${order.vehicle.plate}\n` +
    `👤 *Firmado por:* ${signerName || order.customer.name}\n` +
    `📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n\n` +
    `💰 *RESUMEN DE INVERSIÓN AUTORIZADA:*\n` +
    `${partsList || '  • Mantenimiento y diagnóstico general'}\n` +
    `*Total con IVA:* $${totalWithTax.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN\n` +
    `🛡️ *Garantía del Taller:* 6 Meses o 10,000 km por escrito.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔴 *LINK PERSONALIZADO DE MONITOREO EN VIVO:*\n` +
    `Da clic en el enlace para ingresar directamente a ver el estatus de tu auto en tiempo real:\n\n` +
    `👉 ${trackingUrl}\n\n` +
    `_Tus datos registrados son tu correo (${order.customer.email}) y tu celular (${order.customer.phone})._\n\n` +
    `Cualquier duda estamos a tus órdenes en este chat. ¡Tu auto está en las mejores manos! 🔧🚗`
  );
};
