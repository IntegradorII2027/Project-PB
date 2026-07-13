\set ON_ERROR_STOP on

\if :{?confirm}
\else
  \set confirm 'NO'
\endif

SELECT :'confirm' = 'LIMPIAR' AS confirm_ok \gset

\if :confirm_ok
\else
  \echo 'Cancelado: ejecute con -v confirm=LIMPIAR para eliminar solamente K6_VOLUMEN_V1.'
  \quit
\endif

BEGIN;

SET LOCAL statement_timeout = 0;
SELECT pg_advisory_xact_lock(hashtext('restaurantos-k6-volume-v1'));

DO $$
BEGIN
  IF current_database() <> 'restaurantos' THEN
    RAISE EXCEPTION
      'Base incorrecta: conectado a %, se esperaba restaurantos.',
      current_database();
  END IF;
END
$$;

SELECT
  (SELECT COUNT(*) FROM "Sucursal" WHERE "id" LIKE 'k6v1-sucursal-%') AS sucursales_antes,
  (SELECT COUNT(*) FROM "Usuario" WHERE "id" LIKE 'k6v1-%') AS usuarios_antes,
  (SELECT COUNT(*) FROM "Pedido" WHERE "id" LIKE 'k6v1-pedido-%') AS pedidos_antes,
  (SELECT COUNT(*) FROM "ItemPedido" WHERE "id" LIKE 'k6v1-item-%') AS items_antes;

DELETE FROM "Sucursal"
WHERE "id" LIKE 'k6v1-sucursal-%';

DO $$
DECLARE
  v_remaining integer;
BEGIN
  SELECT SUM(cantidad)
  INTO v_remaining
  FROM (
    SELECT COUNT(*) AS cantidad
    FROM "Sucursal"
    WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*)
    FROM "Usuario"
    WHERE "id" LIKE 'k6v1-%'
       OR "email" LIKE 'k6v1-%@restaurantos.test'
    UNION ALL
    SELECT COUNT(*)
    FROM "Mesa"
    WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*)
    FROM "Categoria"
    WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*)
    FROM "Producto"
    WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*)
    FROM "Pedido"
    WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*)
    FROM "ItemPedido"
    WHERE "id" LIKE 'k6v1-%'
  ) restantes;

  IF v_remaining <> 0 THEN
    RAISE EXCEPTION
      'La limpieza dejo % registros K6_VOLUMEN_V1. Se revierte la transaccion.',
      v_remaining;
  END IF;
END
$$;

COMMIT;

ANALYZE "Sucursal";
ANALYZE "Usuario";
ANALYZE "Mesa";
ANALYZE "Categoria";
ANALYZE "Producto";
ANALYZE "Pedido";
ANALYZE "ItemPedido";

SELECT
  (SELECT COUNT(*) FROM "Sucursal" WHERE "id" LIKE 'k6v1-%') AS sucursales_restantes,
  (SELECT COUNT(*) FROM "Usuario" WHERE "id" LIKE 'k6v1-%') AS usuarios_restantes,
  (SELECT COUNT(*) FROM "Pedido" WHERE "id" LIKE 'k6v1-%') AS pedidos_restantes,
  (SELECT COUNT(*) FROM "ItemPedido" WHERE "id" LIKE 'k6v1-%') AS items_restantes;
