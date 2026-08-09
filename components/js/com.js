var COMComponents = COMComponents || {};

COMComponents._comCache = {};

COMComponents.getShell = function() {
    if (!COMComponents._comCache.shell) {
        COMComponents._comCache.shell = new ActiveXObject("WScript.Shell");
    }
    return COMComponents._comCache.shell;
};

COMComponents.getFSO = function() {
    if (!COMComponents._comCache.fso) {
        COMComponents._comCache.fso = new ActiveXObject("Scripting.FileSystemObject");
    }
    return COMComponents._comCache.fso;
};

COMComponents.getShellApp = function() {
    if (!COMComponents._comCache.shellApp) {
        COMComponents._comCache.shellApp = new ActiveXObject("Shell.Application");
    }
    return COMComponents._comCache.shellApp;
};

COMComponents.getEnvVars = function(type) {
    return COMComponents.getShell().Environment(type || "User");
};

COMComponents.runCmd = function(cmd, cwd) {
    var shell = COMComponents.getShell();
    if (cwd) {
        shell.CurrentDirectory = cwd;
    }
    return shell.Exec('cmd /c ' + cmd + ' 2>&1');
};

COMComponents.readReg = function(path) {
    return COMComponents.getShell().RegRead(path);
};

COMComponents.writeReg = function(path, value, type) {
    var shell = COMComponents.getShell();
    if (type) {
        shell.RegWrite(path, value, type);
    } else {
        shell.RegWrite(path, value);
    }
};

COMComponents.folderExists = function(path) {
    return COMComponents.getFSO().FolderExists(path);
};

COMComponents.fileExists = function(path) {
    return COMComponents.getFSO().FileExists(path);
};

COMComponents.createFolder = function(path) {
    var fso = COMComponents.getFSO();
    if (!fso.FolderExists(path)) {
        fso.CreateFolder(path);
    }
    return path;
};

COMComponents.getParentFolder = function(path) {
    return COMComponents.getFSO().GetParentFolderName(path);
};

COMComponents.getBasePath = function() {
    return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
};

COMComponents.openTextFile = function(path, mode, create) {
    var fso = COMComponents.getFSO();
    return fso.OpenTextFile(path, mode || 1, create !== false);
};

COMComponents.browseForFolder = function(title, root) {
    var shellApp = COMComponents.getShellApp();
    var folder = shellApp.BrowseForFolder(0, title || "选择文件夹", root || 0, 0);
    return folder ? folder.Self.Path : null;
};

COMComponents.runCmdSync = function(cmd, cwd) {
    var exec = COMComponents.runCmd(cmd, cwd);
    var output = "";
    while (!exec.Status) {
        CommonComponents.sleep(50);
    }
    if (exec.StdOut.AtEndOfStream === false) {
        output = exec.StdOut.ReadAll();
    }
    if (exec.StdErr.AtEndOfStream === false) {
        output += exec.StdErr.ReadAll();
    }
    return output;
};
