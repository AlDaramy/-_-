const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');
let autoUpdater = null;
try { autoUpdater = require('electron-updater').autoUpdater; } catch (e) {}

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
  w.loadFile(path.join(__dirname, '../www/index.html'), { query: { v: app.getVersion() } });
  w.webContents.setWindowOpenHandler(({ url }) => {
    if (/^(https?|tel|mailto):/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  w.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) { e.preventDefault(); if (/^(https?|tel|mailto):/i.test(url)) shell.openExternal(url); }
  });
}

function setupUpdates() {
  // التحديث التلقائي يعمل مع نسخة التثبيت فقط (وليس النسخة المحمولة)
  if (!autoUpdater || !app.isPackaged || process.env.PORTABLE_EXECUTABLE_FILE) return;
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['إعادة التشغيل الآن', 'لاحقًا'],
      defaultId: 0, cancelId: 1,
      title: 'تحديث جديد',
      message: 'تم تنزيل نسخة جديدة من التطبيق.',
      detail: 'اضغط «إعادة التشغيل الآن» لتثبيتها، أو ستُثبَّت تلقائيًا عند إغلاق التطبيق.'
    }).then(r => { if (r.response === 0) autoUpdater.quitAndInstall(); });
  });
  autoUpdater.on('error', () => {});
  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  check();
  setInterval(check, 6 * 60 * 60 * 1000);
}

app.whenReady().then(() => { create(); setupUpdates(); });
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
