/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RoleId, VehicleServiceOrder, AdvisorMovement } from './types';
import { INITIAL_ORDERS, INITIAL_55_INSPECTION_POINTS } from './data/initialData';

// Common Components
import { RoleSelector } from './components/roles/RoleSelector';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';

// Modules for Advisor (Recepción y Asesor)
import { AdvisorMetrics } from './components/modules/advisor/AdvisorMetrics';
import { AdvisorRegistrationFlow } from './components/modules/advisor/AdvisorRegistrationFlow';
import { AdvisorHistoryPDF } from './components/modules/advisor/AdvisorHistoryPDF';

// Other Role Modules
import { M1Reception } from './components/modules/M1Reception';
import { M2Inspection55 } from './components/modules/M2Inspection55';
import { M3QuoteAuthorization } from './components/modules/M3QuoteAuthorization';
import { M4WorkshopEvidence } from './components/modules/M4WorkshopEvidence';
import { M4PurchasesAudit } from './components/modules/M4PurchasesAudit';
import { M5CashierBilling } from './components/modules/M5CashierBilling';
import { M5VehicleDelivery } from './components/modules/M5VehicleDelivery';
import { M6CRMProductivity } from './components/modules/M6CRMProductivity';
import { ClientPortal } from './components/modules/ClientPortal';
import { ClientLoginView } from './components/modules/ClientLoginView';

// 16-Step Linear Protocol View
import { LinearWorkflowView } from './components/workflow/LinearWorkflowView';

const STORAGE_KEY_ORDERS = 'sr_mecanico_orders_v1';
const STORAGE_KEY_ROLE = 'sr_mecanico_active_role_v1';
const STORAGE_KEY_MODULE = 'sr_mecanico_active_module_v1';
const STORAGE_KEY_MOVEMENTS = 'sr_mecanico_advisor_movements_v1';
const STORAGE_KEY_CLIENT_AUTH = 'sr_mecanico_client_auth_order_id_v1';

const INITIAL_ADVISOR_MOVEMENTS: AdvisorMovement[] = [
  {
    id: 'mov-1',
    orderNumber: 'SM-2026-0842',
    plate: 'NCY-58-21',
    customerName: 'Alejandro Morales Fuentes',
    action: 'registro_auto',
    actionLabel: 'Registro de Automóvil',
    description: 'Ingreso al taller de Volkswagen Jetta Trendline 2021',
    timestamp: 'Hoy, 09:15 AM',
  },
  {
    id: 'mov-2',
    orderNumber: 'SM-2026-0842',
    plate: 'NCY-58-21',
    customerName: 'Alejandro Morales Fuentes',
    action: 'fotos_esteticas',
    actionLabel: 'Fotos Estéticas',
    description: 'Captura de 5 fotografías perimetrales y tablero',
    timestamp: 'Hoy, 09:22 AM',
  },
  {
    id: 'mov-3',
    orderNumber: 'SM-2026-0842',
    plate: 'NCY-58-21',
    customerName: 'Alejandro Morales Fuentes',
    action: 'diagnostico_entregado',
    actionLabel: 'Diagnóstico Entregado',
    description: 'Envío de dictamen técnico y evidencias por WhatsApp',
    timestamp: 'Hoy, 10:45 AM',
  },
  {
    id: 'mov-4',
    orderNumber: 'SM-2026-0842',
    plate: 'NCY-58-21',
    customerName: 'Alejandro Morales Fuentes',
    action: 'cotizacion_generada',
    actionLabel: 'Cotización Generada',
    description: 'Propuesta de balatas delanteras y discos ventilados',
    timestamp: 'Hoy, 11:10 AM',
    amount: 3950,
  },
  {
    id: 'mov-5',
    orderNumber: 'SM-2026-0840',
    plate: 'RBH-74-19',
    customerName: 'Mariana Garza Villarreal',
    action: 'entrega_coche',
    actionLabel: 'Entrega de Vehículo',
    description: 'Entrega formal con firma digital y piezas usadas devueltas',
    timestamp: 'Hoy, 02:30 PM',
  },
];

