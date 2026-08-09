var $COM = $COM || {};

$COM.dialog = {
    browseForFolder: function(title, root) {
        var rootFolder = 0;
        if (typeof root === 'number') {
            rootFolder = root;
        } else if (typeof root === 'string' && root) {
            try {
                var ns = $COM.shellApp.NameSpace(root);
                if (ns) rootFolder = root;
            } catch(e) {}
        }
        var dlg = $COM.shellApp.BrowseForFolder(0, title || "选择文件夹", 0, rootFolder);
        return dlg ? dlg.Self.Path : null;
    }
};
