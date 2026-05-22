Feature: Editar producto

Como administrador
Quiero editar productos del menú
Para actualizar la información de los productos

Criterios de Aceptación

@EditarProducto
Escenario: Modificar nombre
    Given que existe un producto registrado
    When el administrador modifica el nombre
    Then el sistema actualiza el nombre correctamente

@EditarProducto
Escenario: Modificar precio
    Given que existe un producto registrado
    When el administrador modifica el precio
    Then el sistema actualiza el precio correctamente

@EditarProducto
Escenario: Modificar descripción
    Given que existe un producto registrado
    When el administrador modifica la descripción
    Then el sistema actualiza la descripción correctamente

@EditarProducto
Escenario: Guardar cambios
    Given que el administrador realizó modificaciones
    When selecciona la opción "Guardar cambios"
    Then el sistema actualiza la información del producto
