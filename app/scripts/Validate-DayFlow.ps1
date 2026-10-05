# DayFlow - Automated Validation Runner
[CmdletBinding()]
param(
    [string]$AppPath = (Join-Path $PSScriptRoot ".."),
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$AppPath = (Resolve-Path $AppPath).Path
$RepoPath = Split-Path $AppPath -Parent
$ReportDir = Join-Path $AppPath "validation-reports"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ReportDir "validation-$Timestamp.md"
$E2EJsonPath = Join-Path $ReportDir "e2e-results.json"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Results = New-Object System.Collections.Generic.List[object]

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host ("=" * 72) -ForegroundColor DarkGray
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ("=" * 72) -ForegroundColor DarkGray
}

function Add-Result {
    param(
        [string]$Area,
        [string]$Check,
        [ValidateSet("PASS","FAIL","WARN","SKIP")]
        [string]$Status,
        [string]$Details = ""
    )

    $Results.Add([PSCustomObject]@{
        Area = $Area
        Check = $Check
        Status = $Status
        Details = $Details
    })

    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "SKIP" { "DarkYellow" }
    }

    Write-Host ("[{0}] {1} - {2}" -f $Status, $Check, $Details) -ForegroundColor $color
}

function Invoke-CheckedCommand {
    param(
        [string]$Area,
        [string]$Check,
        [string]$WorkingDirectory,
        [string]$Command,
        [string[]]$Arguments
    )

    Write-Host ""
    Write-Host (">> {0} {1}" -f $Command, ($Arguments -join " ")) -ForegroundColor DarkGray

    Push-Location $WorkingDirectory
    try {
        & $Command @Arguments
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            Add-Result $Area $Check "PASS" "Exit code 0"
            return $true
        }

        Add-Result $Area $Check "FAIL" "Exit code $exitCode"
        return $false
    }
    catch {
        Add-Result $Area $Check "FAIL" $_.Exception.Message
        return $false
    }
    finally {
        Pop-Location
    }
}

function Test-RequiredFile {
    param(
        [string]$Area,
        [string]$Path
    )

    if (Test-Path $Path) {
        Add-Result $Area "File exists: $Path" "PASS"
        return $true
    }

    Add-Result $Area "File exists: $Path" "FAIL" "Missing file"
    return $false
}

function Test-TextContains {
    param(
        [string]$Area,
        [string]$Path,
        [string]$Pattern,
        [string]$Description
    )

    if (-not (Test-Path $Path)) {
        Add-Result $Area $Description "FAIL" "Missing file: $Path"
        return $false
    }

    $content = Get-Content -Raw -Path $Path

    if ($content -match $Pattern) {
        Add-Result $Area $Description "PASS"
        return $true
    }

    Add-Result $Area $Description "FAIL" "Expected pattern not found"
    return $false
}

function New-MarkdownReport {
    $pass = @($Results | Where-Object Status -eq "PASS").Count
    $fail = @($Results | Where-Object Status -eq "FAIL").Count
    $warn = @($Results | Where-Object Status -eq "WARN").Count
    $skip = @($Results | Where-Object Status -eq "SKIP").Count

    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("# DayFlow Automated Validation Report")
    $lines.Add("")
    $lines.Add("- **Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")")
    $lines.Add("- **App path:** $AppPath")
    $lines.Add("- **Production URL:** $productionUrl")
    $lines.Add("- **PASS:** $pass")
    $lines.Add("- **FAIL:** $fail")
    $lines.Add("- **WARN:** $warn")
    $lines.Add("- **SKIP:** $skip")
    $lines.Add("")
    $lines.Add("## Results")
    $lines.Add("")
    $lines.Add("| Area | Check | Status | Details |")
    $lines.Add("|---|---|---|---|")

    foreach ($item in $Results) {
        $details = ($item.Details -replace "\|", "\|") -replace "`r?`n", " "
        $lines.Add("| $($item.Area) | $($item.Check) | $($item.Status) | $details |")
    }

    $lines.Add("")
    $lines.Add("## Release Decision")
    $lines.Add("")

    if ($fail -gt 0) {
        $lines.Add("**BLOCKED** - one or more automated checks failed.")
    }
    elseif ($warn -gt 0 -or $skip -gt 0) {
        $lines.Add("**NOT FULLY VALIDATED** - no failures, but warnings/skips remain.")
    }
    else {
        $lines.Add("**PASS** - all automated validation checks passed.")
    }

    $lines.Add("")
    $lines.Add("> Authentication secrets and Firebase configuration values are never written to this report.")

    Set-Content -Path $ReportPath -Value ($lines -join "`r`n") -Encoding UTF8
}

