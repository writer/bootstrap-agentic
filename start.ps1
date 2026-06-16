#Requires -Version 5.1
<#
.SYNOPSIS
    Windows launcher for bootstrap-agentic. Validates WSL prerequisites and
    runs start.sh inside your WSL distro.
#>

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "    WARNING: $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "    ERROR: $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  bootstrap-agentic -- Windows WSL Launcher"
Write-Host "============================================"
Write-Host ""

# ---------------------------------------------------------------------------
# 1. WSL installed
# ---------------------------------------------------------------------------
Write-Step "Checking WSL..."

$wslExe = Get-Command "wsl.exe" -ErrorAction SilentlyContinue
if (-not $wslExe) {
    Write-Fail "wsl.exe not found. WSL does not appear to be installed."
    Write-Host ""
    Write-Host "  To install WSL, open PowerShell as Administrator and run:" -ForegroundColor Yellow
    Write-Host "      wsl --install" -ForegroundColor White
    Write-Host ""
    Write-Host "  Then restart your computer and run this script again." -ForegroundColor Yellow
    exit 1
}

wsl --status > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Fail "WSL is installed but does not appear to be enabled or the kernel is missing."
    Write-Host ""
    Write-Host "  Try running in an elevated PowerShell:" -ForegroundColor Yellow
    Write-Host "      wsl --update" -ForegroundColor White
    Write-Host "      wsl --install" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Ok "WSL is installed and enabled."

# ---------------------------------------------------------------------------
# 2. WSL distro available
# ---------------------------------------------------------------------------
Write-Step "Checking for a WSL distro..."

# wsl --list emits UTF-16LE; pipe through a temp file decoded properly
$raw = (wsl --list --quiet 2>$null) | Out-String
$distros = $raw -replace "`0", "" -split "`r?`n" | Where-Object { $_ -match '\S' }

if (-not $distros -or @($distros).Count -eq 0) {
    Write-Fail "No WSL distros found."
    Write-Host ""
    Write-Host "  Install Ubuntu (recommended) by running:" -ForegroundColor Yellow
    Write-Host "      wsl --install -d Ubuntu" -ForegroundColor White
    Write-Host ""
    Write-Host "  Or search for 'Ubuntu' in the Microsoft Store." -ForegroundColor Yellow
    exit 1
}

Write-Ok "Found distro(s): $(@($distros) -join ', ')"

# ---------------------------------------------------------------------------
# 3. Docker accessible inside WSL
# ---------------------------------------------------------------------------
Write-Step "Checking Docker inside WSL..."

$dockerOut = wsl -- docker --version 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Docker is not accessible inside WSL."
    Write-Host ""
    Write-Host "  Make sure Docker Desktop is installed and running, then enable" -ForegroundColor Yellow
    Write-Host "  WSL integration for your distro:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    Docker Desktop -> Settings -> Resources -> WSL Integration" -ForegroundColor White
    Write-Host "    Toggle on your distro, then click 'Apply & Restart'." -ForegroundColor White
    Write-Host ""
    Write-Host "  Download Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

Write-Ok "Docker found in WSL: $($dockerOut.Trim())"

# ---------------------------------------------------------------------------
# 4. Translate Windows path to WSL path + performance warning
# ---------------------------------------------------------------------------
Write-Step "Resolving project path in WSL..."

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if ($scriptDir -match '^([A-Za-z]):\\(.*)$') {
    $driveLetter = $Matches[1].ToLower()
    $rest        = $Matches[2] -replace '\\', '/'
    $wslPath     = "/mnt/$driveLetter/$rest"
} else {
    $wslPath = (wsl wslpath -u "$scriptDir" 2>&1 | Out-String).Trim()
}

Write-Ok "WSL path: $wslPath"

if ($wslPath -like '/mnt/*') {
    Write-Host ""
    Write-Warn "Project is on the Windows filesystem ($wslPath)."
    Write-Warn "This works, but file I/O will be significantly slower."
    Write-Host ""
    Write-Host "  For best performance, clone the project inside WSL:" -ForegroundColor Yellow
    Write-Host "      wsl" -ForegroundColor White
    Write-Host "      git clone <your-repo-url> ~/bootstrap-agentic" -ForegroundColor White
    Write-Host "      cd ~/bootstrap-agentic && bash start.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "  Continuing anyway... (Ctrl+C to abort)" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# ---------------------------------------------------------------------------
# 5. Launch start.sh inside WSL
# ---------------------------------------------------------------------------
Write-Host ""
Write-Step "Launching start.sh inside WSL..."
Write-Host ""

wsl bash -c "cd '$wslPath' && bash start.sh"
exit $LASTEXITCODE
