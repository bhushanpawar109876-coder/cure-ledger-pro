import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Recycle, AlertTriangle, Droplets, Trash2, ShieldCheck } from 'lucide-react';

const guidelines = [
  {
    icon: AlertTriangle,
    title: 'Do not flush medicines',
    description: 'Flushing medicines can contaminate water supplies. Only flush if the label specifically instructs you to.',
  },
  {
    icon: Trash2,
    title: 'Mix with undesirable substance',
    description: 'Mix medicines with coffee grounds, dirt, or cat litter in a sealed bag before placing in household trash.',
  },
  {
    icon: Droplets,
    title: 'Remove personal info',
    description: 'Scratch out all personal information on prescription labels before disposing of packaging.',
  },
  {
    icon: Recycle,
    title: 'Use take-back programs',
    description: 'Check with local pharmacies for medicine take-back programs — the safest disposal method.',
  },
  {
    icon: ShieldCheck,
    title: 'Keep away from children',
    description: 'Store medicines awaiting disposal in a secure location out of reach of children and pets.',
  },
];

export function DisposalGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]">
          <Recycle size={16} />
          Safe Disposal Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Recycle size={20} className="text-primary" />
            Safe Medicine Disposal Guide
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Improper disposal of expired medicines can harm the environment and pose health risks. Follow these guidelines to dispose of medicines safely.
        </p>
        <div className="space-y-4 mt-4">
          {guidelines.map((g) => (
            <div key={g.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                <g.icon size={16} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm text-card-foreground">{g.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{g.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-sm text-foreground">
            <strong>⚠️ Never</strong> give expired medicines to others or use them beyond their expiry date. When in doubt, consult your pharmacist.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
