Feature: Marcar asistencia

Como administrador
Quiero marcar la asistencia del personal
Para controlar el acceso del personal y registrar su tardanza

Criterios de Aceptación

@GestionUsuariosAdmin
Escenario: Visualizar asistencia
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And se encuentra en el módulo de "Asistencias"
    When selecciona EL buscador personal y aplica filtros de rol y estados
    Then el sistema muestra la lista del personal con su estado de asistencia correspondiente

@GestionUsuariosAdmin
Escenario: Registrar asistencia
    Given que el usuario ha iniciado sesión con rol "ADMIN"
    And se encuentra en el módulo de "Asistencias"
    When selecciona a un trabajador y marca su asistencia
    Then el sistema registra la asistencia correctamente
    And la tabla de asistencias se actualiza y marca como "Presente"

