$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Prueba del usuario restaurantos_app ==="
Write-Host ""
Write-Host "Esta prueba no modifica registros."
Write-Host ""

$DbHost = Read-Host "Host publico de DigitalOcean"

$DbPort = Read-Host "Puerto [25060]"
if ([string]::IsNullOrWhiteSpace($DbPort)) {
    $DbPort = "25060"
}

$DbName = Read-Host "Base de datos [restaurantos]"
if ([string]::IsNullOrWhiteSpace($DbName)) {
    $DbName = "restaurantos"
}

$DbUser = Read-Host "Usuario [restaurantos_app]"
if ([string]::IsNullOrWhiteSpace($DbUser)) {
    $DbUser = "restaurantos_app"
}

$SecurePassword = Read-Host "Password de restaurantos_app" -AsSecureString

$DbPassword = [System.Net.NetworkCredential]::new(
    "",
    $SecurePassword
).Password

$env:PGPASSWORD = $DbPassword
$env:PGSSLMODE = "require"

$TempSqlFile = Join-Path `
    $env:TEMP `
    "restaurantos-app-test-$([guid]::NewGuid().ToString()).sql"

try {
    $Sql = @"
SELECT
    current_database() AS base,
    current_user AS usuario;

SELECT
    has_schema_privilege(current_user, 'public', 'USAGE')
    AS puede_usar_schema;

SELECT
    has_table_privilege(
        current_user,
        'public."Usuario"',
        'SELECT,INSERT,UPDATE,DELETE'
    ) AS permisos_usuario;

SELECT
    has_table_privilege(
        current_user,
        'public."Pedido"',
        'SELECT,INSERT,UPDATE,DELETE'
    ) AS permisos_pedido;

SELECT
    has_sequence_privilege(
        current_user,
        'public."Pedido_numero_seq"',
        'USAGE,SELECT'
    ) AS permisos_secuencia;

SELECT COUNT(*) AS cantidad_usuarios
FROM public."Usuario";

SELECT COUNT(*) AS cantidad_pedidos
FROM public."Pedido";
"@

    $Utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

    [System.IO.File]::WriteAllText(
        $TempSqlFile,
        $Sql,
        $Utf8WithoutBom
    )

    Write-Host ""
    Write-Host "Probando conexion y permisos..."

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--file=$TempSqlFile" `
        "--set=ON_ERROR_STOP=1"

    if ($LASTEXITCODE -ne 0) {
        throw "La prueba del usuario de aplicacion fallo."
    }

    Write-Host ""
    Write-Host "PRUEBA CORRECTA: restaurantos_app puede conectarse y acceder a RestaurantOS."
}
finally {
    if (Test-Path $TempSqlFile) {
        Remove-Item $TempSqlFile -Force
    }

    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $DbPassword = $null
    $SecurePassword = $null
}