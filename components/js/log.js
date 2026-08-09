var $Component = $Component || {};

(function() {
    var LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    var LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    var _minLevel = 0;
    var _currentFile = '';
    var _currentSize = 0;
    var _maxSize = 10 * 1024 * 1024;

    function _formatTime() {
        var d = new Date();
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        function p3(n) { return n < 100 ? (n < 10 ? '00' + n : '0' + n) : '' + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
            p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.' + p3(d.getMilliseconds());
    }

    function _formatFileTime() {
        var d = new Date();
        function p(n) { return n < 10 ? '0' + n : '' + n; }
        function p3(n) { return n < 100 ? (n < 10 ? '00' + n : '0' + n) : '' + n; }
        return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' +
            p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.' + p3(d.getMilliseconds());
    }

    function _formatMessage(pattern, args) {
        var i = 0;
        return pattern.replace(/\{\}/g, function() {
            return i < args.length ? String(args[i++]) : '{}';
        });
    }

    function _getLogPath(logDir, seq) {
        var name = _formatFileTime();
        if (seq > 0) name += '_' + seq;
        return logDir + '\\' + name + '.log';
    }

    function _rollFile(logDir) {
        var fso = $COM.fso;
        var seq = 0;
        var path = _getLogPath(logDir, seq);
        while (fso.FileExists(path)) {
            var file = fso.GetFile(path);
            if (file.Size < _maxSize) {
                _currentFile = path;
                _currentSize = file.Size;
                return;
            }
            seq++;
            path = _getLogPath(logDir, seq);
        }
        _currentFile = path;
        _currentSize = 0;
    }

    function _write(level, logger, pattern, args) {
        if (level < _minLevel) return;
        var msg = _formatTime() + ' [' + LEVEL_NAMES[level] + '] [' + logger + '] ' + _formatMessage(pattern, args);
        try {
            var fso = $COM.fso;
            var logDir = $COM.file.parent($COM.file.basePath()) + '\\logs';
            $COM.file.create(logDir);
            if (!_currentFile || _currentFile.indexOf(logDir) !== 0) {
                _rollFile(logDir);
            } else {
                var checkFile = fso.GetFile(_currentFile);
                if (checkFile.Size >= _maxSize) {
                    _rollFile(logDir);
                }
            }
            var msgLen = msg.length + 2;
            if (_currentSize + msgLen > _maxSize) {
                var seq = 0;
                var path = _getLogPath(logDir, seq);
                while (fso.FileExists(path)) {
                    seq++;
                    path = _getLogPath(logDir, seq);
                }
                _currentFile = path;
                _currentSize = 0;
            }
            var ts = fso.OpenTextFile(_currentFile, 8, true);
            ts.WriteLine(msg);
            ts.Close();
            _currentSize += msgLen;
        } catch (e) {}
    }

    function _createLogger(name) {
        return {
            debug: function(pattern) { _write(0, name, pattern, Array.prototype.slice.call(arguments, 1)); },
            info: function(pattern) { _write(1, name, pattern, Array.prototype.slice.call(arguments, 1)); },
            warn: function(pattern) { _write(2, name, pattern, Array.prototype.slice.call(arguments, 1)); },
            error: function(pattern) { _write(3, name, pattern, Array.prototype.slice.call(arguments, 1)); },
            isDebugEnabled: function() { return _minLevel <= 0; },
            isInfoEnabled: function() { return _minLevel <= 1; },
            isWarnEnabled: function() { return _minLevel <= 2; },
            isErrorEnabled: function() { return _minLevel <= 3; }
        };
    }

    $Component.log = {
        getLogger: function(name) { return _createLogger(name); },
        setLevel: function(level) {
            if (typeof level === 'string') {
                level = LEVELS[level.toUpperCase()];
            }
            if (level !== undefined) _minLevel = level;
        },
        Level: LEVELS
    };
})();
