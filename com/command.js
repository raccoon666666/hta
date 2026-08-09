var $COM = $COM || {};

$COM.cmd = {
    run: function(cmd, cwd) {
        if (cwd) $COM.shell.CurrentDirectory = cwd;
        return $COM.shell.Exec('cmd /c ' + cmd + ' 2>&1');
    },
    runSync: function(cmd, cwd) {
        var exec = $COM.cmd.run(cmd, cwd);
        var output = "";
        while (!exec.Status) {
            $Component.sleep(50);
        }
        if (exec.StdOut.AtEndOfStream === false) output = exec.StdOut.ReadAll();
        if (exec.StdErr.AtEndOfStream === false) output += exec.StdErr.ReadAll();
        return output;
    }
};
