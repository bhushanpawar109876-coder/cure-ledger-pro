import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { useFamilyMembers, FamilyMember } from '@/hooks/useFamilyMembers';
import { toast } from 'sonner';

export function FamilyMemberManager() {
  const { members, addMember, updateMember, deleteMember } = useFamilyMembers();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const error = await addMember(newName.trim());
    if (error) toast.error('Failed to add member');
    else { toast.success(`${newName.trim()} added`); setNewName(''); }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    await updateMember(id, editName.trim());
    setEditingId(null);
  };

  const handleDelete = async (member: FamilyMember) => {
    await deleteMember(member.id);
    toast.success(`${member.name} removed`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 min-h-[44px]">
          <Users size={16} />
          Family ({members.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Family Members
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add family member name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="min-h-[44px]"
          />
          <Button onClick={handleAdd} size="icon" className="min-h-[44px] min-w-[44px] shrink-0">
            <Plus size={18} />
          </Button>
        </div>

        <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
          {members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No family members yet. Add one above to tag medicines to specific people.
            </p>
          )}
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border">
              {editingId === m.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="min-h-[36px] text-sm"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate(m.id)} className="p-1.5 rounded-md text-success hover:bg-success/10">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-card-foreground">{m.name}</span>
                  <button
                    onClick={() => { setEditingId(m.id); setEditName(m.name); }}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
