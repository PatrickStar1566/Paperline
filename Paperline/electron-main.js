const { app, BrowserWindow, dialog, Menu, ipcMain } = require('electron');
const fs = require('fs/promises');
const path = require('path');

let mainWindow;
let pendingOpenPath = null;

function isMarkdownFile(filePath) {
  return typeof filePath === 'string' && /\.(md|markdown)$/i.test(filePath);
}

function getPathFromArgs(args) {
  return args.find((value) => isMarkdownFile(value) && !value.startsWith('--')) || null;
}

async function sendFileToRenderer(filePath) {
  if (!mainWindow || mainWindow.isDestroyed() || mainWindow.webContents.isLoadingMainFrame()) {
    pendingOpenPath = filePath;
    return;
  }
  try {
    mainWindow.webContents.send('file:opened', await readMarkdown(filePath));
  } catch (error) {
    dialog.showErrorBox('打开 Markdown 文件失败', error.message);
  }
}

async function readMarkdown(filePath) {
  const absolutePath = path.resolve(filePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  return { filePath: absolutePath, content };
}

async function chooseMarkdownFile() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '打开 Markdown 文件',
    properties: ['openFile'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }, { name: '所有文件', extensions: ['*'] }]
  });
  return result.canceled || !result.filePaths[0] ? null : result.filePaths[0];
}

async function chooseSavePath(defaultPath) {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '保存 Markdown 文件',
    defaultPath: defaultPath || '未命名文档.md',
    filters: [{ name: 'Markdown', extensions: ['md'] }, { name: '所有文件', extensions: ['*'] }]
  });
  return result.canceled || !result.filePath ? null : result.filePath;
}

function createMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: '文件',
      submenu: [
        { label: '打开…', accelerator: 'CmdOrCtrl+O', click: () => sendFileToRendererFromDialog() },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:command', 'save') },
        { label: '另存为…', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:command', 'save-as') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }]
    },
    {
      label: '视图',
      submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function sendFileToRendererFromDialog() {
  const filePath = await chooseMarkdownFile();
  if (filePath) sendFileToRenderer(filePath);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 860,
    minHeight: 620,
    backgroundColor: '#f4f5f7',
    title: 'Paperline',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.once('did-finish-load', () => {
    const filePath = pendingOpenPath;
    pendingOpenPath = null;
    if (filePath) sendFileToRenderer(filePath);
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('file:open', async () => {
  const filePath = await chooseMarkdownFile();
  return filePath ? readMarkdown(filePath) : null;
});

ipcMain.handle('file:initial', async () => {
  const filePath = pendingOpenPath;
  pendingOpenPath = null;
  return filePath ? readMarkdown(filePath) : null;
});

ipcMain.handle('file:save', async (_event, payload = {}) => {
  let filePath = isMarkdownFile(payload.filePath) ? payload.filePath : null;
  if (!filePath) filePath = await chooseSavePath(payload.title ? `${payload.title}.md` : null);
  if (!filePath) return null;
  if (!/\.(md|markdown)$/i.test(filePath)) filePath += '.md';
  await fs.writeFile(filePath, String(payload.content || ''), 'utf8');
  return { filePath: path.resolve(filePath) };
});

ipcMain.handle('file:save-as', async (_event, payload = {}) => {
  const filePath = await chooseSavePath(payload.title ? `${payload.title}.md` : null);
  if (!filePath) return null;
  const finalPath = /\.(md|markdown)$/i.test(filePath) ? filePath : `${filePath}.md`;
  await fs.writeFile(finalPath, String(payload.content || ''), 'utf8');
  return { filePath: path.resolve(finalPath) };
});

app.whenReady().then(() => {
  pendingOpenPath = getPathFromArgs(process.argv.slice(1));
  createWindow();
  createMenu();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (!isMarkdownFile(filePath)) return;
  if (app.isReady()) sendFileToRenderer(filePath);
  else pendingOpenPath = filePath;
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
