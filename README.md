# Remotepix

Share images with AI coding agents running on a remote server via Remote-SSH. Upload clipboard images instantly and get shareable file paths for seamless AI coding workflows.

## Features

- **Instant clipboard upload** - Press `Ctrl+V` in terminal to upload any image from clipboard
- **Cross-platform support** - Works on Windows, Linux, and macOS
- **Smart path insertion** - Automatically pastes file paths in editor or terminal
- **Remote-SSH integration** - Seamlessly works with VS Code Remote-SSH
- **Clipboard preservation** - Keeps image on clipboard while adding text path
- **Real-time progress** - Visual feedback during upload process
- **Secure by design** - Uses your existing SSH connections
- **Dual context** - Works in both code editors and integrated terminals

## Quick Start

### Step 1: Prerequisites
- Install VS Code Remote-SSH extension
- Connect to your remote server
- Open a workspace folder on the remote server

### Step 2: Upload Images
1. **Copy any image to clipboard** (screenshot, file copy, web image)
2. **Press `Ctrl+V`** in VS Code terminal (or `Ctrl+Alt+V` in editor)
3. **Watch the magic** - Image uploads instantly and path is pasted
4. **Done!** Your image is now accessible at the inserted file path

**AI Coding Tip**: The generated file paths can be directly shared with AI coding agents (Claude Code, Cursor, Copilot, Aider, etc.) for image analysis, making it perfect for discussing screenshots, diagrams, or visual debugging.

## How It Works

When you press `Ctrl+V` in the terminal with an image on your clipboard:
1. The extension detects the image in your clipboard
2. Saves the image to `~/remotepix/` on your remote server
3. Adds the file path to your clipboard (while keeping the original image)
4. Sends the path directly to the terminal

If there's no image on the clipboard, normal paste behavior works as expected.

## Upload Destination

### Remote Server Upload
- **Location**: `~/remotepix/` on the remote server
- **Secure**: Uses existing Remote-SSH connection, no additional authentication needed
- **Returns**: Full file path (e.g., `/home/user/remotepix/image_1234567890.png`)

## Configuration

Go to `File > Preferences > Settings` and search for "Remotepix":

### Available Settings:

#### Keybinding
Choose your preferred keyboard shortcut for terminal:
- `Ctrl+V` (default) - intercepts paste, passes through if no image
- `Ctrl+Alt+V`
- `Ctrl+Shift+V`
- `Alt+V`
- `F12`

**Note**: Editor always uses `Ctrl+Alt+V` to avoid conflicts with normal editing.

## Requirements

- **VS Code 1.74.0** or newer
- **VS Code Remote-SSH extension** (for remote server connections)
- **Active remote connection** to your development server
- **Workspace folder** opened on the remote server

### Platform Support
- **Windows** - Full clipboard support via PowerShell
- **Linux** - Clipboard support via `xclip` or `wl-clipboard`
- **macOS** - Clipboard support via `pbpaste` and AppleScript

### Platform-Specific Dependencies
- **Linux**: Install `xclip` (X11) or `wl-clipboard` (Wayland)
- **macOS**: Uses built-in tools (no additional setup)
- **Windows**: Uses built-in PowerShell (no additional setup)

## Supported Formats

- **PNG** (primary format)
- **TIFF** (auto-converted to PNG on macOS)
- **JPEG** (supported)

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+V` | Upload image from clipboard | Terminal |
| `Ctrl+Alt+V` | Upload image from clipboard | Editor |
| `Ctrl+V` | Normal paste (if no image) | Terminal |

**Note**: When there's no image on clipboard, `Ctrl+V` in terminal works normally for text pasting.

## Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Remotepix"
4. Click "Install"

### From .vsix file
1. Download the latest `.vsix` file from [Releases](https://github.com/dkodr/remotepix/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` and type "Extensions: Install from VSIX"
4. Select the downloaded `.vsix` file

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No remote connection detected" | Connect to remote server using Remote-SSH extension |
| "No workspace folder available" | Open a folder on the remote server |
| Image not detected | Make sure image is copied to clipboard (not just selected) |
| PowerShell error | Check if PowerShell is available and ExecutionPolicy allows execution |
| Upload timeout | Check Remote-SSH connection stability |
| Paste error | Make sure cursor is in text editor or terminal |
| File permission error | Check write permissions in home directory |

## File Organization

```
~/remotepix/
    ├── image_1234567890.png
    ├── image_1234567891.png
    └── ...
```

## Development

Want to contribute or build from source?

```bash
# Clone repository
git clone https://github.com/dkodr/remotepix.git
cd remotepix

# Install dependencies
npm install

# Development workflow
npm run compile     # Compile TypeScript
npm run watch      # Watch for changes
npm run package    # Create VSIX package

# Testing
code .             # Open in VS Code
# Press F5 to launch Extension Development Host
```

### Architecture
- **TypeScript** with strict mode for type safety
- **Service-based architecture** for maintainability
- **Cross-platform clipboard abstractions**
- **Result<T,E> pattern** for error handling

## Contributing

If you want to help with development:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](https://github.com/dkodr/remotepix/blob/HEAD/LICENSE) for details.

## Links

- [VS Code Remote-SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) - Required extension
- [VS Code Extensions](https://marketplace.visualstudio.com/vscode) - Marketplace
- [GitHub Issues](https://github.com/dkodr/remotepix/issues) - Report issues

---

**Made for AI coding agents and VS Code Remote Development users**
