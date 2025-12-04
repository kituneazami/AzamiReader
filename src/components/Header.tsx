import React from 'react';
import { useTranslation } from 'react-i18next';
import starIcon from '../assets/icons/star.svg';
import sortIcon from '../assets/icons/sort_by_alpha.svg';
import listIcon from '../assets/icons/view_headline.svg';
import gridIcon from '../assets/icons/grid_view.svg';
import fullscreenIcon from '../assets/icons/fullscreen.svg';
import fullscreenExitIcon from '../assets/icons/fullscreen_exit.svg';
import refreshIcon from '../assets/icons/refresh.svg';
import settingsIcon from '../assets/icons/settings.svg';
import linkIcon from '../assets/icons/link.svg';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showFavoritesOnly: boolean;
    setShowFavoritesOnly: (show: boolean) => void;
    sortOrder: 'asc' | 'desc';
    toggleSortOrder: () => void;
    libraryViewMode: 'grid' | 'list';
    toggleLibraryViewMode: () => void;
    isFullscreen: boolean;
    rootPath: string | null;
    handleOpenDirectory: () => void;
    loadSubdirectories: (path: string) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
    searchQuery,
    setSearchQuery,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortOrder,
    toggleSortOrder,
    libraryViewMode,
    toggleLibraryViewMode,
    isFullscreen,
    rootPath,
    handleOpenDirectory,
    loadSubdirectories,
    setIsSettingsOpen
}) => {
    const { t } = useTranslation();
    return (
        <header className="header">
            <div className="header-left">
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #a68ec9 0%, #d8bfd8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.05em',
                    fontWeight: 800
                }}>
                    Azami Reader
                </h1>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder={t('header.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            className="search-clear-button"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="header-icon-btn"
                    title={showFavoritesOnly ? "Show All" : "Show Favorites"}
                >
                    <img
                        src={starIcon}
                        alt="favorites"
                        style={{
                            width: '24px',
                            height: '24px',
                            filter: showFavoritesOnly ? 'brightness(0) saturate(100%) invert(74%) sepia(96%) saturate(1832%) hue-rotate(355deg) brightness(102%) contrast(107%)' : 'none'
                        }}
                    />
                </button>
                <button
                    onClick={toggleSortOrder}
                    className="header-icon-btn"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                    <img
                        src={sortIcon}
                        alt="sort"
                        style={{
                            width: '24px',
                            height: '24px'
                        }}
                    />
                    <span style={{ minWidth: '2.2em', textAlign: 'center' }}>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                </button>
                <button
                    onClick={toggleLibraryViewMode}
                    className="header-icon-btn"
                    title={`View ${libraryViewMode === 'grid' ? 'List' : 'Grid'}`}
                >
                    <img
                        src={libraryViewMode === 'grid' ? listIcon : gridIcon}
                        alt="view mode"
                        style={{ width: '24px', height: '24px' }}
                    />
                    <span style={{ minWidth: '2.2em', textAlign: 'center' }}>{libraryViewMode === 'grid' ? 'List' : 'Grid'}</span>
                </button>
                <button
                    onClick={() => window.electronAPI.toggleFullscreen()}
                    className="header-icon-btn"
                    title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
                >
                    <img
                        src={isFullscreen ? fullscreenExitIcon : fullscreenIcon}
                        alt="fullscreen"
                        style={{ width: '24px', height: '24px' }}
                    />
                </button>
            </div>
            <div className="header-right">
                <div style={{ opacity: 0.7, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                        onClick={handleOpenDirectory}
                        style={{
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px',
                            textDecorationColor: 'rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Change Folder"
                        onMouseEnter={(e) => e.currentTarget.style.textDecorationColor = 'rgba(255, 255, 255, 0.8)'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecorationColor = 'rgba(255, 255, 255, 0.3)'}
                    >
                        <img src={linkIcon} alt="link" style={{ width: '20px', height: '20px' }} />
                        {rootPath || t('header.noFolderSelected')}
                    </span>
                    {rootPath && (
                        <button
                            onClick={() => loadSubdirectories(rootPath)}
                            className="header-icon-btn"
                            style={{ padding: '4px 8px' }}
                            title="Reload"
                        >
                            <img src={refreshIcon} alt="reload" style={{ width: '20px', height: '20px' }} />
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="gear-button"
                    title="Settings"
                >
                    <img src={settingsIcon} alt="settings" style={{ width: '24px', height: '24px' }} />
                </button>
            </div>
        </header>
    );
};
