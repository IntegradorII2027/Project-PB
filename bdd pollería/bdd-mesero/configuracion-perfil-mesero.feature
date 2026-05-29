Feature: Configuración del perfil del Mesero

Como mesero
Quiero actualizar la información de mi perfil
Para mantener mis datos personales correctamente registrados

Criterios de Aceptación

@ConfiguracionMesero
Escenario: Actualizar nombre del perfil
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el módulo "Configuración"
    When modifica su nombre
    And guarda los cambios
    Then el sistema actualiza la información del perfil
    And muestra el nuevo nombre en la interfaz del sistema

@ConfiguracionMesero
Escenario: Cambiar contraseña del perfil
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el módulo "Configuración"
    When ingresa su contraseña actual
    And registra y confirma una nueva contraseña válida
    Then el sistema actualiza la contraseña correctamente
    And limpia los campos del formulario de cambio de contraseña

@ConfiguracionMesero
Escenario: Validar confirmación de nueva contraseña
    Given que el usuario ha iniciado sesión con rol "MESERO"
    And se encuentra en el formulario de cambio de contraseña
    When ingresa una nueva contraseña
    And la confirmación de contraseña no coincide
    Then el sistema impide la actualización
    And muestra un mensaje indicando que las contraseñas no coinciden
