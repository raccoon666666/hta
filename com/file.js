var $COM = $COM || {};

$COM.file = {
    exists: function(path) {
        return $COM.fso.FileExists(path);
    },
    folderExists: function(path) {
        return $COM.fso.FolderExists(path);
    },
    create: function(path) {
        if (!$COM.fso.FolderExists(path)) {
            $COM.fso.CreateFolder(path);
        }
        return path;
    },
    parent: function(path) {
        return $COM.fso.GetParentFolderName(path);
    },
    basePath: function() {
        return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
    },
    open: function(path, mode, create) {
        return $COM.fso.OpenTextFile(path, mode || 1, create !== false);
    }
};
