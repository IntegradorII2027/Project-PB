Feature: Filtros de usuarios

Como dueño
Quiero filtrar la lista de usuarios
Para encontrar rápidamente al personal registrado en el sistema

Criterios de Aceptación

@FiltrosUsuarios
Escenario: Filtrar usuarios por búsqueda
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen usuarios registrados en el sistema
    When ingresa un texto de búsqueda por nombre, email o sucursal
    Then el sistema muestra únicamente los usuarios que coinciden con la búsqueda

@FiltrosUsuarios
Escenario: Filtrar usuarios por rol, sucursal y estado
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen usuarios registrados en diferentes roles, sucursales y estados
    When aplica filtros por rol, sucursal y estado
    Then el sistema muestra únicamente los usuarios que cumplen con los filtros seleccionados
    And actualiza el contador de usuarios mostrados

@FiltrosUsuarios
Escenario: Limpiar filtros aplicados
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen filtros aplicados en la tabla de usuarios
    When selecciona la opción "Limpiar filtros"
    Then el sistema restablece los filtros a su estado inicial
    And muestra nuevamente la lista completa de usuarios disponibles