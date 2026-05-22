Feature: Entrega de pedidos al cliente

Como mesero
Quiero entregar el pedido preparado al cliente
Para completar la atención del pedido

Criterios de Aceptación

@EntregarPedido
Escenario: Pedido listo
    Given que el pedido se encuentra listo
    When el mesero visualiza el estado del pedido
    Then el sistema muestra que puede ser entregado

@EntregarPedido
Escenario: Entrega en mesa
    Given que el pedido corresponde a consumo en mesa
    When el mesero entrega el pedido al cliente
    Then el sistema registra la entrega correctamente

@EntregarPedido
Escenario: Pedido para llevar entregado
    Given que el pedido es para llevar
    When el mesero entrega el pedido al cliente
    Then el sistema registra el pedido como entregado
