$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Permisos de restaurantos_app - RestaurantOS ==="
Write-Host ""
Write-Host "Este script otorga permisos de uso a la aplicacion."
Write-Host "No elimina tablas ni modifica registros."
Write-Host ""

$DbHost = Read-Host "Host publico de DigitalOcean"

$DbPort = Read-Host "Puerto de DigitalOcean [25060]"
if ([string]::IsNullOrWhiteSpace($DbPort)) {
    $DbPort = "25060"
}

$DbName = Read-Host "Nombre de la base [restaurantos]"
if ([string]::IsNullOrWhiteSpace($DbName)) {
    $DbName = "restaurantos"
}

$AdminUser = Read-Host "Usuario administrativo [doadmin]"
if ([string]::IsNullOrWhiteSpace($AdminUser)) {
    $AdminUser = "doadmin"
}

$AppUser = Read-Host "Usuario de la aplicacion [restaurantos_app]"
if ([string]::IsNullOrWhiteSpace($AppUser)) {
    $AppUser = "restaurantos_app"
}

$SecurePassword = Read-Host "Password de doadmin" -AsSecureString

$DbPassword = [System.Net.NetworkCredential]::new(
    "",
    $SecurePassword
).Password

$env:PGPASSWORD = $DbPassword
$env:PGSSLMODE = "require"

$TempSqlFile = Join-Path `
    $env:TEMP `
    "restaurantos-permissions-$([guid]::NewGuid().ToString()).sql"

try {
    $Sql = @"
GRANT CONNECT ON DATABASE "$DbName" TO "$AppUser";

GRANT USAGE ON SCHEMA public TO "$AppUser";

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO "$AppUser";

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO "$AppUser";

ALTER DEFAULT PRIVILEGES
FOR ROLE "$AdminUser"
IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES
TO "$AppUser";

ALTER DEFAULT PRIVILEGES
FOR ROLE "$AdminUser"
IN SCHEMA public
GRANT USAGE, SELECT
ON SEQUENCES
TO "$AppUser";
"@

    $Utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

    [System.IO.File]::WriteAllText(
        $TempSqlFile,
        $Sql,
        $Utf8WithoutBom
    )

    Write-Host ""
    Write-Host "Otorgando permisos..."

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$AdminUser" `
        "--dbname=$DbName" `
        "--file=$TempSqlFile" `
        "--set=ON_ERROR_STOP=1"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible otorgar los permisos."
    }

    Write-Host ""
    Write-Host "Permisos otorgados correctamente a $AppUser."
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