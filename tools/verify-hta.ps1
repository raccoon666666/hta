# HTA file verification script
# Usage: .\tools\verify-hta.ps1 <file1> [file2] ...

param(
    [Parameter(Mandatory=$true, Position=0, ValueFromRemainingArguments=$true)]
    [string[]]$Files
)

$allPassed = $true

foreach ($file in $Files) {
    if (-not (Test-Path $file)) {
        Write-Host "[NOT FOUND] $file" -ForegroundColor Red
        $allPassed = $false
        continue
    }

    $name = Split-Path $file -Leaf
    $bytes = [System.IO.File]::ReadAllBytes($file)
    $errors = @()

    # 1. UTF-8 BOM check
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        # BOM OK
    } else {
        $errors += "Missing UTF-8 BOM"
    }

    # 2. Encoding corruption check (U+FFFD)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    $lines = $text.Split("`n")
    $corruptedLines = @()
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match [char]0xFFFD) {
            $corruptedLines += ($i + 1)
        }
    }
    if ($corruptedLines.Count -gt 0) {
        $errors += "Corrupted lines: $($corruptedLines -join ', ')"
    }

    # 3. JS syntax check
    if ($file -match '\.(js|hta)$') {
        # Bracket matching
        $openBrace = ([regex]::Matches($text, '\{')).Count
        $closeBrace = ([regex]::Matches($text, '\}')).Count
        $openParen = ([regex]::Matches($text, '\(')).Count
        $closeParen = ([regex]::Matches($text, '\)')).Count
        $openBracket = ([regex]::Matches($text, '\[')).Count
        $closeBracket = ([regex]::Matches($text, '\]')).Count

        if ($openBrace -ne $closeBrace) { $errors += "Braces mismatch: { = $openBrace, } = $closeBrace" }
        if ($openParen -ne $closeParen) { $errors += "Parens mismatch: ( = $openParen, ) = $closeParen" }
        if ($openBracket -ne $closeBracket) { $errors += "Brackets mismatch: [ = $openBracket, ] = $closeBracket" }

        # ES6+ syntax (JScript incompatible)
        # Exclude HTML attributes and string literals
        $arrow = ([regex]::Matches($text, '=>')).Count
        $let = ([regex]::Matches($text, '\blet\s+[_\w]')).Count
        $const = ([regex]::Matches($text, '\bconst\s+[_\w]')).Count
        $tpl = ([regex]::Matches($text, '(?<!\\)`')).Count
        $forof = ([regex]::Matches($text, '\bfor\s*\([^)]*\bof\b')).Count
        # class: exclude HTML (class="...", :class, 'class')
        $class = ([regex]::Matches($text, '(?:^|[^"''=:\w])class\s+\w')).Count
        # WScript: exclude string content ("WScript.Shell" etc)
        $wscript = ([regex]::Matches($text, '(?:^|[^"''\w])WScript(?:!\.)')).Count

        if ($arrow -gt 0) { $errors += "Found $arrow arrow function(s)" }
        if ($let -gt 0) { $errors += "Found $let 'let' (use var)" }
        if ($const -gt 0) { $errors += "Found $const 'const' (use var)" }
        if ($tpl -gt 0) { $errors += "Found $tpl template literal(s)" }
        if ($forof -gt 0) { $errors += "Found $forof for...of (use for)" }
        if ($class -gt 0) { $errors += "Found $class class (use function+prototype)" }
        if ($wscript -gt 0) { $errors += "Found $wscript WScript (not in HTA)" }
    }

    # Output result
    if ($errors.Count -eq 0) {
        Write-Host "[PASS] $name" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Yellow
        foreach ($err in $errors) {
            Write-Host "       - $err" -ForegroundColor Red
        }
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "`nAll checks passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome checks failed!" -ForegroundColor Red
    exit 1
}
