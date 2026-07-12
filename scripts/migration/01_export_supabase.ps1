$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Exportacion de Supabase - RestaurantOS ==="
Write-Host "Este script solo lee la base de datos de origen."
Write-Host ""

$DbHost = Read-Host "Host de Supabase"
$DbPort = Read-Host "Puerto de Supabase [5432]"

if ([string]::IsNullOrWhiteSpace($DbPort)) {
    $DbPort = "5432"
}

$DbName = Read-Host "Nombre de la base [postgres]"

if ([string]::IsNullOrWhiteSpace($DbName)) {
    $DbName = "postgres"
}

$DbUser = Read-Host "Usuario de Supabase"
$SecurePassword = Read-Host "Password de Supabase" -AsSecureString

$DbPassword = [System.Net.NetworkCredential]::new(
    "",
    $SecurePassword
).Password

$BackupDirectory = Join-Path $PSScriptRoot "backups"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupFile = Join-Path $BackupDirectory "restaurantos-public-$Timestamp.dump"
$ListFile = Join-Path $BackupDirectory "restaurantos-public-$Timestamp-list.txt"

New-Item `
    -ItemType Directory `
    -Path $BackupDirectory `
    -Force | Out-Null

$env:PGPASSWORD = $DbPassword

try {
    Write-Host ""
    Write-Host "Probando conexion con Supabase..."

    & psql `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--set=sslmode=require" `
        "--command=SELECT current_database(), current_user, version();"

    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible conectarse a Supabase."
    }

    Write-Host ""
    Write-Host "Generando dump del esquema public..."

    & pg_dump `
        "--host=$DbHost" `
        "--port=$DbPort" `
        "--username=$DbUser" `
        "--dbname=$DbName" `
        "--format=custom" `
        "--schema=public" `
        "--no-owner" `
        "--no-privileges" `
        "--verbose" `
        "--file=$BackupFile"

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump termino con errores."
    }

    Write-Host ""
    Write-Host "Validando el archivo generado..."

    & pg_restore `
        "--list" `
        $BackupFile |
        Out-File `
            -FilePath $ListFile `
            -Encoding utf8

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo leer el contenido del dump."
    }

    $BackupInfo = Get-Item $BackupFile

    if ($BackupInfo.Length -le 0) {
        throw "El archivo de respaldo esta vacio."
    }

    Write-Host ""
    Write-Host "Exportacion completada correctamente."
    Write-Host "Dump: $BackupFile"
    Write-Host "Lista: $ListFile"
    Write-Host "Tamano: $($BackupInfo.Length) bytes"
}
finally {
    $env:PGPASSWORD = $null
    $DbPassword = $null
    $SecurePassword = $null
}