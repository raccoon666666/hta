$COM.runCmd = function(cmd, cwd) {
    if (cwd) $COM.shell.CurrentDirectory = cwd;
    return $COM.shell.Exec('cmd /c ' + cmd + ' 2>&1');
};

$COM.runCmdSync = function(cmd, cwd) {
    var exec = $COM.runCmd(cmd, cwd);
    var output = "";
    while (!exec.Status) {
        CommonComponents.sleep(50);
    }
    if (exec.StdOut.AtEndOfStream === false) output = exec.StdOut.ReadAll();
    if (exec.StdErr.AtEndOfStream === false) output += exec.StdErr.ReadAll();
    return output;
};

$COM.readReg = function(path) {
    return $COM.shell.RegRead(path);
};

$COM.writeReg = function(path, value, type) {
    if (type) {
        $COM.shell.RegWrite(path, value, type);
    } else {
        $COM.shell.RegWrite(path, value);
    }
};

$COM.getEnvVars = function(type) {
    return $COM.shell.Environment(type || "User");
};
