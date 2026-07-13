\set ON_ERROR_STOP on

\if :{?confirm}
\else
  \set confirm 'NO'
\endif

SELECT :'confirm' = 'GENERAR' AS confirm_ok \gset

\if :confirm_ok
\else
  \echo 'Cancelado: ejecute con -v confirm=GENERAR para insertar el dataset.'
  \quit
\endif

BEGIN;

SET LOCAL statement_timeout = 0;
SELECT pg_advisory_xact_lock(hashtext('restaurantos-k6-volume-v1'));

DO $$
DECLARE
  v_owner_count integer;
  v_existing integer;
BEGIN
  IF current_database() <> 'restaurantos' THEN
    RAISE EXCEPTION
      'Base incorrecta: conectado a %, se esperaba restaurantos.',
      current_database();
  END IF;

  SELECT COUNT(*)
  INTO v_owner_count
  FROM "Usuario"
  WHERE "email" = 'dueno@polleria.com'
    AND "rol" = 'DUENO'
    AND "activo" = true;

  IF v_owner_count <> 1 THEN
    RAISE EXCEPTION
      'Se esperaba exactamente un DUENO activo con email dueno@polleria.com; encontrados: %.',
      v_owner_count;
  END IF;

  SELECT SUM(cantidad)
  INTO v_existing
  FROM (
    SELECT COUNT(*) AS cantidad
    FROM "Sucursal"
    WHERE "id" LIKE 'k6v1-%'
       OR "nombre" LIKE '[K6-VOLUMEN-V1]%'
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
  ) existentes;

  IF v_existing <> 0 THEN
    RAISE EXCEPTION
      'Ya existen % registros asociados con K6_VOLUMEN_V1. Ejecute primero la limpieza.',
      v_existing;
  END IF;
END
$$;

INSERT INTO "Sucursal" (
  "id",
  "nombre",
  "direccion",
  "telefono",
  "abierto",
  "horarioApertura",
  "horarioCierre",
  "diasOperacion",
  "duenoId",
  "creadoEn",
  "actualizadoEn"
)
SELECT
  format('k6v1-sucursal-%s', s.numero),
  format(
    '[K6-VOLUMEN-V1] Sucursal %s',
    CASE s.numero
      WHEN 1 THEN 'Centro'
      WHEN 2 THEN 'Norte'
      ELSE 'Sur'
    END
  ),
  format('Direccion sintetica %s', s.numero),
  format('999-000-%s', lpad(s.numero::text, 3, '0')),
  true,
  '08:00',
  '23:00',
  'LUN-DOM',
  (
    SELECT "id"
    FROM "Usuario"
    WHERE "email" = 'dueno@polleria.com'
      AND "rol" = 'DUENO'
      AND "activo" = true
  ),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 3) AS s(numero);

INSERT INTO "Usuario" (
  "id",
  "nombre",
  "email",
  "passwordHash",
  "rol",
  "activo",
  "sucursalId",
  "creadoEn",
  "bloqueadoHasta",
  "intentosFallidos"
)
SELECT
  format('k6v1-mesero-s%s-%s', s.numero, m.numero),
  format('[K6-VOLUMEN-V1] Mesero S%s-%s', s.numero, m.numero),
  format('k6v1-mesero-s%s-%s@restaurantos.test', s.numero, m.numero),
  'CUENTA-DESHABILITADA-K6-VOLUMEN-V1',
  'MESERO'::"Rol",
  false,
  format('k6v1-sucursal-%s', s.numero),
  CURRENT_TIMESTAMP,
  NULL,
  0
FROM generate_series(1, 3) AS s(numero)
CROSS JOIN generate_series(1, 5) AS m(numero);

INSERT INTO "Mesa" (
  "id",
  "numero",
  "capacidad",
  "estado",
  "sucursalId"
)
SELECT
  format('k6v1-mesa-s%s-%s', s.numero, m.numero),
  m.numero,
  CASE
    WHEN m.numero <= 2 THEN 2
    WHEN m.numero <= 9 THEN 4
    WHEN m.numero <= 11 THEN 6
    ELSE 8
  END,
  'LIBRE'::"EstadoMesa",
  format('k6v1-sucursal-%s', s.numero)
