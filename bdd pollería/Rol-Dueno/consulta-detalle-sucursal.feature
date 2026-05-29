Feature: Consulta de detalle de sucursal

Como dueño
Quiero visualizar el detalle de una sucursal
Para revisar su información general, estado y personal asignado

Criterios de Aceptación

@DetalleSucursal
Escenario: Acceder al detalle de una sucursal
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en el módulo "Sucursales"
    When selecciona el ícono de visualización de una sucursal
    Then el sistema redirige a la vista de detalle de la sucursal
    And muestra la información principal del local seleccionado

@DetalleSucursal
Escenario: Visualizar personal asignado a una sucursal
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en la vista de detalle de una sucursal
    When el sistema carga la información del local
    Then muestra el personal asignado a la sucursal
    And muestra nombre, rol y estado del usuario cuando la información está disponible

@DetalleSucursal
Escenario: Editar información de una sucursal desde la vista de detalle
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en la vista de detalle de una sucursal
    When selecciona el botón "Editar"
    And modifica datos como nombre, dirección, teléfono, horario o días de operación en el modal
    And guarda los cambios
    Then el sistema actualiza la información de la sucursal correctamente
    And muestra los datos actualizados en la vista de detalle