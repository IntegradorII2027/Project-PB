Feature: Gestionar mesas

Como administrador
Quiero gestionar las mesas de la sucursal
Para mantener un buen control de las mismas

Criterios de Aceptación

@GestionarMesa
Escenario: Identificación de mesa
    Given que existen varias mesas registradas
    When el administrador visualiza el listado de mesas
    Then cada mesa muestra su número de mesa y capacidad

@GestionarMesa
Escenario: Agregar mesa
    Given que el administrador accede al módulo de mesas
    And selecciona la opción "Nueva mesa"
    When registra el número de mesa y capacidad
    Then el sistema muestra la nueva mesa junto con su número, capacidad y estado "Libre"

@GestionarMesa
Escenario: Editar mesa
    Given que existe una mesa registrada
    And el administrador selecciona la opción "Editar mesa"
    When el administrador modifica la información de la mesa
    Then el sistema actualiza los datos de la mesa

