// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveWishlistItem: (item) => ipcRenderer.invoke('save-wishlist-item', item),
  deleteWishlistItem: (itemName) => ipcRenderer.invoke('delete-wishlist-item', itemName)
});

