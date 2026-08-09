var COMComponents = COMComponents || {};

COMComponents.getFSO = function() {
    if (!COMComponents._comCache) COMComponents._comCache = {};
    if (!COMComponents._comCache.fso) {
        COMComponents._comCache.fso = new ActiveXObject("Scripting.FileSystemObject");
    }
    return COMComponents._comCache.fso;
};

COMComponents.folderExists = function(path) {
    return COMComponents.getFSO().FolderExists(path);
};

COMComponents.fileExists = function(path) {
    return COMComponents.getFSO().FileExists(path);
};

COMComponents.createFolder = function(path) {
    var fso = COMComponents.getFSO();
    if (!fso.FolderExists(path)) {
        fso.CreateFolder(path);
    }
    return path;
};

COMComponents.getParentFolder = function(path) {
    return COMComponents.getFSO().GetParentFolderName(path);
};

COMComponents.getBasePath = function() {
    return unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
};

COMComponents.openTextFile = function(path, mode, create) {
    var fso = COMComponents.getFSO();
    return fso.OpenTextFile(path, mode || 1, create !== false);
};
