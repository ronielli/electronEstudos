const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const isWindowsStartup = process.argv.slice(1).some(arg => arg === '--startup');



if (require('electron-squirrel-startup')) {
  // Se for o caso, encerre o aplicativo, pois a tarefa de registro foi tratada
  app.quit();
}


let mainWindow;
let tray;
let count = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', (event) => {
    if (app.isQuiting) {
      mainWindow = null;
    } else {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  tray = new Tray(path.join(__dirname, 'trayIcon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir Aplicativo',
      click: () => mainWindow.show(),
    },
    {
      label: 'Fechar Aplicativo',
      click: () => {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Aplicativo Electron');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Incrementar o contador a cada segundo
setInterval(() => {
  count++;
  if (mainWindow) {
    mainWindow.webContents.send('update-counter', count);
  }
}, 1000);

// Receber atualizações do contador
ipcMain.on('get-counter', (event) => {
  event.returnValue = count;
});


function addToWindowsStartup() {

  const electronAppPath =  path.resolve("background-task.exe")

  const registryKeyName = 'background-task';

  console.log(electronAppPath)
  
  const addRegistryEntryCommand = `REG ADD HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v ${registryKeyName} /t REG_SZ /d "${electronAppPath}" /f`;
  
  exec(addRegistryEntryCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao adicionar a entrada no Registro:', error);
    } else {
      console.log('Entrada adicionada no Registro com sucesso!');
    }
  });
}

if (!isWindowsStartup) {
 
  addToWindowsStartup();
}