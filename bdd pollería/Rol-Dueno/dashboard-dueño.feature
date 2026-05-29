Feature: Dashboard del Dueño

Como dueño
Quiero visualizar un resumen general del negocio
Para conocer el estado operativo y comercial de todas las sucursales

Criterios de Aceptación

@DashboardDueno
Escenario: Visualizar resumen general del negocio
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen sucursales registradas en el sistema
    When ingresa al módulo "Dashboard"
    Then el sistema muestra el resumen general del negocio
    And muestra ventas del día, pedidos del día, sucursales abiertas y personal activo

@DashboardDueno
Escenario: Visualizar ventas por sucursal
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen ventas registradas en una o más sucursales
    When ingresa al módulo "Dashboard"
    Then el sistema muestra el gráfico de ventas por sucursal
    And permite comparar el rendimiento de los locales registrados

@DashboardDueno
Escenario: Visualizar dashboard sin ventas registradas
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And no existen ventas registradas durante el día
    When ingresa al módulo "Dashboard"
    Then el sistema muestra los indicadores de ventas en cero
    And muestra un mensaje indicando que aún no hay ventas registradas