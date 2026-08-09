COMComponents.readJsonFile = function(filePath) {
    try {
        if (!$COM.fso.FileExists(filePath)) return null;
        var stream = $COM.fso.OpenTextFile(filePath, 1, false);
        var content = stream.ReadAll();
        stream.Close();
        return JSON.parse(content);
    } catch(e) {
        return null;
    }
};

COMComponents.writeJsonFile = function(filePath, data) {
    try {
        var folder = $COM.fso.GetParentFolderName(filePath);
        if (!$COM.fso.FolderExists(folder)) $COM.fso.CreateFolder(folder);
        var stream = $COM.fso.OpenTextFile(filePath, 2, true);
        stream.Write(JSON.stringify(data));
        stream.Close();
        return true;
    } catch(e) {
        return false;
    }
};
