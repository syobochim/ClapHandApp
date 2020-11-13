const { create } = require("domain");
// Modules to control application life and create native browser window
const { app, screen, Tray, Menu, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require('path')
const { autoUpdater } = require("electron-updater");
const log = require("electron-log")
const isDev = require('electron-is-dev');

log.info("application version : ", app.getVersion())
const is_mac = process.platform==='darwin'

if(is_mac) {
  app.dock.hide()
}

let settingWindow;
function createSettingWindow() {
  settingWindow = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    }
  })
  settingWindow.setMenu(null)
  settingWindow.loadFile('public/menu.html')
}

let mainWindow;
const MAIN_WINDOWS_WIDTH = 300;
const MAIN_WINDOWS_HEIGHT = 350;
function createClapWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: MAIN_WINDOWS_WIDTH,
    height: MAIN_WINDOWS_HEIGHT,
    transparent: true,
    frame: false,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    }
  })
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(workAreaSize.width - MAIN_WINDOWS_WIDTH, workAreaSize.height - MAIN_WINDOWS_HEIGHT)
  mainWindow.setAlwaysOnTop(true, "screen-saver")
  mainWindow.setVisibleOnAllWorkspaces(true)
  // mainWindow.setIgnoreMouseEvents(true)
  mainWindow.loadFile('public/reaction.html')
}

function setTopRightPosition() {
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(workAreaSize.width - MAIN_WINDOWS_WIDTH, 20)
}
function setTopLeftPosition() {
  mainWindow.setPosition(0, 0)
}
function setBottomRightPosition() {
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(workAreaSize.width - MAIN_WINDOWS_WIDTH, workAreaSize.height - MAIN_WINDOWS_HEIGHT)
}
function setBottomLeftPosition() {
  let workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(0, workAreaSize.height - MAIN_WINDOWS_HEIGHT)
}

function createTaskBar() {
  tray = new Tray(path.join(__dirname, './image/logo.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: "Setting", click: function () { createSettingWindow() } },
    {
      label: "Position", submenu: [
        { label: "Top Right", type: 'radio', checked: false, click: function () { setTopRightPosition() } },
        { label: "Top Left", type: 'radio', checked: false, click: function () { setTopLeftPosition() } },
        { label: "Bottom Right", type: 'radio', checked: true, click: function () { setBottomRightPosition() } },
        { label: "Bottom Left",type: 'radio', checked: false,  click: function () { setBottomLeftPosition() } }
      ]
    },
    { label: "Quit", click: function () { app.quit(); } }
  ])
  tray.setContextMenu(contextMenu)
}

function setEventCode(eventId) {
  mainWindow.webContents.send('eventId', eventId)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  log.transports.file.level = "info"
  autoUpdater.logger = log
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
  createSettingWindow()
  createClapWindow()
  createTaskBar()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createSettingWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('eventCode', async (event, eventCode) => {
  setEventCode(eventCode)
  return "complete"
})
if (isDev) {
  console.log('Running in development');
} else {
  autoUpdater.on('update-downloaded', ({ version, releaseDate }) => {
    log.info('application update ...')
    const detail = `${app.getName()} ${version} ${releaseDate}`
    dialog.showMessageBox(
      mainWindow,
      {
        type: 'question',
        buttons: ['Restart', 'Later'],
        defaultId: 0,
        cancelId: 999,
        message: 'The new version has been downloaded. Please restart the application to apply the updates.',
        detail
      },
      res => {
        if (res === 0) {
          log.info('update start')
          autoUpdater.quitAndInstall()
        }
      })
  })
}
