const { app, BrowserWindow, shell, dialog } = require('electron');

const APP_URL = process.env.ENCARTO_DESKTOP_URL || 'https://encarto.vercel.app';
const APP_ORIGIN = new URL(APP_URL).origin;

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 900, minHeight: 620,
    show: false, title: 'Encarto', backgroundColor: '#050505',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    try { if (new URL(url).protocol === 'https:') shell.openExternal(url); } catch (_) {}
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    try {
      if (new URL(url).origin !== APP_ORIGIN) { event.preventDefault(); shell.openExternal(url); }
    } catch (_) { event.preventDefault(); }
  });
  win.webContents.on('render-process-gone', async () => {
    await dialog.showMessageBox(win, { type: 'error', title: 'Encarto stopped unexpectedly',
      message: 'Encarto encountered a rendering problem.',
      detail: 'Please reopen the application. If the problem continues, check your internet connection.' });
  });
  win.loadURL(APP_URL).catch(async (error) => {
    await dialog.showMessageBox(win, { type: 'error', title: 'Unable to connect to Encarto',
      message: 'Encarto could not load its online service.',
      detail: 'Check your internet connection and try again.\n\n' + String(error.message || error) });
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
