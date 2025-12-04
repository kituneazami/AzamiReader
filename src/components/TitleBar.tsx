import { useState, useEffect } from 'react';

interface TitleBarProps {
    isFullscreen: boolean;
}

export function TitleBar({ isFullscreen }: TitleBarProps) {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // 初期状態を取得
        const checkMaximized = async () => {
            if (window.electronAPI) {
                const maximized = await window.electronAPI.isMaximized();
                setIsMaximized(maximized);
            }
        };
        checkMaximized();
    }, []);

    const handleMinimize = () => {
        if (window.electronAPI) {
            window.electronAPI.minimizeWindow();
        }
    };

    const handleMaximize = async () => {
        if (window.electronAPI) {
            await window.electronAPI.maximizeWindow();
            const maximized = await window.electronAPI.isMaximized();
            setIsMaximized(maximized);
        }
    };

    const handleClose = () => {
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        }
    };

    if (isFullscreen) {
        return null;
    }

    return (
        <div className="title-bar">
            <div className="title-bar-drag-region"></div>
            <div className="title-bar-buttons">
                <button
                    className="title-bar-button title-bar-minimize"
                    onClick={handleMinimize}
                    title="Minimize"
                    aria-label="Minimize"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <rect x="0" y="5" width="12" height="2" fill="currentColor" />
                    </svg>
                </button>
                <button
                    className="title-bar-button title-bar-maximize"
                    onClick={handleMaximize}
                    title={isMaximized ? "Restore" : "Maximize"}
                    aria-label={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="2" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="0" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12">
                            <rect x="0" y="0" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                    )}
                </button>
                <button
                    className="title-bar-button title-bar-close"
                    onClick={handleClose}
                    title="Close"
                    aria-label="Close"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
