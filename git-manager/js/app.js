var w = 1024, h = 700;
window.resizeTo(w, h);
window.moveTo((screen.availWidth - w) / 2, (screen.availHeight - h) / 2);

var shell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

function sleep(ms) {
    var start = new Date().getTime();
    while (new Date().getTime() - start < ms) {}
}

function writeLog(msg) {
    try {
        var basePath = unescape(location.href.replace("file:///", "").replace(/\//g, "\\"));
        var logDir = fso.GetParentFolderName(basePath) + "\\logs";
        if (!fso.FolderExists(logDir)) fso.CreateFolder(logDir);
        var ts = fso.OpenTextFile(logDir + "\\error.log", 8, true);
        var now = new Date();
        function p(n) { return n < 10 ? "0" + n : "" + n; }
        ts.WriteLine(now.getFullYear() + "-" + p(now.getMonth()+1) + "-" + p(now.getDate()) + "T" + p(now.getHours()) + ":" + p(now.getMinutes()) + ":" + p(now.getSeconds()) + " " + msg);
        ts.Close();
    } catch(e) {}
}

function runGitSync(args, cwd) {
    try {
        var cmd = 'cmd /c git ' + args + ' 2>&1';
        if (cwd) {
            shell.CurrentDirectory = cwd;
        }
        var exec = shell.Exec(cmd);
        var output = "";
        while (!exec.Status) {
            sleep(100);
        }
        if (exec.StdOut.AtEndOfStream === false) {
            output = exec.StdOut.ReadAll();
        }
        if (exec.StdErr.AtEndOfStream === false) {
            output += exec.StdErr.ReadAll();
        }
        return output;
    } catch(e) {
        return "error: " + e.message;
    }
}

new Vue({
    el: '#app',
    data: {
        currentRepo: "",
        recentRepos: [],
        showRepoMenu: false,
        showBranchMenu: false,
        activeTab: "changes",
        currentBranch: "",
        localBranches: [],
        remoteBranches: [],
        changedFiles: [],
        stagedFiles: [],
        unstagedFiles: [],
        commitMessage: "",
        stagedExpanded: true,
        unstagedExpanded: true,
        diffContent: "",
        diffFileName: "",
        commits: [],
        filteredCommits: [],
        logSearch: "",
        selectedCommit: null,
        selectedCommitFiles: [],
        commitFilesExpanded: true,
        consoleOutput: [],
        consoleCmd: "",
        loading: false,
        toastVisible: false,
        toastMessage: "",
        toastTimer: null
    },
    computed: {
        selectedUnstaged: function() {
            return this.unstagedFiles.filter(function(f) { return f._selected; });
        },
        selectedStaged: function() {
            return this.stagedFiles.filter(function(f) { return f._selected; });
        }
    },
        mounted: function() {
            this.loadRecentRepos();
            var self = this;
            document.addEventListener('click', function(e) {
                var target = e.target;
                var inToolbar = false;
                var el = target;
                while (el && el !== document.body) {
                    if (el.className && typeof el.className === 'string') {
                        if (el.className.indexOf('toolbar-left') > -1 || el.className.indexOf('toolbar-right') > -1) {
                            inToolbar = true;
                            break;
                        }
                    }
                    el = el.parentNode;
                }
                if (!inToolbar) {
                    self.showRepoMenu = false;
                    self.showBranchMenu = false;
                }
            });
        },
    watch: {
        currentRepo: function(val) {
            if (val) {
                this.refreshAll();
            }
        }
    },
    methods: {
        logToConsole: function(text) {
            var self = this;
            String(text).split('\n').forEach(function(line) {
                self.consoleOutput.push(line);
            });
        },
        loadRecentRepos: function() {
            try {
                var regPath = "HKCU\\Software\\GitManager\\RecentRepos";
                var val = shell.RegRead(regPath);
                this.recentRepos = val ? val.split(";") : [];
            } catch(e) {
                this.recentRepos = [];
            }
        },
        saveRecentRepo: function(repo) {
            try {
                var list = this.recentRepos.filter(function(r) { return r !== repo; });
                list.unshift(repo);
                if (list.length > 10) list = list.slice(0, 10);
                this.recentRepos = list;
                shell.RegWrite("HKCU\\Software\\GitManager\\RecentRepos", list.join(";"));
            } catch(e) {}
        },
        browseRepo: function() {
            try {
                var shellApp = new ActiveXObject("Shell.Application");
                var folder = shellApp.BrowseForFolder(0, "选择Git仓库目录", 0, 0);
                if (folder) {
                    var path = folder.Self.Path;
                    if (fso.FolderExists(path + "\\.git")) {
                        this.openRepo(path);
                    } else {
                        this.showToast("所选目录不是Git仓库");
                    }
                }
            } catch(e) {
                this.showToast("取消选择");
            }
            this.showRepoMenu = false;
        },
        openRepo: function(repo) {
            this.currentRepo = repo;
            this.saveRecentRepo(repo);
            this.showRepoMenu = false;
            this.consoleOutput = [];
            this.logToConsole("Opened: " + repo);
        },
        refreshAll: function() {
            this.loadBranches();
            this.refreshStatus();
            this.loadLog();
        },
        loadBranches: function() {
            if (!this.currentRepo) return;
            var output = runGitSync("branch", this.currentRepo);
            this.localBranches = output.split("\n").filter(function(l) { return l.trim(); }).map(function(l) {
                return l.replace(/^\*\s*/, "").trim();
            });
            var currentOutput = runGitSync("branch --show-current", this.currentRepo);
            this.currentBranch = currentOutput.trim();
            var remoteOutput = runGitSync("branch -r", this.currentRepo);
            this.remoteBranches = remoteOutput.split("\n").filter(function(l) {
                return l.trim() && l.indexOf("HEAD") === -1;
            }).map(function(l) { return l.trim(); });
        },
        checkoutBranch: function(branch) {
            var self = this;
            this.loading = true;
            var result = runGitSync("checkout \"" + branch + "\"", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git checkout " + branch + "\n" + result);
            this.showBranchMenu = false;
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("已切换到分支: " + branch);
                this.refreshAll();
            } else {
                this.showToast("切换失败: " + result.split("\n")[0]);
            }
        },
        checkoutRemoteBranch: function(branch) {
            var name = branch.replace(/^.*?\/([^\/]+)$/, "$1");
            var self = this;
            this.loading = true;
            var result = runGitSync("checkout -b \"" + name + "\" \"" + branch + "\"", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git checkout -b " + name + " " + branch + "\n" + result);
            this.showBranchMenu = false;
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("已创建并切换到: " + name);
                this.refreshAll();
            } else {
                this.showToast("失败: " + result.split("\n")[0]);
            }
        },
        createBranch: function() {
            var name = prompt("新分支名称:");
            if (!name || !name.trim()) return;
            var self = this;
            this.loading = true;
            var result = runGitSync("checkout -b \"" + name.trim() + "\"", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git checkout -b " + name.trim() + "\n" + result);
            this.showBranchMenu = false;
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("已创建分支: " + name.trim());
                this.refreshAll();
            } else {
                this.showToast("创建失败: " + result.split("\n")[0]);
            }
        },
        refreshStatus: function() {
            if (!this.currentRepo) return;
            var output = runGitSync("status --porcelain -u", this.currentRepo);
            var lines = output.split("\n").filter(function(l) { return l.trim(); });
            var staged = [];
            var unstaged = [];
            lines.forEach(function(line) {
                if (line.length < 4) return;
                var indexStatus = line[0];
                var workStatus = line[1];
                var path = line.substring(3);
                if (indexStatus === "?" && workStatus === "?") {
                    unstaged.push({ status: "A", path: path, _selected: false });
                } else {
                    if (indexStatus !== " " && indexStatus !== "?") {
                        staged.push({ status: indexStatus, path: path, _selected: false });
                    }
                    if (workStatus !== " " && workStatus !== "?") {
                        unstaged.push({ status: workStatus, path: path, _selected: false });
                    }
                }
            });
            this.stagedFiles = staged;
            this.unstagedFiles = unstaged;
            this.changedFiles = staged.concat(unstaged);
        },
        stageAll: function() {
            var self = this;
            this.loading = true;
            runGitSync("add -A", this.currentRepo);
            this.loading = false;
            this.showToast("已暂存所有文件");
            this.refreshStatus();
        },
        unstageAll: function() {
            var self = this;
            this.loading = true;
            runGitSync("reset HEAD", this.currentRepo);
            this.loading = false;
            this.showToast("已取消暂存所有文件");
            this.refreshStatus();
        },
        stageSelected: function() {
            var self = this;
            var files = this.selectedUnstaged.map(function(f) { return f.path; });
            this.loading = true;
            files.forEach(function(f) {
                runGitSync("add \"" + f + "\"", self.currentRepo);
            });
            this.loading = false;
            this.showToast("已暂存 " + files.length + " 个文件");
            this.refreshStatus();
        },
        unstageSelected: function() {
            var self = this;
            var files = this.selectedStaged.map(function(f) { return f.path; });
            this.loading = true;
            files.forEach(function(f) {
                runGitSync("reset HEAD \"" + f + "\"", self.currentRepo);
            });
            this.loading = false;
            this.showToast("已取消暂存 " + files.length + " 个文件");
            this.refreshStatus();
        },
        discardSelected: function() {
            var self = this;
            var files = this.selectedUnstaged.map(function(f) { return f.path; });
            if (!confirm("确定撤销 " + files.length + " 个文件的更改吗？")) return;
            this.loading = true;
            files.forEach(function(f) {
                runGitSync("checkout -- \"" + f + "\"", self.currentRepo);
            });
            this.loading = false;
            this.showToast("已撤销 " + files.length + " 个文件");
            this.refreshStatus();
        },
        toggleFileSelect: function(file, event) {
            this.$set(file, '_selected', !file._selected);
        },
        toggleAllStaged: function(event) {
            var target = event.target.checked;
            var self = this;
            this.stagedFiles.forEach(function(f) {
                self.$set(f, '_selected', target);
            });
        },
        toggleAllUnstaged: function(event) {
            var target = event.target.checked;
            var self = this;
            this.unstagedFiles.forEach(function(f) {
                self.$set(f, '_selected', target);
            });
        },
        showFileDiff: function(file) {
            var self = this;
            var args;
            if (file.status === "A") {
                args = "diff --cached -- \"" + file.path + "\"";
            } else {
                args = "diff -- \"" + file.path + "\"";
            }
            var output = runGitSync(args, this.currentRepo);
            if (output.trim()) {
                self.diffContent = output;
                self.diffFileName = file.path;
            } else {
                self.diffContent = "(无差异 - 可能是新文件)";
                self.diffFileName = file.path;
            }
        },
        gitCommit: function() {
            var self = this;
            var msg = this.commitMessage.trim();
            if (!msg || this.stagedFiles.length === 0) return;
            this.loading = true;
            var result = runGitSync("commit -m \"" + msg.replace(/"/g, '\\"') + "\"", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git commit -m \"" + msg + "\"\n" + result);
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("提交成功");
                this.commitMessage = "";
                this.refreshAll();
            } else {
                this.showToast("提交失败: " + result.split("\n")[0]);
            }
        },
        gitCommitPush: function() {
            var self = this;
            var msg = this.commitMessage.trim();
            if (!msg || this.stagedFiles.length === 0) return;
            this.loading = true;
            var result = runGitSync("commit -m \"" + msg.replace(/"/g, '\\"') + "\"", this.currentRepo);
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                var pushResult = runGitSync("push", this.currentRepo);
                this.logToConsole("> git commit -m \"" + msg + "\"\n" + result + "\n> git push\n" + pushResult);
                if (pushResult.indexOf("error") === -1 && pushResult.indexOf("fatal") === -1) {
                    this.showToast("提交并推送成功");
                    this.commitMessage = "";
                } else {
                    this.showToast("提交成功但推送失败: " + pushResult.split("\n")[0]);
                }
                this.refreshAll();
            } else {
                this.logToConsole("> git commit -m \"" + msg + "\"\n" + result);
                this.showToast("提交失败: " + result.split("\n")[0]);
            }
            this.loading = false;
        },
        gitFetch: function() {
            var self = this;
            if (!this.currentRepo) return;
            this.loading = true;
            var result = runGitSync("fetch", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git fetch\n" + result);
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("Fetch 完成");
                this.loadBranches();
            } else {
                this.showToast("Fetch 失败: " + result.split("\n")[0]);
            }
        },
        gitPull: function() {
            var self = this;
            if (!this.currentRepo) return;
            this.loading = true;
            var result = runGitSync("pull", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git pull\n" + result);
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("Pull 完成");
                this.refreshAll();
            } else {
                this.showToast("Pull 失败: " + result.split("\n")[0]);
            }
        },
        gitPush: function() {
            var self = this;
            if (!this.currentRepo) return;
            this.loading = true;
            var result = runGitSync("push", this.currentRepo);
            this.loading = false;
            this.logToConsole("> git push\n" + result);
            if (result.indexOf("error") === -1 && result.indexOf("fatal") === -1) {
                this.showToast("Push 成功");
            } else {
                this.showToast("Push 失败: " + result.split("\n")[0]);
            }
        },
        loadLog: function() {
            if (!this.currentRepo) return;
            var format = "%H|%h|%an|%ae|%ai|%s";
            var output = runGitSync("log -100 --pretty=format:\"" + format + "\" --date=format:\"%Y-%m-%d %H:%M\"", this.currentRepo);
            var lines = output.split("\n").filter(function(l) { return l.trim(); });
            var self = this;
            var commits = lines.map(function(line) {
                var parts = line.split("|");
                return {
                    hash: parts[0] || "",
                    shortHash: parts[1] || "",
                    author: parts[2] || "",
                    email: parts[3] || "",
                    date: parts[4] || "",
                    message: parts[5] || "",
                    branches: []
                };
            });
            this.commits = commits;
            this.filteredCommits = commits;
            this.logSearch = "";
        },
        filterLog: function() {
            var search = this.logSearch.toLowerCase().trim();
            if (!search) {
                this.filteredCommits = this.commits;
                return;
            }
            this.filteredCommits = this.commits.filter(function(c) {
                return c.message.toLowerCase().indexOf(search) > -1 ||
                       c.author.toLowerCase().indexOf(search) > -1 ||
                       c.hash.toLowerCase().indexOf(search) > -1 ||
                       c.shortHash.toLowerCase().indexOf(search) > -1;
            });
        },
        selectCommit: function(commit) {
            this.selectedCommit = commit;
            this.commitFilesExpanded = true;
            this.loadCommitFiles(commit);
        },
        loadCommitFiles: function(commit) {
            if (!this.currentRepo || !commit) return;
            var output = runGitSync("diff-tree --no-commit-id -r --name-status " + commit.hash, this.currentRepo);
            var lines = output.split("\n").filter(function(l) { return l.trim(); });
            this.selectedCommitFiles = lines.map(function(line) {
                var parts = line.split("\t");
                return { type: parts[0], path: parts[1] };
            });
        },
        showCommitDiff: function(file) {
            if (!this.selectedCommit) return;
            var output = runGitSync("diff " + this.selectedCommit.hash + "~1 " + this.selectedCommit.hash + " -- \"" + file.path + "\"", this.currentRepo);
            if (output.trim()) {
                this.diffContent = output;
                this.diffFileName = file.path;
            } else {
                this.diffContent = "(无差异)";
                this.diffFileName = file.path;
            }
        },
        executeCmd: function() {
            var cmd = this.consoleCmd.trim();
            if (!cmd) return;
            this.consoleOutput.push("> git " + cmd);
            this.consoleCmd = "";
            if (!this.currentRepo) {
                this.consoleOutput.push("error: 请先选择仓库");
                return;
            }
            var result = runGitSync(cmd, this.currentRepo);
            var self = this;
            result.split('\n').forEach(function(line) {
                self.consoleOutput.push(line);
            });
            this.consoleOutput.push("");
            this.$nextTick(function() {
                var el = document.querySelector('.console-output');
                if (el) el.scrollTop = el.scrollHeight;
            });
        },
        showToast: function(msg) {
            var self = this;
            this.toastMessage = msg;
            this.toastVisible = true;
            if (this.toastTimer) clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(function() { self.toastVisible = false; }, 3000);
        }
    }
});
