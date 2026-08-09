/**
 * Scripting.FileSystemObject 类型定义
 */

declare namespace COMComponents {
    interface FileSystemObject {
        FolderExists(path: string): boolean;
        FileExists(path: string): boolean;
        DriveExists(path: string): boolean;
        GetFolder(path: string): Folder;
        GetFile(path: string): File;
        GetParentFolderName(path: string): string;
        GetFileName(path: string): string;
        GetBaseName(path: string): string;
        GetExtensionName(path: string): string;
        GetTempName(): string;
        CreateFolder(path: string): Folder;
        CreateTextFile(filename: string, overwrite?: boolean, unicode?: boolean): TextStream;
        DeleteFolder(path: string, force?: boolean): void;
        DeleteFile(path: string, force?: boolean): void;
        CopyFile(source: string, destination: string, overwrite?: boolean): void;
        CopyFolder(source: string, destination: string, overwrite?: boolean): void;
        MoveFile(source: string, destination: string): void;
        MoveFolder(source: string, destination: string): void;
        OpenTextFile(filename: string, mode?: number, create?: boolean, format?: number): TextStream;
        Drives: DrivesCollection;
        GetAbsolutePathName(path: string): string;
        GetDriveName(path: string): string;
        BuildPath(base: string, name: string): string;
    }

    interface Folder {
        readonly Path: string;
        readonly Name: string;
        readonly ShortPath: string;
        readonly ShortName: string;
        readonly Drive: string;
        readonly ParentFolder: string;
        readonly Attributes: number;
        readonly DateCreated: Date;
        readonly DateLastAccessed: Date;
        readonly DateLastModified: Date;
        readonly Size: number;
        readonly Type: string;
        readonly Files: FilesCollection;
        readonly SubFolders: FoldersCollection;
        readonly IsRootFolder: boolean;
        Copy(destination: string, overwrite?: boolean): void;
        Delete(force?: boolean): void;
        Move(destination: string): void;
    }

    interface File {
        readonly Path: string;
        readonly Name: string;
        readonly ShortPath: string;
        readonly ShortName: string;
        readonly Drive: string;
        readonly ParentFolder: string;
        readonly Attributes: number;
        readonly DateCreated: Date;
        readonly DateLastAccessed: Date;
        readonly DateLastModified: Date;
        readonly Size: number;
        readonly Type: string;
        Copy(destination: string, overwrite?: boolean): void;
        Delete(force?: boolean): void;
        Move(destination: string): void;
        OpenAsTextStream(mode?: number, format?: number): TextStream;
    }

    interface TextStream {
        Read(chars: number): string;
        ReadAll(): string;
        ReadLine(): string;
        Write(text: string): void;
        WriteLine(text: string): void;
        WriteBlankLines(lines: number): void;
        Skip(chars: number): void;
        SkipLine(): void;
        Close(): void;
        readonly AtEndOfStream: boolean;
        readonly AtEndOfLine: boolean;
        readonly Column: number;
        readonly Line: number;
    }

    interface DrivesCollection {
        readonly Count: number;
        Item(key: string): Drive;
    }

    interface FilesCollection {
        readonly Count: number;
        Item(key: string): File;
    }

    interface FoldersCollection {
        readonly Count: number;
        Item(key: string): Folder;
    }

    interface Drive {
        readonly Path: string;
        readonly DriveLetter: string;
        readonly ShareName: string;
        readonly DriveType: number;
        readonly RootFolder: string;
        readonly AvailableSpace: number;
        readonly FreeSpace: number;
        readonly TotalSize: number;
        readonly VolumeName: string;
        readonly FileSystem: string;
        readonly IsReady: boolean;
        readonly SerialNumber: number;
    }

    function getFSO(): FileSystemObject;
    function folderExists(path: string): boolean;
    function fileExists(path: string): boolean;
    function createFolder(path: string): string;
    function getParentFolder(path: string): string;
    function getBasePath(): string;
    function openTextFile(path: string, mode?: number, create?: boolean): TextStream;
}
