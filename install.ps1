param()

$Repo = "ikrishagarwal/GIFs.md"
$RequiredFiles = @("manifest.json", "main.js")
$OptionalFiles = @("styles.css")
$TargetDir = Join-Path ".obsidian" "plugins/gifs-md"

Write-Host "Fetching latest release info from $Repo..."

try {
    $Latest = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -ErrorAction Stop
} catch {
    Write-Error "Failed to fetch latest release. Check the repo name or your network connection."
    exit 1
}

$Tag = $Latest.tag_name

if ([string]::IsNullOrWhiteSpace($Tag)) {
    Write-Error "No releases found for $Repo."
    exit 1
}

Write-Host "Latest release tag: $Tag"

# Safely reset the target directory
if (Test-Path $TargetDir) {
    Write-Host "Clearing existing files in $TargetDir..."
    Remove-Item -Path $TargetDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null

Write-Host "Downloading files to $TargetDir..."

foreach ($File in $RequiredFiles) {
    $Url = "https://github.com/$Repo/releases/download/$Tag/$File"
    $OutPath = Join-Path $TargetDir $File
    Write-Host "  Downloading $File..."
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutPath -ErrorAction Stop | Out-Null
    } catch {
        Write-Error "Error: Failed to download required file $File"
        exit 1
    }
}

foreach ($File in $OptionalFiles) {
    $Url = "https://github.com/$Repo/releases/download/$Tag/$File"
    $OutPath = Join-Path $TargetDir $File
    Write-Host "  Downloading optional $File..."
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutPath -ErrorAction Stop | Out-Null
    } catch {
        Write-Host "  (Optional file $File not present in release, skipping)" -ForegroundColor DarkGray
    }
}

Write-Host "Done. Files installed to $TargetDir" -ForegroundColor Green
Get-ChildItem -Path $TargetDir
