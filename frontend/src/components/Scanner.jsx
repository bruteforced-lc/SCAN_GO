import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { playScanBeep } from '../utils.js';

const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.QR_CODE,
];

export default function Scanner({ onScan }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const lastRef = useRef({ code: '', time: 0 });
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const start = async () => {
    setError('');
    try {
      const scanner = new Html5Qrcode('reader', {
        formatsToSupport: FORMATS,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        verbose: false,
      });
      scannerRef.current = scanner;

      const qrConfig = {
        fps: 15,
        qrbox: (w, h) => ({
          width: Math.floor(w * 0.88),
          height: Math.floor(Math.min(h * 0.65, w * 0.5)),
        }),
      };

      const handleSuccess = (text) => {
        const now = Date.now();
        if (text === lastRef.current.code && now - lastRef.current.time < 2000) return;
        lastRef.current = { code: text, time: now };
        
        // Play POS scanner beep & vibrate
        playScanBeep();
        
        onScanRef.current(text);
      };

      try {
        // Try back/rear camera first (for phones)
        await scanner.start(
          { facingMode: 'environment' },
          qrConfig,
          handleSuccess,
          () => {}
        );
      } catch {
        // Fallback to default/user camera (for laptops / desktops)
        await scanner.start(
          { facingMode: 'user' },
          qrConfig,
          handleSuccess,
          () => {}
        );
      }
      setRunning(true);
    } catch (e) {
      scannerRef.current = null;
      setError(
        `Camera error: ${e?.message || e}. Please allow camera permission in your browser.`
      );
    }
  };

  const stop = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.stop();
      scanner.clear();
    } catch {
      /* stopped */
    }
    scannerRef.current = null;
    setRunning(false);
  };

  useEffect(
    () => () => {
      const scanner = scannerRef.current;
      if (scanner) scanner.stop().then(() => scanner.clear()).catch(() => {});
    },
    []
  );

  return (
    <div className="relative">
      {/* Scanner Viewport Container */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-950/90 border border-slate-800 min-h-[220px] flex items-center justify-center">
        {/* html5-qrcode video element renders here */}
        <div id="reader" className="w-full h-full overflow-hidden rounded-2xl" />

        {/* Futuristic Laser & Reticle Overlay when active */}
        {running && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            <div className="relative w-full max-w-sm h-36 border-2 border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              {/* Sweeping Laser Line */}
              <div className="scan-laser-line animate-laser" />

              {/* Glowing Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 rounded-br" />
            </div>
          </div>
        )}

        {/* Idle Placeholder when camera is off */}
        {!running && (
          <div className="py-12 px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-200">Camera is ready</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Tap start to scan any barcode or QR code with live instant detection.
            </p>
          </div>
        )}
      </div>

      {/* Camera Live Indicator / Hint */}
      {running && (
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Scanner Active
          </span>
          <span>Hold barcode 15-20cm away</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Toggle Camera Button */}
      <button
        onClick={running ? stop : start}
        className={`btn mt-3.5 w-full flex items-center justify-center gap-2 ${
          running ? 'btn-secondary text-slate-200' : 'btn-primary'
        }`}
      >
        {running ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop Scanner
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Camera Scanner
          </>
        )}
      </button>
    </div>
  );
}