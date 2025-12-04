/// <reference types="vite/client" />
/// <reference types="vite/client" />

interface Window {
    electronAPI: {
        openDirectory: () => Promise<string | null>;
        openPath: (path: string) => Promise<void>;
        getSubdirectories: (path: string) => Promise<{ name: string; path: string; thumbnail?: string }[]>;
        getImages: (path: string) => Promise<string[]>;
        toggleFullscreen: () => Promise<void>;
        onFullscreenChange: (callback: (isFullscreen: boolean) => void) => () => void;
        minimizeWindow: () => Promise<void>;
        maximizeWindow: () => Promise<void>;
        closeWindow: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
    };
}