FROM generate_series(1, 3) AS s(numero)
CROSS JOIN generate_series(1, 12) AS m(numero);

INSERT INTO "Categoria" (
  "id",
  "nombre",
  "sucursalId"
)
SELECT
  format('k6v1-categoria-s%s-%s', s.numero, c.numero),
  format('[K6-VOLUMEN-V1] Categoria %s', c.numero),
  format('k6v1-sucursal-%s', s.numero)
FROM generate_series(1, 3) AS s(numero)
CROSS JOIN generate_series(1, 5) AS c(numero);

INSERT INTO "Producto" (
  "id",
  "nombre",
  "descripcion",
  "precio",
  "imagen",
  "disponible",
  "requiereCocina",
  "categoriaId",
  "sucursalId"
)
SELECT
  format('k6v1-producto-s%s-%s', s.numero, p.numero),
  format('[K6-VOLUMEN-V1] Producto %s', lpad(p.numero::text, 2, '0')),
  'Producto sintetico para pruebas controladas de volumen',
  (5 + p.numero * 2.50)::numeric(12, 2),
  NULL,
  true,
  (p.numero % 4) <> 0,
  format('k6v1-categoria-s%s-%s', s.numero, ((p.numero - 1) % 5) + 1),
  format('k6v1-sucursal-%s', s.numero)
FROM generate_series(1, 3) AS s(numero)
CROSS JOIN generate_series(1, 16) AS p(numero);

WITH pedidos_base AS (
  SELECT
    n,
    CASE
      WHEN n <= 6000 THEN 1
      WHEN n <= 8500 THEN 2
      ELSE 3
    END AS sucursal_no,
    CASE
      WHEN ((n - 1) % 200) < 184 THEN 'PAGADO'
      WHEN ((n - 1) % 200) < 199 THEN 'CANCELADO'
      ELSE CASE (((n - 1) / 200) % 4)
        WHEN 0 THEN 'PENDIENTE'
        WHEN 1 THEN 'EN_COCINA'
        WHEN 2 THEN 'LISTO'
        ELSE 'ENTREGADO'
      END
    END AS estado,
    timestamp '2026-01-01 10:00:00'
      + ((n * 37) % 181) * interval '1 day'
      + ((n * 17) % 720) * interval '1 minute' AS creado_en
  FROM generate_series(1, 10000) AS serie(n)
),
pagados_rankeados AS (
  SELECT
    n,
    row_number() OVER (
      ORDER BY md5(n::text || ':metodo-pago')
    ) AS ranking_pago
  FROM pedidos_base
  WHERE estado = 'PAGADO'
),
pedidos_finales AS (
  SELECT
    p.*,
    r.ranking_pago,
    CASE
      WHEN p.estado <> 'PAGADO' THEN NULL
      WHEN r.ranking_pago <= 3680 THEN 'Efectivo'
      WHEN r.ranking_pago <= 5980 THEN 'Yape'
      WHEN r.ranking_pago <= 7820 THEN 'Tarjeta'
      ELSE 'Plin'
    END AS metodo_pago
  FROM pedidos_base p
  LEFT JOIN pagados_rankeados r USING (n)
)
INSERT INTO "Pedido" (
  "id",
  "tipo",
  "estado",
  "mesaId",
  "meseroId",
  "sucursalId",
  "pagado",
  "metodoPago",
  "total",
  "creadoEn",
  "actualizadoEn"
)
SELECT
  format('k6v1-pedido-%s', p.n),
  (
    CASE
      WHEN p.estado NOT IN ('PAGADO', 'CANCELADO') THEN 'PARA_LLEVAR'
      WHEN (p.n % 4) = 0 THEN 'PARA_LLEVAR'
      ELSE 'EN_MESA'
    END
  )::"TipoPedido",
  p.estado::"EstadoPedido",
  CASE
    WHEN p.estado NOT IN ('PAGADO', 'CANCELADO') THEN NULL
    WHEN (p.n % 4) = 0 THEN NULL
    ELSE format(
      'k6v1-mesa-s%s-%s',
      p.sucursal_no,
      ((p.n - 1) % 12) + 1
    )
  END,
  format(
    'k6v1-mesero-s%s-%s',
    p.sucursal_no,
    ((p.n - 1) % 5) + 1
  ),
  format('k6v1-sucursal-%s', p.sucursal_no),
  p.estado = 'PAGADO',
  p.metodo_pago,
  NULL,
  p.creado_en,
  p.creado_en + (15 + (p.n % 90)) * interval '1 minute'
