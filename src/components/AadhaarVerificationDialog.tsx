import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Step = 'enter_aadhaar' | 'enter_otp' | 'verified' | 'rejected';

export function AadhaarVerificationDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('enter_aadhaar');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedDob, setVerifiedDob] = useState<string | null>(null);

  const resetState = () => {
    setStep('enter_aadhaar');
    setAadhaar('');
    setOtp('');
    setVerifiedDob(null);
  };

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = aadhaar.replace(/\D/g, '');
    if (digits.length !== 12) {
      toast.error('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setLoading(true);
    // Mock: simulate UIDAI OTP request (2s delay)
    await new Promise(r => setTimeout(r, 1500));
    toast.success('OTP sent to your Aadhaar-linked mobile number (demo mode).');
    setStep('enter_otp');
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    // Mock: simulate UIDAI OTP verification
    await new Promise(r => setTimeout(r, 2000));

    // Demo: generate a mock DOB based on aadhaar hash
    const aadhaarDigits = aadhaar.replace(/\D/g, '');
    const yearOffset = parseInt(aadhaarDigits.slice(0, 2)) % 40;
    const mockYear = 1970 + yearOffset;
    const mockMonth = (parseInt(aadhaarDigits.slice(2, 4)) % 12) + 1;
    const mockDay = (parseInt(aadhaarDigits.slice(4, 6)) % 28) + 1;
    const dob = `${mockYear}-${String(mockMonth).padStart(2, '0')}-${String(mockDay).padStart(2, '0')}`;

    // Check age
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;

    if (age < 18) {
      setStep('rejected');
      setVerifiedDob(dob);
      toast.error('Age verification failed: user is under 18.');
    } else {
      setVerifiedDob(dob);
      setStep('verified');

      // Store verification in DB (no raw Aadhaar stored)
      if (user) {
        const { data: existing } = await supabase
          .from('aadhaar_verifications' as any)
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase.from('aadhaar_verifications' as any)
            .update({ verified: true, verified_dob: dob, verified_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase.from('aadhaar_verifications' as any).insert({
            user_id: user.id,
            verified: true,
            verified_dob: dob,
            verified_at: new Date().toISOString(),
          });
        }
      }
      toast.success('Aadhaar DOB verified successfully!');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]">
          <ShieldCheck size={18} />
          Verify Age (Aadhaar)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            Aadhaar e-KYC Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'enter_aadhaar' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Demo Mode:</strong> This simulates UIDAI Aadhaar e-KYC. No real Aadhaar data is processed. Enter any 12 digits and use OTP <strong>123456</strong>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadhaar-input">Aadhaar Number</Label>
                <Input
                  id="aadhaar-input"
                  placeholder="XXXX XXXX XXXX"
                  value={aadhaar}
                  onChange={e => setAadhaar(formatAadhaar(e.target.value))}
                  className="min-h-[44px] font-mono text-lg tracking-wider"
                  maxLength={14}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'enter_otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to your Aadhaar-linked mobile. (Demo: use <strong>123456</strong>)
              </p>
              <div className="space-y-2">
                <Label htmlFor="otp-input">OTP</Label>
                <Input
                  id="otp-input"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="min-h-[44px] font-mono text-lg text-center tracking-[0.5em]"
                  maxLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}

          {step === 'verified' && (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex p-4 rounded-full bg-safe/10">
                <CheckCircle2 size={40} className="text-safe" />
              </div>
              <h4 className="font-heading font-semibold text-foreground">Age Verified ✓</h4>
              <p className="text-sm text-muted-foreground">
                Date of Birth: <strong>{verifiedDob}</strong><br />
                You are confirmed to be 18 years or older.
              </p>
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-xs text-muted-foreground">
                  <strong>Privacy:</strong> Your Aadhaar number was not stored. Only verification status and DOB are retained.
                </p>
              </div>
            </div>
          )}

          {step === 'rejected' && (
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex p-4 rounded-full bg-expired/10">
                <AlertTriangle size={40} className="text-expired" />
              </div>
              <h4 className="font-heading font-semibold text-foreground">Age Verification Failed</h4>
              <p className="text-sm text-muted-foreground">
                DOB: <strong>{verifiedDob}</strong><br />
                Users must be 18 years or older to use MediTrack.
              </p>
              <Button variant="outline" onClick={resetState} className="min-h-[44px]">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
