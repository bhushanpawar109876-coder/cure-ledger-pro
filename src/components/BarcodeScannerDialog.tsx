import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScanLine, Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ScanResult {
  code: string;
  medicineName?: string;
  mfgDate?: string;
  expiryDate?: string;
}

interface BarcodeScannerDialogProps {
  onScanComplete: (result: ScanResult) => void;
}

// Mock medicine database for demo purposes
const MOCK_MEDICINE_DB: Record<string, { name: string; mfgDate: string; expiryDate: string }> = {
  '8901023008406': { name: 'Crocin Advance 500mg', mfgDate: '2024-06-01', expiryDate: '2026-05-31' },
  '8901790733167': { name: 'Dolo 650mg', mfgDate: '2024-03-15', expiryDate: '2026-03-14' },
  '8904004402643': { name: 'Azithromycin 500mg', mfgDate: '2024-01-10', expiryDate: '2025-12-31' },
};

function lookupMedicine(code: string): ScanResult {
  const found = MOCK_MEDICINE_DB[code];
  if (found) return { code, ...found };
  return {
    code,
    medicineName: `Medicine (${code.slice(0, 8)}...)`,
    mfgDate: '2024-01-01',
    expiryDate: '2026-01-01',
  };
}

export function BarcodeScannerDialog({ onScanComplete }: BarcodeScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    stopScanner();
    const result = lookupMedicine(decodedText);
    setScanResult(result);
    toast.success(`Scanned: ${result.medicineName || result.code}`);
  }, [stopScanner]);

  const startScanner = useCallback(async () => {
    setScanResult(null);
    setScanning(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => {}
      );
    } catch (err: any) {
      setScanning(false);
      toast.error('Camera access denied or unavailable. Try uploading an image instead.');
    }
  }, [handleScanSuccess]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('barcode-reader-file');
      const result = await scanner.scanFile(file, true);
      const med = lookupMedicine(result);
      setScanResult(med);
      toast.success(`Scanned: ${med.medicineName || med.code}`);
      scanner.clear();
    } catch {
      toast.error('Could not read barcode from image. Try a clearer photo.');
    }
    e.target.value = '';
  }, []);

  const handleUseResult = () => {
    if (scanResult) {
      onScanComplete(scanResult);
      setScanResult(null);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) stopScanner();
  }, [open, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]">
          <ScanLine size={18} />
          Scan Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Scan Medicine Barcode</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Scanner viewport */}
          <div id="barcode-reader" className={`w-full rounded-lg overflow-hidden bg-muted ${scanning ? 'min-h-[280px]' : 'hidden'}`} />
          <div id="barcode-reader-file" className="hidden" />

          {!scanning && !scanResult && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="p-4 rounded-full bg-primary/10">
                <ScanLine size={40} className="text-primary" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan a barcode or QR code on your medicine package to auto-fill details.
              </p>
              <div className="flex gap-3">
                <Button onClick={startScanner} className="gap-2 min-h-[44px]">
                  <Camera size={16} /> Use Camera
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 min-h-[44px]">
                  <Upload size={16} /> Upload Image
                </Button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </div>
          )}

          {scanning && (
            <div className="flex justify-center">
              <Button variant="destructive" size="sm" onClick={stopScanner} className="gap-2">
                <X size={14} /> Stop Camera
              </Button>
            </div>
          )}

          {scanResult && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <h4 className="font-heading font-semibold text-foreground">Scanned Result</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode</span>
                  <span className="font-mono text-foreground">{scanResult.code}</span>
                </div>
                {scanResult.medicineName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicine</span>
                    <span className="font-semibold text-foreground">{scanResult.medicineName}</span>
                  </div>
                )}
                {scanResult.mfgDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mfg. Date</span>
                    <span className="text-foreground">{scanResult.mfgDate}</span>
                  </div>
                )}
                {scanResult.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className="text-foreground">{scanResult.expiryDate}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUseResult} className="flex-1 min-h-[44px]">
                  Add to Inventory
                </Button>
                <Button variant="outline" onClick={() => { setScanResult(null); startScanner(); }} className="min-h-[44px]">
                  Scan Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
