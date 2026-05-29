Feature: Iniciar sesión

Como usuario
Quiero iniciar sesión en la web del sistema
Para acceder al sistema de gestión de la pollería

Criterios de Aceptación

@IniciarSesion
Escenario: Inicio de sesión exitoso
    Given que el usuario se encuentra en la pantalla de inicio de sesión
    When ingresa un correo y contraseña válidos
    And presiona el botón "Iniciar sesión"
    Then el sistema valida las credenciales
    And redirecciona al usuario al panel principal según su rol

@IniciarSesion
Scenario: Datos incompletos
    Given que el usuario se encuentra en la pantalla de inicio de sesión
    When deja campos obligatorios vacíos
    And presiona el botón "Iniciar sesión"
    Then el sistema muestra un mensaje indicando que debe completar todos los campos
    
@IniciarSesion
Scenario: Credenciales incorrectas
    Given que el usuario se encuentra en la pantalla de inicio de sesión
    When ingresa un correo o contraseña incorrectos
    And presiona el botón "Iniciar sesión"
    Then el sistema muestra un mensaje de credenciales incorrectas junto con 2 intentos restantes
    And mantiene al usuario en la pantalla de inicio de sesión

@IniciarSesion
Scenario: Acceso fallido por tercera vez
    Given que el usuario realizó dos intentos fallidos de inicio de sesión
    When ingresa nuevamente credenciales incorrectas
    And presiona el botón "Iniciar sesión"
    Then el sistema bloquea temporalmente el acceso
    And muestra un mensaje de límite de intentos alcanzado y muestra un temporizador de 1 minuto para el próximo intento

@IniciarSesion
Scenario: Cierre de sesión
    Given que el usuario ha iniciado sesión en el sistema
    When selecciona la opción "Cerrar sesión"
    Then el sistema finaliza la sesión activa
    And redirecciona al usuario a la pantalla de inicio de sesión