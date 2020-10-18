const { create } = require("domain");
// Modules to control application life and create native browser window
const {app, screen, Tray, Menu, BrowserWindow, ipcMain, autoUpdater, dialog} = require("electron");
const path = require('path')

let settingWindow;
function createSettingWindow() {
  var electronScreen = screen;
  settingWindow = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    }
  })
  settingWindow.loadFile('public/menu.html')
}

let mainWindow;
function createClapWindow(eventId) {
  // Create the browser window.
  var electronScreen = screen;
  mainWindow = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: false
    }
  })
  var size = electronScreen.getPrimaryDisplay().workAreaSize;
  mainWindow.setPosition(size.width - 200, 20)
  mainWindow.loadFile('public/index.html')
}

function createTaskBar() {
  tray = new Tray(path.join(__dirname, './image/logo.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: "Setting", click: function () { createSettingWindow() }},
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

// const feedUrl = 'https://rhcc2z3o70.execute-api.ap-northeast-1.amazonaws.com/production/clapHandVersion?version=' + app.getVersion();
// autoUpdater.setFeedURL({ url: feedUrl })

// autoUpdater.checkForUpdates()

// console.log("check for update")

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   const dialogOpts = {
//     type: 'info',
//     buttons:  ['Restart', 'Later'],
//     title: 'Application Update',
//     message: 'The new version has been downloaded. Please restart the application to apply the updates.',
//     detail: releaseName + "\n\n" + releaseNotes
//   }

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// })
