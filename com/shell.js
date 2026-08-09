var COMComponents = COMComponents || {};

COMComponents._comCache = {};

COMComponents.getShell = function() {
    if (!COMComponents._comCache.shell) {
        COMComponents._comCache.shell = new ActiveXObject("WScript.Shell");
    }
    return COMComponents._comCache.shell;
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
