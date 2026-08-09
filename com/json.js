var $COM = $COM || {};

$COM.json = {
    read: function(path) {
        try {
            if (!$COM.fso.FileExists(path)) return null;
            var stream = $COM.fso.OpenTextFile(path, 1, false);
            var content = stream.ReadAll();
            stream.Close();
            return JSON.parse(content);
        } catch(e) {
            return null;
        }
    },
    write: function(path, data) {
        try {
            var folder = $COM.fso.GetParentFolderName(path);
            if (!$COM.fso.FolderExists(folder)) $COM.fso.CreateFolder(folder);
            var stream = $COM.fso.OpenTextFile(path, 2, true);
            stream.Write(JSON.stringify(data));
            stream.Close();
            return true;
        } catch(e) {
            return false;
        }
    }
};
