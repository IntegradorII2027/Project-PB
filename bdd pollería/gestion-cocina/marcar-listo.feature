Feature: Marcar pedido listo

Como cocinero
Quiero marcar un pedido como listo
Para notificar al mesero que puede recoger el pedido

Criterios de Aceptación

@MarcarPedidoListo
Escenario: Pedido marcado como listo
    Given el cocinero ha iniciado sesión con rol "Cocinero"
    And que el pedido está en preparación
    When el cocinero selecciona la opción "Marcar como listo"
    Then el sistema cambia el estado a "Listo"

@MarcarPedidoListo
Escenario: Notificación al mesero
    Given el cocinero ha marcado un pedido como listo
    When el sistema procesa el cambio de estado
    Then el pedido aparece como "Listo" en la lista del mesero
    And se borra el pedido de la lista de pedidos pendientes en cocina
