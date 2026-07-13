$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Verificacion de base de datos - RestaurantOS ==="
Write-Host ""
Write-Host "Este script solo realiza consultas de lectura."
Write-Host "No crea, modifica ni elimina registros."
Write-Host ""

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "No se encontro psql en el PATH."
}

$DbHost = Read-Host "Host publico de DigitalOcean"
$DbPort = Read-Host "Puerto [25060]"

if ([string]::IsNullOrWhiteSpace($DbPort)) {
    $DbPort = "25060"
}

$DbName = Read-Host "Nombre de la base [defaultdb]"

if ([string]::IsNullOrWhiteSpace($DbName)) {
    $DbName = "defaultdb"
}

$DbUser = Read-Host "Usuario [doadmin]"

if ([string]::IsNullOrWhiteSpace($DbUser)) {
    $DbUser = "doadmin"
}

$SecurePassword = Read-Host "Password de DigitalOcean" -AsSecureString

$DbPassword = [System.Net.NetworkCredential]::new(
    "",
    $SecurePassword
).Password

$env:PGPASSWORD = $DbPassword
$env:PGSSLMODE = "require"

try {
    Write-Host ""
    Write-Host "Identidad de la conexion:"
    Write-Host ""

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--command=SELECT current_database() AS base, current_user AS usuario, version();"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible conectarse a la base de datos."
    }

    Write-Host ""
    Write-Host "Cantidad actual de registros:"
    Write-Host ""

        $CountQuery = @'
SELECT 'Usuario' AS entidad, COUNT(*) AS cantidad FROM "Usuario"
UNION ALL
SELECT 'Sucursal', COUNT(*) FROM "Sucursal"
UNION ALL
SELECT 'Mesa', COUNT(*) FROM "Mesa"
UNION ALL
SELECT 'Categoria', COUNT(*) FROM "Categoria"
UNION ALL
SELECT 'Producto', COUNT(*) FROM "Producto"
UNION ALL
SELECT 'Pedido', COUNT(*) FROM "Pedido"
UNION ALL
SELECT 'ItemPedido', COUNT(*) FROM "ItemPedido"
UNION ALL
SELECT 'Asistencia', COUNT(*) FROM "Asistencia"
ORDER BY entidad;
'@

    $CountQuery | & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--set=ON_ERROR_STOP=1"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible consultar las cantidades."
    }

    Write-Host ""
    Write-Host "Verificacion completada. No se modificaron datos."
}
finally {
    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $DbPassword = $null
    $SecurePassword = $null
}
