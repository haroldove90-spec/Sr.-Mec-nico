/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoleId, VehicleServiceOrder } from './types';
import { INITIAL_ORDERS, INITIAL_55_INSPECTION_POINTS } from './data/initialData';

// Common Components
import { RoleSelector } from './components/roles/RoleSelector';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';

// Modules
import { M1Reception } from './components/modules/M1Reception';
import { M2Inspection55 } from './components/modules/M2Inspection55';
import { M3QuoteAuthorization } from './components/modules/M3QuoteAuthorization';
import { M4WorkshopEvidence } from './components/modules/M4WorkshopEvidence';
import { M4PurchasesAudit } from './components/modules/M4PurchasesAudit';
import { M5CashierBilling } from './components/modules/M5CashierBilling';
import { M5VehicleDelivery } from './components/modules/M5VehicleDelivery';
import { M6CRMProductivity } from './components/modules/M6CRMProductivity';

// 16-Step Linear Protocol View
import { LinearWorkflowView } from './components/workflow/LinearWorkflowView';

const STORAGE_KEY_ORDERS = 'sr_mecanico_orders_v1';
const STORAGE_KEY_ROLE = 'sr_mecanico_active_role_v1';

export default function App() {
  // Start with null to show the clean Start Screen (Selector de Roles sin header ni descripciones)
  const [activeRole, setActiveRole] = useState<RoleId | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    return saved ? (saved as RoleId) : null;
  });

  const [activeModule, setActiveModule] = useState<string>('m1_reception');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Orders State with localStorage persistence
  const [orders, setOrders] = useState<VehicleServiceOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading orders from localStorage', e);
      }
    }
    return INITIAL_ORDERS;
  });

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    orders[0]?.id || 'ord-101'
  );

  // Persist orders to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  // Set default module when role changes
  const handleSelectRole = (role: RoleId) => {
    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY_ROLE, role);

    switch (role) {
      case 'front_desk':
        setActiveModule('m1_reception');
        break;
      case 'mechanic':
        setActiveModule('m2_inspection');
        break;
      case 'admin':
        setActiveModule('m4_purchases');
        break;
      case 'director':
        setActiveModule('m6_crm_director');
        break;
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
    localStorage.removeItem(STORAGE_KEY_ROLE);
  };

  // Find currently active order
  const currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleUpdateCurrentOrder = (updated: VehicleServiceOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  // Create new vehicle service order
  const handleCreateNewOrder = () => {
    const newNumber = `SM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = `ord-${Date.now()}`;

    const newOrder: VehicleServiceOrder = {
      id: newId,
      orderNumber: newNumber,
      currentStep: 1,
      status: 'en_recepcion',
      createdAt: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      customer: {
        name: 'Nuevo Cliente',
        phone: '55 1234 5678',
        email: 'cliente@ejemplo.com',
        fiscalData: {
          rfc: 'XAXX010101000',
          razonSocial: 'PUBLICO EN GENERAL',
          regimenFiscal: '616 - Sin obligaciones fiscales',
          codigoPostal: '01000',
          direccion: 'Ciudad de México, CDMX',
          correo: 'cliente@ejemplo.com',
          whatsapp: '+525512345678',
          usoCFDI: 'S01 - Sin efectos fiscales',
        },
      },
      vehicle: {
        make: 'Nissan',
        model: 'Versa Sense',
        year: 2023,
        plate: 'NUE-01-26',
        vin: '3N1CN7AP5PL' + Math.floor(100000 + Math.random() * 900000),
        color: 'Plata',
        mileage: 32400,
        fuelLevelPercent: 50,
      },
      aestheticPhotos: [],
      initialTestDrive: {
        completed: false,
        testerName: '',
        odometer: 32400,
        vibrations: false,
        noises: false,
        brakingGood: true,
        steeringAlignment: true,
        notes: '',
      },
      inspectionPoints: INITIAL_55_INSPECTION_POINTS.map((pt) => ({
        ...pt,
        status: 'uninspected' as const,
        notes: '',
      })),
      parts: [
        {
          id: `p-${Date.now()}-1`,
          name: 'Servicio de Afinación Menor (Aceite y Filtros)',
          description: 'Reemplazo de aceite sintético 5W-30 y filtro de aceite.',
          damagedPhotoUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
          installedPhotoUrl: '',
          cost: 1850,
          laborCost: 450,
          urgency: 'preventivo',
          approved: true,
          supplier: 'Refaccionaria California',
          purchaseCost: 1100,
        },
      ],
      diagnosisSummary: 'Recepción inicial para servicio preventivo y revisión de 55 puntos.',
      clientAuthorized: false,
      workOrderGenerated: false,
      timeSpentMinutes: 0,
      isTimerRunning: false,
      finalTestDrive: {
        completed: false,
        testerName: '',
        odometer: 0,
        vibrations: false,
        noises: false,
        brakingGood: false,
        steeringAlignment: false,
        notes: '',
      },
      correctionsRequired: false,
      correctionsCompleted: false,
      walkAroundCompleted: false,
      paymentSettled: false,
      delivered: false,
      oldPartsReturned: false,
      followUp2DaysSent: false,
      alert15DaysSent: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newId);
    setActiveModule('m1_reception');
  };

  // 1. Start Screen: Selector limpio con tarjetas independientes para cada rol (Sin header, sin descripciones, solo nombre del rol)
  if (!activeRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  // 2. Active Role Dashboard View
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Unified Institutional Header */}
      <Header
        activeRole={activeRole}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpen16Steps={() => setActiveModule('linear_16_steps')}
        activeOrderNumber={currentOrder?.orderNumber}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeRole={activeRole}
          activeModule={activeModule}
          onSelectModule={(mod) => setActiveModule(mod)}
          orders={orders}
          selectedOrderId={selectedOrderId}
          onSelectOrder={(id) => setSelectedOrderId(id)}
          onNewOrder={handleCreateNewOrder}
          onOpen16Steps={() => setActiveModule('linear_16_steps')}
        />

        {/* Main Content Area (Clean, single navigation hierarchy without repetitive horizontal tabs) */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6 lg:ml-72 sm:lg:ml-80 pb-24 lg:pb-12">
          {/* 16-Step Continuous Protocol View */}
          {activeModule === 'linear_16_steps' && currentOrder && (
            <LinearWorkflowView
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
              onBackToDashboard={() => {
                switch (activeRole) {
                  case 'front_desk':
                    setActiveModule('m1_reception');
                    break;
                  case 'mechanic':
                    setActiveModule('m2_inspection');
                    break;
                  case 'admin':
                    setActiveModule('m4_purchases');
                    break;
                  case 'director':
                    setActiveModule('m6_crm_director');
                    break;
                }
              }}
            />
          )}

          {/* M1: Recepción e Historial Clínico */}
          {activeModule === 'm1_reception' && currentOrder && (
            <M1Reception
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m2_inspection')}
            />
          )}

          {/* M2: Inspección de 55 Puntos */}
          {activeModule === 'm2_inspection' && currentOrder && (
            <M2Inspection55
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m3_quote')}
            />
          )}

          {/* M3: Cotización Dinámica y Autorización */}
          {activeModule === 'm3_quote' && currentOrder && (
            <M3QuoteAuthorization
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m4_workshop')}
            />
          )}

          {/* M4: Taller, Evidencia y Cronómetro */}
          {activeModule === 'm4_workshop' && currentOrder && (
            <M4WorkshopEvidence
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m4_purchases')}
            />
          )}

          {/* M4-A: Compras y Auditoría Anti-Robo */}
          {activeModule === 'm4_purchases' && currentOrder && (
            <M4PurchasesAudit
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m5_billing')}
            />
          )}

          {/* M5-C: Caja y Facturación CFDI */}
          {activeModule === 'm5_billing' && currentOrder && (
            <M5CashierBilling
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m5_delivery')}
            />
          )}

          {/* M5-E: Entrega de Vehículo y Firma */}
          {activeModule === 'm5_delivery' && currentOrder && (
            <M5VehicleDelivery
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m6_crm_director')}
            />
          )}

          {/* M6: Director General, Productividad y CRM */}
          {activeModule === 'm6_crm_director' && currentOrder && (
            <M6CRMProductivity
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
            />
          )}
        </main>
      </div>

      {/* Tactile Bottom Navigation Bar for Mobile and Tablet */}
      <BottomNav
        activeRole={activeRole}
        activeModule={activeModule}
        onSelectModule={(mod) => setActiveModule(mod)}
        onOpen16Steps={() => setActiveModule('linear_16_steps')}
      />
    </div>
  );
}
