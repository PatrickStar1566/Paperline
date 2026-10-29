# Paperline

一款基于 Electron 的 Markdown 桌面阅读与编辑工具，采用简洁、舒适的界面，支持 Windows 和 macOS。

## 功能

- 打开、阅读和编辑 `.md`、`.markdown` 文件。
- 保存和另存为 Markdown 文档。
- 支持常用快捷键：
  - 打开：`Ctrl / Cmd + O`
  - 保存：`Ctrl / Cmd + S`
  - 另存为：`Ctrl / Cmd + Shift + S`
- 桌面独立运行，无需启动本地 Web 服务。
- 支持 Windows 安装包与 macOS 应用打包。

## 下载与安装

前往 [Releases](https://github.com/PatrickStar1566/Paperline/releases) 查看已发布版本。

- **Windows**：下载名称包含 `Setup` 的 `.exe` 文件，运行安装。
- **macOS**：下载 `.dmg` 文件，打开后安装应用。

如果 Releases 页面暂无安装包，可以按照下方步骤从源码运行。

## 从源码运行

需要安装 Node.js 和 npm。

```bash
git clone https://github.com/PatrickStar1566/Paperline.git
cd Paperline/Paperline
npm ci
npm start
```

Windows PowerShell 如果提示无法运行 `npm.ps1`，请将 `npm` 替换为 `npm.cmd`：

```powershell
npm.cmd ci
npm.cmd start
```

## 本地打包

在包含 `package.json` 的 `Paperline` 子目录中运行：

```bash
# Windows 安装包
npm run dist:win

# Windows 免安装版本
npm run dist:win-portable

# macOS 安装包
npm run dist:mac
```

请在对应操作系统上执行打包，生成文件位于该目录下的 `release/` 文件夹。

## 自动发布

项目使用 GitHub Actions 构建和发布安装包。

推送以 `v` 或 `V` 开头的版本标签，例如 `v1.0.0`，会触发自动构建。标签中的版本号必须与 `Paperline/package.json` 的 `version` 一致。

Windows 和 macOS 构建全部成功后，工作流会自动创建 GitHub Release 并上传安装包。

Windows 自动构建要求先配置代码签名凭据。完整配置及发布步骤请参阅 [开发与发布说明](Paperline/README.md)。

## 技术栈

- Electron
- JavaScript
- HTML / CSS
- electron-builder
- GitHub Actions

## 问题反馈

欢迎通过 [Issues](https://github.com/PatrickStar1566/Paperline/issues) 提交问题或建议。

反馈问题时，请尽量提供操作系统、应用版本、复现步骤和相关截图。
