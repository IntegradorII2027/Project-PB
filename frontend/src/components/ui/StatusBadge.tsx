import { cn } from '../../utils/cn';

type BadgeVariant =
  | 'pendiente' | 'en_cocina' | 'en_preparacion' | 'listo' | 'entregado' | 'pagado' | 'cancelado'
  | 'libre' | 'ocupada' | 'en_espera'
  | 'ok' | 'bajo' | 'critico'
  | 'activo' | 'inactivo';

/*
 * Paleta accesible para deuteranopia/protanopia:
 *   success → cyan  (#22D3EE)  nunca confundible con error
 *   error   → rosa  (#F472B6)  no depende canal verde
 *   warning → ámbar (#FBBF24)  visible todos los tipos
 *   info    → azul  (#60A5FA)
 *
 * Cada estado tiene símbolo gráfico (shape) ADEMÁS del color,
 * para usuarios que no distinguen colores.
 */
const badgeConfig: Record<BadgeVariant, { bg: string; text: string; label: string; symbol: string }> = {
  pagado:         { bg: '#042A30', text: '#22D3EE', label: 'Pagado',      symbol: '✓' },
  entregado:      { bg: '#0A1628', text: '#60A5FA', label: 'Entregado',   symbol: '→' },
  listo:          { bg: '#042A30', text: '#22D3EE', label: 'Listo',       symbol: '●' },
  en_preparacion: { bg: '#2C1F04', text: '#FBBF24', label: 'En prep.',    symbol: '◐' },
  en_cocina:      { bg: '#2C1F04', text: '#FBBF24', label: 'En cocina',   symbol: '◐' },
  pendiente:      { bg: '#252525', text: '#A8A8A8', label: 'Pendiente',   symbol: '○' },
  cancelado:      { bg: '#2A0A1A', text: '#F472B6', label: 'Cancelado',   symbol: '✕' },
  libre:          { bg: '#042A30', text: '#22D3EE', label: 'Libre',       symbol: '○' },
  ocupada:        { bg: '#2A0A1A', text: '#F472B6', label: 'Ocupada',     symbol: '●' },
  en_espera:      { bg: '#2C1F04', text: '#FBBF24', label: 'En espera',   symbol: '◔' },
  critico:        { bg: '#2A0A1A', text: '#F472B6', label: 'Crítico',     symbol: '!' },
  bajo:           { bg: '#2C1F04', text: '#FBBF24', label: 'Bajo',        symbol: '▲' },
  ok:             { bg: '#042A30', text: '#22D3EE', label: 'OK',          symbol: '✓' },
  activo:         { bg: '#042A30', text: '#22D3EE', label: 'Activo',      symbol: '●' },
  inactivo:       { bg: '#252525', text: '#A8A8A8', label: 'Inactivo',    symbol: '○' },
};

interface Props {
  variant: BadgeVariant | string;
  className?: string;
  noSymbol?: boolean;
}

function normalize(v: string): BadgeVariant {
  return v.toLowerCase().replace(/ /g, '_') as BadgeVariant;
}

export function StatusBadge({ variant, className, noSymbol = false }: Props) {
  const key    = normalize(variant);
  const config = badgeConfig[key] ?? { bg: '#252525', text: '#A8A8A8', label: variant, symbol: '•' };
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-wide', className)}
      style={{ backgroundColor: config.bg, color: config.text }}
      aria-label={config.label}
    >
      {!noSymbol && <span aria-hidden="true" style={{ fontSize: '10px' }}>{config.symbol}</span>}
      {config.label}
    </span>
  );
}
