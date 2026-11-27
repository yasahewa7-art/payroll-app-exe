const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 1. D: drive එක තියෙනවද බලලා 'D:\Payroll_System_Data' හදනවා. නැත්නම් 'C:\Payroll_System_Data' හදනවා.
const dataDrive = fs.existsSync('D:\\') ? 'D:\\Payroll_System_Data' : 'C:\\Payroll_System_Data';

if (!fs.existsSync(dataDrive)) {
  fs.mkdirSync(dataDrive, { recursive: true });
}

// 2. Data Save කරන Function එක (JSON file එකක් විදියට)
ipcMain.handle('save-data', async (event, fileName, data) => {
  try {
    const filePath = path.join(dataDrive, `${fileName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Data save error:', error);
    return { success: false, error: error.message };
  }
});

// 3. Data Load කරන Function එක
ipcMain.handle('load-data', async (event, fileName) => {
  try {
    const filePath = path.join(dataDrive, `${fileName}.json`);
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    }
    return []; // File එක තාම හැදිලා නැත්නම් හිස් list එකක් යවනවා
  } catch (error) {
    console.error('Data load error:', error);
    return [];
  }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'logo.ico'),
    autoHideMenuBar: true, // උඩ තියෙන File/Edit menu bar එක හංගන්න
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.maximize(); // App එක open වෙද්දීම Full Screen වෙන්න
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
