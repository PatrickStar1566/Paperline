const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (payload) => ipcRenderer.invoke('file:save', payload),
  saveFileAs: (payload) => ipcRenderer.invoke('file:save-as', payload),
  getInitialFile: () => ipcRenderer.invoke('file:initial'),
  onFileOpened: (callback) => {
    const listener = (_event, file) => callback(file);
    ipcRenderer.on('file:opened', listener);
    return () => ipcRenderer.removeListener('file:opened', listener);
  },
  onMenuCommand: (callback) => {
    const listener = (_event, command) => callback(command);
    ipcRenderer.on('menu:command', listener);
    return () => ipcRenderer.removeListener('menu:command', listener);
  }
});
