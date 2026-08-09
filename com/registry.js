var $COM = $COM || {};

$COM.reg = {
    read: function(path) {
        return $COM.shell.RegRead(path);
    },
    write: function(path, value, type) {
        if (type) {
            $COM.shell.RegWrite(path, value, type);
        } else {
            $COM.shell.RegWrite(path, value);
        }
    }
};

$COM.env = {
    get: function(type) {
        return $COM.shell.Environment(type || "User");
    }
};
