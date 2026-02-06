import * as vscode from 'vscode';

export interface ExtensionConfig {
    keybinding: KeybindingOption;
    timeouts: TimeoutConfig;
}

export interface TimeoutConfig {
    clipboard: number;
    upload: number;
}

export type KeybindingOption = 'ctrl+alt+v' | 'ctrl+shift+v' | 'alt+v' | 'ctrl+v' | 'f12';

export interface ConfigurationService {
    getConfig(): ExtensionConfig;
    getKeybinding(): KeybindingOption;
    getTimeouts(): TimeoutConfig;
    onConfigurationChanged(callback: (config: ExtensionConfig) => void): vscode.Disposable;
}

class VSCodeConfigurationService implements ConfigurationService {
    private readonly sectionName = 'remotepix';
    private readonly defaults: ExtensionConfig = {
        keybinding: 'ctrl+v',
        timeouts: {
            clipboard: 10000,
            upload: 30000
        }
    };

    getConfig(): ExtensionConfig {
        const config = vscode.workspace.getConfiguration(this.sectionName);

        return {
            keybinding: this.validateKeybinding(config.get('keybinding')),
            timeouts: this.validateTimeouts(config.get('timeouts'))
        };
    }

    getKeybinding(): KeybindingOption {
        const config = vscode.workspace.getConfiguration(this.sectionName);
        return this.validateKeybinding(config.get('keybinding'));
    }

    getTimeouts(): TimeoutConfig {
        const config = vscode.workspace.getConfiguration(this.sectionName);
        return this.validateTimeouts(config.get('timeouts'));
    }

    onConfigurationChanged(callback: (config: ExtensionConfig) => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(this.sectionName)) {
                callback(this.getConfig());
            }
        });
    }

    private validateKeybinding(value: any): KeybindingOption {
        const validOptions: KeybindingOption[] = ['ctrl+alt+v', 'ctrl+shift+v', 'alt+v', 'ctrl+v', 'f12'];

        if (typeof value === 'string' && validOptions.includes(value as KeybindingOption)) {
            return value as KeybindingOption;
        }

        return this.defaults.keybinding;
    }

    private validateTimeouts(value: any): TimeoutConfig {
        if (typeof value === 'object' && value !== null) {
            return {
                clipboard: this.validateTimeout(value.clipboard, this.defaults.timeouts.clipboard),
                upload: this.validateTimeout(value.upload, this.defaults.timeouts.upload)
            };
        }

        return this.defaults.timeouts;
    }

    private validateTimeout(value: any, defaultValue: number): number {
        if (typeof value === 'number' && value >= 1000 && value <= 60000) {
            return Math.floor(value);
        }

        return defaultValue;
    }
}

// Configuration validation utilities
export class ConfigValidator {
    static isValidKeybinding(value: string): value is KeybindingOption {
        const validOptions: KeybindingOption[] = ['ctrl+alt+v', 'ctrl+shift+v', 'alt+v', 'ctrl+v', 'f12'];
        return validOptions.includes(value as KeybindingOption);
    }

    static isValidTimeout(value: number): boolean {
        return Number.isInteger(value) && value >= 1000 && value <= 60000;
    }
}

// Type guards for runtime validation
export namespace TypeGuards {
    export function isExtensionConfig(obj: any): obj is ExtensionConfig {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            ConfigValidator.isValidKeybinding(obj.keybinding) &&
            isTimeoutConfig(obj.timeouts)
        );
    }

    export function isTimeoutConfig(obj: any): obj is TimeoutConfig {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            ConfigValidator.isValidTimeout(obj.clipboard) &&
            ConfigValidator.isValidTimeout(obj.upload)
        );
    }
}

export function createConfigurationService(): ConfigurationService {
    return new VSCodeConfigurationService();
}
