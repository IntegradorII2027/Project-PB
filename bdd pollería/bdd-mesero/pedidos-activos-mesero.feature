Feature: Gestión de pedidos activos del Mesero

Como mesero
Quiero visualizar y gestionar los pedidos activos de mi sucursal
Para hacer seguimiento del estado de cada mesa y coordinar la atención

Criterios de Aceptación

@PedidosActivosMesero
Escenario: Visualizar listado de pedidos activos
    Given que el usuario ha iniciado sesión con rol "MESERO"
    When ingresa al módulo "Pedidos"
    Then el sistema muestra todos los pedidos activos de la sucursal
    And muestra para cada pedido la mesa, estado, ítems de cocina y complementos

@PedidosActivosMesero
Escenario: Identificar pedido listo para entregar
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido con estado "Listo"
    When visualiza el listado de pedidos activos
    Then el sistema resalta visualmente el pedido listo con animación
    And habilita la opción "Marcar como entregado"

@PedidosActivosMesero
Escenario: Marcar pedido como entregado
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido con estado "Listo"
    When selecciona la opción "Marcar como entregado"
    Then el sistema actualiza el estado del pedido a "Entregado"
    And el pedido deja de aparecer como pendiente de entrega

@PedidosActivosMesero
Escenario: Agregar más ítems a un pedido existente
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido activo en la sucursal
    When selecciona la opción "Añadir más" en el pedido
    Then el sistema redirige a la pantalla de pedido con el pedido existente cargado
    And permite agregar nuevos productos al pedido

@PedidosActivosMesero
Escenario: Actualización automática de pedidos activos
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el módulo "Pedidos"
    When han pasado 15 segundos desde la última carga
    Then el sistema actualiza automáticamente el listado de pedidos
    And refleja los cambios de estado realizados por el cocinero
