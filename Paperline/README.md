# Paperline

Paperline is a standalone Electron Markdown editor for macOS and Windows. It loads its interface from the application bundle and does not need a local web server.

## Development

```bash
npm install
npm start
```

## Build installers

```bash
npm run dist:win
npm run dist:mac
```

Build each target on its native operating system. The Windows build creates an installer and portable executable; the macOS build creates a DMG and ZIP archive. Both builds register `.md` and `.markdown` files with Paperline.
