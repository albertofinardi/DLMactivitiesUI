
/*const setupEvents = require('./installers/setupEvents')
 if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }
 */
 
const { app, ipcMain, BrowserWindow } = require('electron');
const electron = require('electron');
const path = require('path');
const DataStore = require('./DataStore');

const xl = require('excel4node');

const { rejects } = require('assert');
const { data } = require('jquery');

var JSONData = new DataStore({ name: "Data" })
const storico = new DataStore({ name: "Storico" })


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

//const defaultProps = 

const createWindow = () => {

  const userWindow = new BrowserWindow({height: 800,
    width: 800,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }});

  userWindow.loadFile(path.join(__dirname, '/Pages/USER.html'));
  userWindow.once("ready-to-show", () => {
    userWindow.webContents.send("data", JSONData.data)
    userWindow.webContents.send("data", JSONData.getData())
    userWindow.show()
  })

  var displays = electron.screen.getAllDisplays();

  const guiWindow = new BrowserWindow(
    {height: 800,
    width: 800,
    show: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true
    }});
  if (displays.length > 1) {
    guiWindow.setBounds(displays[1].bounds)
    guiWindow.setFullScreen(true);
  }
  

  guiWindow.loadFile(path.join(__dirname, '/Pages/GUI.html'));
  guiWindow.once("ready-to-show", () => {
    //guiWindow.webContents.send("data", JSONData.data)
    //guiWindow.webContents.send("data", JSONData.getData())
    guiWindow.show()
  })

  userWindow.on('close', function(e){
    app.quit()
  })
  guiWindow.on('close', function(e){
    app.quit()
  })

  ipcMain.on("newDataUser", (event, data) => {
    const updatedData = JSONData.addData(data).data
    guiWindow.webContents.send("data", updatedData)
    userWindow.webContents.send("data", updatedData)
  })

  ipcMain.on("getAllData", (event, data) => {
    guiWindow.webContents.send("data", JSONData.data)
  })

  ipcMain.on("deleteData", (event, data) => {
    const updatedData = JSONData.deleteData(data).data
    guiWindow.webContents.send("data", updatedData)
    userWindow.webContents.send("data", updatedData)
  })

  ipcMain.on("getDataById", (event, id) => {
    const singleData = JSONData.getDataById(id)
    guiWindow.webContents.send("dataReturned", singleData)
    userWindow.webContents.send("dataReturned", singleData)
  })

  ipcMain.on("modifyData", (event, data) => {
    const updatedData = JSONData.modifyData(data.pre, data.post).data
    guiWindow.webContents.send("data", updatedData)
    userWindow.webContents.send("data", updatedData)
  })

  ipcMain.on("saveData", () => {
    saveData()
  })

  ipcMain.on("openFile", () => {
    electron.shell.showItemInFolder("StoricoAttività.xlsx")
  })

  ipcMain.on("deleteAllData", () => {
    storico.deleteAll()
  })

  //guiWindow.webContents.send("data", JSONData.getData())
  userWindow.webContents.send("data", JSONData.getData())

  const interval = setInterval(function () {
    const JSONDataLocal = new DataStore({ name: "Data" })
    const data = JSONDataLocal.data
    if (data.length > 0) {
      dataS = data[0]
      const now = new Date().toISOString()
      if (dataS.fine < now) {
        JSONDataLocal.deleteData(dataS)
        //storico.addData(dataS)//------------------------------------------------------------------------------------------
        guiWindow.webContents.send("data", JSONDataLocal.data)
        userWindow.webContents.send("data", JSONDataLocal.data)
        JSONData = JSONDataLocal
      }
    }
  }, 1000);

};

app.on('ready', createWindow);

//EXPORT DATA
function saveData() {

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Storico attività pomeridiane');
  const headingColumnNames = [
    "Nome attività",
    "Aula",
    "Piano",
    "Inizio",
    "Fine"
  ]
  let headingColumnIndex = 1;
  headingColumnNames.forEach(heading => {
    ws.cell(1, headingColumnIndex++)
      .string(heading)
  });

  let rowIndex = 2;
  storico.data.forEach(record => {
    let columnIndex = 1;
    Object.keys(record).forEach(columnName => {
      if (columnName == "id") {

      } else if (columnName == "aula") {
        ws.cell(rowIndex, columnIndex++)
          .number(record[columnName])
      }
      else if (columnName == "inizio" || columnName == "fine") {
        ws.cell(rowIndex, columnIndex++)
          .number(JSDateToExcelDate(new Date(record[columnName])))
      } else {
        ws.cell(rowIndex, columnIndex++)
          .string(record[columnName])
      }
    });
    rowIndex++;
  });

  ws.cell(2, 8)
    .string('PER VISUALIZZARE CORRETTAMENTE "INIZIO" E "FINE" IMPOSTARE TIPOLOGIA COLONNA SU DATA')
  wb.write('StoricoAttività.xlsx');
}
function JSDateToExcelDate(inDate) {
  var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
  return Number(returnDateTime.toString().substr(0, 20))
}