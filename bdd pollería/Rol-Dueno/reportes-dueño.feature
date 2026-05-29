Feature: Reportes del Dueño

Como dueño
Quiero consultar reportes generales del negocio
Para analizar el rendimiento de las sucursales y tomar decisiones

Criterios de Aceptación

@ReportesDueno
Escenario: Visualizar reporte general del negocio
    Given que el usuario ha iniciado sesión con rol "DUENO"
    When ingresa al módulo "Reportes"
    Then el sistema muestra indicadores generales del negocio
    And muestra ventas totales, pedidos pagados, ticket promedio, productos destacados y detalle de pedidos

@ReportesDueno
Escenario: Filtrar reporte por rango de fechas
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And se encuentra en el módulo "Reportes"
    When selecciona un rango de fechas válido
    Then el sistema actualiza la información del reporte
    And muestra los datos correspondientes al periodo seleccionado

@ReportesDueno
Escenario: Filtrar reporte por sucursal
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen sucursales disponibles para consultar
    When selecciona una sucursal específica en el filtro
    Then el sistema muestra únicamente la información correspondiente a la sucursal seleccionada

@ReportesDueno
Escenario: Restablecer filtros del reporte
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen filtros aplicados en el módulo "Reportes"
    When selecciona la opción "Restablecer"
    Then el sistema vuelve al rango de fechas predeterminado
    And muestra nuevamente la información general del reporte