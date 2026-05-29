Feature: Visualizar pedidos pendientes

Como cocinero
Quiero visualizar pedidos pendientes
Para prepararlos en orden de llegada

Criterios de Aceptación

@VisualizarPedidos
Escenario: Visualización de pedidos
    Given el usuario ha iniciado sesión con rol "COCINERO"
    And que existen pedidos pendientes
    When el cocinero accede al módulo de pedidos
    Then el sistema muestra los pedidos pendientes

@VisualizarPedidos
Escenario: Actualización en tiempo real
    Given el usuario ha iniciado sesión con rol "COCINERO"
    And que ingresa un nuevo pedido
    When el cocinero se encuentra en la vista pedidos pendientes abierta
    Then la lista de pedidos pendientes se actualiza automáticamente

@VisualizarPedidos
Escenario: Orden cronológico
    Given que existen varios pedidos pendientes
    When el cocinero visualiza la lista
    Then los pedidos se muestran en orden de llegada
