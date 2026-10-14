const { app, BrowserWindow, shell, dialog } = require('electron');

const APP_URL = process.env.ENCARTO_DESKTOP_URL || 'https://encarto.vercel.app';
let APP_ORIGIN;
try {
  const parsed = new URL(APP_URL);
  if (parsed.protocol !== 'https:') throw new Error('Only HTTPS Encarto URLs are permitted.');
  APP_ORIGIN = parsed.origin;
} catch (error) {
  throw new Error('ENCARTO_DESKTOP_URL must be a valid HTTPS URL: ' + String(error.message || error));
}

function openTrustedExternal(url) {
  try {
    const target = new URL(url);
    if (target.protocol === 'https:' && target.origin !== APP_ORIGIN) shell.openExternal(target.href);
  } catch (_) {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 900, minHeight: 620,
    show: false, title: 'Encarto', backgroundColor: '#050505',
    autoHideMenuBar: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    openTrustedExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    try {
      const target = new URL(url);
      if (target.origin !== APP_ORIGIN) {
        event.preventDefault();
        openTrustedExternal(target.href);
      }
    } catch (_) {
      event.preventDefault();
    }
  });
  win.webContents.on('will-redirect', (event, url) => {
    try {
      if (new URL(url).origin !== APP_ORIGIN) event.preventDefault();
    } catch (_) {
      event.preventDefault();
    }
  });
  win.webContents.on('render-process-gone', async () => {
    await dialog.showMessageBox(win, { type: 'error', title: 'Encarto stopped unexpectedly',
      message: 'Encarto encountered a rendering problem.',
      detail: 'Please reopen the application. If the problem continues, check your internet connection.' });
  });
  win.loadURL(APP_URL).catch(async (error) => {
    await dialog.showMessageBox(win, { type: 'error', title: 'Unable to connect to Encarto',
      message: 'Encarto could not load its online service.',
      detail: 'Check your internet connection and try again.\\n\\n' + String(error.message || error) });
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