FROM pedidos_finales p;

WITH pedidos_base AS (
  SELECT
    n,
    CASE
      WHEN n <= 6000 THEN 1
      WHEN n <= 8500 THEN 2
      ELSE 3
    END AS sucursal_no,
    CASE
      WHEN ((n - 1) % 200) < 184 THEN 'PAGADO'
      WHEN ((n - 1) % 200) < 199 THEN 'CANCELADO'
      ELSE CASE (((n - 1) / 200) % 4)
        WHEN 0 THEN 'PENDIENTE'
        WHEN 1 THEN 'EN_COCINA'
        WHEN 2 THEN 'LISTO'
        ELSE 'ENTREGADO'
      END
    END AS estado
  FROM generate_series(1, 10000) AS serie(n)
),
items_base AS (
  SELECT
    p.n,
    p.sucursal_no,
    p.estado,
    i.item_no,
    ((p.n * 7 + i.item_no * 3 - 1) % 16) + 1 AS producto_no,
    1 + ((p.n + i.item_no) % 3) AS cantidad
  FROM pedidos_base p
  CROSS JOIN LATERAL generate_series(
    1,
    3 + (p.n % 2)
  ) AS i(item_no)
)
INSERT INTO "ItemPedido" (
  "id",
  "pedidoId",
  "productoId",
  "cantidad",
  "precio",
  "subtotal",
  "servido",
  "enviadoACocina"
)
SELECT
  format('k6v1-item-%s-%s', i.n, i.item_no),
  format('k6v1-pedido-%s', i.n),
  producto."id",
  i.cantidad,
  producto."precio",
  producto."precio" * i.cantidad,
  i.estado IN ('PAGADO', 'ENTREGADO'),
  producto."requiereCocina"
FROM items_base i
JOIN "Producto" producto
  ON producto."id" = format(
    'k6v1-producto-s%s-%s',
    i.sucursal_no,
    i.producto_no
  );

UPDATE "Pedido" pedido
SET "total" = totales.total
FROM (
  SELECT
    "pedidoId",
    SUM("subtotal") AS total
  FROM "ItemPedido"
  WHERE "id" LIKE 'k6v1-item-%'
  GROUP BY "pedidoId"
) totales
WHERE pedido."id" = totales."pedidoId";

