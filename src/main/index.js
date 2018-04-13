import { app } from "electron";
import createMainWindow from "./createMainWindow";
import setAppMenu from "./setAppMenu";
import showSaveAsNewFileDialog from "./showSaveAsNewFileDialog";
import showOpenFileDialog from "./showOpenFileDialog";
import createFileManager from "./createFileManager";

let mainWindow = null;
let fileManger = null;

//OSのAPIはMainプロセス上で呼び出し。Rendererプロセスでは呼び出しは不可。
function openFile() {
    showOpenFileDialog()
        .then((filePath) => fileManger.readFile(filePath))
        .then((text) => mainWindow.sendText(text))
        .catch((error) => {
            console.log(error);
        });
}

function saveFile() {
    if(!fileManger.filePath) {
        saveAsNewFile();
        return;
    }
    mainWindow.requestText()
        .then((text) => fileManger.overwriteFile(text))
        .catch((error) => {
            console.log(error);
        });
}

function saveAsNewFile() {
    Promise.all([ showSaveAsNewFileDialog(), mainWindow.requestText()])
        .then(([filePath, text]) => fileManger.saveFile(filePath, text))
        .catch((error) => {
            console.log(error);
        });
}

app.on("ready", () => {
    mainWindow = createMainWindow();
    fileManger = createFileManager();
    setAppMenu({ openFile, saveFile, saveAsNewFile });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", (_e, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
        mainWindow = createMainWindow();
    }
});

