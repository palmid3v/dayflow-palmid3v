[CmdletBinding()]
param(
    [string]$AppPath = (Join-Path $PSScriptRoot ".."),
    [switch]$SkipManual,
    [switch]$Strict
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ============================================================
# DayFlow - Validation Runner
# ============================================================
# Purpose:
#   Run a repeatable validation pass over the DayFlow application.
#
# What this script does:
#   1. Validates the local environment and project structure.
#   2. Runs automated tests, lint and production build.
#   3. Validates Firebase-related files and required DayFlow paths.
#   4. Runs an interactive manual E2E checklist for every product area.
#   5. Writes a timestamped validation report.
#
# Important:
#   - This script DOES NOT deploy Firebase rules.
#   - This script DOES NOT modify application data.
#   - It never prints Firebase API keys or .env values.
#   - Manual browser actions remain manual unless Playwright tests exist.
#
# Suggested usage from the repository root:
#   .\app\scripts\Validate-DayFlow.ps1
#
# Or from inside app:
#   .\scripts\Validate-DayFlow.ps1
#
# Optional:
#   .\scripts\Validate-DayFlow.ps1 -SkipManual
#   .\scripts\Validate-DayFlow.ps1 -Strict
# ============================================================

$AppPath = (Resolve-Path $AppPath).Path
$RepoPath = Split-Path $AppPath -Parent
$ReportDir = Join-Path $AppPath "validation-reports"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$ReportPath = Join-Path $ReportDir "validation-$Timestamp.md"

New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

$Results = New-Object System.Collections.Generic.List[object]
$ManualResults = New-Object System.Collections.Generic.List[object]

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
        Area    = $Area
        Check   = $Check
        Status  = $Status
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

function Add-ManualResult {
    param(
        [string]$Area,
        [string]$Check,
        [string]$Status,
        [string]$Details = ""
    )

    $ManualResults.Add([PSCustomObject]@{
        Area    = $Area
        Check   = $Check
        Status  = $Status
        Details = $Details
    })
}

function Invoke-CheckedCommand {
    param(
        [string]$Area,
        [string]$Check,
        [string]$Command,
        [string[]]$Arguments
    )

    Write-Host ""
    Write-Host ">> $Command $($Arguments -join ' ')" -ForegroundColor DarkGray

    Push-Location $AppPath
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
        [string]$RelativePath
    )

    $path = Join-Path $AppPath $RelativePath

    if (Test-Path $path) {
        Add-Result $Area "File exists: $RelativePath" "PASS"
        return $true
    }

    Add-Result $Area "File exists: $RelativePath" "FAIL" "Missing file"
    return $false
}

function Test-TextContains {
    param(
        [string]$Area,
        [string]$RelativePath,
        [string]$Pattern,
        [string]$Description
    )

    $path = Join-Path $AppPath $RelativePath

    if (-not (Test-Path $path)) {
        Add-Result $Area $Description "FAIL" "Missing file: $RelativePath"
        return $false
    }

    $content = Get-Content -Raw -Path $path

    if ($content -match $Pattern) {
        Add-Result $Area $Description "PASS"
        return $true
    }

    Add-Result $Area $Description "FAIL" "Pattern not found in $RelativePath"
    return $false
}

function Ask-ManualCheck {
    param(
        [string]$Area,
        [string]$Step,
        [string]$Instruction
    )

    Write-Host ""
    Write-Host "[$Area] $Step" -ForegroundColor Cyan
    Write-Host $Instruction -ForegroundColor White
    Write-Host ""
    Write-Host "  P = PASS    F = FAIL    S = SKIP" -ForegroundColor DarkGray

    do {
        $answer = (Read-Host "Result").Trim().ToUpperInvariant()
    } while ($answer -notin @("P","F","S"))

    $status = switch ($answer) {
        "P" { "PASS" }
        "F" { "FAIL" }
        "S" { "SKIP" }
    }

    $details = ""
    if ($status -eq "FAIL") {
        $details = Read-Host "Describe the error briefly"
    }

    Add-ManualResult $Area $Step $status $details

    $color = switch ($status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "SKIP" { "DarkYellow" }
    }

    Write-Host "[$status] $Step" -ForegroundColor $color
}

