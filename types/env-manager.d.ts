/**
 * 环境变量管理应用类型定义
 * 用于编辑器智能提示 (VS Code / WebStorm)
 * 运行时无效，仅作为开发参考
 */

interface EnvItem {
    name: string;
    value: string;
    selected: boolean;
    isUser: boolean;
}

interface NewVar {
    name: string;
    value: string;
}

interface EnvManagerData {
    envList: EnvItem[];
    editingIndex: number;
    showDeleteModal: boolean;
    showAddModal: boolean;
    newVar: NewVar;
    originalList: EnvItem[];
    toastVisible: boolean;
    toastMessage: string;
    toastTimer: number | null;
    saving: boolean;
}

interface EnvManagerComputed {
    selectedCount: number;
    selectedItems: string[];
    allSelected: boolean;
    hasChanges: boolean;
}

interface EnvManagerMethods {
    loadEnvVars(): void;
    startEdit(index: number): void;
    finishEdit(index: number): void;
    cancelEdit(): void;
    saveChanges(): void;
    confirmDelete(): void;
    deleteSelected(): void;
    addVariable(): void;
    toggleSelectAll(): void;
    refreshList(): void;
    showToast(msg: string, duration?: number): void;
}
