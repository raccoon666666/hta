var $Component = $Component || {};

$Component.sleep = function(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
};

$Component.writeLog = function(msg) {
    try {
        var fso = $COM.fso;
        var basePath = $COM.file.basePath();
        var logDir = $COM.file.parent(basePath) + "\\logs";
        $COM.file.create(logDir);
        var ts = fso.OpenTextFile(logDir + "\\error.log", 8, true);
        var now = new Date();
        function p(n) { return n < 10 ? "0" + n : "" + n; }
        ts.WriteLine(now.getFullYear() + "-" + p(now.getMonth()+1) + "-" + p(now.getDate()) + "T" + p(now.getHours()) + ":" + p(now.getMinutes()) + ":" + p(now.getSeconds()) + " " + msg);
        ts.Close();
    } catch(e) {}
};
