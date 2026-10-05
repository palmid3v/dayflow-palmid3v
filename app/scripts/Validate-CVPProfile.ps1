# CVP - Project Profile Validator
[CmdletBinding()]
param(
    [string]$ProfilePath = (Join-Path $PSScriptRoot "..\cvp\DAYFLOW_PROFILE.json"),
    [switch]$RunCommands
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ProfilePath = (Resolve-Path $ProfilePath).Path
$RepoPath = Split-Path (Split-Path (Split-Path $ProfilePath -Parent) -Parent) -Parent
$profile = Get-Content -Raw -Path $ProfilePath | ConvertFrom-Json

$pass = 0
$fail = 0

function Write-Check {
    param([string]$Name, [bool]$Ok, [string]$Details = "")
    if ($Ok) {
        $script:pass++
        Write-Host "[PASS] $Name$(if ($Details) { " - $Details" })" -ForegroundColor Green
    } else {
        $script:fail++
        Write-Host "[FAIL] $Name$(if ($Details) { " - $Details" })" -ForegroundColor Red
    }
}

function Resolve-RepoPath {
    param([string]$RelativePath)
    return Join-Path $RepoPath $RelativePath.Replace("/", [IO.Path]::DirectorySeparatorChar)
}

Write-Host ""
Write-Host "DAYFLOW - CVP PROJECT PROFILE VALIDATOR" -ForegroundColor Cyan
Write-Host "Profile: $ProfilePath"
Write-Host ""

try {
    Write-Check "Profile JSON parses" ($null -ne $profile)
} catch {
    Write-Check "Profile JSON parses" $false $_.Exception.Message
    exit 1
}

Write-Check "schemaVersion is 1" ([int]$profile.schemaVersion -eq 1)
Write-Check "project.id is present" (-not [string]::IsNullOrWhiteSpace([string]$profile.project.id))
Write-Check "project.appPath is present" (-not [string]::IsNullOrWhiteSpace([string]$profile.project.appPath))
Write-Check "commands.test is declared" ($null -ne $profile.commands.test)
Write-Check "commands.lint is declared" ($null -ne $profile.commands.lint)
Write-Check "commands.build is declared" ($null -ne $profile.commands.build)

foreach ($relativePath in @($profile.requiredPaths.files)) {
    $path = Resolve-RepoPath $relativePath
    Write-Check "Required file: $relativePath" (Test-Path -Path $path -PathType Leaf)
}

foreach ($relativePath in @($profile.requiredPaths.directories)) {
    $path = Resolve-RepoPath $relativePath
    Write-Check "Required directory: $relativePath" (Test-Path -Path $path -PathType Container)
}

foreach ($check in @($profile.sourceChecks)) {
    $path = Resolve-RepoPath ([string]$check.path)
    if (-not (Test-Path $path -PathType Leaf)) {
        Write-Check ([string]$check.description) $false "Missing source file: $($check.path)"
        continue
    }

    $content = Get-Content -Raw -Path $path
    $matched = $content -match ([string]$check.pattern)
    Write-Check ([string]$check.description) $matched
}

if ($RunCommands) {
    foreach ($name in @("install", "test", "lint", "build")) {
        $commandSpec = $profile.commands.$name
        if ($null -eq $commandSpec) {
            Write-Check "Command: $name" $false "Not declared"
            continue
        }

        $workingDirectory = Resolve-RepoPath ([string]$profile.project.appPath)
        $command = [string]$commandSpec.command
        $arguments = @($commandSpec.arguments)

        Write-Host ">> $command $($arguments -join " ")" -ForegroundColor DarkGray
        Push-Location $workingDirectory
        try {
            & $command @arguments
            $exitCode = $LASTEXITCODE
            Write-Check "Command: $name" ($exitCode -eq 0) "Exit code $exitCode"
        } catch {
            Write-Check "Command: $name" $false $_.Exception.Message
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
Write-Host "Summary: PASS=$pass FAIL=$fail"

if ($fail -gt 0) {
    exit 1
}

Write-Host "RESULT: PASS" -ForegroundColor Green
exit 0
