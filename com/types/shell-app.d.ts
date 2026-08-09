/**
 * Shell.Application 类型定义
 */

declare namespace COMComponents {
    interface ShellApplication {
        BrowseForFolder(hwnd: number, title: string, options: number, rootFolder?: any): FolderItem;
        NameSpace(vFolder: any): Folder;
        Windows(): ShellWindows;
    }

    interface FolderItem {
        readonly Path: string;
        readonly Name: string;
        readonly Self: FolderItem;
        readonly Parent: any;
        readonly IsFolder: boolean;
        readonly IsFileSystem: boolean;
        readonly IsLink: boolean;
        readonly IsBrowsable: boolean;
        readonly GetLink: any;
        readonly GetFolder: any;
        readonly Verbs: FolderItemVerbs;
        readonly ModifyDate: Date;
        readonly Size: number;
        readonly Type: string;
        InvokeVerb(verb?: string): void;
    }

    interface FolderItemVerbs {
        readonly Count: number;
        Item(index: number): FolderItemVerb;
    }

    interface FolderItemVerb {
        readonly Name: string;
        DoIt(): void;
    }

    interface ShellWindows {
        readonly Count: number;
        Item(index: number): any;
    }

    function getShellApp(): ShellApplication;
    function browseForFolder(title?: string, root?: any): string | null;
}
