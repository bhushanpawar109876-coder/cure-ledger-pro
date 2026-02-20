export interface Medicine {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  expiryDate: string; // ISO date string
  addedAt: string;
  familyMemberId?: string | null;
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'safe';

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'critical';
  if (diffDays <= 30) return 'warning';
  return 'safe';
}

export function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusLabel(status: ExpiryStatus): string {
  switch (status) {
    case 'expired': return 'Expired';
    case 'critical': return '0–7 days';
    case 'warning': return '8–30 days';
    case 'safe': return '31+ days';
  }
}

export function exportToCSV(medicines: Medicine[]): void {
  const headers = ['Name', 'Batch', 'Quantity', 'Expiry Date', 'Status'];
  const rows = medicines.map(m => [
    m.name,
    m.batch,
    m.quantity.toString(),
    m.expiryDate,
    getStatusLabel(getExpiryStatus(m.expiryDate)),
  ]);

  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `meditrack-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
