import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Fingerprint, ShieldCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Utility: base64url encode/decode
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function WebAuthnDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCredentials = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('webauthn_credentials' as any)
      .select('*')
      .eq('user_id', user.id);
    setCredentials(data || []);
  };

  const handleRegister = async () => {
    if (!user) return;
    if (!window.PublicKeyCredential) {
      toast.error('WebAuthn is not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = new TextEncoder().encode(user.id);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'MediTrack', id: window.location.hostname },
          user: { id: userId, name: user.email || '', displayName: user.email || '' },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Registration cancelled');

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = bufferToBase64url(credential.rawId);
      const publicKey = bufferToBase64url(response.getPublicKey?.() || new ArrayBuffer(0));

      await supabase.from('webauthn_credentials' as any).insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey || credentialId,
        device_name: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop',
      });

      toast.success('Biometric credential registered successfully!');
      await fetchCredentials();
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') {
        toast.error(err.message || 'Failed to register biometric credential.');
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('webauthn_credentials' as any).delete().eq('id', id);
    toast.success('Credential removed.');
    await fetchCredentials();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) fetchCredentials(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]">
          <Fingerprint size={18} />
          Biometric Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Fingerprint size={20} className="text-primary" />
            WebAuthn Biometric Login
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Register your fingerprint or Face ID for quick, passwordless login on this device.
          </p>

          <Button onClick={handleRegister} disabled={loading} className="w-full gap-2 min-h-[44px]">
            <ShieldCheck size={16} />
            {loading ? 'Registering...' : 'Register Biometric'}
          </Button>

          {credentials.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Registered Credentials</p>
              {credentials.map((cred: any) => (
                <div key={cred.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2">
                    <Fingerprint size={16} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{cred.device_name}</p>
                      <p className="text-xs text-muted-foreground">Added {new Date(cred.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cred.id)} aria-label="Remove credential">
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Security note:</strong> Your biometric data never leaves your device. Only a cryptographic public key is stored on our servers. Raw biometric data is never transmitted or stored.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
