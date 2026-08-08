/**
 * Git Manager 应用类型定义
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

interface GitFileItem {
    status: string;
    path: string;
    _selected: boolean;
}

interface CommitFileItem {
    type: string;
    path: string;
}

interface CommitItem {
    hash: string;
    shortHash: string;
    author: string;
    email: string;
    date: string;
    message: string;
    branches: string[];
}

interface GitManagerData {
    currentRepo: string;
    recentRepos: string[];
    showRepoMenu: boolean;
    showBranchMenu: boolean;
    activeTab: string;
    currentBranch: string;
    localBranches: string[];
    remoteBranches: string[];
    changedFiles: GitFileItem[];
    stagedFiles: GitFileItem[];
    unstagedFiles: GitFileItem[];
    commitMessage: string;
    stagedExpanded: boolean;
    unstagedExpanded: boolean;
    diffContent: string;
    diffFileName: string;
    commits: CommitItem[];
    filteredCommits: CommitItem[];
    logSearch: string;
    selectedCommit: CommitItem | null;
    selectedCommitFiles: CommitFileItem[];
    commitFilesExpanded: boolean;
    consoleOutput: string[];
    consoleCmd: string;
    loading: boolean;
    toastVisible: boolean;
    toastMessage: string;
    toastTimer: number | null;
}

interface GitManagerComputed {
    selectedUnstaged: GitFileItem[];
    selectedStaged: GitFileItem[];
}

interface GitManagerMethods {
    logToConsole(text: string): void;
    loadRecentRepos(): void;
    saveRecentRepo(repo: string): void;
    browseRepo(): void;
    openRepo(repo: string): void;
    refreshAll(): void;
    loadBranches(): void;
    checkoutBranch(branch: string): void;
    checkoutRemoteBranch(branch: string): void;
    createBranch(): void;
    refreshStatus(): void;
    stageAll(): void;
    unstageAll(): void;
    stageSelected(): void;
    unstageSelected(): void;
    discardSelected(): void;
    toggleFileSelect(file: GitFileItem, event: Event): void;
    toggleAllStaged(event: Event): void;
    toggleAllUnstaged(event: Event): void;
    showFileDiff(file: GitFileItem): void;
    gitCommit(): void;
    gitCommitPush(): void;
    gitFetch(): void;
    gitPull(): void;
    gitPush(): void;
    loadLog(): void;
    filterLog(): void;
    selectCommit(commit: CommitItem): void;
    loadCommitFiles(commit: CommitItem): void;
    showCommitDiff(file: CommitFileItem): void;
    executeCmd(): void;
    showToast(msg: string, duration?: number): void;
}
