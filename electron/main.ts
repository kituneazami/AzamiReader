import { app, BrowserWindow, ipcMain, dialog, protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: 'Azami Reader',
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: '#121212',
        autoHideMenuBar: true,
        icon: path.join(__dirname, process.env.NODE_ENV === 'development' ? '../public/icon.png' : '../dist/icon.png')
    });

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('enter-full-screen', () => {
        mainWindow?.webContents.send('fullscreen-change', true);
    });

    mainWindow.on('leave-full-screen', () => {
        mainWindow?.webContents.send('fullscreen-change', false);
    });
}

app.whenReady().then(() => {
    protocol.handle('media', (request) => {
        const url = request.url.replace('media:///', '');
        try {
            const decodedPath = decodeURIComponent(url);
            const fileUrl = pathToFileURL(decodedPath).toString();
            return net.fetch(fileUrl);
        } catch (error) {
            console.error('Media protocol error:', error);
            return new Response('Bad Request', { status: 400 });
        }
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('openDirectory', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    if (result.canceled) {
        return null;
    }
    return result.filePaths[0];
});

ipcMain.handle('openPath', async (event, dirPath) => {
    const { shell } = require('electron');
    console.log('Opening path:', dirPath);
    const errorMessage = await shell.openPath(dirPath);
    if (errorMessage) {
        console.error('Failed to open path:', errorMessage);
    }
});

ipcMain.handle('getSubdirectories', async (event, rootPath) => {
    try {
        const dirents = await fs.promises.readdir(rootPath, { withFileTypes: true });
        const dirs = [];
        for (const dirent of dirents) {
            if (dirent.isDirectory()) {
                const dirPath = path.join(rootPath, dirent.name);
                // Find a thumbnail (first image)
                let thumbnail = undefined;
                try {
                    const files = await fs.promises.readdir(dirPath);
                    const imageFile = files.find(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));
                    if (imageFile) {
                        thumbnail = path.join(dirPath, imageFile);
                    }
                } catch (e) {
                    // Ignore error reading subdir
                }
                dirs.push({
                    name: dirent.name,
                    path: dirPath,
                    thumbnail: thumbnail,
                    isFile: false
                });
            } else if (dirent.isFile() && dirent.name.toLowerCase().endsWith('.pdf')) {
                dirs.push({
                    name: dirent.name,
                    path: path.join(rootPath, dirent.name),
                    thumbnail: undefined,
                    isFile: true
                });
            }
        }
        return dirs;
    } catch (error) {
        console.error('Error reading directory:', error);
        return [];
    }
});

ipcMain.handle('getImages', async (event, dirPath) => {
    try {
        const files = await fs.promises.readdir(dirPath);
        const images = files
            .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
            .map(file => path.join(dirPath, file));
        // Sort naturally
        return images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    } catch (error) {
        console.error('Error reading images:', error);
        return [];
    }
});

ipcMain.handle('toggleFullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});

ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.handle('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.handle('is-maximized', () => {
    if (mainWindow) {
        return mainWindow.isMaximized();
    }
    return false;
});
