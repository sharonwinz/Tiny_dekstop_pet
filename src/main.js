const { app, BrowserWindow, screen, Tray, Menu, ipcMain, nativeImage, safeStorage } = require("electron");
const path = require("path");
const fs = require("fs");

let petWin, buttonWin, settingsWin, chatWin, tray;
let settings = {
  enabled: true,
  visitMinutes: 5,
  waterMinutes: 60,
  checkIns: true,
  sound: false,
  animationSpeed: 1,
  petSize: 220,
  aiChat: false,
  apiKey: "",
  launchOnStartup: false,
  alwaysOnTop: true,
  quietUntil: 0,
  button: { x: 0, y: 0 },
  pet: { x: null, y: null }
};

const userDir = app.getPath("userData");
const configPath = path.join(userDir, "settings.json");

function loadSettings() {
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf8"));
    settings = {
      ...settings,
      ...raw,
      button: { ...settings.button, ...(raw.button || {}) },
      pet: { ...settings.pet, ...(raw.pet || {}) }
    };
  } catch {}
}
function saveSettings() {
  fs.mkdirSync(userDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
}
function applyStartup() {
  try {
    app.setLoginItemSettings({ openAtLogin: !!settings.launchOnStartup });
  } catch {}
}
function bounds() { return screen.getPrimaryDisplay().workArea; }
function clampButton() {
  const b = bounds();
  const w = 64, h = 64;
  const defaultX = b.x + b.width - w - 18;
  const defaultY = b.y + Math.floor(b.height * .55);

  const currentX = Number.isFinite(Number(settings.button.x)) ? Number(settings.button.x) : defaultX;
  const currentY = Number.isFinite(Number(settings.button.y)) ? Number(settings.button.y) : defaultY;

  settings.button.x = Math.round(Math.max(b.x, Math.min(currentX, b.x + b.width - w)));
  settings.button.y = Math.round(Math.max(b.y, Math.min(currentY, b.y + b.height - h)));
  saveSettings();
}
function createPet() {
  petWin = new BrowserWindow({
    width: settings.petSize + 220, height: settings.petSize + 180,
    frame: false, transparent: true, resizable: false, movable: true,
    alwaysOnTop: settings.alwaysOnTop, skipTaskbar: true,
    hasShadow: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  petWin.setIgnoreMouseEvents(false);
  petWin.loadFile(path.join(__dirname, "pet.html"));
  petWin.hide();
  petWin.once("ready-to-show", () => clampPetPosition());
  petWin.on("closed", () => petWin = null);
}
function createButton() {
  clampButton();
  buttonWin = new BrowserWindow({
    width: 64, height: 64, frame: false, transparent: true, resizable: false,
    alwaysOnTop: true, skipTaskbar: true, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  buttonWin.loadFile(path.join(__dirname, "button.html"));
  buttonWin.setPosition(Math.round(settings.button.x), Math.round(settings.button.y));
}
function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("Tiny Desktop Pet");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Summon Pet", click: () => summon("greeting") },
    { label: "Chat", click: () => openChat() },
    { label: "Settings", click: () => openSettings() },
    { type: "separator" },
    { label: "Pause Pet", click: () => pauseFor(30) },
    { label: "Resume", click: () => { settings.quietUntil = 0; saveSettings(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() }
  ]));
}
function clampPetPosition() {
  if (!petWin || petWin.isDestroyed()) return;
  const b = bounds();
  const [w, h] = petWin.getSize();
  const margin = 8;
  const x = Math.max(b.x - 20, Math.min(settings.pet.x ?? (b.x + b.width - w - 40), b.x + b.width - w + 20));
  const y = Math.max(b.y, Math.min(settings.pet.y ?? (b.y + b.height - h - 20), b.y + b.height - h));
  settings.pet.x = Math.round(x);
  settings.pet.y = Math.round(y);
  petWin.setPosition(settings.pet.x, settings.pet.y);
  saveSettings();
}

function placePet() {
  clampPetPosition();
}

function summon(reason = "greeting") {
  if (!settings.enabled || !petWin) return;
  placePet();
  petWin.showInactive();
  petWin.webContents.send("summon", { reason, speed: settings.animationSpeed });
}
function openSettings() {
  if (settingsWin && !settingsWin.isDestroyed()) { settingsWin.show(); settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({
    width: 720, height: 760, title: "Tiny Pet Settings",
    webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false }
  });
  settingsWin.loadFile(path.join(__dirname, "settings.html"));
  settingsWin.on("closed", () => settingsWin = null);
}
function openChat() {
  if (!petWin) return;
  summon("greeting");
  setTimeout(() => petWin?.webContents.send("open-chat"), 700);
}
function pauseFor(minutes) {
  settings.quietUntil = Date.now() + minutes * 60000;
  saveSettings();
}
ipcMain.handle("get-settings", () => settings);
ipcMain.handle("save-settings", (_, next) => {
  settings = { ...settings, ...next, button: { ...settings.button, ...(next.button || {}) } };
  saveSettings(); applyStartup(); if (petWin) petWin.setAlwaysOnTop(settings.alwaysOnTop);
  return settings;
});
ipcMain.handle("pause-for", (_, minutes) => { pauseFor(minutes); return settings; });
ipcMain.handle("resume", () => { settings.quietUntil = 0; saveSettings(); return settings; });
ipcMain.handle("button-move", (_, p) => {
  if (!buttonWin || buttonWin.isDestroyed()) return settings.button;

  settings.button = {
    x: Math.round(Number(p.x)),
    y: Math.round(Number(p.y))
  };

  clampButton();
  buttonWin.setPosition(settings.button.x, settings.button.y);
  saveSettings();
  return settings.button;
});
ipcMain.handle("get-pet-position", () => {
  if (!petWin || petWin.isDestroyed()) return { x: settings.pet.x || 0, y: settings.pet.y || 0 };
  const [x, y] = petWin.getPosition();
  return { x, y };
});
ipcMain.handle("move-pet", (_, p) => {
  if (!petWin || petWin.isDestroyed()) return { x: 0, y: 0 };
  const b = bounds();
  const [w, h] = petWin.getSize();
  const x = Math.max(b.x - 20, Math.min(Number(p.x), b.x + b.width - w + 20));
  const y = Math.max(b.y, Math.min(Number(p.y), b.y + b.height - h));
  settings.pet = { x: Math.round(x), y: Math.round(y) };
  petWin.setPosition(settings.pet.x, settings.pet.y);
  saveSettings();
  return settings.pet;
});
ipcMain.on("summon", (_, reason) => summon(reason));
ipcMain.on("open-settings", openSettings);
ipcMain.on("open-chat", openChat);
ipcMain.on("hide-pet", () => { if (petWin && !petWin.isDestroyed()) petWin.hide(); });
ipcMain.handle("secure-api-key", (_, key) => {
  if (!key) { settings.apiKey = ""; saveSettings(); return true; }
  try {
    if (safeStorage.isEncryptionAvailable()) settings.apiKey = safeStorage.encryptString(key).toString("base64");
    else settings.apiKey = key;
    saveSettings(); return true;
  } catch { return false; }
});
ipcMain.handle("get-api-key", () => {
  try {
    if (!settings.apiKey) return "";
    if (safeStorage.isEncryptionAvailable()) return safeStorage.decryptString(Buffer.from(settings.apiKey, "base64"));
    return settings.apiKey;
  } catch { return ""; }
});

app.whenReady().then(() => {
  loadSettings(); applyStartup(); createPet(); createButton(); createTray();
  setInterval(() => {
    if (!settings.enabled || !settings.checkIns || Date.now() < settings.quietUntil) return;
    summon(Math.random() < .35 ? "water" : "greeting");
  }, Math.max(1, settings.visitMinutes) * 60000);
  // The water reminder is independent from general check-ins.
  setInterval(() => {
    if (!settings.enabled || Date.now() < settings.quietUntil) return;
    summon("water");
  }, Math.max(1, settings.waterMinutes) * 60000);
});
app.on("window-all-closed", (e) => e.preventDefault());
app.on("before-quit", () => saveSettings());
