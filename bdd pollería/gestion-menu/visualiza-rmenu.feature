Feature: Visualizar menú

Como administrador
Quiero ver los productos ofrecidos en el menú
Para seleccionar los platos cuando registre el pedido

Criterios de Aceptación

@VisualizarMenu
Escenario: Visualización del menú
    Given que el admin accede al módulo del menú
    When consulta los productos disponibles
    Then el sistema muestra la lista de platos

@VisualizarMenu
Escenario: Información del producto
    Given que existen productos registrados
    When el admin selecciona un producto
    Then el sistema muestra nombre, precio y descripción

@VisualizarMenu
Escenario: Disponibilidad
    Given que algunos productos no tienen stock
    When el admin visualiza el menú
    Then el sistema indica cuáles productos están disponibles
