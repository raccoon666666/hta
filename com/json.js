var COMComponents = COMComponents || {};

COMComponents.readJsonFile = function(filePath) {
    try {
        var fso = COMComponents.getFSO();
        if (!fso.FileExists(filePath)) return null;
        var stream = fso.OpenTextFile(filePath, 1, false);
        var content = stream.ReadAll();
        stream.Close();
        return JSON.parse(content);
    } catch(e) {
        return null;
    }
};

COMComponents.writeJsonFile = function(filePath, data) {
    try {
        var fso = COMComponents.getFSO();
        var folder = fso.GetParentFolderName(filePath);
        if (!fso.FolderExists(folder)) fso.CreateFolder(folder);
        var stream = fso.OpenTextFile(filePath, 2, true);
        stream.Write(JSON.stringify(data));
        stream.Close();
        return true;
    } catch(e) {
        return false;
    }
};
