export type RoleId = 'front_desk' | 'mechanic' | 'admin' | 'director';

export interface RoleInfo {
  id: RoleId;
  name: string;
  badge: string;
  modules: string[];
}

export type InspectionStatus = 'green' | 'yellow' | 'red' | 'uninspected';

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: InspectionStatus;
  notes?: string;
  photoUrl?: string;
}

export interface AestheticPhoto {
  view: 'frontal' | 'trasera' | 'lateral_izq' | 'lateral_der' | 'odometro_gas' | 'otro';
  label: string;
  url: string;
  timestamp: string;
}

export interface DamagedPart {
  id: string;
  name: string;
  description: string;
  damagedPhotoUrl: string;
  installedPhotoUrl?: string;
  cost: number;
  laborCost: number;
  urgency: 'urgente' | 'preventivo' | 'recomendado';
  approved: boolean;
  // Purchase & anti-theft audit
  supplier?: string;
  purchaseCost?: number;
  invoiceNumber?: string;
  installedBy?: string;
  installedTimestamp?: string;
  auditVerified?: boolean;
}

export interface CustomerFiscalData {
  rfc: string;
  razonSocial: string;
  regimenFiscal: string;
  codigoPostal: string;
  direccion: string;
  correo: string;
  whatsapp: string;
  usoCFDI: string;
}

export interface TestDriveRecord {
  completed: boolean;
  testerName: string;
  odometer: number;
  vibrations: boolean;
  noises: boolean;
  brakingGood: boolean;
  steeringAlignment: boolean;
  notes: string;
  timestamp?: string;
}

export interface CFDIInvoice {
  uuid: string;
  folio: string;
  fechaEmision: string;
  rfcEmisor: string;
  razonSocialEmisor: string;
  rfcReceptor: string;
  razonSocialReceptor: string;
  subtotal: number;
  iva: number;
  total: number;
  metodoPago: 'PUE' | 'PPD';
  formaPago: '01 Efectivo' | '04 Tarjeta de Crédito' | '28 Tarjeta de Débito' | '03 Transferencia SPEI';
  selloDigital: string;
  cadenaOriginal: string;
}

export interface VehicleServiceOrder {
  id: string;
  orderNumber: string;
  currentStep: number; // 1 to 16
  status: 'en_recepcion' | 'inspeccion' | 'cotizacion' | 'en_taller' | 'auditoria' | 'por_entregar' | 'completado';
  createdAt: string;
  
  // Customer & Vehicle
  customer: {
    name: string;
    phone: string;
    email: string;
    fiscalData: CustomerFiscalData;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    plate: string;
    vin: string;
    color: string;
    mileage: number;
    fuelLevelPercent: number;
  };

  // Step 2: Aesthetic photos
  aestheticPhotos: AestheticPhoto[];

  // Step 3: Initial test drive
  initialTestDrive: TestDriveRecord;

  // Step 4: 55-point inspection
  inspectionPoints: InspectionItem[];

  // Step 5 & 6 & 7: Parts & Diagnosis
  parts: DamagedPart[];
  diagnosisSummary: string;
  clientAuthorized: boolean;
  clientAuthTimestamp?: string;

  // Step 8 & 9: Work order & Mechanic
  assignedMechanicId?: string;
  assignedMechanicName?: string;
  workOrderGenerated: boolean;
  timeSpentMinutes: number;
  isTimerRunning: boolean;
  timerStartedAt?: number;

  // Step 10: Final test drive
  finalTestDrive: TestDriveRecord;

  // Step 11: Corrections
  correctionsRequired: boolean;
  correctionsNotes?: string;
  correctionsCompleted: boolean;

  // Step 12: Walk-around
  walkAroundCompleted: boolean;
  walkAroundNotes?: string;

  // Step 13: Payment & CFDI
  paymentSettled: boolean;
  paymentMethod?: string;
  invoice?: CFDIInvoice;

  // Step 14: Delivery & signature
  delivered: boolean;
  deliveryTimestamp?: string;
  oldPartsReturned: boolean; // Acceptance that used parts (filters, spark plugs) were handed over
  digitalSignatureUrl?: string; // canvas drawing data URL
  receiverName?: string;

  // Step 15: Post-service 2-day follow-up
  followUp2DaysSent: boolean;
  followUp2DaysTimestamp?: string;

  // Step 16: 15-day pre-maintenance alert
  alert15DaysSent: boolean;
  alert15DaysTimestamp?: string;
  nextScheduledDate?: string;
}

export interface MechanicPerformance {
  id: string;
  name: string;
  specialty: string;
  carsCompleted: number;
  avgTimeMinutes: number;
  standardTargetMinutes: number;
  baseSalary: number;
  commissionRatePercent: number;
  totalCommissions: number;
  warrantyCount: number; // retrabajos
  warrantyRatePercent: number;
  status: 'excelente' | 'normal' | 'alerta';
}
