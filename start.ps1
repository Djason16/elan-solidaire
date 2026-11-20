# Launcher of Élan Solidaire (Next.js  ·  simple site, no server)
# Usage: start.bat (menu; macOS, Linux: ./start.sh) or .\start.ps1 -Action D|S|R|I|G|B|A|Q|K|O|P
# Each option adapts to what the project contains (docker-compose.yml, backend/, frontend/).
param([string]$Action)

$Root = $PSScriptRoot
. (Join-Path $Root 'scripts\common.ps1')

$Shell = if (Test-Command 'pwsh') { 'pwsh' } else { 'powershell' }
$ApiDir = Join-Path $Root 'backend'
$AppDir = Join-Path $Root 'frontend'
$HasDocker = Test-Path (Join-Path $Root 'docker-compose.yml')
# Database and files uploaded from the site, kept by the backups (scripts/data.ps1)
. (Join-Path $Root 'scripts\data.ps1')
$Data = Get-ProjectData $Root
$HasData = [bool]($Data.MySql -or $Data.Sqlite.Count -or $Data.Uploads)

# ---------------------------------------------------------------------------
# Project detection
# ---------------------------------------------------------------------------

# npm scripts of a folder (empty when it has no package.json)
function Get-NpmScripts([string]$Path) {
    $file = Join-Path $Path 'package.json'
    if (-not (Test-Path $file)) { return @{} }
    $scripts = (Get-Content $file -Raw | ConvertFrom-Json).scripts
    $names = @{}
    if ($scripts) { $scripts.PSObject.Properties | ForEach-Object { $names[$_.Name] = $_.Value } }
    return $names
}

$ApiScripts = Get-NpmScripts $ApiDir
$AppScripts = Get-NpmScripts $AppDir
# Production of the front: "generate" (static site, Nuxt with a separate API or none) or "build".
# Only one of them is offered: the one that fits the project.
$FrontGenerate = $AppScripts.ContainsKey('generate:prod')
$FrontBuild = if ($FrontGenerate) { $null } elseif ($AppScripts.ContainsKey('build:prod')) { 'build:prod' } elseif ($AppScripts.ContainsKey('build')) { 'build' } else { $null }
# The front builds a Node.js server with the API inside (Nuxt + Nitro), otherwise a static site to upload
$FrontServer = 'false' -eq 'true'
# Site without a build (HTML / CSS / JS): only its sitemap.xml and robots.txt to write before uploading it
$FrontSitemap = -not $FrontGenerate -and -not $FrontBuild -and (Test-Path (Join-Path $AppDir 'scripts\sitemap.mjs'))
# Qualif: the site shown to the client before it goes live, built with .env.preprod (scripts/qualif.ps1)
$HasQualif = $AppScripts.ContainsKey('generate:qualif') -or $AppScripts.ContainsKey('build:qualif') -or (Test-Path (Join-Path $AppDir 'scripts\qualif.mjs'))
# Design of the site: the DC Scaffold one, a blank site, or start from scratch (frontend/scripts/design.ps1)
$HasDesign = Test-Path (Join-Path $AppDir 'dc-scaffold.config.js')

# ---------------------------------------------------------------------------
# Actions
# ---------------------------------------------------------------------------

