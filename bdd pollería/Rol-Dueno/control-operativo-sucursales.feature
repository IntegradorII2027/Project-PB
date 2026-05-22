Feature: Control operativo de sucursales

Como dueño
Quiero abrir o cerrar una sucursal
Para controlar si el local puede operar durante el día

Criterios de Aceptación

@ControlOperativoSucursal
Escenario: Abrir una sucursal cerrada
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existe una sucursal con estado "Cerrado"
    When selecciona la opción para abrir la sucursal
    And confirma la acción
    Then el sistema cambia el estado de la sucursal a "Abierto"
    And muestra la sucursal como disponible para operar

@ControlOperativoSucursal
Escenario: Cerrar una sucursal abierta
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existe una sucursal con estado "Abierto"
    When selecciona la opción para cerrar la sucursal
    And confirma la acción
    Then el sistema cambia el estado de la sucursal a "Cerrado"
    And restringe la operación de usuarios operativos asociados a dicha sucursal