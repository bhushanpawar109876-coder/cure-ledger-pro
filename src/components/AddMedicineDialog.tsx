import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Medicine } from '@/lib/medicine';
import { toast } from 'sonner';

interface AddMedicineDialogProps {
  onAdd: (med: Omit<Medicine, 'id' | 'addedAt'>) => void;
}

export function AddMedicineDialog({ onAdd }: AddMedicineDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !batch.trim() || !quantity || !expiryDate) {
      toast.error('Please fill in all fields');
      return;
    }

    onAdd({
      name: name.trim(),
      batch: batch.trim(),
      quantity: parseInt(quantity, 10),
      expiryDate,
    });

    toast.success(`${name.trim()} added to your inventory`);
    setName('');
    setBatch('');
    setQuantity('');
    setExpiryDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 font-heading font-semibold min-h-[44px]">
          <Plus size={18} />
          Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Add Medicine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="med-name">Medicine Name</Label>
            <Input
              id="med-name"
              placeholder="e.g. Paracetamol 500mg"
              value={name}
              onChange={e => setName(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="med-batch">Batch No.</Label>
              <Input
                id="med-batch"
                placeholder="e.g. A123"
                value={batch}
                onChange={e => setBatch(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="med-qty">Quantity</Label>
              <Input
                id="med-qty"
                type="number"
                min="1"
                placeholder="e.g. 20"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="med-expiry">Expiry Date</Label>
            <Input
              id="med-expiry"
              type="date"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              className="min-h-[44px]"
            />
          </div>
          <Button type="submit" className="w-full min-h-[44px] font-heading font-semibold">
            Add to Inventory
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