# Opens a new terminal window that runs the given command
function Start-Window([string]$Path, [string]$Title, [string]$Command) {
    $safePath = $Path.Replace("'", "''")
    $script = @(
        "`$Host.UI.RawUI.WindowTitle = '$Title'"
        "Set-Location -LiteralPath '$safePath'"
        "Write-Host '  $Title' -ForegroundColor Cyan"
        "Write-Host ''"
        $Command
    ) -join "`n"
    # macOS / Linux: the new window gets the PATH of this one (npm, docker from Homebrew or ~/.local/bin)
    if ($IsMacOS -or $IsLinux) { $script = "`$env:PATH = '$($env:PATH.Replace("'", "''"))'`n$script" }
    $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($script))
    if ($IsMacOS -or $IsLinux) { Start-TerminalWindow $Path $Title @('-NoExit', '-NoProfile', '-EncodedCommand', $encoded); return }
    Start-Process $Shell -ArgumentList '-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', $encoded
}

function Test-Docker {
    docker info *> $null
    return $LASTEXITCODE -eq 0
}

# Installs vendor/ and node_modules/: only the missing ones, or every folder with -All (also applies the changes of package.json)
function Install-Dependencies([switch]$All) {
    $done = $false
    $ok = $true
    foreach ($dir in $ApiDir, $AppDir) {
        $name = Split-Path $dir -Leaf

        if ((Test-Path (Join-Path $dir 'composer.json')) -and ($All -or -not (Test-Path (Join-Path $dir 'vendor')))) {
            Write-Title "Composer ($name)"
            $installed = Invoke-Composer $dir @('install', '--no-interaction', '--no-progress')
            if (-not $installed) {
                # composer.lock out of date or resolved for another PHP: new resolution from composer.json
                Write-Warn 'Le composer.lock ne correspond pas, lancement de composer update...'
                $installed = Invoke-Composer $dir @('update', '--no-interaction', '--no-progress')
            }
            if ($installed) { Write-Ok "Prêt : $name/vendor" } else { Write-Fail "Installation échouée dans $name/ (Composer)"; $ok = $false }
            $done = $true
        }

        if ((Test-Path (Join-Path $dir 'package.json')) -and ($All -or -not (Test-Path (Join-Path $dir 'node_modules')))) {
            Write-Title "npm ($name)"
            $installed = Invoke-In $dir { & $Npm install --no-fund --no-audit }
            if (-not $installed) {
                # Some npm 10 versions crash on recent packages ("edgesOut"): one more try with the latest npm
                Write-Warn 'npm a échoué, nouvel essai avec le dernier npm...'
                $installed = Invoke-In $dir { & $Npx --yes npm@latest install --no-fund --no-audit }
            }
            if (-not $installed) {
                # A package published a few minutes ago can be listed before its files can be downloaded (error 404):
                # one last try a minute later
                Write-Warn 'npm failed again (a package published a few minutes ago may not be downloadable yet): last try in 60 seconds...'
                Start-Sleep -Seconds 60
                $installed = Invoke-In $dir { & $Npm install --no-fund --no-audit }
            }
            if ($installed) { Write-Ok "Prêt : $name/node_modules" } else { Write-Fail "Installation échouée dans $name/ (npm)"; $ok = $false }
            $done = $true
        }
    }
    if ($All -and -not $done) { Write-Info 'Rien à installer : aucun package.json ni composer.json trouvé.' }
    return $ok
}

function Start-Dev {
    if ($HasDocker -and -not (Test-Docker)) {
        if ($IsLinux) { Write-Fail 'Docker ne tourne pas. Lance-le (sudo systemctl start docker, ou Docker Desktop) et réessaie.' }
        else { Write-Fail 'Docker ne tourne pas. Lance Docker Desktop et réessaie.' }
        return
    }
    Install-Dependencies | Out-Null

    if ($HasDocker) { Start-Window $Root 'Docker' 'docker compose up' }
    if ($ApiScripts.ContainsKey('dev')) { Start-Window $ApiDir 'API' 'npm run dev' }
    if ($AppScripts.ContainsKey('dev')) { Start-Window $AppDir 'Front' 'npm run dev' }

    Write-Host ''
    Write-Ok 'Lancé dans des fenêtres séparées.'
    Write-Host ''
    Write-Box -Color Green @(
        'Front       http://localhost:3000'
    )
}

# ---------------------------------------------------------------------------
# Menu
# ---------------------------------------------------------------------------

if (-not $Action) {
    Clear-Host
    Write-Host ''
    Write-Box @(
        'Élan Solidaire'
        'Next.js  ·  Site simple, sans serveur'
    )
    Write-Host ''
    Write-MenuItem 'D' 'Développement' 'Tout lancer'
    if ($HasDocker) {
        Write-MenuItem 'S' 'Arrêter' 'docker compose down'
        Write-MenuItem 'R' 'Reconstruire' 'Reconstruit les images Docker (sans cache)'
    }
    Write-MenuItem 'I' 'Installer' 'Installe / met à jour les dépendances (Composer / npm)'
    if ($HasData) {
        Write-MenuItem 'K' 'Sauvegarder' 'Base de données et fichiers envoyés, dans backups/'
        Write-MenuItem 'O' 'Restaurer' 'Remet une sauvegarde de backups/'
    }
    Write-Host ''
    if ($FrontGenerate) { Write-MenuItem 'G' 'Générer' 'Site statique à envoyer (frontend/.output/public), avec .env.production' }
    if ($FrontBuild -and $FrontServer) { Write-MenuItem 'B' 'Build' 'Site + API dans un seul serveur Node.js (puis npm start, voir les étapes ci-dessous)' }
    elseif ($FrontBuild) { Write-MenuItem 'B' 'Build du front' 'Site statique à envoyer, avec .env.production' }
    elseif ($FrontSitemap) { Write-MenuItem 'B' 'Sitemap' 'sitemap.xml et robots.txt de production (.env.production), puis envoie frontend/' }
    if ($ApiScripts.ContainsKey('build')) { Write-MenuItem 'A' 'Build de l''API' 'npm run build (backend/)' }
    if ($HasQualif) { Write-MenuItem 'Q' 'Qualif' 'Site montré au client avant la mise en ligne, dans qualif/ (.env.preprod)' }
    if ($FrontGenerate -or $FrontBuild -or $FrontSitemap -or $ApiScripts.ContainsKey('build') -or $HasQualif) { Write-Host '' }
    if ($HasDesign) {
        Write-MenuItem 'P' 'Design' 'Design de DC Scaffold, site vierge, ou repartir de zéro avec ton propre design'
        Write-Host ''
    }
    # How to put this project online (filled by DC Scaffold for the chosen front and back end)
    Write-Host '  En ligne (détails dans README.fr.md, « Mettre en ligne ») :' -ForegroundColor DarkGray
    Write-Host '   1. Site : start.bat puis B, puis envoie le contenu de frontend/out/ sur l''hébergement du site (un hébergement statique suffit)' -ForegroundColor DarkGray
    Write-Host ''
    $Action = Read-Default 'Choix' ''
}

switch ($Action.ToUpper()) {
    'D' { Start-Dev }
    'S' { if ($HasDocker) { Invoke-In $Root { docker compose down } | Out-Null } }
    'R' { if ($HasDocker) { Invoke-In $Root { docker compose build --no-cache } | Out-Null } }
    'I' { if (Install-Dependencies -All) { exit 0 } else { exit 1 } }
    'G' { if ($FrontGenerate) { Start-Window $AppDir 'Front generate (production)' 'npm run generate:prod' } }
    'B' {
        if ($FrontBuild) { Start-Window $AppDir 'Front build (production)' "npm run $FrontBuild" }
        elseif ($FrontSitemap) { Invoke-In $AppDir { node scripts/sitemap.mjs . --pages pages --pages-only } | Out-Null }
    }
    'A' { Start-Window $ApiDir 'API build (production)' 'npm run build' }
    'Q' { if ($HasQualif) { & (Join-Path $Root 'scripts\qualif.ps1') -AppDir $AppDir -ApiDir $ApiDir } }
    'K' { if ($HasData) { & (Join-Path $Root 'scripts\backup.ps1') } }
    'O' { if ($HasData) { & (Join-Path $Root 'scripts\restore.ps1') } }
    'P' { if ($HasDesign) { & (Join-Path $AppDir 'scripts\design.ps1') } }
    default { Write-Fail 'Choix invalide.' }
}
