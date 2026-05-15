import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { TableWrapper, Tr, Td } from '../../components/shared/TableWrapper';
import { pedidosService } from '../../services/pedidos.service';
import { formatCurrency, formatDate } from '../../utils/cn';
import type { Pedido, PaginatedResponse } from '../../types';

const ESTADOS = ['', 'PENDIENTE', 'EN_COCINA', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'PAGADO', 'CANCELADO'];

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Pedido | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Pedido>>({
    queryKey: ['pedidos', estado, page],
    queryFn: () => pedidosService.getAll({ ...(estado && { estado }), page: String(page), limit: '20' }),
  });

  const pedidos = (data?.data ?? []).filter(p =>
    !search || p.mesa?.numero?.toString().includes(search) || p.numero?.toString().includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mesa o #..."
            className="bg-muted border border-border rounded-m pl-8 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-52"
          />
        </div>
        <select
          value={estado}
          onChange={(e) => { setEstado(e.target.value); setPage(1); }}
          className="bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
        >
          {ESTADOS.map((e) => <option key={e} value={e}>{e || 'Todos los estados'}</option>)}
        </select>
      </div>

      <TableWrapper
        headers={['#', 'Mesa', 'Mesero', 'Productos', 'Total', 'Estado', 'Fecha', 'Acciones']}
        isEmpty={pedidos.length === 0}
        emptyMessage={isLoading ? 'Cargando...' : 'Sin pedidos'}
      >
        {pedidos.map((p) => (
          <Tr key={p.id}>
            <Td className="font-mono text-muted-foreground text-xs">#{p.numero}</Td>
            <Td>{p.mesa ? `Mesa ${p.mesa.numero}` : 'Para llevar'}</Td>
            <Td className="text-muted-foreground">{p.mesero?.nombre ?? '—'}</Td>
            <Td className="text-muted-foreground max-w-40 truncate">
              {p.items.slice(0, 2).map(i => i.producto.nombre).join(', ')}
              {p.items.length > 2 && ` +${p.items.length - 2}`}
            </Td>
            <Td className="font-medium">{formatCurrency(Number(p.total ?? 0))}</Td>
            <Td><StatusBadge variant={p.estado.toLowerCase()} /></Td>
            <Td className="text-muted-foreground text-xs">{formatDate(p.creadoEn)}</Td>
            <Td>
              <button onClick={() => setSelected(p)} className="text-muted-foreground hover:text-primary transition-colors">
                <Eye size={15} />
              </button>
            </Td>
          </Tr>
        ))}
      </TableWrapper>

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="flex items-center gap-2 justify-end text-sm">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-m bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40">
            Anterior
          </button>
          <span className="text-muted-foreground">Pág. {page} de {Math.ceil(data.total / 20)}</span>
          <button disabled={page >= Math.ceil(data.total / 20)} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-m bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40">
            Siguiente
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido #${selected.numero}`} width="max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{selected.mesa ? `Mesa ${selected.mesa.numero}` : 'Para llevar'}</span>
              <StatusBadge variant={selected.estado.toLowerCase()} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground uppercase">Producto</th>
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase">Cant.</th>
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase">Precio</th>
                  <th className="text-right py-2 text-xs text-muted-foreground uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {selected.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-foreground">{item.producto.nombre}</td>
                    <td className="py-2 text-right text-muted-foreground">{item.cantidad}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatCurrency(Number(item.precio))}</td>
                    <td className="py-2 text-right text-foreground font-medium">{formatCurrency(Number(item.subtotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between text-lg font-bold text-foreground border-t border-border pt-3">
              <span>TOTAL</span>
              <span className="text-primary">{formatCurrency(Number(selected.total ?? 0))}</span>
            </div>
            {selected.metodoPago && (
              <p className="text-sm text-muted-foreground">Método de pago: {selected.metodoPago}</p>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-muted text-sm text-foreground rounded-m hover:bg-[#252525]">
                Imprimir
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-primary text-white text-sm rounded-m hover:bg-orange-600">
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
