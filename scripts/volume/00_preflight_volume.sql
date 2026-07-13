\set ON_ERROR_STOP on

DO $$
DECLARE
  v_required_tables integer;
  v_owner_count integer;
  v_existing integer;
BEGIN
  IF current_database() <> 'restaurantos' THEN
    RAISE EXCEPTION
      'Base incorrecta: conectado a %, se esperaba restaurantos.',
      current_database();
  END IF;

  SELECT COUNT(*)
  INTO v_required_tables
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'Usuario',
      'Sucursal',
      'Mesa',
      'Categoria',
      'Producto',
      'Pedido',
      'ItemPedido',
      'Asistencia'
    );

  IF v_required_tables <> 8 THEN
    RAISE EXCEPTION
      'Esquema incorrecto: se esperaban 8 tablas de RestaurantOS; encontradas: %.',
      v_required_tables;
  END IF;

  SELECT COUNT(*)
  INTO v_owner_count
  FROM "Usuario"
  WHERE "email" = 'dueno@polleria.com'
    AND "rol" = 'DUENO'
    AND "activo" = true;

  IF v_owner_count <> 1 THEN
    RAISE EXCEPTION
      'Se esperaba exactamente un DUENO activo dueno@polleria.com; encontrados: %.',
      v_owner_count;
  END IF;

  SELECT SUM(cantidad)
  INTO v_existing
  FROM (
    SELECT COUNT(*) AS cantidad FROM "Sucursal"
      WHERE "id" LIKE 'k6v1-%' OR "nombre" LIKE '[K6-VOLUMEN-V1]%'
    UNION ALL
    SELECT COUNT(*) FROM "Usuario"
      WHERE "id" LIKE 'k6v1-%' OR "email" LIKE 'k6v1-%@restaurantos.test'
    UNION ALL
    SELECT COUNT(*) FROM "Mesa" WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*) FROM "Categoria" WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*) FROM "Producto" WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*) FROM "Pedido" WHERE "id" LIKE 'k6v1-%'
    UNION ALL
    SELECT COUNT(*) FROM "ItemPedido" WHERE "id" LIKE 'k6v1-%'
  ) existentes;

  IF v_existing <> 0 THEN
    RAISE EXCEPTION
      'Ya existen % registros K6_VOLUMEN_V1. No se debe generar otra copia.',
      v_existing;
  END IF;
END
$$;

SELECT current_database() AS base, current_user AS usuario;

SELECT
  (SELECT COUNT(*) FROM "Usuario") AS usuarios_actuales,
  (SELECT COUNT(*) FROM "Sucursal") AS sucursales_actuales,
  (SELECT COUNT(*) FROM "Pedido") AS pedidos_actuales,
  (SELECT COUNT(*) FROM "ItemPedido") AS items_actuales;

SELECT
  3 AS sucursales_por_crear,
  15 AS meseros_por_crear,
  36 AS mesas_por_crear,
  15 AS categorias_por_crear,
  48 AS productos_por_crear,
  10000 AS pedidos_por_crear,
  35000 AS items_por_crear;

\echo 'PREFLIGHT OK: no se modificaron datos.'