DO $$
DECLARE
  v_count integer;
  v_inconsistent integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM "Sucursal"
  WHERE "id" LIKE 'k6v1-sucursal-%';

  IF v_count <> 3 THEN
    RAISE EXCEPTION 'Sucursales esperadas: 3; encontradas: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Usuario"
  WHERE "id" LIKE 'k6v1-mesero-%';

  IF v_count <> 15 THEN
    RAISE EXCEPTION 'Meseros esperados: 15; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Mesa"
  WHERE "id" LIKE 'k6v1-mesa-%';

  IF v_count <> 36 THEN
    RAISE EXCEPTION 'Mesas esperadas: 36; encontradas: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Categoria"
  WHERE "id" LIKE 'k6v1-categoria-%';

  IF v_count <> 15 THEN
    RAISE EXCEPTION 'Categorias esperadas: 15; encontradas: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Producto"
  WHERE "id" LIKE 'k6v1-producto-%';

  IF v_count <> 48 THEN
    RAISE EXCEPTION 'Productos esperados: 48; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%';

  IF v_count <> 10000 THEN
    RAISE EXCEPTION 'Pedidos esperados: 10000; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "ItemPedido"
  WHERE "id" LIKE 'k6v1-item-%';

  IF v_count <> 35000 THEN
    RAISE EXCEPTION 'Items esperados: 35000; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "estado" = 'PAGADO';

  IF v_count <> 9200 THEN
    RAISE EXCEPTION 'Pedidos PAGADO esperados: 9200; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "estado" = 'CANCELADO';

  IF v_count <> 750 THEN
    RAISE EXCEPTION 'Pedidos CANCELADO esperados: 750; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "estado" NOT IN ('PAGADO', 'CANCELADO');

  IF v_count <> 50 THEN
    RAISE EXCEPTION 'Pedidos activos esperados: 50; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "metodoPago" = 'Efectivo';

  IF v_count <> 3680 THEN
    RAISE EXCEPTION 'Pagos Efectivo esperados: 3680; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "metodoPago" = 'Yape';

  IF v_count <> 2300 THEN
    RAISE EXCEPTION 'Pagos Yape esperados: 2300; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "metodoPago" = 'Tarjeta';

  IF v_count <> 1840 THEN
    RAISE EXCEPTION 'Pagos Tarjeta esperados: 1840; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND "metodoPago" = 'Plin';

  IF v_count <> 1380 THEN
    RAISE EXCEPTION 'Pagos Plin esperados: 1380; encontrados: %.', v_count;
  END IF;

  SELECT COUNT(*)
  INTO v_inconsistent
  FROM "Pedido"
  WHERE "id" LIKE 'k6v1-pedido-%'
    AND (
      (
        "estado" = 'PAGADO'
        AND (
          "pagado" = false
          OR "metodoPago" IS NULL
        )
      )
      OR
      (
        "estado" <> 'PAGADO'
        AND (
          "pagado" = true
          OR "metodoPago" IS NOT NULL
        )
      )
    );

  IF v_inconsistent <> 0 THEN
    RAISE EXCEPTION
      'Pedidos con estado/pago/metodo inconsistentes: %.',
      v_inconsistent;
  END IF;

  SELECT COUNT(*)
  INTO v_inconsistent
  FROM "Pedido" pedido
  JOIN (
    SELECT
      "pedidoId",
      SUM("subtotal") AS total_items
    FROM "ItemPedido"
    WHERE "id" LIKE 'k6v1-item-%'
    GROUP BY "pedidoId"
  ) items
    ON items."pedidoId" = pedido."id"
  WHERE pedido."id" LIKE 'k6v1-pedido-%'
    AND ABS(pedido."total" - items.total_items) > 0.001;

  IF v_inconsistent <> 0 THEN
    RAISE EXCEPTION
      'Pedidos cuyo total no coincide con sus items: %.',
      v_inconsistent;
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
  (SELECT COUNT(*) FROM "Sucursal" WHERE "id" LIKE 'k6v1-sucursal-%') AS sucursales,
  (SELECT COUNT(*) FROM "Usuario" WHERE "id" LIKE 'k6v1-mesero-%') AS meseros,
  (SELECT COUNT(*) FROM "Mesa" WHERE "id" LIKE 'k6v1-mesa-%') AS mesas,
  (SELECT COUNT(*) FROM "Categoria" WHERE "id" LIKE 'k6v1-categoria-%') AS categorias,
  (SELECT COUNT(*) FROM "Producto" WHERE "id" LIKE 'k6v1-producto-%') AS productos,
  (SELECT COUNT(*) FROM "Pedido" WHERE "id" LIKE 'k6v1-pedido-%') AS pedidos,
  (SELECT COUNT(*) FROM "ItemPedido" WHERE "id" LIKE 'k6v1-item-%') AS items;
