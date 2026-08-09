var COMComponents = COMComponents || {};

COMComponents.getShellApp = function() {
    if (!COMComponents._comCache) COMComponents._comCache = {};
    if (!COMComponents._comCache.shellApp) {
        COMComponents._comCache.shellApp = new ActiveXObject("Shell.Application");
    }
    return COMComponents._comCache.shellApp;
};

COMComponents.browseForFolder = function(title, root) {
    var shellApp = COMComponents.getShellApp();
    var flags = 0;
    var rootFolder = 0;
    if (typeof root === 'number') {
        rootFolder = root;
    } else if (typeof root === 'string' && root) {
        try {
            var ns = shellApp.NameSpace(root);
            if (ns) rootFolder = root;
        } catch(e) {}
    }
    var dlg = shellApp.BrowseForFolder(0, title || "选择文件夹", flags, rootFolder);
    if (dlg) {
        return dlg.Self.Path;
    }
    return null;
};
