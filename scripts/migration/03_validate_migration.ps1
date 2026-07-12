$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== Validacion de migracion - RestaurantOS ==="
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

$env:PGPASSWORD = $DbPassword
$env:PGSSLMODE = "require"

$ValidationFailed = $false

function Invoke-ScalarQuery {
    param (
        [string]$Query
    )

    $TempQueryFile = Join-Path `
        $env:TEMP `
        "restaurantos-validation-$([guid]::NewGuid().ToString()).sql"

    try {
        $Utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

        [System.IO.File]::WriteAllText(
            $TempQueryFile,
            $Query,
            $Utf8WithoutBom
        )

        $Result = & psql `
            "--host=$DbHost" `
            "--port=$DbPort" `
            "--username=$DbUser" `
            "--dbname=$DbName" `
            "--tuples-only" `
            "--no-align" `
            "--file=$TempQueryFile"

        if ($LASTEXITCODE -ne 0) {
            throw "Error al ejecutar una consulta de validacion."
        }

        return ($Result | Out-String).Trim()
    }
    finally {
        if (Test-Path $TempQueryFile) {
            Remove-Item $TempQueryFile -Force
        }
    }
}

function Test-ExpectedValue {
    param (
        [string]$Name,
        [string]$Actual,
        [string]$Expected
    )

    if ($Actual -eq $Expected) {
        Write-Host "[OK] $Name = $Actual"
    }
    else {
        Write-Host "[ERROR] $Name. Esperado: $Expected. Actual: $Actual"
        $script:ValidationFailed = $true
    }
}

try {
    Write-Host "Probando conexion..."

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
    Write-Host "--- Validando tablas ---"

    $TableCount = Invoke-ScalarQuery @"
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
"@

    Test-ExpectedValue "Cantidad de tablas" $TableCount "9"

    Write-Host ""
    Write-Host "--- Validando registros ---"

    $ExpectedCounts = [ordered]@{
        "_prisma_migrations" = 4
        "Asistencia"         = 6
        "Categoria"          = 7
        "ItemPedido"         = 32
        "Mesa"               = 13
        "Pedido"             = 7
        "Producto"           = 16
        "Sucursal"           = 7
        "Usuario"            = 12
    }

    foreach ($Table in $ExpectedCounts.Keys) {
        $Query = 'SELECT COUNT(*) FROM public."' + $Table + '";'
        $ActualCount = Invoke-ScalarQuery $Query
        $ExpectedCount = $ExpectedCounts[$Table].ToString()

        Test-ExpectedValue `
            "Registros en $Table" `
            $ActualCount `
            $ExpectedCount
    }

    Write-Host ""
    Write-Host "--- Validando ENUM ---"

    $EnumCount = Invoke-ScalarQuery @"
SELECT COUNT(DISTINCT t.typname)
FROM pg_type t
JOIN pg_enum e
  ON t.oid = e.enumtypid
JOIN pg_namespace n
  ON n.oid = t.typnamespace
WHERE n.nspname = 'public';
"@

    Test-ExpectedValue "Cantidad de tipos ENUM" $EnumCount "4"

    Write-Host ""
    Write-Host "--- Validando migraciones de Prisma ---"

    $MigrationCount = Invoke-ScalarQuery @"
SELECT COUNT(*)
FROM public."_prisma_migrations"
WHERE rolled_back_at IS NULL;
"@

    Test-ExpectedValue `
        "Migraciones de Prisma aplicadas" `
        $MigrationCount `
        "4"

    Write-Host ""
    Write-Host "--- Validando secuencia de pedidos ---"

    $SequenceValue = Invoke-ScalarQuery @"
SELECT last_value
FROM public."Pedido_numero_seq";
"@

    Test-ExpectedValue `
        "Ultimo valor de Pedido_numero_seq" `
        $SequenceValue `
        "7"

    Write-Host ""
    Write-Host "--- Validando claves foraneas ---"

    $ForeignKeyCount = Invoke-ScalarQuery @"
SELECT COUNT(*)
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';
"@

    Test-ExpectedValue `
        "Cantidad de claves foraneas" `
        $ForeignKeyCount `
        "13"

    Write-Host ""
    Write-Host "--- Validando indices ---"

    $IndexCount = Invoke-ScalarQuery @"
SELECT COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public';
"@

    Test-ExpectedValue `
        "Cantidad de indices" `
        $IndexCount `
        "12"

    Write-Host ""

    if ($ValidationFailed) {
        Write-Host "VALIDACION FINAL: FALLIDA"
        Write-Host "Existe al menos una diferencia respecto a Supabase."
        exit 1
    }

    Write-Host "VALIDACION FINAL: CORRECTA"
    Write-Host "La estructura y los datos coinciden con la linea base de Supabase."
}
finally {
    $env:PGPASSWORD = $null
    $env:PGSSLMODE = $null
    $DbPassword = $null
    $SecurePassword = $null
}