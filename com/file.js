$COM.folderExists = function(path) {
    return $COM.fso.FolderExists(path);
};

$COM.fileExists = function(path) {
    return $COM.fso.FileExists(path);
};

$COM.createFolder = function(path) {
    if (!$COM.fso.FolderExists(path)) {
        $COM.fso.CreateFolder(path);
    }
    return path;
};

$COM.getParentFolder = function(path) {
    return $COM.fso.GetParentFolderName(path);
};

$COM.getBasePath = function() {
    return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
};

$COM.openTextFile = function(path, mode, create) {
    return $COM.fso.OpenTextFile(path, mode || 1, create !== false);
};
