var w = 1024, h = 700;
window.resizeTo(w, h);
window.moveTo((screen.availWidth - w) / 2, (screen.availHeight - h) / 2);

var sleep = $Component.sleep;
var log = $Component.log.getLogger('GitManager');

// WScript 读取子进程输出时按系统 ANSI 代码页解码，git 默认输出 UTF-8，
// 需让 git 以系统代码页输出，否则中文会乱码。从注册表读取 ACP 并映射为 git 编码名。
var gitOutputEncoding = "gbk";
try {
    var acp = parseInt($COM.reg.read("HKLM\\SYSTEM\\CurrentControlSet\\Control\\Nls\\CodePage\\ACP"), 10);
    if (acp && acp > 0) {
        gitOutputEncoding = (acp === 65001) ? "utf-8" : "cp" + acp;
    }
} catch (e) {
    log.warn("读取系统代码页失败，使用默认 gbk: {}", e.message);
}

function runGitSync(args, cwd) {
    return $COM.cmd.runSync('git -c i18n.logOutputEncoding=' + gitOutputEncoding + ' ' + args, cwd);
}

new Vue({
    el: '#app',
    mixins: [$Component.ToastMixin, $Component.LoadingMixin],
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
        consoleCmd: ""
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
            log.info("currentRepo变成了{}", val)
            if (val) {
                this.refreshAll();
            }
        }
    },
    methods: {
        getDataPath: function() {
            return $COM.file.basePath().replace(/\\[^\\]+$/, "") + "\\data\\git-manager.json";
        },
        loadData: function() {
            var data = $COM.json.read(this.getDataPath()) || {};
            this.recentRepos = data.recentRepos || [];
            this.lastBrowsePath = data.lastBrowsePath || '';
        },
        saveData: function() {
            $COM.json.write(this.getDataPath(), {
                recentRepos: this.recentRepos,
                lastBrowsePath: this.lastBrowsePath
            });
        },
        loadRecentRepos: function() {
            this.loadData();
        },
        saveRecentRepo: function(repo) {
            var list = this.recentRepos.filter(function(r) { return r !== repo; });
            list.unshift(repo);
            if (list.length > 10) list = list.slice(0, 10);
            this.recentRepos = list;
            this.saveData();
        },
        browseRepo: function() {
            this.showRepoMenu = false;
            try {
                var rootPath = '';
                if (this.lastBrowsePath) {
                    var parent = this.lastBrowsePath.replace(/\\[^\\]+$/, '');
                    if (parent && $COM.file.folderExists(parent)) rootPath = parent;
                }
                var path = $COM.dialog.browseForFolder("选择Git仓库目录", rootPath);
                if (path) {
                    this.lastBrowsePath = path;
                    this.saveData();
                    log.info('选择目录: {}', path);
                    if ($COM.file.folderExists(path + "\\.git")) {
                        this.openRepo(path);
                    } else {
                        log.warn('不是Git仓库: {}', path);
                        this.showToast("所选目录不是Git仓库");
                    }
                }
            } catch(e) {
                log.debug('取消选择目录');
                this.showToast("取消选择");
            }
        },
        openRepo: function(repo) {
            if (!$COM.file.folderExists(repo + "\\.git")) {
                this.showToast("所选目录不是Git仓库");
                return;
            }
            this.showRepoMenu = false;
            this.currentRepo = repo;
            this.saveRecentRepo(repo);
            this.consoleOutput = [];
            log.info("打开仓库: {}", repo);
        },
        refreshAll: function() {
            var self = this;
            this.loading = true;
            this.showToast("正在加载仓库...");
            setTimeout(function() {
                self.loadBranches();
                setTimeout(function() {
                    self.refreshStatus();
                    setTimeout(function() {
                        self.loadLog();
                        self.loading = false;
                        self.showToast("仓库加载完成");
                    }, 50);
                }, 50);
            }, 50);
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
            log.info("> git checkout {}\n{}", branch, result);
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
            log.info("> git checkout -b {} {}\n{}", name, branch, result);
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
            log.info("> git checkout -b {}\n{}", name.trim(), result);
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
            log.info("> git commit -m \"{}\"\n{}", msg, result);
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
                log.info("> git commit -m \"{}\"\n{}\n> git push\n{}", msg, result, pushResult);
                if (pushResult.indexOf("error") === -1 && pushResult.indexOf("fatal") === -1) {
                    this.showToast("提交并推送成功");
                    this.commitMessage = "";
                } else {
                    this.showToast("提交成功但推送失败: " + pushResult.split("\n")[0]);
                }
                this.refreshAll();
            } else {
                log.warn("> git commit -m \"{}\"\n{}", msg, result);
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
            log.info("> git fetch\n{}", result);
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
            log.info("> git pull\n{}", result);
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
            log.info("> git push\n{}", result);
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
        }
    }
});
