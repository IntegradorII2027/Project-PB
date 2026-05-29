Feature: Gestión de sucursales

Como dueño
Quiero administrar las sucursales del negocio
Para controlar la operación de cada local

Criterios de Aceptación

@GestionSucursales
Escenario: Visualizar listado de sucursales
    Given que el usuario ha iniciado sesión con rol "DUENO"
    When ingresa al módulo "Sucursales"
    Then el sistema muestra el listado de sucursales registradas
    And muestra nombre, estado operativo, dirección, teléfono, horario y acciones disponibles

@GestionSucursales
Escenario: Crear sucursal con datos válidos
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en el módulo "Sucursales"
    When selecciona la opción "Nueva sucursal"
    And registra nombre, dirección, teléfono, horario y días de operación válidos
    Then el sistema crea la sucursal correctamente
    And la nueva sucursal aparece en el listado de sucursales

@GestionSucursales
Escenario: Validar datos obligatorios al crear sucursal
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en el formulario de nueva sucursal
    When intenta guardar la sucursal sin completar los datos obligatorios o con datos inválidos
    Then el sistema impide el registro de la sucursal
    And muestra mensajes de validación correspondientes