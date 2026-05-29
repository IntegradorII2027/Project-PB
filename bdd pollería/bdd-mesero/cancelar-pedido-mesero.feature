Feature: Cancelación de pedido del Mesero

Como mesero
Quiero cancelar un pedido activo
Para corregir errores o atender solicitudes de cancelación del cliente

Criterios de Aceptación

@CancelarPedidoMesero
Escenario: Cancelar pedido activo
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido activo en la sucursal
    When selecciona la opción "Cancelar" en el pedido
    Then el sistema cancela el pedido
    And si no hay otros pedidos activos para la mesa, cambia el estado de la mesa a "Libre"
    And el pedido desaparece del listado de pedidos activos

@CancelarPedidoMesero
Escenario: Cancelar pedido sin afectar otras mesas
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe un pedido activo asociado a una mesa con otros pedidos activos
    When cancela el pedido
    Then el sistema cancela únicamente ese pedido
    And la mesa permanece en estado "Ocupada" por los pedidos restantes
