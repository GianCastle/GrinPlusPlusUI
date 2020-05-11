const electron = require("electron");
const path = require("path");
const url = require("url");
const log = require("electron-log");
const { dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const isDevMode = process.execPath.match(/[\\/]electron/);

const powerSaveBlocker = require("electron").powerSaveBlocker;
powerSaveBlocker.start("prevent-app-suspension");

const BrowserWindow = electron.BrowserWindow;
// Module to control application life.
const app = electron.app;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function isRunning(win, mac, linux) {
  const plat = process.platform
  const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
  const proc = plat == 'win32' ? win : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
  if (cmd === '' || proc === '') {
    throw new Error("Unknown platform")
  }
  var stdout = require('child_process').execSync(cmd).toString();
  return (stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
}

function closeGrinNode(cb) {
  var running = isRunning('GrinNode.exe', 'GrinNode', 'GrinNode');
  log.error(running);
  if (!running) { log.info("GrinNode does not appear to be running. Calling app.quit()"); }
  else {
    const filePath = require("path").join(
      require("electron").app.getAppPath(),
      "defaults.json"
    );
    let settings = JSON.parse(require("fs").readFileSync(filePath, "utf8"));
    let request = require("request");
    let options = {
      url: `http://${settings.ip}:${
        settings.floonet ? settings.ports.node + 10000 : settings.ports.node
        }/v1/shutdown`,
      method: "post",
    };
    request(options, (error, response, body) => {
      log.info("Shutdown API called");
      log.error(error);
      log.info(response);
      log.info(body);
    });
  }
  cb();
}

autoUpdater.on("error", () => {
  //dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
});

autoUpdater.on("update-available", () => {
  log.info("update-available: Downloading update");
  autoUpdater.downloadUpdate();
});

autoUpdater.on("update-not-available", () => {});

autoUpdater.on("update-downloaded", () => {
  log.info("update-downloaded: Prompting to install");
  const buttonIndex = dialog.showMessageBoxSync({
    type: "info",
    title: "Update Available",
    message:
      "A new version of Grin++ is available. Would you like to update now?",
    buttons: ["Yes", "No"],
  });

  log.info("buttonIndex: " + buttonIndex);
  if (buttonIndex === 0) {
    log.info("User chose to install");
    closeGrinNode(() => {
      log.info("Client stopped. Calling quitAndInstall");
      autoUpdater.quitAndInstall(true, true);
    });
  }
});

function checkForUpdates() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.checkForUpdates();
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 790,
    minWidth: 1200,
    minHeight: 790,
    resizable: true,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: "#0D0D0D",
    title: "Grin++ v" + app.getVersion(),
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, "/../assets/icons/512x512.png"),
  });

  // and load the index.html of the app.
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "/../build/index.html"),
      protocol: "file:",
      slashes: true,
    });
  mainWindow.loadURL(startUrl);

  if (isDevMode) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  if (!isDevMode) {
    checkForUpdates();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on("close", () => {
    closeGrinNode(() => {
      app.quit();
    });
  });

  mainWindow.once("ready-to-show", () => {});

  app.applicationMenu = null;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

app.on("activate", function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {});
