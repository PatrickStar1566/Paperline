# Paperline

Paperline is a standalone Electron Markdown editor for macOS and Windows. It loads its interface from the application bundle and does not need a local web server.

## Development

```bash
npm install
npm start
```

Windows PowerShell 如果提示禁止运行 `npm.ps1`，请改用对应的 `.cmd` 入口：

```powershell
npm.cmd install
npm.cmd start
```

也可以只对当前 PowerShell 窗口放开脚本限制：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

`npm start` 会直接启动开发版窗口，适合快速验收界面，不需要先生成安装包。需要交给其他人测试时，可生成 Windows 安装包：

```bash
npm.cmd run dist:win
```

生成的安装程序位于 `release` 目录，文件名通常包含 `Setup`。双击安装后即可运行。

如需临时生成免安装版本，仍可使用 `npm.cmd run dist:win-portable`。

## Build installers

```bash
npm run dist:win
npm run dist:mac
```

Build each target on its native operating system. The Windows build creates an NSIS installer; the macOS build creates a DMG and ZIP archive. Both builds register `.md` and `.markdown` files with Paperline.
