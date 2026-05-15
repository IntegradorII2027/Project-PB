import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

/**
 * Suscripción global a cambios en Supabase Realtime.
 * Cuando un pedido o mesa cambia en la BD, invalida el cache de
 * React Query para que todos los componentes se actualicen al instante.
 *
 * Registrar este hook UNA sola vez en AuthLayout.
 */
export function useRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) return; // desactivado si no hay config

    const channel = supabase
      .channel('restaurantos-realtime')
      // Cambios en tabla Pedido
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Pedido' }, () => {
        qc.invalidateQueries({ queryKey: ['pedidosActivos'] });
        qc.invalidateQueries({ queryKey: ['pedidos'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      })
      // Cambios en tabla Mesa
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Mesa' }, () => {
        qc.invalidateQueries({ queryKey: ['mesas'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      })
      // Cambios en inventario
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Insumo' }, () => {
        qc.invalidateQueries({ queryKey: ['inventario'] });
        qc.invalidateQueries({ queryKey: ['alertasInventario'] });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Conectado — actualizaciones en tiempo real activas');
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Realtime] Error de canal — usando polling como fallback');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
