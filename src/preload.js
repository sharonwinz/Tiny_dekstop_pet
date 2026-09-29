const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("petAPI", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (s) => ipcRenderer.invoke("save-settings", s),
  pauseFor: (m) => ipcRenderer.invoke("pause-for", m),
  resume: () => ipcRenderer.invoke("resume"),
  moveButton: (p) => ipcRenderer.invoke("button-move", p),
  getPetPosition: () => ipcRenderer.invoke("get-pet-position"),
  movePet: (p) => ipcRenderer.invoke("move-pet", p),
  summon: (r) => ipcRenderer.send("summon", r),
  openSettings: () => ipcRenderer.send("open-settings"),
  openChat: () => ipcRenderer.send("open-chat"),
  hidePet: () => ipcRenderer.send("hide-pet"),
  secureApiKey: (k) => ipcRenderer.invoke("secure-api-key", k),
  getApiKey: () => ipcRenderer.invoke("get-api-key"),
  on: (channel, cb) => ipcRenderer.on(channel, (_, data) => cb(data))
});
