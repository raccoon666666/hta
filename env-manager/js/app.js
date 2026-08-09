var w = 780, h = 520;
window.resizeTo(w, h);
window.moveTo((screen.availWidth - w) / 2, (screen.availHeight - h) / 2);

var writeLog = CommonComponents.writeLog;
var envUser = COMComponents.getEnvVars("User");

Vue.directive('focus', CommonComponents.FocusDirective);

new Vue({
    el: '#app',
    mixins: [CommonComponents.ToastMixin],
    data: {
        envList: [],
        editingIndex: -1,
        showDeleteModal: false,
        showAddModal: false,
        newVar: { name: '', value: '' },
        originalList: [],
        saving: false
    },
    computed: {
        selectedCount: function() {
            return this.envList.filter(function(item) { return item.selected; }).length;
        },
        selectedItems: function() {
            return this.envList.filter(function(item) { return item.selected; }).map(function(item) { return item.name; });
        },
        allSelected: function() {
            return this.envList.length > 0 && this.envList.every(function(item) { return item.selected; });
        },
        hasChanges: function() {
            return JSON.stringify(this.envList) !== JSON.stringify(this.originalList);
        }
    },
    mounted: function() {
        this.loadEnvVars();
        var self = this;
        this.$nextTick(function() {
            var addBtn = document.getElementById('app').querySelector('.btn-add');
            if (addBtn) addBtn.onclick = function() { self.showAddModal = true; };
        });
    },
    watch: {
        showAddModal: function(val) {
            if (val) {
                var self = this;
                this.$nextTick(function() {
                    var input = self.$refs.newNameInput;
                    if (input) input.focus();
                });
            }
        }
    },
    methods: {
        loadEnvVars: function() {
            try {
                var map = {};

                function loadFromEnv(env, isUser) {
                    try {
                        var e = new Enumerator(env);
                        for (; !e.atEnd(); e.moveNext()) {
                            var item = e.item();
                            if (typeof item === "string") {
                                var eq = item.indexOf("=");
                                if (eq > -1) {
                                    var name = item.substring(0, eq);
                                    var value = item.substring(eq + 1);
                                    if (!(name in map) || isUser) {
                                        map[name] = { name: name, value: value, selected: false, isUser: isUser };
                                    }
                                }
                            }
                        }
                    } catch(ex) {}
                }

                loadFromEnv(COMComponents.getEnvVars("System"), false);
                loadFromEnv(envUser, true);

                var list = [];
                for (var key in map) {
                    if (map.hasOwnProperty(key)) {
                        list.push(map[key]);
                    }
                }
                list.sort(function(a, b) { return a.name.localeCompare(b.name); });
                this.envList = list;
                this.originalList = JSON.parse(JSON.stringify(list));
            } catch(e) {
                writeLog("loadEnvVars error: " + e.message);
                this.showToast("加载失败: " + e.message);
            }
        },
        startEdit: function(index) {
            this.editingIndex = index;
        },
        finishEdit: function(index) {
            this.editingIndex = -1;
        },
        cancelEdit: function() {
            this.editingIndex = -1;
        },
        saveChanges: function() {
            var self = this;
            var changes = [];
            var originalMap = {};
            for (var i = 0; i < self.originalList.length; i++) {
                originalMap[self.originalList[i].name] = self.originalList[i].value;
            }
            for (var i = 0; i < self.envList.length; i++) {
                var item = self.envList[i];
                if (originalMap[item.name] !== undefined) {
                    if (originalMap[item.name] !== item.value) {
                        changes.push({ name: item.name, value: item.value });
                    }
                } else {
                    changes.push({ name: item.name, value: item.value });
                }
            }
            if (changes.length === 0) {
                self.showToast("没有需要保存的更改");
                return;
            }
            self.saving = true;
            var idx = 0;
            function processNext() {
                if (idx >= changes.length) {
                    self.originalList = JSON.parse(JSON.stringify(self.envList));
                    self.saving = false;
                    self.showToast("保存成功 (" + changes.length + " 项)");
                    return;
                }
                try { envUser(changes[idx].name) = changes[idx].value; } catch(e) { writeLog("save error: " + e.message); }
                idx++;
                setTimeout(processNext, 0);
            }
            setTimeout(processNext, 0);
        },
        confirmDelete: function() {
            if (this.selectedCount === 0) return;
            this.showDeleteModal = true;
        },
        deleteSelected: function() {
            var self = this;
            var items = self.selectedItems;
            self.showDeleteModal = false;
            var idx = 0;
            function processNext() {
                if (idx >= items.length) {
                    self.envList = self.envList.filter(function(item) {
                        return items.indexOf(item.name) === -1;
                    });
                    self.originalList = JSON.parse(JSON.stringify(self.envList));
                    self.showToast("已删除 " + items.length + " 个环境变量");
                    return;
                }
                try { envUser.Remove(items[idx]); } catch(e) { writeLog("delete error: " + e.message); }
                idx++;
                setTimeout(processNext, 0);
            }
            setTimeout(processNext, 0);
        },
        addVariable: function() {
            var name = this.newVar.name.trim();
            var value = this.newVar.value;
            if (!name) { this.showToast("请输入变量名"); return; }
            for (var i = 0; i < this.envList.length; i++) {
                if (this.envList[i].name === name) { this.showToast("变量名已存在"); return; }
            }
            this.envList.push({ name: name, value: value, selected: false });
            this.envList.sort(function(a, b) { return a.name.localeCompare(b.name); });
            this.newVar.name = '';
            this.newVar.value = '';
            this.showAddModal = false;
            this.showToast("已添加变量 " + name);
        },
        toggleSelectAll: function() {
            var target = !this.allSelected;
            this.envList.forEach(function(item) { item.selected = target; });
        },
        refreshList: function() {
            this.loadEnvVars();
            this.showToast("已刷新");
        }
    }
});
