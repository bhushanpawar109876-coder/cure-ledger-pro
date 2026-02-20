import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

type Mode = 'login' | 'signup' | 'magic';

export default function Auth() {
  const { user, loading, signUp, signIn, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="animate-pulse-gentle text-primary"><Shield size={48} /></div></div>;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !tosAccepted) {
      toast.error('You must accept the Terms & Conditions to continue.');
      return;
    }
    setSubmitting(true);
    try {
      let result: { error: Error | null };
      if (mode === 'signup') {
        result = await signUp(email, password, displayName);
      } else if (mode === 'magic') {
        result = await signInWithMagicLink(email);
        if (!result.error) {
          toast.success('Check your email for a login link!');
          setSubmitting(false);
          return;
        }
      } else {
        result = await signIn(email, password);
      }
      if (result.error) toast.error(result.error.message);
      else if (mode === 'signup') toast.success('Account created! Welcome to MediTrack.');
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-xl bg-primary text-primary-foreground mb-4">
            <Shield size={28} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">MediTrack</h1>
          <p className="text-muted-foreground mt-1">Your personal medicine expiry tracker</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1">
            {(['login', 'signup', 'magic'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  mode === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Magic Link'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="auth-name">Display Name</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-name"
                    placeholder="Your name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="pl-9 min-h-[44px]"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 min-h-[44px]"
                  required
                />
              </div>
            </div>

            {mode !== 'magic' && (
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 min-h-[44px]"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm font-medium text-foreground">Terms & Conditions</p>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="tos"
                    checked={tosAccepted}
                    onCheckedChange={(c) => setTosAccepted(c === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="tos" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    I confirm that I am <strong>18 years or older</strong>, the medicine details I provide are <strong>accurate</strong>, and I agree to follow <strong>safe disposal practices</strong> for expired medicines.
                  </label>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full min-h-[44px] font-heading font-semibold gap-2" disabled={submitting}>
              {submitting ? (
                <span className="animate-pulse-gentle">Please wait...</span>
              ) : mode === 'magic' ? (
                <><Sparkles size={16} /> Send Magic Link</>
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