$productionUrl = $env:DAYFLOW_VALIDATE_URL
if ([string]::IsNullOrWhiteSpace($productionUrl)) {
    $productionUrl = "https://dayflow-palmid3v.vercel.app"
    $env:DAYFLOW_VALIDATE_URL = $productionUrl
}

Write-Host ""
Write-Host "DAYFLOW - AUTOMATED VALIDATION RUNNER" -ForegroundColor Cyan
Write-Host "PALMI-D3V" -ForegroundColor DarkGray
Write-Host ""
Write-Host "App:        $AppPath"
Write-Host "Target URL: $productionUrl"
Write-Host "Report:     $ReportPath"
Write-Host ""

Write-Section "1. ENVIRONMENT"

if (Get-Command node -ErrorAction SilentlyContinue) {
    Add-Result "Environment" "Node.js" "PASS" (node --version)
} else {
    Add-Result "Environment" "Node.js" "FAIL" "node command not found"
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Add-Result "Environment" "npm" "PASS" (npm --version)
} else {
    Add-Result "Environment" "npm" "FAIL" "npm command not found"
}

if (Get-Command git -ErrorAction SilentlyContinue) {
    $branch = git -C $RepoPath branch --show-current
    $head = git -C $RepoPath rev-parse --short HEAD
    Add-Result "Environment" "Git repository" "PASS" ("branch={0} head={1}" -f $branch, $head)
} else {
    Add-Result "Environment" "Git" "FAIL" "git command not found"
}

if (Get-Command firebase -ErrorAction SilentlyContinue) {
    Add-Result "Environment" "Firebase CLI" "PASS" (firebase --version)
} else {
    Add-Result "Environment" "Firebase CLI" "WARN" "firebase command not found"
}

Write-Section "2. REPOSITORY STRUCTURE"

$requiredFiles = @(
    (Join-Path $AppPath "package.json"),
    (Join-Path $AppPath "package-lock.json"),
    (Join-Path $AppPath "vite.config.js"),
    (Join-Path $AppPath "src/App.jsx"),
    (Join-Path $AppPath "src/lib/dayflowCloudStore.js"),
    (Join-Path $AppPath "src/lib/access.js"),
    (Join-Path $AppPath "src/features/tasks"),
    (Join-Path $AppPath "src/features/schedule"),
    (Join-Path $AppPath "src/features/calendar"),
    (Join-Path $AppPath "src/features/reminders"),
    (Join-Path $AppPath "src/features/memory"),
    (Join-Path $AppPath "src/features/dashboard"),
    (Join-Path $AppPath "src/components/AdminAccessPanel.jsx"),
    (Join-Path $AppPath "tests"),
    (Join-Path $AppPath "e2e/dayflow.spec.mjs"),
    (Join-Path $AppPath "e2e/fixtures/validation.ics"),
    (Join-Path $AppPath "playwright.config.mjs"),
    (Join-Path $RepoPath "firebase.json"),
    (Join-Path $RepoPath "firestore.rules")
)

foreach ($file in $requiredFiles) {
    Test-RequiredFile "Structure" $file | Out-Null
}

Write-Section "3. DEPENDENCIES"
Invoke-CheckedCommand "Dependencies" "npm ci" $AppPath "npm" @("ci", "--ignore-scripts", "--no-audit", "--no-fund") | Out-Null

Write-Section "4. APPLICATION CHECKS"
Invoke-CheckedCommand "Tests" "Unit/domain tests" $AppPath "npm" @("test") | Out-Null
Invoke-CheckedCommand "Quality" "ESLint" $AppPath "npm" @("run", "lint") | Out-Null
Invoke-CheckedCommand "Build" "Production build" $AppPath "npm" @("run", "build") | Out-Null

Write-Section "5. FIREBASE SOURCE VALIDATION"

$rulesPath = Join-Path $RepoPath "firestore.rules"
Test-TextContains "Firebase" $rulesPath 'match /appAccess/\{uid\}' "appAccess rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'function canUseDayFlowFeature' "feature permissions" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowPlans' "Today rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowResults' "Daily result rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowMemories' "Memory rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowReminders' "Reminder rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowImportedCalendarEvents' "Calendar event rules" | Out-Null
Test-TextContains "Firebase" $rulesPath 'dayflowCalendarImports' "Calendar import rules" | Out-Null

