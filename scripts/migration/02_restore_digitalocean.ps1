$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Restauracion en DigitalOcean - RestaurantOS ==="
Write-Host ""
Write-Host "Este script restaurara un dump dentro de la base de destino."
Write-Host "La base de destino debe estar vacia."
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

$DbUser = Read-Host "Usuario administrativo [doadmin]"

if ([string]::IsNullOrWhiteSpace($DbUser)) {
    $DbUser = "doadmin"
}

$SecurePassword = Read-Host "Password de DigitalOcean" -AsSecureString

$DbPassword = [System.Net.NetworkCredential]::new(
    "",
    $SecurePassword
).Password

$BackupDirectory = Join-Path $PSScriptRoot "backups"

$BackupFiles = Get-ChildItem `
    -Path $BackupDirectory `
    -Filter "restaurantos-public-*.dump" |
    Sort-Object LastWriteTime -Descending

if (-not $BackupFiles) {
    throw "No se encontro ningun archivo .dump en $BackupDirectory"
}

$BackupFile = $BackupFiles[0].FullName

Write-Host ""
Write-Host "Se usara el respaldo mas reciente:"
Write-Host $BackupFile
Write-Host ""

$Confirmation = Read-Host "Escribe RESTAURAR para continuar"

if ($Confirmation -ne "RESTAURAR") {
    throw "Restauracion cancelada."
}

$env:PGPASSWORD = $DbPassword
$env:PGSSLMODE = "require"

try {
    Write-Host ""
    Write-Host "Probando conexion con DigitalOcean..."

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--command=SELECT current_database(), current_user, version();"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible conectarse a DigitalOcean."
    }

    Write-Host ""
    Write-Host "Comprobando que la base de destino este vacia..."

    $ExistingTables = & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--tuples-only" `
        "--no-align" `
        "--command=SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible revisar la base de destino."
    }

    $TableCount = [int]($ExistingTables.Trim())

    if ($TableCount -gt 0) {
        throw "La base de destino ya contiene $TableCount tablas en public. No se restaurara para evitar sobrescribir informacion."
    }

    Write-Host ""
    Write-Host "Eliminando el esquema public vacio de DigitalOcean..."

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--command=DROP SCHEMA public CASCADE;"

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo eliminar el esquema public vacio."
    }

    Write-Host ""
    Write-Host "Restaurando el respaldo..."

    & pg_restore `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--no-owner" `
        "--no-privileges" `
        "--exit-on-error" `
        "--verbose" `
        $BackupFile

    if ($LASTEXITCODE -ne 0) {
        throw "pg_restore termino con errores."
    }

    Write-Host ""
    Write-Host "Restauracion completada correctamente."
}
finally {
    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $DbPassword = $null
    $SecurePassword = $null
}