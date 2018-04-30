/*
  Attributions
  https://stackoverflow.com/questions/32885657/how-to-catch-the-event-of-clicking-the-app-windows-close-button-in-electron-app?rq=1
*/

const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const url = require('url')

// global references between electron and the renderer
global.storage = {needsPrompt: false};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    icon: path.join(__dirname, 'src', 'assets', 'icon.png')
  })

  // win.setMenu(null)

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'src', 'view', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //win.webContents.openDevTools()

  win.on('close', function (event) {  // Added by Kyle, credit to user Josh on stack overflow
    if (global.storage.needsPrompt) {
      var choice = dialog.showMessageBox({
    message: "Are you sure you want to quit? You will lose any unsaved changes.\n(Click save under any current event window to save)",
    buttons: ["Yes", "No"]
  });
  if (choice === 1){
    event.preventDefault();
  }
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})
