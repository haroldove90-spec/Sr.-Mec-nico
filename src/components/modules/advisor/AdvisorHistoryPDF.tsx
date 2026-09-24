import React, { useState } from 'react';
import {
  History,
  Search,
  FileDown,
  Eye,
  Car,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X,
  ShieldCheck,
  Receipt,
  Camera,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { VehicleServiceOrder } from '../../../types';

interface AdvisorHistoryPDFProps {
  orders: VehicleServiceOrder[];
  onSelectOrder: (orderId: string) => void;
}

export const AdvisorHistoryPDF: React.FC<AdvisorHistoryPDFProps> = ({
  orders,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<VehicleServiceOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      o.vehicle.plate.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.vehicle.make.toLowerCase().includes(q) ||
      o.vehicle.model.toLowerCase().includes(q) ||
      o.vehicle.vin.toLowerCase().includes(q)
    );
  });

  // Exportar expediente a PDF institucional con jsPDF
  const handleExportPDF = (order: VehicleServiceOrder) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Colores institucionales
    const primaryColor = '#1A253B';
    const orangeColor = '#D05E28';

    // Membrete Superior
    doc.setFillColor(26, 37, 59); // #1A253B
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SR. MECÁNICO - EXPEDIENTE CLÍNICO DE SERVICIO', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Folio: ${order.orderNumber} | Fecha: ${order.createdAt}`, 135, 15);

    // Banda naranja divisoria
    doc.setFillColor(208, 94, 40); // #D05E28
    doc.rect(0, 24, 210, 2.5, 'F');

    let y = 35;

    // 1. Datos del Cliente y SAT
    doc.setTextColor(26, 37, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. DATOS DEL CLIENTE Y FACTURACIÓN FISCAL', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Propietario: ${order.customer.name}`, 14, y);
    doc.text(`Teléfono / WhatsApp: ${order.customer.fiscalData.whatsapp || order.customer.phone}`, 110, y);
    y += 5;
    doc.text(`RFC: ${order.customer.fiscalData.rfc || 'No registrado'}`, 14, y);
    doc.text(`Correo: ${order.customer.email}`, 110, y);
    y += 5;
    doc.text(`Razón Social: ${order.customer.fiscalData.razonSocial || order.customer.name}`, 14, y);
    doc.text(`Código Postal: ${order.customer.fiscalData.codigoPostal || 'N/A'}`, 110, y);
    y += 9;

    // 2. Datos del Vehículo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. FICHA TÉCNICA DEL AUTOMÓVIL', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Vehículo: ${order.vehicle.make} ${order.vehicle.model} (${order.vehicle.year})`, 14, y);
    doc.text(`Placas: ${order.vehicle.plate}`, 110, y);
    y += 5;
    doc.text(`Color: ${order.vehicle.color}`, 14, y);
    doc.text(`Kilometraje: ${order.vehicle.mileage.toLocaleString()} km`, 110, y);
    y += 5;
    doc.text(`Número de Serie / VIN: ${order.vehicle.vin}`, 14, y);
    doc.text(`Nivel de Combustible: ${order.vehicle.fuelLevelPercent}%`, 110, y);
    y += 9;

    // 3. Diagnóstico y Dictamen
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. DICTAMEN TÉCNICO Y DIAGNÓSTICO', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const diagLines = doc.splitTextToSize(
      order.diagnosisSummary || 'Inspección técnica general concluida sin fallas críticas.',
      180
    );
    doc.text(diagLines, 14, y);
    y += diagLines.length * 5 + 4;

    // 4. Refacciones y Trabajos Autorizados
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. REFACCIONES Y SERVICIOS INSTALADOS', 14, y);
    y += 6;

    // Cabecera de tabla
    doc.setFillColor(245, 247, 250);
    doc.rect(14, y - 4, 182, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto / Refacción', 16, y);
    doc.text('Urgencia', 95, y);
    doc.text('Pieza ($)', 130, y);
    doc.text('M.O. ($)', 155, y);
    doc.text('Total ($)', 175, y);
    y += 6;

    const parts = (order.parts || []).filter((p) => p.approved);
    doc.setFont('helvetica', 'normal');
    let subtotalParts = 0;
    let subtotalLabor = 0;

    parts.forEach((p) => {
      const partTotal = p.cost + p.laborCost;
      subtotalParts += p.cost;
      subtotalLabor += p.laborCost;

      doc.text(p.name.substring(0, 38), 16, y);
      doc.text(p.urgency.toUpperCase(), 95, y);
      doc.text(`$${p.cost.toLocaleString()}`, 130, y);
      doc.text(`$${p.laborCost.toLocaleString()}`, 155, y);
      doc.text(`$${partTotal.toLocaleString()}`, 175, y);
      y += 5;
    });

    if (parts.length === 0) {
      doc.text('Mantenimiento preventivo general y diagnóstico de rutina.', 16, y);
      y += 5;
    }

    const subtotal = subtotalParts + subtotalLabor;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    y += 3;
    doc.line(14, y, 196, y);
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal: $${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 125, y);
    y += 5;
    doc.text(`IVA (16%): $${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 125, y);
    y += 6;
    doc.setTextColor(208, 94, 40);
    doc.setFontSize(11);
    doc.text(`TOTAL FACTURADO: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 115, y);
    y += 10;

    // 5. Estado de Entrega y Firma
    doc.setTextColor(26, 37, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('5. CONFORMIDAD Y ENTREGA DE VEHÍCULO', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('El cliente manifiesta haber recibido su vehículo a entera satisfacción con recorrido de niveles y piezas sustituidas.', 14, y);
    y += 7;

    // Cuadro de firma
    doc.rect(14, y, 80, 20);
    doc.text(`Recibió: ${order.receiverName || order.customer.name}`, 16, y + 5);
    doc.text(`Firma Digital Registrada: ${order.delivered ? 'VÁLIDA' : 'PENDIENTE'}`, 16, y + 10);
    doc.text(`Fecha: ${order.deliveryTimestamp || 'En proceso'}`, 16, y + 15);

    // Pie de página oficial
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Documento emitido por Sr. Mecánico - Software de Gestión de Talleres Automotrices de Alta Eficiencia.',
      14,
      285
    );

    // Descarga directa
    doc.save(`Expediente_Clinico_${order.vehicle.plate}_${order.orderNumber}.pdf`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D05E28] block mb-1">
            Recepción y Asesor • Archivo Clínico
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A253B]">
            Historial de Automóviles y Expedientes
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Consulta integral, expediente clínico y exportación directa en PDF de cada auto recibido.
          </p>
        </div>
      </div>

      {/* Buscador Rápido */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por placa, cliente, modelo o folio de orden..."
          className="w-full text-base bg-transparent text-[#1A253B] placeholder-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Listado de Automóviles Recibidos */}
      <div className="space-y-4">
        {filteredOrders.map((ord) => {
          const totalCost = (ord.parts || [])
            .filter((p) => p.approved)
            .reduce((acc, p) => acc + p.cost + p.laborCost, 0) * 1.16;

          return (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-[#D05E28]/40 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#D05E28] shrink-0">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg sm:text-xl text-[#1A253B]">
                        {ord.vehicle.make} {ord.vehicle.model} ({ord.vehicle.year})
                      </h3>
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#1A253B]">
                        {ord.vehicle.plate}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Cliente: <strong className="text-slate-700">{ord.customer.name}</strong> • Folio: <span className="font-mono">{ord.orderNumber}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ord.delivered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.delivered ? '✓ Entregado' : `En Proceso (Paso ${ord.currentStep})`}
                  </span>
                </div>
              </div>

              {/* Métricas del auto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400 block">Kilometraje</span>
                  <strong className="text-base text-[#1A253B]">{ord.vehicle.mileage.toLocaleString()} km</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Fotos Estéticas</span>
                  <strong className="text-base text-[#1A253B]">{ord.aestheticPhotos.length} registradas</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Refacciones</span>
                  <strong className="text-base text-[#1A253B]">{ord.parts.length} diagnosticadas</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Inversión Total</span>
                  <strong className="text-base text-[#D05E28] font-black">
                    ${totalCost.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                  </strong>
                </div>
              </div>

              {/* Botones de acción: Consultar y Exportar PDF */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => onSelectOrder(ord.id)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold cursor-pointer"
                >
                  Abrir en Taller Activo
                </button>

                <button
                  onClick={() => setSelectedOrderForModal(ord)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1A253B] text-sm font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#D05E28]" />
                  <span>Ver Expediente</span>
                </button>

                <button
                  onClick={() => handleExportPDF(ord)}
                  className="px-5 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Expediente Clínico Completo */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-black text-xl text-[#1A253B]">
                  Expediente Clínico: {selectedOrderForModal.vehicle.plate}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Folio: {selectedOrderForModal.orderNumber} • {selectedOrderForModal.vehicle.make} {selectedOrderForModal.vehicle.model}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportPDF(selectedOrderForModal)}
                  className="px-4 py-2 rounded-xl bg-[#D05E28] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Cliente y SAT */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-sm">
                <h4 className="font-bold text-base text-[#1A253B]">Datos del Cliente</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p><strong>Nombre:</strong> {selectedOrderForModal.customer.name}</p>
                  <p><strong>Teléfono:</strong> {selectedOrderForModal.customer.phone}</p>
                  <p><strong>RFC:</strong> {selectedOrderForModal.customer.fiscalData.rfc || 'Sin RFC'}</p>
                  <p><strong>Razón Social:</strong> {selectedOrderForModal.customer.fiscalData.razonSocial || 'N/A'}</p>
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-3">
                <h4 className="font-bold text-base text-[#1A253B]">Fotos de Estado Estético ({selectedOrderForModal.aestheticPhotos.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {selectedOrderForModal.aestheticPhotos.map((f, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={f.url} alt={f.label} className="w-full h-24 object-cover" />
                      <div className="p-1.5 text-center text-xs font-semibold text-slate-700 bg-white truncate">
                        {f.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dictamen */}
              <div className="space-y-2">
                <h4 className="font-bold text-base text-[#1A253B]">Dictamen Técnico</h4>
                <p className="text-sm text-slate-700 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
                  {selectedOrderForModal.diagnosisSummary || 'Inspección de 55 puntos sin novedades mayores.'}
                </p>
              </div>

              {/* Refacciones */}
              <div className="space-y-3">
                <h4 className="font-bold text-base text-[#1A253B]">Refacciones y Servicios</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedOrderForModal.parts.map((p) => (
                    <div key={p.id} className="p-3 bg-white flex items-center justify-between text-sm">
                      <div>
                        <strong className="text-[#1A253B]">{p.name}</strong>
                        <span className="text-xs text-slate-500 block">{p.description}</span>
                      </div>
                      <span className="font-bold text-[#1A253B]">
                        ${(p.cost + p.laborCost).toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