function New-MarkdownReport {
    $pass = @($Results | Where-Object Status -eq "PASS").Count
    $fail = @($Results | Where-Object Status -eq "FAIL").Count
    $warn = @($Results | Where-Object Status -eq "WARN").Count
    $skip = @($Results | Where-Object Status -eq "SKIP").Count

    $manualPass = @($ManualResults | Where-Object Status -eq "PASS").Count
    $manualFail = @($ManualResults | Where-Object Status -eq "FAIL").Count
    $manualSkip = @($ManualResults | Where-Object Status -eq "SKIP").Count

    $lines = New-Object System.Collections.Generic.List[string]

    $lines.Add("# DayFlow Validation Report")
    $lines.Add("")
    $lines.Add("- **Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")")
    $lines.Add("- **App path:** " + $AppPath)
    $lines.Add("- **Automated:** PASS $pass / FAIL $fail / WARN $warn / SKIP $skip")
    $lines.Add("- **Manual:** PASS $manualPass / FAIL $manualFail / SKIP $manualSkip")
    $lines.Add("")

    $lines.Add("## Automated Validation")
    $lines.Add("")
    $lines.Add("| Area | Check | Status | Details |")
    $lines.Add("|---|---|---|---|")

    foreach ($item in $Results) {
        $details = ($item.Details -replace "\|", "\|") -replace "`r?`n", " "
        $lines.Add("| $($item.Area) | $($item.Check) | $($item.Status) | $details |")
    }

    $lines.Add("")
    $lines.Add("## Manual E2E Validation")
    $lines.Add("")
    $lines.Add("| Area | Check | Status | Details |")
    $lines.Add("|---|---|---|---|")

    foreach ($item in $ManualResults) {
        $details = ($item.Details -replace "\|", "\|") -replace "`r?`n", " "
        $lines.Add("| $($item.Area) | $($item.Check) | $($item.Status) | $details |")
    }

    $lines.Add("")
    $lines.Add("## Release Decision")
    $lines.Add("")

    if ($fail -gt 0 -or $manualFail -gt 0) {
        $lines.Add("**BLOCKED** - one or more validation checks failed.")
    }
    elseif ($warn -gt 0 -or $skip -gt 0 -or $manualSkip -gt 0) {
        $lines.Add("**NOT FULLY VALIDATED** - no failures were recorded, but some checks were skipped or produced warnings.")
    }
    else {
        $lines.Add("**PASS** - automated and manual validation completed without recorded failures.")
    }

    $lines.Add("")
    $lines.Add("> This report proves what this script checked. It does not prove Firebase/Vercel production state unless those checks were actually performed.")

    Set-Content -Path $ReportPath -Value ($lines -join "`r`n") -Encoding UTF8
}

# ============================================================
# 0. Header
# ============================================================

Clear-Host
Write-Host ""
Write-Host "DAYFLOW - VALIDATION RUNNER" -ForegroundColor Cyan
Write-Host "PALMI-D3V" -ForegroundColor DarkGray
Write-Host ""
Write-Host "App:    $AppPath"
Write-Host "Report: $ReportPath"
Write-Host ""

# ============================================================
# 1. Environment
# ============================================================

Write-Section "1. ENVIRONMENT"

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Add-Result "Environment" "Node.js available" "PASS" $nodeVersion
}
else {
    Add-Result "Environment" "Node.js available" "FAIL" "node command not found"
}

if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Add-Result "Environment" "npm available" "PASS" $npmVersion
}
else {
    Add-Result "Environment" "npm available" "FAIL" "npm command not found"
}

