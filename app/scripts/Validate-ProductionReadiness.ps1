[CmdletBinding()]
param(
    [string]$ProductionUrl = "https://dayflow-palmid3v.vercel.app"
)

$ErrorActionPreference = "Stop"
$AppRoot = Split-Path -Parent $PSScriptRoot
$RepoRoot = Split-Path -Parent $AppRoot
$results = @()

function Add-Check {
    param(
        [string]$Area,
        [string]$Check,
        [ValidateSet("PASS","FAIL","WARN")]
        [string]$Status,
        [string]$Details = ""
    )

    $script:results += [pscustomobject]@{
        Area = $Area
        Check = $Check
        Status = $Status
        Details = $Details
    }

    $symbol = switch ($Status) {
        "PASS" { "[PASS]" }
        "FAIL" { "[FAIL]" }
        "WARN" { "[WARN]" }
    }

    $suffix = if ($Details) { " - $Details" } else { "" }
    Write-Host "$symbol $Area :: $Check$suffix"
}

function Test-Text {
    param(
        [string]$Path,
        [string]$Pattern,
        [string]$Area,
        [string]$Check
    )

    if (-not (Test-Path $Path)) {
        Add-Check $Area $Check "FAIL" "Missing file: $Path"
        return
    }

    $content = Get-Content -Raw -Path $Path
    if ($content -match $Pattern) {
        Add-Check $Area $Check "PASS"
    } else {
        Add-Check $Area $Check "FAIL" "Expected pattern was not found"
    }
}

Write-Host "DayFlow Phase 16 Production Readiness"
Write-Host "App: $AppRoot"
Write-Host "Production: $ProductionUrl"
Write-Host ""

Test-Text "$RepoRoot/firebase.json" '"rules"\s*:\s*"firestore\.rules"' "Firebase" "Canonical Firestore rules path"
Test-Text "$AppRoot/vercel.json" '"ignoreCommand"' "Vercel" "Vercel app configuration"

$envExample = Join-Path $AppRoot ".env.example"
$requiredEnv = @(
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID"
)

if (Test-Path $envExample) {
    $envContent = Get-Content -Raw -Path $envExample
    $missing = @($requiredEnv | Where-Object { $envContent -notmatch "(?m)^$([regex]::Escape($_))=" })
    if ($missing.Count -eq 0) {
        Add-Check "Configuration" "Firebase environment template" "PASS" "All required VITE_FIREBASE keys are documented"
    } else {
        Add-Check "Configuration" "Firebase environment template" "FAIL" "Missing keys: $($missing -join ', ')"
    }
} else {
    Add-Check "Configuration" "Firebase environment template" "FAIL" "Missing $envExample"
}

$distManifest = Join-Path $AppRoot "dist/manifest.webmanifest"
if (Test-Path $distManifest) {
    try {
        $manifest = Get-Content -Raw -Path $distManifest | ConvertFrom-Json
        $icons = @($manifest.icons | ForEach-Object { [string]$_.src })
        $hasStandalone = [string]$manifest.display -eq "standalone"
        $hasIcons = ($icons -contains "/pwa-192.svg") -and ($icons -contains "/pwa-512.svg")

        if ($hasStandalone -and $hasIcons) {
            Add-Check "PWA" "Production build manifest" "PASS" "Standalone manifest and both production icons are present"
        } else {
            Add-Check "PWA" "Production build manifest" "FAIL" "Manifest must be standalone and include both production icons"
        }
    } catch {
        Add-Check "PWA" "Production build manifest" "FAIL" "Generated manifest is not valid JSON"
    }
} else {
    Add-Check "PWA" "Production build manifest" "WARN" "Run npm run build before this check"
}

try {
    $response = Invoke-WebRequest -Uri $ProductionUrl -Method Get -MaximumRedirection 5 -TimeoutSec 20
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Add-Check "Production" "Production URL reachable" "PASS" "HTTP $($response.StatusCode)"
    } else {
        Add-Check "Production" "Production URL reachable" "FAIL" "HTTP $($response.StatusCode)"
    }
} catch {
    Add-Check "Production" "Production URL reachable" "FAIL" $_.Exception.Message
}

$failCount = @($results | Where-Object Status -eq "FAIL").Count
$warnCount = @($results | Where-Object Status -eq "WARN").Count
$passCount = @($results | Where-Object Status -eq "PASS").Count

Write-Host ""
Write-Host "Summary: PASS=$passCount FAIL=$failCount WARN=$warnCount"

if ($failCount -gt 0) {
    exit 1
}

exit 0
