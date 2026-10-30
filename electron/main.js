const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');
if (!app.requestSingleInstanceLock()) app.quit();
function create() {
  const w = new BrowserWindow({
    width: 1100, height: 820, minWidth: 380, minHeight: 600,
    title: 'متابعة حلقات القرآن الكريم',
    icon: path.join(__dirname, '../build/icon.png'),
    backgroundColor: '#eef3f0',
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  w.loadFile(path.join(__dirname, '../www/index.html'));
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|tel|mailto):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  w.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) { e.preventDefault(); if (/^(https?|tel|mailto):/i.test(url)) shell.openExternal(url); }
  });
}
app.whenReady().then(create);
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
