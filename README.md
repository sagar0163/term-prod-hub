# 📦 Terminal Productivity Hub (tph)

A unified CLI productivity tool that combines essential terminal utilities into one powerful command-line application.

## ✨ Features

- **📋 Clipboard Manager** - Track clipboard history, quick copy/paste
- **📝 Notes** - Fast note-taking with search and organization
- **🔍 Web Search** - Search the web directly from terminal
- **💻 System Info** - Quick system information display
- **📱 QR Generator** - Generate QR codes from text/URLs
- **⚡ Shortcuts** - Create custom command aliases

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/term-prod-hub.git
cd term-prod-hub

# Install dependencies
npm install

# Link the CLI (optional)
npm link
```

## 📖 Usage

### Clipboard Manager
```bash
tph clipboard copy "text to copy"    # Copy text to clipboard
tph clipboard list                   # View clipboard history
tph clipboard clear                  # Clear history
tph clipboard paste                  # Show current clipboard
```

### Notes
```bash
tph notes add "My first note"        # Add a note
tph notes list                       # List all notes
tph notes search "keyword"           # Search notes
tph notes delete 1234567890          # Delete by ID
tph notes clear                      # Clear all notes
```

### Web Search
```bash
tph search "Node.js tutorials"       # Search the web
```

### System Info
```bash
tph sys                              # Full system info
tph sys basic                        # Basic info only
```

### QR Code
```bash
tph qr "https://example.com"        # Generate QR code
tph qr "text" output.png             # Save as file
```

### Shortcuts
```bash
tph shortcuts add g git              # Create shortcut
tph shortcuts list                   # List shortcuts
tph shortcuts run g                  # Run shortcut
tph shortcuts delete g               # Delete shortcut
```

## 🎯 Why Use tph?

- **Single tool** for multiple CLI utilities
- **Persistent data** - notes and history saved locally
- **Fast workflow** - minimal keystrokes
- **Extensible** - easy to add new commands

## 📝 License

MIT
