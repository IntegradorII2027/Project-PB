Feature: Eliminar producto

Como administrador
Quiero eliminar productos del menú
Para retirar productos que ya no se ofrecen

Criterios de Aceptación

@EliminarProducto
Escenario: Seleccionar producto
    Given que existen productos registrados
    When el administrador selecciona un producto
    Then el sistema muestra la información del producto

@EliminarProducto
Escenario: Confirmar eliminación
    Given que el administrador seleccionó un producto
    When confirma la eliminación
    Then el sistema elimina el producto del menú

@EliminarProducto
Escenario: Producto no disponible
    Given que un producto fue eliminado
    When el mesero consulta el menú
    Then el producto no aparece disponible
