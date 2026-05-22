Feature: Vista de mesas del Mesero

Como mesero
Quiero visualizar el estado de las mesas del restaurante
Para saber cuáles están disponibles y gestionar los pedidos

Criterios de Aceptación

@VistaMesasMesero
Escenario: Visualizar listado de mesas por estado
    Given que el usuario ha iniciado sesión con rol "MESERO"
    When ingresa al módulo "Mesas"
    Then el sistema muestra todas las mesas de la sucursal
    And muestra cada mesa con su número, capacidad y estado visual diferenciado
    And las mesas libres se muestran en verde, las ocupadas en naranja y las reservadas en gris

@VistaMesasMesero
Escenario: Seleccionar mesa libre para crear pedido
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe al menos una mesa con estado "Libre"
    When selecciona una mesa libre
    Then el sistema redirige a la pantalla de nuevo pedido
    And asocia automáticamente la mesa seleccionada al pedido

@VistaMesasMesero
Escenario: Intentar seleccionar mesa ocupada
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And existe una mesa con estado "Ocupada"
    When selecciona una mesa ocupada
    Then el sistema redirige a la pantalla de nuevo pedido para agregar ítems al pedido existente

@VistaMesasMesero
Escenario: Crear pedido para llevar
    Given que el usuario ha iniciado sesión con rol "MESERO"
    When selecciona la opción "Para llevar"
    Then el sistema redirige a la pantalla de nuevo pedido sin asociar ninguna mesa

@VistaMesasMesero
Escenario: Actualización automática del estado de mesas
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el módulo "Mesas"
    When han pasado 15 segundos desde la última carga
    Then el sistema actualiza automáticamente el estado de las mesas
    And refleja los cambios realizados por otros usuarios de la sucursal
