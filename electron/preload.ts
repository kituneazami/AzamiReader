import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    openDirectory: () => ipcRenderer.invoke('openDirectory'),
    openPath: (path: string) => ipcRenderer.invoke('openPath', path),
    getSubdirectories: (path: string) => ipcRenderer.invoke('getSubdirectories', path),
    getImages: (path: string) => ipcRenderer.invoke('getImages', path),
    toggleFullscreen: () => ipcRenderer.invoke('toggleFullscreen'),
    onFullscreenChange: (callback: (isFullscreen: boolean) => void) => {
        const subscription = (_event: any, isFullscreen: boolean) => callback(isFullscreen);
        ipcRenderer.on('fullscreen-change', subscription);
        return () => ipcRenderer.removeListener('fullscreen-change', subscription);
    },
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    isMaximized: () => ipcRenderer.invoke('is-maximized'),
});
