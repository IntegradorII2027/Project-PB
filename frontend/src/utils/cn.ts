import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `S/ ${amount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

export function getInitials(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function rolColor(rol: string): string {
  switch (rol) {
    case 'ADMIN': return 'text-primary bg-[#2A1506]';
    case 'MESERO': return 'text-info bg-info-bg';
    case 'COCINERO': return 'text-warning bg-warning-bg';
    case 'CAJERO': return 'text-success bg-success-bg';
    default: return 'text-muted-foreground bg-muted';
  }
}

export function rolLabel(rol: string): string {
  const map: Record<string, string> = {
    ADMIN: 'Admin', MESERO: 'Mesero', COCINERO: 'Cocinero', CAJERO: 'Cajero',
  };
  return map[rol] ?? rol;
}