if (Get-Command firebase -ErrorAction SilentlyContinue) {
    $firebaseVersion = firebase --version
    Add-Result "Environment" "Firebase CLI available" "PASS" $firebaseVersion
}
else {
    Add-Result "Environment" "Firebase CLI available" "WARN" "firebase command not found; rules cannot be deployed from this shell"
}

if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitBranch = git -C $RepoPath branch --show-current
    $gitHead = git -C $RepoPath rev-parse --short HEAD
    Add-Result "Environment" "Git repository available" "PASS" "branch=$gitBranch head=$gitHead"
}
else {
    Add-Result "Environment" "Git available" "WARN" "git command not found"
}

# ============================================================
# 2. Project structure
# ============================================================

Write-Section "2. PROJECT STRUCTURE"

@(
    "package.json",
    "vite.config.js",
    "src/App.jsx",
    "src/index.css",
    "src/lib/dayflowCloudStore.js",
    "src/lib/access.js",
    "src/features/tasks",
    "src/features/schedule",
    "src/features/calendar",
    "src/features/reminders",
    "src/features/memory",
    "src/features/dashboard",
    "src/features/admin",
    "tests",
    "docs/QA_MATRIX.md",
    "docs/RELEASE_CHECKLIST.md",
    "firestore.rules"
) | ForEach-Object {
    Test-RequiredFile "Structure" $_ | Out-Null
}

# ============================================================
# 3. Dependencies
# ============================================================

Write-Section "3. DEPENDENCIES"

if (Test-Path (Join-Path $AppPath "package-lock.json")) {
    Add-Result "Dependencies" "package-lock.json exists" "PASS"

    Push-Location $AppPath
    try {
        # npm ci validates package-lock.json against package.json and installs
        # the exact dependency tree without rewriting package.json/package-lock.json.
        npm ci --ignore-scripts --no-audit --no-fund
        if ($LASTEXITCODE -eq 0) {
            Add-Result "Dependencies" "Clean dependency install" "PASS" "npm ci completed"
        }
        else {
            Add-Result "Dependencies" "Clean dependency install" "FAIL" "npm ci returned exit code $LASTEXITCODE"
        }
    }
    catch {
        Add-Result "Dependencies" "Clean dependency install" "FAIL" $_.Exception.Message
    }
    finally {
        Pop-Location
    }
}
else {
    Add-Result "Dependencies" "package-lock.json exists" "WARN" "No lockfile found"
}

# ============================================================
# 4. Automated tests
# ============================================================

Write-Section "4. AUTOMATED TESTS"

$testOk = Invoke-CheckedCommand "Tests" "Unit/domain tests" "npm" @("test")

# ============================================================
# 5. Lint
# ============================================================

Write-Section "5. LINT"

$lintOk = Invoke-CheckedCommand "Quality" "ESLint" "npm" @("run", "lint")

# ============================================================
# 6. Production build
# ============================================================

Write-Section "6. PRODUCTION BUILD"

$buildOk = Invoke-CheckedCommand "Build" "Vite production build" "npm" @("run", "build")

# ============================================================
# 7. Firebase / access configuration
# ============================================================

Write-Section "7. FIREBASE / ACCESS VALIDATION"

$rules = Join-Path $AppPath "firestore.rules"

if (Test-Path $rules) {
    Test-TextContains "Firebase" "firestore.rules" 'match /appAccess/\{uid\}' "appAccess security rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowPlans/\{dateKey\}' "DayFlow plans rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowResults/\{dateKey\}' "DayFlow results rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowMemories/\{dateKey\}' "DayFlow memory rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowReminders/\{reminderId\}' "DayFlow reminder rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowImportedCalendarEvents/\{eventId\}' "Calendar event rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'match /users/\{uid\}/dayflowCalendarImports/\{document\}' "Calendar import metadata rules exist" | Out-Null
    Test-TextContains "Firebase" "firestore.rules" 'function canUseDayFlowFeature' "Feature-level security function exists" | Out-Null
}
else {
    Add-Result "Firebase" "Firestore rules file" "FAIL" "firestore.rules not found"
}

