# 创建新的 HTA 应用目录结构
# 用法: .\tools\new-hta.ps1 <应用名称>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$AppName
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $root
$appDir = Join-Path $projectRoot $AppName

if (Test-Path $appDir) {
    Write-Host "目录已存在: $appDir" -ForegroundColor Red
    exit 1
}

# 创建目录结构
$cssDir = Join-Path $appDir "css"
$jsDir = Join-Path $appDir "js"
$logsDir = Join-Path $appDir "logs"
$typesDir = Join-Path $appDir "types"

New-Item -ItemType Directory -Path $cssDir -Force | Out-Null
New-Item -ItemType Directory -Path $jsDir -Force | Out-Null
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
New-Item -ItemType Directory -Path $typesDir -Force | Out-Null

# UTF-8 with BOM 编码器
$utf8WithBom = New-Object System.Text.UTF8Encoding $true

# 创建 main.hta 模板
$htaContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>$AppName</title>
    <HTA:APPLICATION
        ID="$AppName"
        APPLICATIONNAME="$AppName"
        BORDER="dialog"
        BORDERSTYLE="normal"
        CAPTION="yes"
        CONTEXTMENU="no"
        INNERBORDER="no"
        MAXIMIZEBUTTON="yes"
        MINIMIZEBUTTON="yes"
        NAVIGABLE="no"
        SCROLL="no"
        SELECTION="no"
        SINGLEINSTANCE="yes"
        SYSMENU="yes"
        VERSION="1.0"
    />
    <script language="javascript" src="../vue/vue.js"></script>
    <script language="javascript" src="../components/js/com.js"></script>
    <script language="javascript" src="../components/js/common.js"></script>
    <link rel="stylesheet" type="text/css" href="../components/css/common.css" />
    <link rel="stylesheet" type="text/css" href="css/style.css" />
</head>
<body>
    <div id="app">
        <!-- 应用内容 -->
    </div>
    <script language="javascript" src="js/app.js"></script>
</body>
</html>
"@

$cssContent = @"
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: "Segoe UI", "Microsoft YaHei", sans-serif; font-size: 13px; background: #2b2b2b; color: #bbb; overflow: hidden; height: 100vh; }
#app { display: flex; flex-direction: column; height: 100vh; }
"@

$jsContent = @"
var w = 800, h = 600;
window.resizeTo(w, h);
window.moveTo((screen.availWidth - w) / 2, (screen.availHeight - h) / 2);

var writeLog = CommonComponents.writeLog;
var sleep = CommonComponents.sleep;

Vue.directive('focus', CommonComponents.FocusDirective);

new Vue({
    el: '#app',
    mixins: [CommonComponents.ToastMixin, CommonComponents.LoadingMixin],
    data: {
    },
    methods: {
    }
});
"@

$dtsContent = @"
/**
 * $AppName 应用类型定义
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

interface ${AppName}Data {
    // 应用数据属性
    loading: boolean;
    toastVisible: boolean;
    toastMessage: string;
    toastTimer: number | null;
}

interface ${AppName}Methods {
    showToast(msg: string, duration?: number): void;
}
"@

# 写入文件 (UTF-8 with BOM)
[System.IO.File]::WriteAllText((Join-Path $appDir "main.hta"), $htaContent, $utf8WithBom)
[System.IO.File]::WriteAllText((Join-Path $cssDir "style.css"), $cssContent, $utf8WithBom)
[System.IO.File]::WriteAllText((Join-Path $jsDir "app.js"), $jsContent, $utf8WithBom)
[System.IO.File]::WriteAllText((Join-Path $typesDir "$AppName.d.ts"), $dtsContent, $utf8WithBom)

Write-Host "Created HTA app: $appDir" -ForegroundColor Green
Write-Host "  main.hta" -ForegroundColor Gray
Write-Host "  css/style.css" -ForegroundColor Gray
Write-Host "  js/app.js" -ForegroundColor Gray
Write-Host "  types/$AppName.d.ts" -ForegroundColor Gray
Write-Host "  logs/" -ForegroundColor Gray