$firebaseConfig = Join-Path $RepoPath "firebase.json"
Test-TextContains "Firebase" $firebaseConfig '"rules": "firestore.rules"' "Root Firestore rules configuration" | Out-Null

Write-Section "6. PWA VALIDATION"
Test-RequiredFile "PWA" (Join-Path $AppPath "public/pwa-192.svg") | Out-Null
Test-RequiredFile "PWA" (Join-Path $AppPath "public/pwa-512.svg") | Out-Null
Test-TextContains "PWA" (Join-Path $AppPath "vite.config.js") 'VitePWA' "Vite PWA plugin" | Out-Null
Test-TextContains "PWA" (Join-Path $AppPath "vite.config.js") 'display:\s*"standalone"' "Standalone manifest configuration" | Out-Null

$generatedManifest = Join-Path $AppPath "dist/manifest.webmanifest"
Test-RequiredFile "PWA" $generatedManifest | Out-Null
if (Test-Path $generatedManifest) {
    Test-TextContains "PWA" $generatedManifest '"display"\s*:\s*"standalone"' "Generated standalone manifest" | Out-Null
    Test-TextContains "PWA" $generatedManifest '"pwa-192.svg"' "Generated PWA icon manifest" | Out-Null
}

Write-Section "7. FIREBASE CLI ACCESS"

if (Get-Command firebase -ErrorAction SilentlyContinue) {
    Push-Location $RepoPath
    try {
        firebase projects:list --json 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Add-Result "Firebase" "CLI authentication" "PASS" "Firebase project access confirmed"
        } else {
            Add-Result "Firebase" "CLI authentication" "WARN" "Firebase CLI could not confirm project access"
        }
    } catch {
        Add-Result "Firebase" "CLI authentication" "WARN" "Firebase CLI authentication could not be confirmed"
    } finally {
        Pop-Location
    }
}

Write-Section "8. PRODUCTION E2E"

$authFile = Join-Path $AppPath "playwright/.auth/dayflow.json"
$hasCredentials = (-not [string]::IsNullOrWhiteSpace($env:DAYFLOW_VALIDATE_EMAIL)) -and (-not [string]::IsNullOrWhiteSpace($env:DAYFLOW_VALIDATE_PASSWORD))

if (-not $hasCredentials -and -not (Test-Path $authFile)) {
    Add-Result "E2E" "Authentication bootstrap" "FAIL" "Set DAYFLOW_VALIDATE_EMAIL and DAYFLOW_VALIDATE_PASSWORD once, or provide a valid local Playwright auth state"
} else {
    $browserInstallOk = Invoke-CheckedCommand "E2E" "Playwright Chromium availability" $AppPath "npx" @("--yes", "playwright@1.63.0", "install", "chromium")

    if ($browserInstallOk) {
        Invoke-CheckedCommand "E2E" "Production browser flow" $AppPath "npx" @("--yes", "@playwright/test@1.63.0", "test", "--config=playwright.config.mjs") | Out-Null
        if (Test-Path $E2EJsonPath) {
            Add-Result "E2E" "Playwright result artifact" "PASS" $E2EJsonPath
        }
    }
}

Write-Section "9. VALIDATION SUMMARY"

New-MarkdownReport

$fail = @($Results | Where-Object Status -eq "FAIL").Count
$warn = @($Results | Where-Object Status -eq "WARN").Count
$skip = @($Results | Where-Object Status -eq "SKIP").Count
$pass = @($Results | Where-Object Status -eq "PASS").Count

Write-Host ""
Write-Host ("PASS={0} FAIL={1} WARN={2} SKIP={3}" -f $pass, $fail, $warn, $skip)
Write-Host "Report: $ReportPath" -ForegroundColor Cyan

if ($fail -gt 0) {
    Write-Host ""
    Write-Host "RESULT: BLOCKED - inspect the validation report." -ForegroundColor Red
    exit 1
}

if ($Strict -and ($warn -gt 0 -or $skip -gt 0)) {
    Write-Host ""
    Write-Host "RESULT: NOT FULLY VALIDATED - strict mode." -ForegroundColor Yellow
    exit 2
}

if ($warn -gt 0 -or $skip -gt 0) {
    Write-Host ""
    Write-Host "RESULT: PARTIAL - no failures, but warnings/skips remain." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "RESULT: PASS - all automated checks passed." -ForegroundColor Green
exit 0
