import * as vscode from 'vscode';
import { ClipboardService, ImageData } from '../services/clipboard';
import { FileManagerService, ImageFile } from '../services/fileManager';
import { ProgressService, ProgressSteps } from '../services/progress';
import { ConfigurationService } from '../services/configuration';
import { Result, success, failure, ExtensionResult, ClipboardError, FileSystemError } from '../common/result';

export type InsertDestination = 'editor' | 'terminal';

export interface UploadImageCommand {
    execute(destination: InsertDestination): Promise<ExtensionResult<string>>;
}

export interface CommandDependencies {
    clipboard: ClipboardService;
    fileManager: FileManagerService;
    progress: ProgressService;
    config: ConfigurationService;
}

// Result type for clipboard check - distinguishes between "no image" and "error"
type ClipboardCheckResult =
    | { type: 'image'; data: ImageData }
    | { type: 'no_image' }
    | { type: 'error'; error: ClipboardError };

class OptimizedImageUploadCommand implements UploadImageCommand {
    constructor(private readonly deps: CommandDependencies) {}

    async execute(destination: InsertDestination): Promise<ExtensionResult<string>> {
        // Validate remote connection first
        const remoteCheck = this.validateRemoteConnection();
        if (Result.isFailure(remoteCheck)) {
            return remoteCheck;
        }

        // Step 1: Check clipboard - this determines whether to proceed or pass through
        const clipboardCheck = await this.checkClipboardWithPassthrough();

        if (clipboardCheck.type === 'no_image') {
            // No image on clipboard - pass through to normal paste for terminal
            if (destination === 'terminal') {
                await vscode.commands.executeCommand('workbench.action.terminal.paste');
            }
            // For editor, the user expects paste behavior, but we don't intercept Ctrl+V there
            // so this case shouldn't happen in normal usage
            return success('passthrough');
        }

        if (clipboardCheck.type === 'error') {
            vscode.window.showWarningMessage(clipboardCheck.error.message);
            return failure(clipboardCheck.error);
        }

        // We have an image - proceed with upload
        const imageData = clipboardCheck.data;

        // Step 2: Upload and insert
        return await this.deps.progress.withProgress(
            `Uploading image to server...`,
            (reporter) => this.uploadAndInsert(imageData, destination, reporter)
        );
    }

    private validateRemoteConnection(): ExtensionResult<void> {
        if (!vscode.env.remoteName) {
            return failure(new ClipboardError(
                'No remote connection detected. Please connect to a server using Remote-SSH to upload images.',
                { remoteName: vscode.env.remoteName }
            ));
        }
        return success(undefined);
    }

    private async checkClipboardWithPassthrough(): Promise<ClipboardCheckResult> {
        try {
            // First check if there's an image without fully retrieving it
            const hasImage = await this.deps.clipboard.hasImage();

            if (!hasImage) {
                return { type: 'no_image' };
            }

            // There is an image - get it
            const imageData = await this.deps.clipboard.getImage();

            if (!imageData) {
                return { type: 'no_image' };
            }

            return { type: 'image', data: imageData };
        } catch (error) {
            return {
                type: 'error',
                error: new ClipboardError('Failed to access clipboard', { originalError: error })
            };
        }
    }

    private async uploadAndInsert(
        imageData: ImageData,
        destination: InsertDestination,
        reporter: any
    ): Promise<ExtensionResult<string>> {
        try {
            reporter.report(ProgressSteps.preparing());

            reporter.report(ProgressSteps.uploading());

            // Create image file
            const imageFile = await this.deps.fileManager.createImageFile(
                imageData.buffer,
                imageData.format
            );

            reporter.report(ProgressSteps.inserting());

            const imagePath = imageFile.getPath();

            // Insert path into editor/terminal
            const insertResult = await this.insertImagePath(imagePath, destination);
            if (Result.isFailure(insertResult)) {
                imageFile.dispose();
                return insertResult;
            }

            // Update clipboard: add text path while keeping image (best effort)
            try {
                await this.deps.clipboard.setTextWithImage(imagePath, imageData.buffer);
            } catch (error) {
                // Clipboard update is best effort - don't fail the upload
                console.warn('Failed to update clipboard with path:', error);
            }

            // Show success message
            vscode.window.showInformationMessage(`Image saved: ${imagePath}`);

            return success(imagePath);

        } catch (error) {
            return failure(new FileSystemError(
                'Failed to upload image',
                { originalError: error, destination }
            ));
        }
    }

    private async insertImagePath(path: string, destination: InsertDestination): Promise<ExtensionResult<void>> {
        try {
            if (destination === 'editor') {
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    return failure(new FileSystemError('No active editor available'));
                }

                const position = activeEditor.selection.active;
                await activeEditor.edit(editBuilder => {
                    editBuilder.insert(position, path);
                });
            } else if (destination === 'terminal') {
                const activeTerminal = vscode.window.activeTerminal;
                if (!activeTerminal) {
                    return failure(new FileSystemError('No active terminal available'));
                }

                activeTerminal.sendText(path, false);
            }

            return success(undefined);
        } catch (error) {
            return failure(new FileSystemError(
                `Failed to insert image path into ${destination}`,
                { originalError: error, destination, path }
            ));
        }
    }
}

// Factory function
export function createUploadImageCommand(deps: CommandDependencies): UploadImageCommand {
    return new OptimizedImageUploadCommand(deps);
}

// Command handler for VS Code commands
export async function handleUploadCommand(
    destination: InsertDestination,
    deps: CommandDependencies
): Promise<void> {
    const command = createUploadImageCommand(deps);
    const result = await command.execute(destination);

    if (Result.isFailure(result)) {
        vscode.window.showErrorMessage(`Upload error: ${result.error.message}`);
    }
}
