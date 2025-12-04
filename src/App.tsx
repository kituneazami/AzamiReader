import { useState, useEffect } from 'react';
import './styles/index.css';
import './styles/titlebar.css';
import './i18n';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Settings } from './components/Settings';
import { TitleBar } from './components/TitleBar';
import { Header } from './components/Header';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Subdirectory } from './types';

// Electron環境 (file://プロトコル) とweb環境の両方に対応
if (window.location.protocol === 'file:') {
  // Electronアプリの場合、相対パスで指定
  pdfjs.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.imageResourcesPath = './';
} else {
  // 開発環境の場合
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('/pdf.worker.min.mjs', window.location.origin).toString();
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.imageResourcesPath = window.location.origin + '/';
}

function App() {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [subdirectories, setSubdirectories] = useState<Subdirectory[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'library' | 'reader'>('library');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [libraryViewMode, setLibraryViewMode] = useState<'grid' | 'list'>('grid');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [ignoredPatterns, setIgnoredPatterns] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [libraryScrollPosition, setLibraryScrollPosition] = useState(0);

  const loadSubdirectories = async (path: string) => {
    try {
      setIsLoading(true);
      if (!window.electronAPI) {
        console.error('electronAPI is not defined');
        return;
      }
      const dirs = await window.electronAPI.getSubdirectories(path);
      setSubdirectories(dirs);
    } catch (error) {
      console.error('Error loading subdirectories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // 起動時に保存されたパスと設定があれば読み込む
    const savedPath = localStorage.getItem('manga-viewer-root-path');
    if (savedPath) {
      setRootPath(savedPath);
      loadSubdirectories(savedPath);
    }

    const savedPatterns = localStorage.getItem('manga-viewer-ignored-patterns');
    if (savedPatterns) {
      try {
        setIgnoredPatterns(JSON.parse(savedPatterns));
      } catch (e) {
        console.error('Failed to parse ignored patterns', e);
      }
    }

    const savedFavorites = localStorage.getItem('manga-viewer-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onFullscreenChange((fullscreen) => {
        setIsFullscreen(fullscreen);
      });
      return unsubscribe;
    }
  }, []);

  const handleUpdateIgnoredPatterns = (patterns: string[]) => {
    setIgnoredPatterns(patterns);
    localStorage.setItem('manga-viewer-ignored-patterns', JSON.stringify(patterns));
  };

  const handleAddToFavorites = (path: string) => {
    if (!favorites.includes(path)) {
      const newFavorites = [...favorites, path];
      setFavorites(newFavorites);
      localStorage.setItem('manga-viewer-favorites', JSON.stringify(newFavorites));
      console.log('Added to favorites:', path);
    }
  };

  const handleAddToIgnore = (name: string) => {
    // 名前の一部として追加するのではなく、完全一致またはパターンとして追加する
    // ここでは単純に名前を追加する
    if (!ignoredPatterns.includes(name)) {
      const newPatterns = [...ignoredPatterns, name];
      handleUpdateIgnoredPatterns(newPatterns);
      console.log('Added to ignore:', name);
    }
  };

  const handleOpenFolderInExplorer = async (path: string) => {
    console.log('handleOpenFolderInExplorer called with:', path);
    if (window.electronAPI) {
      console.log('Invoking window.electronAPI.openPath');
      await window.electronAPI.openPath(path);
    } else {
      console.error('window.electronAPI is not defined');
    }
  };

  const handleResetApp = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleOpenDirectory = async () => {
    console.log('Open Folder clicked');
    try {
      if (!window.electronAPI) {
        console.error('electronAPI is not defined');
        return;
      }
      console.log('Calling window.electronAPI.openDirectory');
      const path = await window.electronAPI.openDirectory();
      console.log('openDirectory result:', path);
      if (path) {
        setRootPath(path);
        localStorage.setItem('manga-viewer-root-path', path); // パスを保存
        await loadSubdirectories(path);
        setViewMode('library');
      }
    } catch (error) {
      console.error('Error in handleOpenDirectory:', error);
    }
  };

  const handleSelectDirectory = async (path: string, isFile: boolean = false) => {
    // Scroll position is now tracked via onScroll callback in Library component
    if (isFile) {
      setCurrentPdfPath(path);
      setViewMode('reader');
    } else {
      const images = await window.electronAPI.getImages(path);
      setCurrentImages(images);
      setViewMode('reader');
    }
  };

  const handleBackToLibrary = () => {
    setViewMode('library');
    setCurrentImages([]);
    setCurrentPdfPath(null);
  };

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredSubdirectories = subdirectories
    .filter((dir) => {
      // 検索フィルタ
      if (!dir.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // 除外フィルタ
      if (ignoredPatterns.some(pattern => dir.name.includes(pattern))) return false;
      // お気に入りフィルタ
      if (showFavoritesOnly && !favorites.includes(dir.path)) return false;
      return true;
    })
    .sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      } else {
        return nameB.localeCompare(nameA, undefined, { numeric: true, sensitivity: 'base' });
      }
    });

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const toggleLibraryViewMode = () => {
    setLibraryViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'));
  };

  const handleRemoveFromFavorites = (path: string) => {
    const newFavorites = favorites.filter(fav => fav !== path);
    setFavorites(newFavorites);
    localStorage.setItem('manga-viewer-favorites', JSON.stringify(newFavorites));
    console.log('Removed from favorites:', path);
  };

  return (
    <>
      <TitleBar isFullscreen={isFullscreen} />
      {viewMode === 'library' && (
        <>
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showFavoritesOnly={showFavoritesOnly}
            setShowFavoritesOnly={setShowFavoritesOnly}
            sortOrder={sortOrder}
            toggleSortOrder={toggleSortOrder}
            libraryViewMode={libraryViewMode}
            toggleLibraryViewMode={toggleLibraryViewMode}
            isFullscreen={isFullscreen}
            rootPath={rootPath}
            handleOpenDirectory={handleOpenDirectory}
            loadSubdirectories={loadSubdirectories}
            setIsSettingsOpen={setIsSettingsOpen}
          />
          <Library
            subdirectories={filteredSubdirectories}
            onSelect={handleSelectDirectory}
            viewMode={libraryViewMode}
            onOpenDirectory={handleOpenDirectory}
            isSearching={searchQuery.length > 0 || showFavoritesOnly}
            isLoading={isLoading}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onAddToIgnore={handleAddToIgnore}
            onOpenFolder={handleOpenFolderInExplorer}
            favorites={favorites}
            scrollPosition={libraryScrollPosition}
            onScrollPositionChange={setLibraryScrollPosition}
          />
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            ignoredPatterns={ignoredPatterns}
            onUpdateIgnoredPatterns={handleUpdateIgnoredPatterns}
            onReset={handleResetApp}
          />
        </>
      )}

      {viewMode === 'reader' && (
        <Reader images={currentImages} pdfPath={currentPdfPath} onBack={handleBackToLibrary} />
      )}
    </>
  );
}

export default App;
