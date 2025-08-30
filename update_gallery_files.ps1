# PowerShell script to update the files array in gallery.html with all markdown files in Docs/

# Use relative paths
$galleryPath = Join-Path $PSScriptRoot 'gallery.html'
$docsPath = Join-Path $PSScriptRoot 'Docs'

# Get all .md files in Docs (non-recursive)
$mdFiles = Get-ChildItem -Path $docsPath -Filter *.md | Select-Object -ExpandProperty Name

# Convert to JS array
$jsArray = "const files = [" + ($mdFiles | ForEach-Object { '"' + $_ + '"' }) -join ", " + "];"

# Read gallery.html
$html = Get-Content $galleryPath -Raw

# Replace the files array
$html = $html -replace "const files = \[[^\]]*\];", $jsArray

# Write back
Set-Content $galleryPath $html
Write-Host "gallery.html updated with markdown files from Docs/"
