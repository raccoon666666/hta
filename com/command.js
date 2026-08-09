COMComponents.runCmd = function(cmd, cwd) {
    if (cwd) $COM.shell.CurrentDirectory = cwd;
    return $COM.shell.Exec('cmd /c ' + cmd + ' 2>&1');
};

COMComponents.runCmdSync = function(cmd, cwd) {
    var exec = COMComponents.runCmd(cmd, cwd);
    var output = "";
    while (!exec.Status) {
        CommonComponents.sleep(50);
    }
    if (exec.StdOut.AtEndOfStream === false) output = exec.StdOut.ReadAll();
    if (exec.StdErr.AtEndOfStream === false) output += exec.StdErr.ReadAll();
    return output;
};

COMComponents.readReg = function(path) {
    return $COM.shell.RegRead(path);
};

COMComponents.writeReg = function(path, value, type) {
    if (type) {
        $COM.shell.RegWrite(path, value, type);
    } else {
        $COM.shell.RegWrite(path, value);
    }
};

COMComponents.getEnvVars = function(type) {
    return $COM.shell.Environment(type || "User");
};
