# 修复文件编码为 UTF-8 with BOM
# 用法: .\tools\fix-encoding.ps1 <文件路径1> [文件路径2] ...

param(
    [Parameter(Mandatory=$true, Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$Files
)

$utf8WithBom = New-Object System.Text.UTF8Encoding $true

foreach ($file in $Files) {
    if (-not (Test-Path $file)) {
        Write-Host "[NOT FOUND] $file" -ForegroundColor Red
        continue
    }

    $name = Split-Path $file -Leaf
    $bytes = [System.IO.File]::ReadAllBytes($file)

    # 检查是否已有 BOM
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "[SKIP] $name 已有 BOM" -ForegroundColor Gray
        continue
    }

    # 读取内容并重新写入
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    [System.IO.File]::WriteAllText($file, $text, $utf8WithBom)
    Write-Host "[FIXED] $name -> UTF-8 with BOM" -ForegroundColor Green
}
