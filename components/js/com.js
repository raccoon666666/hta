var HTAComponents = HTAComponents || {};

HTAComponents._comCache = {};

HTAComponents.getShell = function() {
    if (!HTAComponents._comCache.shell) {
        HTAComponents._comCache.shell = new ActiveXObject("WScript.Shell");
    }
    return HTAComponents._comCache.shell;
};

HTAComponents.getFSO = function() {
    if (!HTAComponents._comCache.fso) {
        HTAComponents._comCache.fso = new ActiveXObject("Scripting.FileSystemObject");
    }
    return HTAComponents._comCache.fso;
};

HTAComponents.getShellApp = function() {
    if (!HTAComponents._comCache.shellApp) {
        HTAComponents._comCache.shellApp = new ActiveXObject("Shell.Application");
    }
    return HTAComponents._comCache.shellApp;
};

HTAComponents.getEnvVars = function(type) {
    return HTAComponents.getShell().Environment(type || "User");
};

HTAComponents.runCmd = function(cmd, cwd) {
    var shell = HTAComponents.getShell();
    if (cwd) {
        shell.CurrentDirectory = cwd;
    }
    return shell.Exec('cmd /c ' + cmd + ' 2>&1');
};

HTAComponents.readReg = function(path) {
    return HTAComponents.getShell().RegRead(path);
};

HTAComponents.writeReg = function(path, value, type) {
    var shell = HTAComponents.getShell();
    if (type) {
        shell.RegWrite(path, value, type);
    } else {
        shell.RegWrite(path, value);
    }
};

HTAComponents.folderExists = function(path) {
    return HTAComponents.getFSO().FolderExists(path);
};

HTAComponents.fileExists = function(path) {
    return HTAComponents.getFSO().FileExists(path);
};

HTAComponents.createFolder = function(path) {
    var fso = HTAComponents.getFSO();
    if (!fso.FolderExists(path)) {
        fso.CreateFolder(path);
    }
    return path;
};

HTAComponents.getParentFolder = function(path) {
    return HTAComponents.getFSO().GetParentFolderName(path);
};

HTAComponents.getBasePath = function() {
    return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
};

HTAComponents.openTextFile = function(path, mode, create) {
    var fso = HTAComponents.getFSO();
    return fso.OpenTextFile(path, mode || 1, create !== false);
};

HTAComponents.browseForFolder = function(title, root) {
    var shellApp = HTAComponents.getShellApp();
    var folder = shellApp.BrowseForFolder(0, title || "选择文件夹", root || 0, 0);
    return folder ? folder.Self.Path : null;
};

HTAComponents.runCmdSync = function(cmd, cwd) {
    var exec = HTAComponents.runCmd(cmd, cwd);
    var output = "";
    while (!exec.Status) {
        HTAComponents.sleep(50);
    }
    if (exec.StdOut.AtEndOfStream === false) {
        output = exec.StdOut.ReadAll();
    }
    if (exec.StdErr.AtEndOfStream === false) {
        output += exec.StdErr.ReadAll();
    }
    return output;
};