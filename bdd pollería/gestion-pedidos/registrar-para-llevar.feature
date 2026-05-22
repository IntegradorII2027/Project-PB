Feature: Registro de pedidos para llevar

Como mesero
Quiero registrar pedidos para llevar
Para generar una orden diferenciada

Criterios de Aceptación

@RegistrarParaLlevar
Escenario: Registro exitoso
    Given que el mesero se encuentra en el módulo de pedidos
    When registra un pedido como "Para llevar"
    Then el sistema guarda la orden correctamente

@RegistrarParaLlevar
Escenario: Identificación del pedido
    Given que existe un pedido para llevar registrado
    When el pedido es visualizado en el sistema
    Then el sistema lo identifica como "Para llevar"
