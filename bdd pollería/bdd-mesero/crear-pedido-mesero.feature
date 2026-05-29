Feature: Creación de pedido del Mesero

Como mesero
Quiero registrar un nuevo pedido con los productos solicitados por el cliente
Para enviarlo a cocina y gestionar la atención de la mesa

Criterios de Aceptación

@CrearPedidoMesero
Escenario: Visualizar productos disponibles por categoría
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en la pantalla de nuevo pedido
    When el sistema carga los productos disponibles
    Then muestra los productos agrupados por categoría
    And diferencia visualmente los productos que van a cocina de los complementos

@CrearPedidoMesero
Escenario: Agregar producto de cocina al pedido
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en la pantalla de nuevo pedido
    When selecciona un producto marcado como "Cocina"
    Then el sistema agrega el producto al resumen del pedido
    And muestra el producto con la etiqueta naranja de cocina

@CrearPedidoMesero
Escenario: Agregar complemento al pedido
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en la pantalla de nuevo pedido
    When selecciona un producto marcado como "Complemento"
    Then el sistema agrega el complemento al resumen del pedido
    And muestra el producto con la etiqueta verde de complemento

@CrearPedidoMesero
Escenario: Modificar cantidad de un ítem en el pedido
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe al menos un producto en el resumen del pedido
    When incrementa o reduce la cantidad del producto
    Then el sistema actualiza la cantidad y el subtotal del ítem
    And recalcula el total del pedido

@CrearPedidoMesero
Escenario: Confirmar y enviar pedido
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe al menos un producto en el resumen del pedido
    When selecciona la opción "Confirmar pedido"
    Then el sistema registra el pedido en la base de datos
    And cambia el estado de la mesa a "Ocupada"
    And el pedido queda disponible para ser visto por el cocinero si contiene ítems de cocina

@CrearPedidoMesero
Escenario: Intentar confirmar pedido sin productos
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en la pantalla de nuevo pedido sin productos agregados
    When selecciona la opción "Confirmar pedido"
    Then el sistema impide el registro del pedido
    And muestra un mensaje indicando que debe agregar al menos un producto

@CrearPedidoMesero
Escenario: Filtrar productos por categoría
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en la pantalla de nuevo pedido
    When selecciona una categoría del filtro
    Then el sistema muestra únicamente los productos pertenecientes a esa categoría
