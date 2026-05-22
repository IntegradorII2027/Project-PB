Feature: Agregar producto

Como administrador
Quiero agregar nuevos productos al menú
Para mantener actualizada la carta

Criterios de Aceptación

@AgregarProducto
Escenario: Registro del nombre
    Given que el administrador ha iniciado sesión con rol "admin"
    When el administrador accede al módulo de productos
    And selecciona la opción "Nuevo producto"
    And ingresa el nombre del producto
    Then el sistema registra el nuevo producto

@AgregarProducto
Escenario: Registro del precio
    Given que el administrador registra un producto
    When ingresa el precio del producto
    Then el sistema valida el dato ingresado

@AgregarProducto
Escenario: Registro de la descripción
    Given que el administrador registra un producto
    When ingresa la descripción del producto
    Then el sistema almacena la información ingresada

@AgregarProducto
Escenario: Guardar producto
    Given que todos los datos del producto son válidos
    When el administrador selecciona "Guardar"
    Then el sistema registra el nuevo producto en el menú
