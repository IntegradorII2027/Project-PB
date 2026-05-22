Feature: Exportación de reportes

Como dueño
Quiero exportar la información del reporte
Para analizar los datos fuera del sistema

Criterios de Aceptación

@ExportarReportes
Escenario: Exportar reporte en formato CSV
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And existen datos cargados en el módulo "Reportes"
    When selecciona la opción "Exportar CSV"
    Then el sistema genera un archivo CSV con la información del reporte
    And el archivo contiene los datos del periodo y sucursal seleccionados

@ExportarReportes
Escenario: Exportar reporte sin datos disponibles
    Given que el usuario ha iniciado sesión con rol "DUENO"
    And no existen datos para el periodo seleccionado en el módulo "Reportes"
    When selecciona la opción "Exportar CSV"
    Then el sistema genera el archivo con la estructura correspondiente
    And mantiene la consistencia de los encabezados del reporte