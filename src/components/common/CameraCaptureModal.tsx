import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Check,
  Upload,
  Sparkles,
  Video,
  Smartphone,
  FolderOpen,
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
  samplePhotoUrl?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Tomar Fotografía de Evidencia',
  samplePhotoUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Estados
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Detener la cámara WebRTC
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
    setIsStarting(false);
  };

  // Iniciar stream de la cámara web (WebRTC) SOLO cuando el usuario lo solicita explícitamente
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsStarting(true);
    setPermissionError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La transmisión en vivo no es soportada por este navegador. Usa la cámara nativa.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsLiveCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Permiso denegado';
      setHasPermission(false);
      setIsLiveCameraActive(false);
      setPermissionError(
        'El navegador bloqueó la cámara web en vivo. Puedes usar la Cámara Nativa o Galería sin pedir permisos.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  // Al abrir el modal: NO pedimos permisos automáticos.
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setIsLiveCameraActive(false);
      setPermissionError(null);
      setHasPermission(null);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsLiveCameraActive(false);
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isLiveCameraActive) {
      startCamera(nextMode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCapturedPhoto(reader.result);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = () => {
    const fallback =
      samplePhotoUrl ||
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';
    setCapturedPhoto(fallback);
    stopCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Cabecera del modal */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#D05E28]/10 text-[#D05E28]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A253B] leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                Elige cómo deseas registrar la fotografía
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visor de cámara o foto capturada */}
        <div className="relative bg-slate-900 flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black p-2">
              <img
                src={capturedPhoto}
                alt="Foto Capturada"
                className="w-full h-full object-contain max-h-[50vh] rounded-xl"
              />
            </div>
          ) : isLiveCameraActive && hasPermission ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover max-h-[50vh] ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
              {/* Botón para cambiar cámara */}
              <button
                onClick={handleToggleFacingMode}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer"
                title="Cambiar Cámara Frontal / Trasera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="p-6 text-center space-y-4 max-w-md w-full">
              <div className="w-16 h-16 rounded-2xl bg-[#D05E28]/10 border border-[#D05E28]/30 mx-auto flex items-center justify-center text-[#D05E28]">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-white font-bold text-lg">
                  Captura Rápida de Fotografía
                </h4>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                  Para no tener que pedir permisos en cada toma, usa la <strong>Cámara Nativa</strong> de tu tablet/celular o sube desde tus archivos.
                </p>
              </div>

              {permissionError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs text-left">
                  {permissionError}
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                {/* Opción 1: Cámara Nativa (¡SIN permisos de navegador!) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition transform active:scale-98"
                >
                  <Camera className="w-5 h-5" />
                  <span>Tomar Foto con Cámara Nativa (Recomendado)</span>
                </button>

                {/* Opción 2: Galería o Archivo */}
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition"
                >
                  <FolderOpen className="w-4 h-4 text-slate-300" />
                  <span>Elegir de Galería o Archivos</span>
                </button>

                {/* Opción 3: Activar cámara web en vivo (WebRTC explícito) */}
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700/60 cursor-pointer transition"
                >
                  <Video className="w-4 h-4 text-[#D05E28]" />
                  <span>Activar Transmisión Web en Vivo (Webcam)</span>
                </button>

                {/* Opción 4: Foto de Demostración del Taller */}
                <button
                  type="button"
                  onClick={handleUseSamplePhoto}
                  className="w-full py-2 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-medium text-xs flex items-center justify-center gap-1.5 border border-amber-500/20 cursor-pointer transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cargar Foto de Prueba Rápida</span>
                </button>
              </div>
            </div>
          )}

          {isStarting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-2 p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#D05E28]" />
              <span className="text-xs font-semibold">Iniciando cámara en vivo...</span>
            </div>
          )}
        </div>

        {/* Inputs de archivo nativo (ocultos) */}
        {/* Input con capture='environment' abre la cámara física directamente en móviles/tablets sin pedir permisos WebRTC */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        {/* Input estándar para galería */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Barra de botones inferiores */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
              >
                Tomar Otra Foto
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          ) : isLiveCameraActive && hasPermission ? (
            <>
              <button
                type="button"
                onClick={stopCamera}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
              >
                <span>Cancelar En Vivo</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureFrame}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Capturar Foto</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-slate-500">
              <span>💡 Consejo: La cámara nativa toma fotos a máxima resolución.</span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-semibold hover:text-slate-900 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
