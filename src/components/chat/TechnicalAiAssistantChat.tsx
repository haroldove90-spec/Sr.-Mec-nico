import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Car,
  RotateCcw,
  Check,
  Copy,
  ChevronDown,
  Wrench,
  ShieldCheck,
  Clock,
  Fuel,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { VehicleServiceOrder } from '../../types';
import {
  ChatMessage,
  generateTechnicalAssistantReply,
  AssistantContext,
} from '../../services/technicalAiEngine';

interface TechnicalAiAssistantChatProps {
  activeOrder?: VehicleServiceOrder | null;
  allOrders?: VehicleServiceOrder[];
  userRole?: string | null;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    timestamp: 'Ahora',
    text: `¡Hola! Soy el **Asistente Técnico Inteligente de Sr. Mecánico** 🛠️.\n\n` +
      `Estoy entrenado con la base técnica del taller para asistirte con cotizaciones precisas, viscosidades exactas de aceite, bujías por cilindros y recomendaciones preventivas.\n\n` +
      `*Prueba haciendo clic en alguna de las preguntas de ejemplo o escribe el vehículo que deseas consultar:*`,
    suggestedActions: [
      { label: '🏷️ Cotizar afinación Versa 1.6L', actionText: 'Cotizar afinación mayor para Nissan Versa 1.6L 2021' },
      { label: '🛢️ Aceite para Jetta 1.4 TSI', actionText: '¿Qué aceite y cuántos litros lleva un VW Jetta 1.4 TSI?' },
      { label: '⚡ Bujías para Aveo 1.5L', actionText: '¿Qué bujías y cuántas lleva un Chevrolet Aveo 1.5L?' },
      { label: '🛡️ Mantenimiento a los 50,000 km', actionText: '¿Qué mantenimiento le toca a un auto con 50,000 km?' },
      { label: '📋 Estatus de mi orden en taller', actionText: '¿Cuál es el estatus de mi orden en el taller?' },
    ],
  },
];

