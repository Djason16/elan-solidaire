# Restores a backup of scripts/backup.ps1: the local database and the uploaded files become exactly those of the backup.
#   scripts/restore.ps1                      the most recent one in backups/
#   scripts/restore.ps1 2026-11-06_21-30     a specific backup
# Run by start.bat then O. The site must be running (start.bat then D) when the database is in Docker.
param([string]$Name)
$ErrorActionPreference = [System.Management.Automation.ActionPreference]::Stop
$Root = Split-Path -Parent $PSScriptRoot
. (Join-Path $PSScriptRoot 'data.ps1')
$Data = Get-ProjectData $Root
$Backups = Join-Path $Root 'backups'
$Folder = if ($Name) { Join-Path $Backups $Name } elseif (Test-Path $Backups) { Get-ChildItem $Backups -Directory | Sort-Object Name | Select-Object -Last 1 -ExpandProperty FullName }
if (-not $Folder -or -not (Test-Path $Folder)) { throw 'Aucune sauvegarde dans backups/.' }

$Answer = Read-Host "Remplacer les données locales par la sauvegarde $(Split-Path -Leaf $Folder) ? (o/n)"
if ($Answer -notin 'y', 'o') { Write-Host 'Rien n''a changé.'; exit 0 }

# MySQL of Docker: a dump made with GTIDs cannot be imported as it is, these lines are skipped
$Sql = Join-Path $Folder 'database.sql'
if ($Data.MySql -and (Test-Path $Sql)) {
    (Get-Content -Encoding utf8 $Sql | Where-Object { $_ -notmatch 'GTID_PURGED|SQL_LOG_BIN' }) -join "`n" |
        docker exec -i $Data.MySql.Container sh -c "mysql -uroot -p`"`$MYSQL_ROOT_PASSWORD`" $($Data.MySql.Database) 2>/dev/null"
    if ($LASTEXITCODE -ne 0) { throw 'La base n''a pas pu être importée : lance d''abord le site (start.bat puis D).' }
}

# SQLite: the files of the backup replace the current ones (stop the API first)
foreach ($File in $Data.Sqlite) {
    $Saved = Join-Path $Folder (Split-Path $File -Leaf)
    if (Test-Path $Saved) { Copy-Item $Saved $File -Force }
}

# Uploaded files: those kept in Git (.htaccess, .gitkeep) stay, everything else is replaced by the backup
$Zip = Join-Path $Folder 'uploads.zip'
if ($Data.Uploads -and (Test-Path $Zip)) {
    Get-ChildItem $Data.Uploads -Force | Where-Object { $_.Name -notin '.htaccess', '.gitkeep' } | Remove-Item -Recurse -Force
    Expand-Archive -Path $Zip -DestinationPath $Data.Uploads -Force
}

Write-Host "Sauvegarde $(Split-Path -Leaf $Folder) remise." -ForegroundColor Green
