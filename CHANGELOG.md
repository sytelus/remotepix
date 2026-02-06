# Changelog

All notable changes to the "Remotepix" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-10

### Changed
- **Renamed project** from "Claudeboard" to "Remotepix"
- **Updated documentation** to reference AI coding agents generically (Claude Code, Cursor, Copilot, Aider, etc.)
- **Changed storage location** from `.claude/claude-code-chat-images/` to `~/remotepix/`
- **Removed auto-cleanup** - images are now kept indefinitely
- **Changed default keybinding** to `Ctrl+V` for terminal (intercepts only when image on clipboard)
- **Clipboard preservation** - keeps image on clipboard while adding text path

### Added
- Smart paste detection - normal `Ctrl+V` behavior when no image is on clipboard
- Multi-format clipboard support (image AND text path simultaneously)

### Removed
- Retention days configuration (no longer needed)
- Automatic file cleanup feature

## [1.0.1] - 2025-01-25

### Fixed
- **macOS clipboard detection**: Implemented robust multi-strategy clipboard access to resolve "No image found in clipboard" errors
- **Format compatibility**: Added support for multiple image formats (PNG, TIFF, JPEG) with automatic conversion
- **AppleScript integration**: Primary clipboard access method with native macOS format handling
- **Fallback mechanisms**: Enhanced pbpaste fallback with proper UTI (Uniform Type Identifier) support

### Technical Improvements
- Multi-strategy clipboard service architecture (AppleScript → pbpaste fallback)
- Automatic TIFF to PNG conversion using macOS sips command
- Comprehensive error handling with silent fallbacks
- Support for images from various macOS applications (Preview, browsers, chat apps, screenshots)

## [1.0.0] - 2025-01-24

### Added
- Initial release
- Cross-platform clipboard image upload (Windows, Linux, macOS)
- Remote-SSH server integration
- Configurable keyboard shortcuts
- Progress indicators and error handling

[2.0.0]: https://github.com/dkodr/remotepix/releases/tag/v2.0.0
[1.0.1]: https://github.com/dkodr/remotepix/releases/tag/v1.0.1
[1.0.0]: https://github.com/dkodr/remotepix/releases/tag/v1.0.0
