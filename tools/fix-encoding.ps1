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

    # 检查是否已有 BOM 且有内容
    if ($bytes.Length -gt 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "[SKIP] $name 已有 BOM" -ForegroundColor Gray
        continue
    }

    # 警告：文件只有 BOM 没有内容（可能是之前写入失败）
    if ($bytes.Length -eq 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "[WARN] $name 只有 BOM 无内容，文件可能已损坏，请手动恢复" -ForegroundColor Yellow
        continue
    }

    # 读取内容并重新写入
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    [System.IO.File]::WriteAllText($file, $text, $utf8WithBom)

    # 验证写入后文件非空
    $newBytes = [System.IO.File]::ReadAllBytes($file)
    if ($newBytes.Length -le 3) {
        Write-Host "[ERROR] $name 写入后文件为空！" -ForegroundColor Red
    } else {
        Write-Host "[FIXED] $name -> UTF-8 with BOM" -ForegroundColor Green
    }
}