$envFiles = @(
    ".env",
    ".env.local",
    ".env.production",
    ".env.example"
)

$envFound = $false
foreach ($envFile in $envFiles) {
    $envPath = Join-Path $AppPath $envFile
    if (Test-Path $envPath) {
        $envFound = $true
        $envContent = Get-Content -Raw $envPath

        $requiredVars = @(
            "VITE_FIREBASE_API_KEY",
            "VITE_FIREBASE_AUTH_DOMAIN",
            "VITE_FIREBASE_PROJECT_ID",
            "VITE_FIREBASE_STORAGE_BUCKET",
            "VITE_FIREBASE_MESSAGING_SENDER_ID",
            "VITE_FIREBASE_APP_ID"
        )

        foreach ($variable in $requiredVars) {
            if ($envContent -match "(?m)^$([regex]::Escape($variable))=") {
                Add-Result "Firebase" "$envFile contains $variable" "PASS"
            }
            else {
                Add-Result "Firebase" "$envFile contains $variable" "WARN" "Variable not present locally"
            }
        }
    }
}

if (-not $envFound) {
    Add-Result "Firebase" "Local environment file" "WARN" "No local .env file found; Vercel environment is external to this script"
}

# ============================================================
# 8. Source-level feature inventory
# ============================================================

Write-Section "8. FEATURE INVENTORY"

$featureChecks = @(
    @{ Name = "Today"; Path = "src/features"; Pattern = "Today|dayflowPlans|dayflowResults" },
    @{ Name = "Tasks"; Path = "src/features/tasks"; Pattern = "Task|task" },
    @{ Name = "Schedule"; Path = "src/features/schedule"; Pattern = "schedule" },
    @{ Name = "Calendar / ICS"; Path = "src/features/calendar"; Pattern = "ics|calendar" },
    @{ Name = "Reminders"; Path = "src/features/reminders"; Pattern = "reminder" },
    @{ Name = "Memory"; Path = "src/features/memory"; Pattern = "memory" },
    @{ Name = "Dashboard"; Path = "src/features"; Pattern = "dashboard|Dashboard" },
    @{ Name = "Admin / Access"; Path = "src/features"; Pattern = "Admin|access" }
)

foreach ($feature in $featureChecks) {
    $base = Join-Path $AppPath $feature.Path

    if (-not (Test-Path $base)) {
        Add-Result "Features" $feature.Name "FAIL" "Path missing: $($feature.Path)"
        continue
    }

    $matches = Get-ChildItem -Path $base -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx |
        Select-String -Pattern $feature.Pattern -SimpleMatch:$false -ErrorAction SilentlyContinue

    if ($matches) {
        Add-Result "Features" $feature.Name "PASS" "$($matches.Count) matching source locations"
    }
    else {
        Add-Result "Features" $feature.Name "WARN" "No source match found"
    }
}

# ============================================================
# 9. PWA / release files
# ============================================================

Write-Section "9. PWA / RELEASE"

Test-RequiredFile "PWA" "public/manifest.webmanifest" | Out-Null
Test-RequiredFile "PWA" "public/pwa-192.svg" | Out-Null
Test-RequiredFile "PWA" "public/pwa-512.svg" | Out-Null
Test-RequiredFile "PWA" "vercel.json" | Out-Null
Test-RequiredFile "QA" "docs/QA_MATRIX.md" | Out-Null
Test-RequiredFile "Release" "docs/RELEASE_CHECKLIST.md" | Out-Null

# ============================================================
# 10. Firebase CLI rules validation (read-only)
# ============================================================

Write-Section "10. FIREBASE CLI"

