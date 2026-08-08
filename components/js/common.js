var HTAComponents = HTAComponents || {};

HTAComponents.sleep = function(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
};

HTAComponents.writeLog = function(msg) {
    try {
        var fso = HTAComponents.getFSO();
        var basePath = HTAComponents.getBasePath();
        var logDir = HTAComponents.getParentFolder(basePath) + "\\logs";
        HTAComponents.createFolder(logDir);
        var ts = fso.OpenTextFile(logDir + "\\error.log", 8, true);
        var now = new Date();
        function p(n) { return n < 10 ? "0" + n : "" + n; }
        ts.WriteLine(now.getFullYear() + "-" + p(now.getMonth()+1) + "-" + p(now.getDate()) + "T" + p(now.getHours()) + ":" + p(now.getMinutes()) + ":" + p(now.getSeconds()) + " " + msg);
        ts.Close();
    } catch(e) {}
};

HTAComponents.ToastMixin = {
    data: function() {
        return {
            toastVisible: false,
            toastMessage: '',
            toastTimer: null
        };
    },
    methods: {
        showToast: function(msg, duration) {
            var self = this;
            this.toastMessage = msg;
            this.toastVisible = true;
            if (this.toastTimer) clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function() {
                self.toastVisible = false;
            }, duration || 2000);
        }
    }
};

HTAComponents.LoadingMixin = {
    data: function() {
        return {
            loading: false
        };
    }
};

HTAComponents.FocusDirective = {
    inserted: function(el) {
        el.focus();
        el.select();
    }
};
