// preload.js
const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getCounter: () => ipcRenderer.sendSync('get-counter'),
});
