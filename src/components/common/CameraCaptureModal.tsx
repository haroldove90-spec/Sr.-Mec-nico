import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Upload, Shield } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Tomar Fotografía de Evidencia',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(false);

  // Iniciar stream de la cámara
  const startCamera = async (mode: 'environment' | 'user') => {
    setIsStarting(true);
    setErrorMessage(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o dispositivo no soporta acceso directo a la cámara.');
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
    } catch (err: any) {
      console.warn('Error accediendo a la cámara:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Permiso denegado. Por favor permite el acceso a la cámara en tu navegador.');
      } else {
        setErrorMessage(err.message || 'No se pudo activar la cámara de tu dispositivo.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

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
    startCamera(facingMode);
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Cabecera del modal */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D05E28]/10 text-[#D05E28]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A253B] leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">Cámara en vivo del dispositivo</p>
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
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Foto Capturada"
              className="w-full h-full object-contain max-h-[50vh]"
            />
          ) : (
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

              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white gap-3 p-4 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#D05E28]" />
                  <span className="text-sm font-semibold">Solicitando permisos de cámara...</span>
                </div>
              )}

              {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white gap-3 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-amber-500" />
                  <h4 className="font-bold text-base">Permiso de Cámara Requerido</h4>
                  <p className="text-xs text-slate-300 max-w-xs">{errorMessage}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Usar selector de fotos / Cámara</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Botón flotante para voltear cámara frontal/trasera */}
          {!capturedPhoto && hasPermission && (
            <button
              onClick={handleToggleFacingMode}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition cursor-pointer"
              title="Cambiar Cámara"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Input file nativo oculto como respaldo */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileFallback}
          className="hidden"
        />

        {/* Botones de acción */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm sm:text-base hover:bg-slate-50 transition cursor-pointer"
              >
                Tomar Otra Foto
              </button>
              <button
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Usar Esta Foto</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-2"
                title="Subir archivo desde galería"
              >
                <Upload className="w-4 h-4" />
                <span>Galería</span>
              </button>

              <button
                onClick={handleCaptureFrame}
                disabled={!hasPermission || isStarting}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#D05E28] hover:bg-[#b84e1e] disabled:opacity-40 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xs transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Capturar Foto</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