if (Get-Command firebase -ErrorAction SilentlyContinue) {
    Push-Location $AppPath
    try {
        & firebase projects:list --json 2>$null | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Add-Result "Firebase" "Firebase CLI authentication" "PASS" "CLI can access Firebase projects"
        }
        else {
            Add-Result "Firebase" "Firebase CLI authentication" "WARN" "CLI exists but project access could not be confirmed"
        }
    }
    catch {
        Add-Result "Firebase" "Firebase CLI authentication" "WARN" $_.Exception.Message
    }
    finally {
        Pop-Location
    }
}
else {
    Add-Result "Firebase" "Firebase CLI authentication" "SKIP" "Firebase CLI unavailable"
}

# ============================================================
# 11. Manual E2E walkthrough
# ============================================================

if (-not $SkipManual) {
    Write-Section "11. MANUAL END-TO-END WALKTHROUGH"

    Write-Host ""
    Write-Host "Open the deployed DayFlow application in your browser before continuing." -ForegroundColor Yellow
    Write-Host "For every step, perform the action exactly as described and record PASS/FAIL." -ForegroundColor Yellow
    Write-Host ""

    $manualSteps = @(
        @{
            Area = "Authentication"
            Step = "Login"
            Instruction = "Log in with the intended test account. Confirm the app loads without console errors."
        },
        @{
            Area = "Authentication"
            Step = "Session persistence"
            Instruction = "Refresh the page. Confirm the authenticated session remains available."
        },
        @{
            Area = "Today"
            Step = "Today loads"
            Instruction = "Open Today. Confirm the dashboard loads without 'Cloud sync is unavailable' when Firebase access is correctly configured."
        },
        @{
            Area = "Today"
            Step = "Plan item"
            Instruction = "Create or update a Today plan item. Refresh the page and confirm it persists."
        },
        @{
            Area = "Today"
            Step = "Completion"
            Instruction = "Mark a planned item complete. Confirm the result is reflected after refresh."
        },
        @{
            Area = "Tasks"
            Step = "Create task"
            Instruction = "Create a task with title, priority/status/date metadata available in the current UI."
        },
        @{
            Area = "Tasks"
            Step = "Edit task"
            Instruction = "Edit the task and confirm the changed values persist after refresh."
        },
        @{
            Area = "Tasks"
            Step = "Complete task"
            Instruction = "Complete the task and confirm its state changes correctly."
        },
        @{
            Area = "Tasks"
            Step = "Delete task"
            Instruction = "Delete the test task and confirm it disappears."
        },
        @{
            Area = "Schedule"
            Step = "Schedule item"
            Instruction = "Create or verify a recurring schedule entry. Confirm today's matching weekday projects into Today."
        },
        @{
            Area = "Schedule"
            Step = "Schedule persistence"
            Instruction = "Refresh and confirm schedule data remains available."
        },
        @{
            Area = "Calendar"
            Step = "ICS import"
            Instruction = "Import a valid .ics file containing at least one event. Confirm the import completes without a permissions error."
        },
        @{
            Area = "Calendar"
            Step = "ICS projection"
            Instruction = "Confirm imported calendar events appear in the appropriate DayFlow schedule/Today projection."
        },
        @{
            Area = "Calendar"
            Step = "ICS clear"
            Instruction = "Clear the imported calendar snapshot. Confirm imported events and import metadata are removed."
        },
        @{
            Area = "Reminders"
            Step = "Create reminder"
            Instruction = "Create a test reminder. Confirm it is visible and survives refresh."
        },
        @{
            Area = "Reminders"
            Step = "Notification permission"
            Instruction = "Enable notifications if supported by the browser. Confirm the UI reflects the permission state."
        },
        @{
            Area = "Reminders"
            Step = "Test notification"
            Instruction = "Use the reminder test notification action. Confirm the browser/service-worker notification appears when supported."
        },
        @{
            Area = "Memory"
            Step = "Save memory"
            Instruction = "Create a test memory entry. Refresh and confirm it persists."
        },
        @{
            Area = "Memory"
            Step = "Memory retrieval"
            Instruction = "Navigate away and back. Confirm the stored memory remains available."
        },
        @{
            Area = "Dashboard"
            Step = "Weekly metrics"
            Instruction = "Open Dashboard/analytics. Confirm completion, adherence, streak and weekly metrics render without errors."
        },
        @{
            Area = "Admin"
            Step = "Admin access"
            Instruction = "With the authorized admin account, open Access Manager. Confirm the panel loads."
        },
        @{
            Area = "Admin"
            Step = "Feature permissions"
            Instruction = "Toggle a test user's DayFlow feature access. Confirm the target user's available feature set changes as expected."
        },
        @{
            Area = "Admin"
            Step = "Audit"
            Instruction = "Confirm an access change creates the expected audit activity."
        },
        @{
            Area = "Security"
            Step = "Unauthorized feature"
            Instruction = "Using a non-authorized account, confirm a disabled feature is unavailable and does not expose data."
        },
        @{
            Area = "PWA"
            Step = "Installability"
            Instruction = "From a supported browser, verify DayFlow can be installed as a PWA."
        },
        @{
            Area = "PWA"
            Step = "Standalone launch"
            Instruction = "Launch the installed PWA. Confirm layout, navigation and safe areas behave correctly."
        },
        @{
            Area = "Responsive"
            Step = "Mobile layout"
            Instruction = "Test at a phone-sized viewport. Confirm no horizontal overflow and controls remain usable."
        },
        @{
            Area = "Responsive"
            Step = "Desktop layout"
            Instruction = "Test at desktop width. Confirm content, navigation and panels render correctly."
        },
        @{
            Area = "Cloud"
            Step = "Refresh persistence"
            Instruction = "Refresh after creating test data. Confirm Firebase-backed data remains available."
        },
        @{
            Area = "Cloud"
            Step = "Logout/login persistence"
            Instruction = "Log out and log back in. Confirm authorized data remains available and belongs to the correct user."
        }
    )

    foreach ($step in $manualSteps) {
        Ask-ManualCheck $step.Area $step.Step $step.Instruction
    }
}
else {
    Add-ManualResult "Manual E2E" "Interactive browser walkthrough" "SKIP" "Run without -SkipManual to execute the full checklist"
}

