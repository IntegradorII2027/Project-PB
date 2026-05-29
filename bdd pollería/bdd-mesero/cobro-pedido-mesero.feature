Feature: Cobro de pedido del Mesero

Como mesero
Quiero registrar el pago de un pedido
Para cerrar la atención de la mesa y liberarla para nuevos clientes

Criterios de Aceptación

@CobroPedidoMesero
Escenario: Cobrar pedido con método de pago
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido activo en la sucursal
    When selecciona la opción "Cobrar" en el pedido
    And elige un método de pago válido entre Efectivo, Tarjeta, Yape o Plin
    Then el sistema registra el pedido como pagado
    And cambia el estado de la mesa asociada a "Libre"
    And el pedido desaparece del listado de pedidos activos

@CobroPedidoMesero
Escenario: Visualizar total antes de cobrar
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido activo con ítems registrados
    When selecciona la opción "Cobrar"
    Then el sistema muestra el total del pedido antes de confirmar el cobro
    And presenta las opciones de método de pago disponibles

@CobroPedidoMesero
Escenario: Cancelar acción de cobro
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el modal de cobro
    When cierra el modal sin seleccionar método de pago
    Then el sistema cancela la acción
    And el pedido permanece activo sin cambios
