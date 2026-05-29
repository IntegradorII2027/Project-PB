Feature: Gestión de usuarios administrador

Como administrador
Quiero administrar los usuarios del sistema
Para controlar el acceso del personal la sucursal

Criterios de Aceptación

@GestionUsuariosAdmin
Escenario: Crear usuario asociado a la sucursal del administrador
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    When ingresa al módulo "Personal"
    And selecciona la opción "Nuevo usuario"
    And registra nombre, email, contraseña, rol, sucursal y estado
    Then el sistema crea el usuario correctamente
    And el usuario aparece en la tabla de usuarios

@GestionUsuariosDuenoAdmin
Escenario: Ver información de un usuario
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And existe un usuario registrado en el sistema
    When selecciona el ícono de visualización del usuario
    Then el sistema abre el modal de información del usuario
    And muestra nombre, email, rol, sucursal, fecha de creación y estado

@GestionUsuariosAdmin
Escenario: Editar información de un usuario
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And existe un usuario registrado en el sistema
    When abre la información del usuario
    And selecciona la opción "Editar"
    And modifica nombre, email, rol, sucursal, contraseña o estado
    Then el sistema guarda los cambios correctamente
    And la tabla refleja la información actualizada

@GestionUsuariosAdmin
Escenario: Inactivar usuario
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And existe un usuario activo registrado en el sistema
    When abre la información del usuario
    And cambia el estado a "Inactivo"
    Then el sistema actualiza el estado del usuario
    And el usuario queda impedido de iniciar sesión en el sistema

@GestionUsuariosAdmin
Escenario: Validar email duplicado al editar usuario
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And existe un usuario registrado en el sistema
    And existe otro usuario con un email ya registrado
    When intenta actualizar el email del usuario con un correo duplicado
    Then el sistema impide la actualización
    And muestra un mensaje indicando que el email ya está registrado