import React, { useState } from 'react';
import { Download, CheckCircle, Share2, Smartphone, Monitor } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold"
        title="Sr. Mecánico está instalado en este dispositivo"
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="hidden sm:inline">Instalado</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const result = await install();
      if (!result) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#D05E28] hover:bg-[#b84e1e] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        title="Instala Sr. Mecánico en tu dispositivo"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">Instala Sr. Mecánico</span>
        <span className="inline sm:hidden whitespace-nowrap font-bold">Instalar</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://kabris.com.mx/srmecanicoicono.png"
                alt="Sr. Mecánico Ícono"
                className="w-12 h-12 rounded-xl shadow-md object-contain"
              />
              <div>
                <h3 className="font-bold text-base text-[#1A253B]">Instala Sr. Mecánico</h3>
                <p className="text-xs text-slate-500">Acceso rápido, sin conexión y en pantalla completa</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-amber-900">
                  <Smartphone className="w-4 h-4 text-[#D05E28]" />
                  Instrucciones para iPhone / iPad (Safari):
                </div>
                <ol className="list-decimal list-inside space-y-1.5 ml-1 text-slate-600">
                  <li>
                    Presiona el botón <strong>Compartir</strong> <Share2 className="inline w-3.5 h-3.5 text-blue-600" /> en la barra inferior de Safari.
                  </li>
                  <li>
                    Desliza hacia abajo y pulsa en <strong>&quot;Agregar al inicio&quot;</strong>.
                  </li>
                  <li>
                    Confirma dando clic en <strong>&quot;Agregar&quot;</strong> en la esquina superior derecha.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-[#1A253B]">
                  <Monitor className="w-4 h-4 text-[#D05E28]" />
                  Instrucciones para Android o Computadora (Chrome / Edge):
                </div>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A253B] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Si aparece el diálogo del navegador, pulsa <strong>Instalar</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A253B] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>En escritorio, haz clic en el ícono de pantalla o instalación en la barra de direcciones (URL).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#1A253B] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>En menú de Chrome, pulsa los 3 puntos y elige <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</span>
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A253B] text-white font-medium text-xs hover:bg-[#273756] transition cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