# ============================================================
# 12. Final report
# ============================================================

Write-Section "12. VALIDATION SUMMARY"

New-MarkdownReport

$autoFail = @($Results | Where-Object Status -eq "FAIL").Count
$manualFail = @($ManualResults | Where-Object Status -eq "FAIL").Count
$warnings = @($Results | Where-Object Status -eq "WARN").Count
$skips = @($Results | Where-Object Status -eq "SKIP").Count + @($ManualResults | Where-Object Status -eq "SKIP").Count

Write-Host ""
Write-Host "Automated: PASS=$(@($Results | Where-Object Status -eq "PASS").Count) FAIL=$autoFail WARN=$warnings SKIP=$skips" -ForegroundColor White
Write-Host "Manual:    PASS=$(@($ManualResults | Where-Object Status -eq "PASS").Count) FAIL=$manualFail SKIP=$(@($ManualResults | Where-Object Status -eq "SKIP").Count)" -ForegroundColor White
Write-Host ""
Write-Host "Report: $ReportPath" -ForegroundColor Cyan

if ($autoFail -gt 0 -or $manualFail -gt 0) {
    Write-Host ""
    Write-Host "RESULT: BLOCKED - fix failures before release." -ForegroundColor Red
    exit 1
}

if ($Strict -and ($warnings -gt 0 -or $skips -gt 0)) {
    Write-Host ""
    Write-Host "RESULT: NOT FULLY VALIDATED - strict mode treats warnings/skips as failure." -ForegroundColor Yellow
    exit 2
}

if ($warnings -gt 0 -or $skips -gt 0) {
    Write-Host ""
    Write-Host "RESULT: PARTIAL - no recorded failures, but some checks were skipped/warned." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "RESULT: PASS - validation completed without recorded failures." -ForegroundColor Green
exit 0
