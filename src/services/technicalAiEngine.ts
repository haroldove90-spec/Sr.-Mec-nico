/**
 * Motor del Asistente Técnico Inteligente de "Sr. Mecánico"
 * Diseñado bajo directrices automotrices estrictas:
 * - Cero alucinaciones técnicas (viscosidades SAE/API, bujías y capacidades de cárter validadas).
 * - Desglose estandarizado de cotización y mantenimiento preventivo por kilometraje.
 * - Soporte para consultas de estatus de órdenes activas en taller.
 */

import { VehicleSpec, findVehicleSpec, VEHICLE_SPECS_DATABASE } from '../data/vehicleSpecsData';
import { VehicleServiceOrder } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  structuredQuote?: {
    vehicle: string;
    service: string;
    parts: string[];
    complexity: string;
    estimatedHours: string;
    disclaimer: string;
    nextSteps: string;
  };
  suggestedActions?: { label: string; actionText: string }[];
}

export interface AssistantContext {
  activeOrder?: VehicleServiceOrder | null;
  allOrders?: VehicleServiceOrder[];
  userRole?: string | null;
}

export function generateTechnicalAssistantReply(
  userPrompt: string,
  context?: AssistantContext
): ChatMessage {
  const query = userPrompt.toLowerCase().trim();
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. CONSULTA DE ESTATUS DE ORDEN ACTIVA
  if (
    query.includes('estatus') ||
    query.includes('mi orden') ||
    query.includes('mi auto') ||
    query.includes('mi coche') ||
    query.includes('mi carro') ||
    query.includes('cómo va') ||
    query.includes('como va') ||
    query.includes('placa') ||
    query.includes('folio')
  ) {
    if (context?.activeOrder) {
      const order = context.activeOrder;
      const stepNames: Record<number, string> = {
        1: 'Recepción e Inventario Perimetral',
        2: 'Inspección Multipunto de 55 Puntos de Seguridad',
        3: 'Diagnóstico Técnico Especializado',
        4: 'Cálculo de Cotización y Presupuesto Urgente',
        5: 'Autorización y Firma Digital del Propietario',
        6: 'Adquisición y Auditoría de Refacciones',
        7: 'Cotejo y Almacén Físico de Piezas',
        8: 'Asignación a Bahía Mecánica',
        9: 'Desmontaje de Piezas y Documentación Fotográfica',
        10: 'Montaje de Refacciones Nuevas Certificadas',
        11: 'Control de Fluidos y Lubricantes a Granel',
        12: 'Prueba de Ruta y Control de Calidad',
        13: 'Lavado de Cortesía y Detallado',
        14: 'Liquidación en Caja y Facturación CFDI',
        15: 'Devolución de Piezas Usadas al Cliente',
        16: 'Liberación de Unidad y Seguimiento CRM Post-Venta',
      };

      const currentStepName = stepNames[order.currentStep] || `Paso ${order.currentStep}`;
      const statusText =
        order.status === 'completado'
          ? 'Vehículo terminado y listo para entrega en recepción.'
          : order.status === 'en_taller'
          ? `En proceso activo dentro de taller (Paso ${order.currentStep} de 16).`
          : order.status === 'por_entregar'
          ? 'Vehículo en control de calidad final y listo para entrega.'
          : 'Orden recibida y en proceso de inspección/cotización.';

      const totalAmount = (order.parts || []).reduce(
        (sum, p) => sum + (p.cost || 0) + (p.laborCost || 0),
        0
      );

      return {
        id: messageId,
        sender: 'assistant',
        timestamp: now,
        text: `🚗 **Estatus Oficial de la Orden #${order.orderNumber}**\n\n` +
          `• **Vehículo:** ${order.vehicle.make} ${order.vehicle.model} ${order.vehicle.year} (Placas: \`${order.vehicle.plate}\`)\n` +
          `• **Propietario:** ${order.customer.name}\n` +
          `• **Etapa actual:** **Paso ${order.currentStep} de 16 — ${currentStepName}**\n` +
          `• **Condición:** ${statusText}\n` +
          (order.diagnosisSummary ? `• **Dictamen técnico:** ${order.diagnosisSummary}\n` : '') +
          `• **Monto cotizado:** $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n` +
          (order.clientAuthorized ? `• **Autorización:** Aprobado por el cliente con firma digital.\n` : `• **Autorización:** Pendiente de firma de cotización por el cliente.\n\n`) +
          `*Puedes consultar los detalles fotográficos y avance en vivo en la barra de flujo de trabajo del taller.*`,
        suggestedActions: [
          { label: '¿Qué mantenimiento le toca por km?', actionText: `¿Qué mantenimiento le toca a ${order.vehicle.make} ${order.vehicle.model} con ${order.vehicle.mileage} km?` },
          { label: 'Especificaciones de aceite', actionText: `¿Qué aceite y cuántos litros lleva ${order.vehicle.make} ${order.vehicle.model}?` },
        ],
      };
    } else {
      return {
        id: messageId,
        sender: 'assistant',
        timestamp: now,
        text: `Con gusto reviso el estatus de tu reparación. Por favor indícame las **placas del auto** o el **número de folio** de tu orden de trabajo (ej. \`ORD-2024-001\`). Si eres cliente con orden activa, selecciónala en la parte superior para consultar el expediente en vivo.`,
        suggestedActions: [
          { label: 'Cotizar afinación Versa', actionText: 'Cotizar afinación mayor para Nissan Versa 1.6L 2021' },
          { label: 'Consultar aceite Jetta', actionText: '¿Qué aceite y cuántos litros lleva un VW Jetta 1.4 TSI?' },
        ],
      };
    }
  }

  // 2. DETECCIÓN DE PREGUNTAS SOBRE VISCOSIDAD / ACEITE
  const isOilQuestion =
    query.includes('aceite') ||
    query.includes('viscosidad') ||
    query.includes('litros') ||
    query.includes('cárter') ||
    query.includes('carter') ||
    query.includes('0w-20') ||
    query.includes('5w-30') ||
    query.includes('5w-40') ||
    query.includes('20w-50');

  // 3. DETECCIÓN DE BUJÍAS
  const isSparkPlugQuestion =
    query.includes('bujía') ||
    query.includes('bujia') ||
    query.includes('bujias') ||
    query.includes('iridio') ||
    query.includes('platino') ||
    query.includes('cobre') ||
    query.includes('calibracion') ||
    query.includes('calibración');

  // 4. DETECCIÓN DE COTIZACIÓN O PRESUPUESTO
  const isQuoteQuestion =
    query.includes('cotiz') ||
    query.includes('presupuesto') ||
    query.includes('costo') ||
    query.includes('precio') ||
    query.includes('cuanto sale') ||
    query.includes('cuánto sale') ||
    query.includes('afinacion') ||
    query.includes('afinación') ||
    query.includes('servicio mayor') ||
    query.includes('servicio menor') ||
    query.includes('frenos');

  // 5. DETECCIÓN DE MANTENIMIENTO PREVENTIVO POR KILOMETRAJE
  const isPreventiveMileageQuestion =
    query.includes('km') ||
    query.includes('kilometraje') ||
    query.includes('mantenimiento') ||
    query.includes('cuando le toca') ||
    query.includes('cuándo le toca') ||
    query.includes('cada cuanto') ||
    query.includes('cada cuánto');

  // Buscar si el texto menciona un vehículo de nuestra base técnica
  const matchedSpec = findVehicleSpec(query) || (context?.activeOrder ? findVehicleSpec(context.activeOrder.vehicle.make + ' ' + context.activeOrder.vehicle.model) : null);

  // CASO A: SOLICITA COTIZACIÓN PERO FALTAN DATOS CLAVE (Marca, Modelo, Año o Motor)
  if (isQuoteQuestion && !matchedSpec) {
    const mentionsYear = /\b(19\d\d|20\d\d)\b/.test(query);
    const mentionsEngine = /\b(\d\.\d[l]?|v6|v8|turbo|tsi)\b/i.test(query);

    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: `Hola. Con gusto te preparo una cotización técnica exacta y sin errores.\n\n` +
        `Para garantizar la máxima precisión automotriz (evitando fallas de lubricación por viscosidad errónea o bujías incompatibles), por favor indícame los datos clave de tu vehículo:\n\n` +
        `1. **Marca y Submarca:** (ej. Nissan Versa, VW Jetta, Chevrolet Aveo)\n` +
        `2. **Año o Generación:** (ej. 2018, 2021)\n` +
        `3. **Motorización:** (ej. 1.6L 4 Cils, 1.4 TSI Turbo, 2.5L, etc.)\n\n` +
        `*En cuanto me proporciones estos datos, te entregaré el desglose oficial con tipo de aceite, litros exactos, bujías y baremo de horas.*`,
      suggestedActions: [
        { label: 'Ejemplo: Nissan Versa 1.6L 2021', actionText: 'Cotizar afinación mayor para Nissan Versa 1.6L 2021' },
        { label: 'Ejemplo: VW Jetta 1.4 TSI 2020', actionText: 'Cotizar afinación para VW Jetta 1.4 TSI 2020' },
        { label: 'Ejemplo: Chevrolet Aveo 1.5L 2019', actionText: 'Cotizar afinación para Chevrolet Aveo 1.5L 2019' },
      ],
    };
  }

  // CASO B: COTIZACIÓN ESTRUCTURADA CON DATOS VEHICULARES DETECTADOS
  if ((isQuoteQuestion || query.includes('afinacion') || query.includes('afinación')) && matchedSpec) {
    const isMajor = query.includes('mayor') || !query.includes('menor');
    const serviceName = isMajor ? 'Afinación Mayor Preventiva' : 'Afinación Menor (Cambio de Fluidos y Filtro)';
    const hours = isMajor ? matchedSpec.typicalMajorTuneupHours : matchedSpec.typicalMinorTuneupHours;
    const complexityText = isMajor ? (hours > 2.5 ? 'Media - 3.0 a 3.5 hrs' : 'Media - 2.5 hrs') : 'Baja - 1.5 hrs';

    const partsList: string[] = [
      `Aceite de motor: ${matchedSpec.oilViscosity} (${matchedSpec.oilCapacityWithFilter}) bajo norma ${matchedSpec.oilStandard}`,
      `Filtro de aceite: ${matchedSpec.oilFilterType}`,
      `Filtro de aire motor: ${matchedSpec.airFilterType}`,
      `Bujías de encendido: ${matchedSpec.sparkPlugCount} bujías de ${matchedSpec.sparkPlugType} (Calibración: ${matchedSpec.sparkPlugGap})`,
      `Limpieza de cuerpo de aceleración con solvente dieléctrico y recalibración electrónica con escáner`,
      `Limpieza presurizada de inyectores con boya y presurizador de riel`,
      `Inspección de seguridad en 55 puntos (frenos, suspensión, niveles y batería)`,
    ];

    if (!isMajor) {
      // Afinación menor excluye bujías e inyectores
      partsList.splice(3, 3);
    }

    const replyText =
      `A continuación tienes el desglose técnico oficial para tu cotización:\n\n` +
      `- **Vehículo:** ${matchedSpec.make} ${matchedSpec.model} (${matchedSpec.engine}, Años: ${matchedSpec.years})\n` +
      `- **Servicio:** ${serviceName}\n` +
      `- **Insumos y Piezas Requeridas:**\n` +
      partsList.map((p) => `  • ${p}`).join('\n') + `\n` +
      `- **Complejidad / Tiempo estimado:** ${complexityText}\n` +
      (matchedSpec.notes ? `\n⚠️ **Nota Técnica del Fabricante:** ${matchedSpec.notes}\n` : '\n') +
      `\n> **Nota de Validación Física:** Los costos definitivos se confirman tras la inspección física en el taller.\n\n` +
      `- **Siguientes pasos:** Te invitamos a generar la **Orden de Trabajo formal** en recepción o agendar cita para apartar bahía y asegurar tus refacciones con garantía por escrito.`;

    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: replyText,
      structuredQuote: {
        vehicle: `${matchedSpec.make} ${matchedSpec.model} ${matchedSpec.engine}`,
        service: serviceName,
        parts: partsList,
        complexity: complexityText,
        estimatedHours: `${hours} hrs`,
        disclaimer: 'Los costos definitivos se confirman tras la inspección física en el taller.',
        nextSteps: 'Invitación a generar la Orden de Trabajo formal en recepción.',
      },
      suggestedActions: [
        { label: '¿Cuándo le tocan las bujías?', actionText: `¿Cada cuánto se cambian las bujías de un ${matchedSpec.make} ${matchedSpec.model}?` },
        { label: '¿Tiene banda o cadena de tiempo?', actionText: `¿El ${matchedSpec.make} ${matchedSpec.model} tiene banda o cadena de distribución?` },
      ],
    };
  }

  // CASO C: PREGUNTA ESPECÍFICA DE ACEITE / LITROS
  if (isOilQuestion && matchedSpec) {
    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: `🛢️ **Especificación Oficial de Lubricación:**\n\n` +
        `• **Vehículo:** ${matchedSpec.make} ${matchedSpec.model} (${matchedSpec.engine})\n` +
        `• **Viscosidad recomendada:** **${matchedSpec.oilViscosity}**\n` +
        `• **Norma / Certificación:** ${matchedSpec.oilStandard}\n` +
        `• **Capacidad de cárter con filtro:** **${matchedSpec.oilCapacityWithFilter}**\n` +
        `• **Tipo de filtro:** ${matchedSpec.oilFilterType}\n\n` +
        `⚠️ **Directriz Técnica de Sr. Mecánico:** En motores modernos con apertura variable de válvulas (VVT, VTC, Dual VVT-i), **nunca se debe utilizar aceite grueso (como 20W-50)**, ya que los solenoides y actuadores hidráulicos requieren una película fina para cargar a tiempo. Usar un aceite no certificado provoca ruido de punterías y activa el código *Check Engine*.\n\n` +
        `> **Nota:** La medición final de nivel se valida físicamente en bayoneta tras encender 30 segundos el motor en bahía.`,
      suggestedActions: [
        { label: 'Cotizar afinación completa', actionText: `Cotizar afinación mayor para ${matchedSpec.make} ${matchedSpec.model}` },
        { label: '¿Qué bujías lleva?', actionText: `¿Qué bujías lleva el ${matchedSpec.make} ${matchedSpec.model}?` },
      ],
    };
  }

  // CASO D: PREGUNTA ESPECÍFICA DE BUJÍAS
  if (isSparkPlugQuestion && matchedSpec) {
    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: `⚡ **Especificación Oficial de Bujías:**\n\n` +
        `• **Vehículo:** ${matchedSpec.make} ${matchedSpec.model} (${matchedSpec.engine})\n` +
        `• **Tipo de bujía:** **${matchedSpec.sparkPlugType}**\n` +
        `• **Cantidad exacta requerida:** **${matchedSpec.sparkPlugCount} bujías** (una por cada cilindro)\n` +
        `• **Calibración recomendada:** ${matchedSpec.sparkPlugGap}\n` +
        `• **Intervalo de reemplazo:** Cada **${matchedSpec.sparkPlugIntervalKm}**\n\n` +
        `*Consejo Técnico:* Las bujías de Iridio y Platino vienen calibradas de fábrica con electrodo ultrafino; no se deben raspar ni forzar con calibradores convencionales para evitar dañar el recubrimiento de metal precioso.`,
      suggestedActions: [
        { label: 'Cotizar afinación completa', actionText: `Cotizar afinación mayor para ${matchedSpec.make} ${matchedSpec.model}` },
        { label: 'Ver capacidad de aceite', actionText: `¿Qué aceite y cuántos litros lleva ${matchedSpec.make} ${matchedSpec.model}?` },
      ],
    };
  }

  // CASO E: RECOMENDACIONES PREVENTIVAS POR KILOMETRAJE
  if (isPreventiveMileageQuestion) {
    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: `🛡️ **Tabla Maestra de Mantenimiento Preventivo por Kilometraje:**\n\n` +
        `• **Cada 5,000 km a 10,000 km (Servicio Menor):**\n` +
        `  - Cambio de aceite 100% sintético con filtro de alta retención.\n` +
        `  - Rotación y balanceo de llantas, calibración de presión.\n` +
        `  - Relleno de fluidos (frenos, anticongelante, limpiaparabrisas).\n\n` +
        `• **Cada 20,000 km:**\n` +
        `  - Cambio de filtro de aire de motor y filtro de polen / cabina.\n` +
        `  - Limpieza y ajuste de frenos traseros (tambores o discos).\n` +
        `  - Inspección de pastillas de freno delanteras (grosor mínimo 3mm).\n\n` +
        `• **Cada 40,000 km a 60,000 km (Servicio Mayor Profundo):**\n` +
        `  - Cambio de bujías (Platino o Iridio según fabricante).\n` +
        `  - Reemplazo total de líquido de frenos (DOT 3 / DOT 4) para evitar humedad.\n` +
        `  - Limpieza de inyectores por ultrasonido o boya presurizada.\n` +
        `  - Servicio de fluido de transmisión automática (CVT / ATF) o estándar.\n\n` +
        `• **Cada 80,000 km a 100,000 km:**\n` +
        `  - Sustitución de banda de distribución (en motores que no cuenten con cadena).\n` +
        `  - Drenado y reemplazo de anticongelante larga duración (OAT).\n` +
        `  - Reemplazo de bujías de Iridio Láser.\n\n` +
        `> **Nota:** En Sr. Mecánico realizamos la **Inspección de 55 Puntos** en cada visita sin costo para confirmar el estado real de tus componentes.`,
      suggestedActions: [
        { label: 'Cotizar afinación Nissan Versa', actionText: 'Cotizar afinación mayor para Nissan Versa 1.6L 2021' },
        { label: 'Consultar aceite Jetta 1.4 TSI', actionText: '¿Qué aceite y cuántos litros lleva un VW Jetta 1.4 TSI?' },
      ],
    };
  }

  // CASO F: PREGUNTA GENERAL SOBRE ACEITES GRUESOS (20W-50 en motores modernos)
  if (query.includes('20w-50') || query.includes('aceite grueso') || query.includes('aceite mineral')) {
    return {
      id: messageId,
      sender: 'assistant',
      timestamp: now,
      text: `⚠️ **Dictamen Técnico de Sr. Mecánico sobre Aceites Gruesos:**\n\n` +
        `Existe el mito de que a los 100,000 km se debe pasar a un aceite grueso como el **20W-50**. Esto es **completamente perjudicial** en motores modernos (2005 en adelante):\n\n` +
        `1. **Galerías de lubricación estrechas:** Los motores VVT (apertura variable de válvulas) tienen conductos milimétricos. El aceite 20W-50 tarda hasta 30 segundos en llegar a la parte alta del motor al arrancar en frío, provocando desgaste severo.\n` +
        `2. **Solenoides trabados:** Los actuadores de los árboles de levas operan por presión de aceite precisa; un aceite denso retrasa el tiempo de encendido y causa pérdida de potencia.\n` +
        `3. **Norma correcta:** Si el motor fue diseñado para **0W-20 o 5W-30 Full Sintético**, debe mantenerse en esa viscosidad toda su vida útil, realizando los cambios en su intervalo programado.\n\n` +
        `¿Deseas verificar la viscosidad exacta de algún vehículo en particular?`,
      suggestedActions: [
        { label: 'Ver aceite para Nissan Versa', actionText: '¿Qué aceite y cuántos litros lleva Nissan Versa?' },
        { label: 'Ver aceite para Chevrolet Aveo', actionText: '¿Qué aceite y cuántos litros lleva Chevrolet Aveo?' },
      ],
    };
  }

  // RESPUESTA GENERAL ASISTIDA POR DEFECTO
  return {
    id: messageId,
    sender: 'assistant',
    timestamp: now,
    text: `Hola, soy el **Asistente Técnico Inteligente de Sr. Mecánico**.\n\n` +
      `Estoy programado con las especificaciones exactas de fabricantes automotrices (viscosidades SAE, bujías por cilindros, capacidades de cárter e intervalos baremo) para brindarte cotizaciones precisas y orientación técnica confiable.\n\n` +
      `¿En qué puedo ayudarte hoy?\n` +
      `• **Cotizar un servicio o afinación:** (Indícame Marca, Modelo, Año y Motor)\n` +
      `• **Consultar viscosidad y litros de aceite** para un motor específico\n` +
      `• **Revisar estatus de tu orden** activa en el taller\n` +
      `• **Consultar mantenimiento preventivo** según kilometraje`,
    suggestedActions: [
      { label: 'Cotizar afinación Versa 1.6L', actionText: 'Cotizar afinación mayor para Nissan Versa 1.6L 2021' },
      { label: 'Aceite para Jetta 1.4 TSI', actionText: '¿Qué aceite y cuántos litros lleva un VW Jetta 1.4 TSI?' },
      { label: 'Mantenimiento por km', actionText: '¿Qué mantenimiento preventivo se recomienda por kilometraje?' },
      { label: 'Estatus de mi orden', actionText: '¿Cuál es el estatus de mi orden en el taller?' },
    ],
  };
}
