import * as vscode from 'vscode';
import { Disposable } from './clipboard';

export interface FileManagerService {
    createImageFile(imageData: Buffer, format: string): Promise<ImageFile>;
    ensureDirectoryExists(): Promise<void>;
    getRemotepixPath(): Promise<string>;
}

export interface ImageFile extends Disposable {
    getUri(): vscode.Uri;
    getPath(): string;
    exists(): Promise<boolean>;
}

class ManagedImageFile implements ImageFile {
    constructor(
        private readonly uri: vscode.Uri,
        private readonly shouldCleanup: boolean = false
    ) {}

    getUri(): vscode.Uri {
        return this.uri;
    }

    getPath(): string {
        return this.uri.fsPath;
    }

    async exists(): Promise<boolean> {
        try {
            await vscode.workspace.fs.stat(this.uri);
            return true;
        } catch {
            return false;
        }
    }

    dispose(): void {
        if (this.shouldCleanup) {
            // Best effort cleanup - don't await or throw
            Promise.resolve(vscode.workspace.fs.delete(this.uri)).catch(() => {
                // Ignore cleanup errors
            });
        }
    }
}

export class WorkspaceFileManager implements FileManagerService {
    private cachedRemotepixDir: vscode.Uri | null = null;

    async createImageFile(imageData: Buffer, format: string): Promise<ImageFile> {
        await this.ensureDirectoryExists();

        const remotepixDir = await this.getRemotepixDirectory();
        const fileName = this.generateFileName(format);
        const imageUri = vscode.Uri.joinPath(remotepixDir, fileName);

        await vscode.workspace.fs.writeFile(imageUri, imageData);

        return new ManagedImageFile(imageUri);
    }

    async ensureDirectoryExists(): Promise<void> {
        const remotepixDir = await this.getRemotepixDirectory();

        try {
            await vscode.workspace.fs.createDirectory(remotepixDir);
        } catch {
            // Directory might already exist, ignore error
        }
    }

    async getRemotepixPath(): Promise<string> {
        const remotepixDir = await this.getRemotepixDirectory();
        return remotepixDir.fsPath;
    }

    private async getRemotepixDirectory(): Promise<vscode.Uri> {
        if (!this.cachedRemotepixDir) {
            const homeDir = await this.getRemoteHomeDirectory();
            this.cachedRemotepixDir = vscode.Uri.joinPath(homeDir, 'remotepix');
        }
        return this.cachedRemotepixDir;
    }

    private async getRemoteHomeDirectory(): Promise<vscode.Uri> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder available. Please open a folder in VS Code.');
        }

        const workspaceUri = workspaceFolder.uri;
        const workspacePath = workspaceUri.path;

        // Extract home directory from the workspace path
        // Common patterns: /home/username/..., /Users/username/..., /root/...
        let homePath: string;

        if (workspacePath.startsWith('/home/')) {
            // Linux: /home/username/... -> /home/username
            const parts = workspacePath.split('/');
            if (parts.length >= 3) {
                homePath = `/${parts[1]}/${parts[2]}`;
            } else {
                homePath = workspacePath;
            }
        } else if (workspacePath.startsWith('/Users/')) {
            // macOS: /Users/username/... -> /Users/username
            const parts = workspacePath.split('/');
            if (parts.length >= 3) {
                homePath = `/${parts[1]}/${parts[2]}`;
            } else {
                homePath = workspacePath;
            }
        } else if (workspacePath.startsWith('/root')) {
            // Root user
            homePath = '/root';
        } else if (workspacePath.match(/^\/[a-zA-Z]:\//)) {
            // Windows remote: /C:/Users/username/... -> /C:/Users/username
            const match = workspacePath.match(/^(\/[a-zA-Z]:\/Users\/[^\/]+)/);
            if (match) {
                homePath = match[1];
            } else {
                // Fallback: use workspace folder
                homePath = workspacePath;
            }
        } else {
            // Unknown pattern - try to use first two segments after root
            // This handles cases like /u/username or custom paths
            const parts = workspacePath.split('/').filter(p => p);
            if (parts.length >= 2) {
                homePath = `/${parts[0]}/${parts[1]}`;
            } else {
                // Last resort: use workspace folder itself
                homePath = workspacePath;
            }
        }

        // Create URI with the same scheme and authority as workspace
        return workspaceUri.with({ path: homePath });
    }

    private generateFileName(format: string): string {
        const timestamp = Date.now();
        return `image_${timestamp}.${format}`;
    }
}

export function createFileManager(): FileManagerService {
    return new WorkspaceFileManager();
}