export const TechnicalAiAssistantChat: React.FC<TechnicalAiAssistantChatProps> = ({
  activeOrder,
  allOrders,
  userRole,
  isOpenExternal,
  onToggleExternal,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    onToggleExternal?.(val);
  };
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('sr_mecanico_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MESSAGES;
      }
    }
    return INITIAL_MESSAGES;
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasCopiedId, setHasCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Guardar historial en sesión
  useEffect(() => {
    sessionStorage.setItem('sr_mecanico_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll al recibir o enviar mensaje
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Foco en el input al abrir
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = (textToSend?: string) => {
    const prompt = (textToSend || inputValue).trim();
    if (!prompt) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Simular procesamiento del asistente con tiempo de respuesta natural
    setTimeout(() => {
      const context: AssistantContext = {
        activeOrder,
        allOrders,
        userRole,
      };

      const reply = generateTechnicalAssistantReply(prompt, context);
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    sessionStorage.removeItem('sr_mecanico_chat_history');
  };

  const handleCopyQuote = (quoteText: string, messageId: string) => {
    navigator.clipboard.writeText(quoteText);
    setHasCopiedId(messageId);
    setTimeout(() => setHasCopiedId(null), 2000);
  };

  // Renderizador de texto con formato markdown básico (negritas, viñetas, citas)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Citas en bloque (> Texto)
      if (line.startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-2 p-2.5 rounded-xl bg-amber-500/10 border-l-4 border-[#D05E28] text-xs font-medium text-amber-900 leading-relaxed"
          >
            {line.replace('> ', '')}
          </div>
        );
      }

      // Viñetas con punto (• o -)
      if (line.startsWith('• ') || line.startsWith('- ')) {
        const content = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs sm:text-sm pl-1">
            <span className="text-[#D05E28] font-bold mt-0.5">•</span>
            <span
              dangerouslySetInnerHTML={{
                __html: formatInlineMarkdown(content),
              }}
            />
          </div>
        );
      }

      // Líneas vacías
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      // Párrafos regulares
      return (
        <p
          key={idx}
          className="text-xs sm:text-sm my-0.5 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: formatInlineMarkdown(line),
          }}
        />
      );
    });
  };

  // Ayudante para negritas y código en línea
  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800 border border-slate-200">$1</code>');
  };

  return (
    <>
      {/* BURBUJA FLOTANTE DEL CHAT (VISIBLE EN TODO EL SISTEMA) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 select-none">
        {!isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1A253B] to-slate-900 text-white shadow-2xl hover:shadow-[#D05E28]/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/10"
            title="Abrir Asistente Técnico Inteligente de Sr. Mecánico"
          >
            {/* Indicador de pulsación verde */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            {/* Ícono de Asistente Robot / Llave */}
            <div className="relative p-1.5 rounded-xl bg-gradient-to-tr from-[#D05E28] to-amber-500 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>

            {/* Texto de la píldora */}
            <div className="text-left hidden xs:block">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5 text-white">
                <span>Asistente Técnico IA</span>
                <span className="px-1.5 py-0.2 rounded-md bg-[#D05E28] text-[9px] font-bold uppercase tracking-wider text-white">
                  Demo
                </span>
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                Sr. Mecánico • Cotizaciones & Motor
              </div>
            </div>

            {/* Notificación de no leídos */}
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D05E28] text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                1
              </span>
            )}
          </button>
        ) : null}
      </div>

      {/* VENTANA DEL CHAT INTELIGENTE */}
      {isOpen && (
        <div
          className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-50 w-[95vw] sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[620px] max-h-[82vh]'
          }`}
        >
          {/* HEADER DEL CHAT */}
          <div className="bg-gradient-to-r from-slate-900 via-[#1A253B] to-slate-900 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-2xl bg-[#D05E28] text-white shadow-md">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1A253B]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">
                    Asistente Técnico IA
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black">
                    En línea
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Sr. Mecánico • Fichas & Presupuestos
                </p>
              </div>
            </div>

            {/* Acciones de control (reiniciar, minimizar, cerrar) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title={isMinimized ? 'Maximizar chat' : 'Minimizar chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* BANNER DE AUTO ACTIVO EN SISTEMA (SI HAY UNO SELECCIONADO) */}
              {activeOrder && (
                <div className="bg-amber-50/90 border-b border-amber-200/80 px-3.5 py-2 flex items-center justify-between text-xs text-amber-950 shrink-0">
                  <div className="flex items-center gap-2 truncate">
                    <Car className="w-4 h-4 text-[#D05E28] shrink-0" />
                    <span className="truncate">
                      <strong>Auto Activo:</strong> {activeOrder.vehicle.plate} • {activeOrder.vehicle.make} {activeOrder.vehicle.model}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendMessage(`¿Cuál es el estatus y diagnóstico del vehículo con placas ${activeOrder.vehicle.plate}?`)}
                    className="ml-2 px-2 py-0.5 rounded-md bg-[#D05E28] hover:bg-[#b84e1e] text-white text-[10px] font-bold shrink-0 transition cursor-pointer"
                  >
                    Ver Estatus
                  </button>
                </div>
              )}

              {/* LISTA DE MENSAJES */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                    >
                      <div className="flex items-end gap-2 max-w-[90%]">
                        {!isUser && (
                          <div className="w-7 h-7 rounded-xl bg-[#1A253B] text-white flex items-center justify-center shrink-0 mb-1 shadow-xs">
                            <Bot className="w-4 h-4 text-[#D05E28]" />
                          </div>
                        )}

                        <div
                          className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm shadow-xs ${
                            isUser
                              ? 'bg-gradient-to-r from-slate-900 to-[#1A253B] text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {/* Texto del mensaje */}
                          <div className="space-y-1">{renderFormattedText(msg.text)}</div>

                          {/* Tarjeta de Cotización Estructurada si aplica */}
                          {msg.structuredQuote && (
                            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-2 text-xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 font-bold text-[#1A253B]">
                                <span>Ficha de Presupuesto Rápido</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyQuote(msg.text, msg.id)}
                                  className="flex items-center gap-1 text-[11px] text-[#D05E28] hover:underline cursor-pointer"
                                >
                                  {hasCopiedId === msg.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600 font-bold">Copiado</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block font-semibold">Vehículo:</span>
                                  <span className="font-bold text-slate-700">{msg.structuredQuote.vehicle}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block font-semibold">Servicio:</span>
                                  <span className="font-bold text-[#D05E28]">{msg.structuredQuote.service}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Marca de tiempo */}
                          <div
                            className={`text-[10px] mt-1.5 text-right ${
                              isUser ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* Botones de sugerencia / Chips de acción rápida */}
                      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 pl-9 max-w-full">
                          {msg.suggestedActions.map((action, actionIdx) => (
                            <button
                              key={actionIdx}
                              type="button"
                              onClick={() => handleSendMessage(action.actionText)}
                              className="text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-[#1A253B] hover:text-[#D05E28] border border-slate-200 hover:border-[#D05E28]/40 transition shadow-2xs cursor-pointer text-left"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Indicador de escritura del Asistente */}
                {isTyping && (
                  <div className="flex items-center gap-2 pl-1">
                    <div className="w-7 h-7 rounded-xl bg-[#1A253B] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4 text-[#D05E28]" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 rounded-bl-xs shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D05E28] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#D05E28] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#D05E28] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs font-semibold text-slate-500 ml-1">Consultando especificaciones del fabricante...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* INPUT Y ENVÍO DE MENSAJES */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe tu duda (ej. afinación Versa 1.6L)..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D05E28] focus:bg-white transition"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] disabled:bg-slate-200 disabled:cursor-not-allowed text-white shadow-xs transition cursor-pointer shrink-0"
                    title="Enviar pregunta"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>IA Técnica • Cero alucinaciones bajo norma SAE/API</span>
                  <span className="font-semibold text-slate-500">Sr. Mecánico v2.5</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
