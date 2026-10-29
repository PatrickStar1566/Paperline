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

## GitHub 自动发布与 Windows 代码签名

工作流位于仓库根目录 `.github/workflows/build.yml`。推送 `v*` 或 `V*` 标签会构建 Windows x64 安装包和 macOS DMG，全部成功后自动创建 GitHub Release 并上传附件。Actions 页面也可以手动构建，但手动运行不会发布 Release。macOS 包目前未签名、未公证。

### 标签是什么意思

`v*` 是标签名称的匹配模式：`*` 表示匹配后续字符。例如 `v1.0.0`、`v1.0.1` 都能触发。它不是要输入的实际标签名称，也不代表 Git 分支。工作流同时支持大写 `V`，但建议统一使用小写 `v`。

为了避免版本混淆，标签必须严格等于 `v` 或 `V` 加 `package.json` 的 `version`，例如版本 `1.0.0` 对应 `v1.0.0`。标签不能重复用于不同版本。

### 先准备 Windows 签名

目前还没有配置实际证书。Windows 构建要求签名凭据，缺失时会失败，也不会创建本次 Release。普通本地打包命令不受此限制。

对外分发需要受 Windows 信任的代码签名证书或云签名服务。自签名证书不能替代公信证书消除用户端信任提示。签名验证发布者身份和文件完整性，但不保证 SmartScreen 信誉提示立即消失。

购买前先确认供应商支持 GitHub Actions 的无人值守签名。许多新签发的公信证书要求硬件或云端保存私钥，不能导出成 PFX；本工作流的证书导入方式不适用于这类产品。可以评估 Microsoft Artifact Signing（原 Trusted Signing）或证书供应商的云签名服务，并确认所在地区、申请主体及身份验证条件；选择云服务后，需要改为对应的身份认证及签名集成，不能直接填入下面的 PFX Secrets。

如果你已有合法可导出的 PFX/P12 代码签名证书，本工作流已支持以下方式：

1. 在仓库 **Settings → Secrets and variables → Actions → New repository secret** 创建两个 Secrets：
   - `WINDOWS_CSC_LINK`：整个 PFX/P12 文件的 Base64 内容。
   - `WINDOWS_CSC_KEY_PASSWORD`：证书密码，使用非空密码保护证书。
2. 在自己的 Windows PowerShell 中将证书转成 Base64 并复制到剪贴板：

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\Certificates\paperline.pfx')) | Set-Clipboard
   ```

3. 将剪贴板内容粘贴到 `WINDOWS_CSC_LINK`，单独保存密码 Secret；不要把证书、Base64 或密码提交到仓库或发在聊天里。完成后可执行 `Set-Clipboard -Value ''` 清空剪贴板。

electron-builder 会对应用和安装包执行签名，CI 强制要求签名，并在上传前用 Windows Authenticode 验证安装包。Release 发布使用 GitHub 自动提供的 `GITHUB_TOKEN`，无需额外配置个人访问令牌。

### 发布操作

先将工作流和代码提交到 GitHub；首次发布版本已为 `1.0.0`，可以在仓库根目录执行：

```powershell
git add .github/workflows/build.yml Paperline/README.md
git commit -m "ci: publish signed installers on version tags"
git push origin HEAD
git tag v1.0.0
git push origin v1.0.0
```

先确保上述签名凭据配置完成。进入 **Actions → Build Paperline** 查看进度；Windows 与 macOS 都成功后，进入 **Releases** 下载安装包。如果仓库或组织策略禁止 Actions 写入仓库，需要管理员允许工作流的 `contents: write` 权限。

后续版本先更新版本号和锁文件，再提交并推送新标签，例如：

```powershell
cd Paperline
npm.cmd version 1.0.1 --no-git-tag-version
cd ..
git add Paperline/package.json Paperline/package-lock.json
git commit -m "chore: release 1.0.1"
git push origin HEAD
git tag v1.0.1
git push origin v1.0.1
```

如果构建失败，修复原因后可以重跑相应 Actions 运行；修改了代码则应提交代码并使用新的版本标签。Release 任务仅在构建全部成功后运行，重跑同一标签的发布任务会覆盖同名附件。
