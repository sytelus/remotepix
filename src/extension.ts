import * as vscode from 'vscode';
import { createClipboardService } from './services/clipboard';
import { createFileManager } from './services/fileManager';
import { createProgressService } from './services/progress';
import { createConfigurationService } from './services/configuration';
import { handleUploadCommand, CommandDependencies, InsertDestination } from './commands/uploadImage';

// Main extension entry point
export function activate(context: vscode.ExtensionContext): void {
    // Initialize services
    const clipboard = createClipboardService();
    const fileManager = createFileManager();
    const progress = createProgressService();
    const config = createConfigurationService();

    const dependencies: CommandDependencies = {
        clipboard,
        fileManager,
        progress,
        config
    };

    // Register commands
    const commands = [
        {
            id: 'remotepix.uploadFromClipboard.editor',
            destination: 'editor' as InsertDestination
        },
        {
            id: 'remotepix.uploadFromClipboard.terminal',
            destination: 'terminal' as InsertDestination
        }
    ];

    const disposables = commands.map(({ id, destination }) =>
        vscode.commands.registerCommand(id, () =>
            handleUploadCommand(destination, dependencies)
        )
    );

    // Register configuration change handler
    const configDisposable = config.onConfigurationChanged((newConfig) => {
        console.log('Remotepix configuration updated:', newConfig);
    });

    // Add all disposables to context
    context.subscriptions.push(...disposables, configDisposable);

    // Warm up clipboard service for better first-use experience
    clipboard.warmUp().catch(() => {
        // Silently fail - warming up is best effort
    });

    console.log('Remotepix extension activated');
}

export function deactivate(): void {
    console.log('Remotepix extension deactivated');
}