export default function App() {
  // Detectar si el usuario ingresó por un link de cliente directo
  const isDirectClientLink = typeof window !== 'undefined' && Boolean(
    new URLSearchParams(window.location.search).get('role') === 'client' ||
    new URLSearchParams(window.location.search).get('tracking') ||
    new URLSearchParams(window.location.search).get('orderId') ||
    new URLSearchParams(window.location.search).get('phone') ||
    new URLSearchParams(window.location.search).get('email')
  );

  const [activeRole, setActiveRole] = useState<RoleId | null>(() => {
    if (isDirectClientLink) {
      return 'client';
    }
    const saved = localStorage.getItem(STORAGE_KEY_ROLE);
    return saved ? (saved as RoleId) : null;
  });

  const [activeModule, setActiveModule] = useState<string>(() => {
    if (isDirectClientLink) {
      return 'client_live';
    }
    return 'advisor_registration';
  });
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

  // Client Authentication State
  const [isClientAuthenticated, setIsClientAuthenticated] = useState<boolean>(() => {
    if (isDirectClientLink) {
      return true;
    }
    return Boolean(localStorage.getItem(STORAGE_KEY_CLIENT_AUTH));
  });

  // Escuchar parámetros de URL para acceso directo del cliente (Link de Monitoreo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tracking = params.get('tracking') || params.get('orden') || params.get('order');
    const orderId = params.get('orderId');
    const phone = params.get('phone') || params.get('telefono') || params.get('auth');
    const email = params.get('email') || params.get('correo');
    const plate = params.get('plate');
    const name = params.get('name');
    const make = params.get('make');
    const model = params.get('model');
    const year = params.get('year');
    const roleParam = params.get('role');

    if (roleParam === 'client' || tracking || orderId || phone || email) {
      setActiveRole('client');
      setIsClientAuthenticated(true);
      localStorage.setItem(STORAGE_KEY_ROLE, 'client');
      setActiveModule((prev) => (prev && prev.startsWith('client_') ? prev : 'client_live'));

      const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      const cleanTracking = tracking ? tracking.trim().toUpperCase() : '';
      const cleanOrderId = orderId ? orderId.trim().toLowerCase() : '';
      const cleanPlate = plate ? plate.trim().toUpperCase() : '';

      // 1. Buscar coincidencia exacta en las órdenes
      const matched = orders.find((o) => {
        if (cleanOrderId && o.id.toLowerCase() === cleanOrderId) return true;
        if (cleanTracking && (o.orderNumber.toUpperCase() === cleanTracking || o.id.toUpperCase() === cleanTracking)) return true;
        if (cleanPlate && o.vehicle.plate.toUpperCase() === cleanPlate) return true;
        const oPhone = o.customer.phone.replace(/\D/g, '');
        const oEmail = o.customer.email.trim().toLowerCase();
        if (cleanPhone && cleanPhone.length >= 7 && (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone))) return true;
        if (cleanEmail && oEmail === cleanEmail) return true;
        return false;
      });

      if (matched) {
        setSelectedOrderId(matched.id);
        localStorage.setItem(STORAGE_KEY_CLIENT_AUTH, matched.id);
      } else if (cleanTracking || cleanOrderId || cleanPlate || (name && (cleanPhone || cleanEmail))) {
        // Enlace abierto en otro dispositivo/navegador: hidratamos la orden
        const template = orders[0] || INITIAL_ORDERS[0];
        const newSynthesizedOrder: VehicleServiceOrder = {
          ...template,
          id: cleanOrderId || `ord-${cleanTracking || Date.now()}`,
          orderNumber: cleanTracking || `SM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          customer: {
            ...template.customer,
            name: name ? decodeURIComponent(name) : template.customer.name,
            phone: phone || template.customer.phone,
            email: email ? decodeURIComponent(email) : template.customer.email,
          },
          vehicle: {
            ...template.vehicle,
            plate: cleanPlate || template.vehicle.plate,
            make: make ? decodeURIComponent(make) : template.vehicle.make,
            model: model ? decodeURIComponent(model) : template.vehicle.model,
            year: year ? parseInt(year, 10) || template.vehicle.year : template.vehicle.year,
          },
        };

        setOrders((prev) => {
          const exists = prev.some((o) => o.id === newSynthesizedOrder.id || o.orderNumber === newSynthesizedOrder.orderNumber);
          if (exists) return prev;
          const updated = [newSynthesizedOrder, ...prev];
          localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updated));
          return updated;
        });
        setSelectedOrderId(newSynthesizedOrder.id);
        localStorage.setItem(STORAGE_KEY_CLIENT_AUTH, newSynthesizedOrder.id);
      } else if (orders.length > 0) {
        setSelectedOrderId(orders[0].id);
        localStorage.setItem(STORAGE_KEY_CLIENT_AUTH, orders[0].id);
      }
    }
  }, [orders]);

  const handleClientLoginSuccess = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsClientAuthenticated(true);
    setActiveRole('client');
    setActiveModule('client_live');
    localStorage.setItem(STORAGE_KEY_ROLE, 'client');
    localStorage.setItem(STORAGE_KEY_MODULE, 'client_live');
    localStorage.setItem(STORAGE_KEY_CLIENT_AUTH, orderId);
  };

  const handleClientLogout = () => {
    setIsClientAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_CLIENT_AUTH);
  };

  // Advisor Movements State
  const [advisorMovements, setAdvisorMovements] = useState<AdvisorMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MOVEMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading movements from localStorage', e);
      }
    }
    return INITIAL_ADVISOR_MOVEMENTS;
  });

  // Persist orders & movements to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MOVEMENTS, JSON.stringify(advisorMovements));
  }, [advisorMovements]);

  // Proteger al rol Asesor y Cliente: Nunca permitir acceso a los 16 pasos ni a módulos ajenos
  useEffect(() => {
    if (activeRole === 'front_desk' && (activeModule === 'linear_16_steps' || !activeModule.startsWith('advisor_'))) {
      setActiveModule('advisor_registration');
      localStorage.setItem(STORAGE_KEY_MODULE, 'advisor_registration');
    }
  }, [activeRole, activeModule]);

  const handleRecordAdvisorMovement = (movement: Omit<AdvisorMovement, 'id' | 'timestamp'>) => {
    const newMovement: AdvisorMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    setAdvisorMovements((prev) => [newMovement, ...prev]);
  };

  // Set default module when role changes
  const handleSelectRole = (role: RoleId) => {
    setActiveRole(role);
    localStorage.setItem(STORAGE_KEY_ROLE, role);

    switch (role) {
      case 'front_desk':
        setActiveModule('advisor_registration');
        localStorage.setItem(STORAGE_KEY_MODULE, 'advisor_registration');
        break;
      case 'mechanic':
        setActiveModule('m2_inspection');
        localStorage.setItem(STORAGE_KEY_MODULE, 'm2_inspection');
        break;
      case 'admin':
        setActiveModule('m4_purchases');
        localStorage.setItem(STORAGE_KEY_MODULE, 'm4_purchases');
        break;
      case 'director':
        setActiveModule('m6_crm_director');
        localStorage.setItem(STORAGE_KEY_MODULE, 'm6_crm_director');
        break;
      case 'client':
        setActiveModule('client_live');
        localStorage.setItem(STORAGE_KEY_MODULE, 'client_live');
        break;
    }
  };

  const handleLogout = () => {
    setActiveRole(null);
    setIsClientAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem(STORAGE_KEY_CLIENT_AUTH);
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
    setActiveModule('advisor_registration');

    handleRecordAdvisorMovement({
      orderNumber: newNumber,
      plate: newOrder.vehicle.plate,
      customerName: newOrder.customer.name,
      action: 'registro_auto',
      actionLabel: 'Registro de Automóvil',
      description: `Ingreso de auto nuevo: ${newOrder.vehicle.make} ${newOrder.vehicle.model} (${newOrder.vehicle.plate})`,
    });
  };

  // 1. Start Screen
  if (!activeRole) {
    return <RoleSelector onSelectRole={handleSelectRole} />;
  }

  // 2. Portal de Monitoreo del Cliente: Formulario de Acceso por Correo y Teléfono
  if (activeRole === 'client' && !isClientAuthenticated) {
    return (
      <ClientLoginView
        orders={orders}
        onLoginSuccess={handleClientLoginSuccess}
        onBackToRoles={handleLogout}
      />
    );
  }

  // 3. Active Role Dashboard View
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F8FAFC] overflow-x-hidden">
      {/* Unified Institutional Header */}
      <Header
        activeRole={activeRole}
        onLogout={handleLogout}
        onToggleSidebar={activeRole !== 'client' ? () => setIsSidebarOpen(!isSidebarOpen) : undefined}
        onOpen16Steps={() => setActiveModule('linear_16_steps')}
        activeOrderNumber={currentOrder?.orderNumber}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
        {/* Desktop Collapsible Sidebar (Solo para personal del taller, no para clientes) */}
        {activeRole !== 'client' && (
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
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 min-w-0 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 lg:pb-12 ${
            activeRole === 'client' ? 'max-w-5xl mx-auto' : 'lg:ml-80'
          }`}
        >
          {/* Módulos Específicos del Rol: Recepción y Asesor */}
          {activeRole === 'front_desk' && activeModule === 'advisor_metrics' && (
            <AdvisorMetrics orders={orders} movements={advisorMovements} />
          )}

          {activeRole === 'front_desk' && activeModule === 'advisor_registration' && currentOrder && (
            <AdvisorRegistrationFlow
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNewOrder={handleCreateNewOrder}
              onRecordMovement={handleRecordAdvisorMovement}
            />
          )}

          {activeRole === 'front_desk' && activeModule === 'advisor_history' && (
            <AdvisorHistoryPDF
              orders={orders}
              onSelectOrder={(id) => {
                setSelectedOrderId(id);
                setActiveModule('advisor_registration');
              }}
            />
          )}

          {/* 16-Step Continuous Protocol View (Exclusivo para taller y mecánicos, NUNCA para asesor ni cliente) */}
          {activeModule === 'linear_16_steps' && activeRole !== 'front_desk' && activeRole !== 'client' && currentOrder && (
            <LinearWorkflowView
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
              onBackToDashboard={() => {
                switch (activeRole as RoleId) {
                  case 'front_desk':
                    setActiveModule('advisor_registration');
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
                  case 'client':
                    setActiveModule('client_live');
                    break;
                }
              }}
            />
          )}

          {/* Portal del Cliente: Monitoreo en Vivo */}
          {(activeRole === 'client' || activeModule.startsWith('client_')) && currentOrder && (
            <ClientPortal
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
              onSelectOrder={(id) => setSelectedOrderId(id)}
              onLogout={handleClientLogout}
              activeModule={activeModule}
              onSelectModule={(mod) => setActiveModule(mod)}
            />
          )}

          {/* Módulos de Jefe de Taller y Mecánico */}
          {activeRole === 'mechanic' && activeModule === 'm2_inspection' && currentOrder && (
            <M2Inspection55
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m4_workshop')}
            />
          )}

          {activeRole === 'mechanic' && activeModule === 'm4_workshop' && currentOrder && (
            <M4WorkshopEvidence
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
            />
          )}

          {/* Módulos de Administración y Caja */}
          {activeRole === 'admin' && activeModule === 'm4_purchases' && currentOrder && (
            <M4PurchasesAudit
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              onNextStep={() => setActiveModule('m5_billing')}
            />
          )}

          {activeRole === 'admin' && activeModule === 'm5_billing' && currentOrder && (
            <M5CashierBilling
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
            />
          )}

          {/* Módulos de Director General y CRM */}
          {activeRole === 'director' && activeModule === 'm6_crm_director' && currentOrder && (
            <M6CRMProductivity
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
              defaultTab="productivity"
            />
          )}

          {activeRole === 'director' && activeModule === 'm6_crm_followup' && currentOrder && (
            <M6CRMProductivity
              order={currentOrder}
              onUpdateOrder={handleUpdateCurrentOrder}
              orders={orders}
              defaultTab="crm"
            />
          )}
        </main>
      </div>

      {/* Tactile Bottom Navigation Bar for Mobile and Tablet */}
      <BottomNav
        activeRole={activeRole}
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          localStorage.setItem(STORAGE_KEY_MODULE, mod);
        }}
        onOpen16Steps={() => setActiveModule('linear_16_steps')}
      />
    </div>
  );
}
