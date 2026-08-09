COMComponents.folderExists = function(path) {
    return $COM.fso.FolderExists(path);
};

COMComponents.fileExists = function(path) {
    return $COM.fso.FileExists(path);
};

COMComponents.createFolder = function(path) {
    if (!$COM.fso.FolderExists(path)) {
        $COM.fso.CreateFolder(path);
    }
    return path;
};

COMComponents.getParentFolder = function(path) {
    return $COM.fso.GetParentFolderName(path);
};

COMComponents.getBasePath = function() {
    return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
};

COMComponents.openTextFile = function(path, mode, create) {
    return $COM.fso.OpenTextFile(path, mode || 1, create !== false);
};
