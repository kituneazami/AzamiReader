import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { ContextMenu } from './ContextMenu';
import { FixedSizeGrid as Grid, FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { PdfThumbnail } from './PdfThumbnail';
import { useTranslation } from 'react-i18next';

import type { Subdirectory } from '../types';

interface LibraryProps {
    subdirectories: Subdirectory[];
    onSelect: (path: string, isFile?: boolean) => void;
    viewMode: 'grid' | 'list';
    onOpenDirectory: () => void;
    isSearching: boolean;
    isLoading: boolean;
    onAddToFavorites: (path: string) => void;
    onRemoveFromFavorites: (path: string) => void;
    onAddToIgnore: (name: string) => void;
    onOpenFolder: (path: string) => void;
    favorites: string[];
    scrollPosition: number;
    onScrollPositionChange: (position: number) => void;
}

export const Library: React.FC<LibraryProps> = ({
    subdirectories,
    onSelect,
    viewMode,
    onOpenDirectory,
    isSearching,
    isLoading,
    onAddToFavorites,
    onRemoveFromFavorites,
    onAddToIgnore,
    onOpenFolder,
    favorites,
    scrollPosition,
    onScrollPositionChange
}) => {
    const { t } = useTranslation();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; name: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<any>(null);
    const listRef = useRef<any>(null);

    // Restore scroll position when returning from viewer
    useEffect(() => {
        if (scrollPosition > 0) {
            if (viewMode === 'grid' && gridRef.current) {
                gridRef.current.scrollTo({ scrollTop: scrollPosition });
            } else if (viewMode === 'list' && listRef.current) {
                listRef.current.scrollTo(scrollPosition);
            }
        }
    }, [scrollPosition, viewMode]);

    const handleContextMenu = useCallback((e: React.MouseEvent, dir: Subdirectory) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            path: dir.path,
            name: dir.name
        });
    }, []);

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const itemData = useMemo(() => ({
        items: subdirectories,
        onSelect,
        handleContextMenu,
        favorites
    }), [subdirectories, onSelect, handleContextMenu, favorites]);

    if (isLoading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }
    if (subdirectories.length === 0) {
        if (isSearching) {
            return (
                <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('library.noResultsFound')}</p>
                </div>
            );
        }
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{t('library.noFoldersFound')}</p>
                <button
                    onClick={onOpenDirectory}
                    className="open-folder-button"
                    style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
                >
                    {t('library.openFolder')}
                </button>
            </div>
        );
    }

    return (
        <div className="container" ref={containerRef} style={{ padding: 0, height: '100%', overflow: 'hidden' }}>
            <AutoSizer>
                {({ height, width }) => {
                    if (viewMode === 'grid') {
                        const minColumnWidth = 200;
                        const columnCount = Math.max(1, Math.floor(width / minColumnWidth));
                        const columnWidth = width / columnCount;
                        const rowHeight = columnWidth * 1.5; // Aspect ratio 2:3

                        return (
                            <Grid
                                ref={gridRef}
                                key={`grid-${viewMode}`}
                                columnCount={columnCount}
                                columnWidth={columnWidth}
                                height={height}
                                rowCount={Math.ceil(subdirectories.length / columnCount)}
                                rowHeight={rowHeight}
                                width={width}
                                itemData={{ ...itemData, columnCount, columnWidth, rowHeight }}
                                style={{ overflowX: 'hidden' }}
                                initialScrollTop={scrollPosition}
                                onScroll={({ scrollTop }) => onScrollPositionChange(scrollTop)}
                            >
                                {GridCell}
                            </Grid>
                        );
                    } else {
                        return (
                            <List
                                ref={listRef}
                                key={`list-${viewMode}`}
                                height={height}
                                itemCount={subdirectories.length}
                                itemSize={70} // Fixed height for list item
                                width={width}
                                itemData={itemData}
                                style={{ overflowX: 'hidden' }}
                                initialScrollOffset={scrollPosition}
                                onScroll={({ scrollOffset }) => onScrollPositionChange(scrollOffset)}
                            >
                                {ListRow}
                            </List>
                        );
                    }
                }}
            </AutoSizer>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={handleCloseContextMenu}
                    onAddToFavorites={() => onAddToFavorites(contextMenu.path)}
                    onRemoveFromFavorites={() => onRemoveFromFavorites(contextMenu.path)}
                    onAddToIgnore={() => onAddToIgnore(contextMenu.name)}
                    onOpenFolder={() => onOpenFolder(contextMenu.path)}
                    isFavorite={favorites.includes(contextMenu.path)}
                />
            )}
        </div>
    );
};

interface GridCellProps {
    columnIndex: number;
    rowIndex: number;
    style: CSSProperties;
    data: {
        items: Subdirectory[];
        columnCount: number;
        columnWidth: number;
        rowHeight: number;
        onSelect: (path: string, isFile?: boolean) => void;
        handleContextMenu: (e: React.MouseEvent, dir: Subdirectory) => void;
        favorites: string[];
    }
}

const GridCell = React.memo(({ columnIndex, rowIndex, style, data }: GridCellProps) => {
    const index = rowIndex * data.columnCount + columnIndex;
    if (index >= data.items.length) return null;
    const dir = data.items[index];

    return (
        <div style={{ ...style, padding: '1rem' }}>
            <div
                className="card"
                onClick={() => {
                    if (dir.thumbnail || dir.isFile) {
                        data.onSelect(dir.path, dir.isFile);
                    }
                }}
                onContextMenu={(e) => data.handleContextMenu(e, dir)}
                style={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    cursor: (!dir.thumbnail && !dir.isFile) ? 'default' : 'pointer'
                }}
            >
                {data.favorites.includes(dir.path) && (
                    <div style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        color: '#ffd700',
                        fontSize: '1.2rem',
                        textShadow: '0 0 3px rgba(0,0,0,0.5)',
                        zIndex: 10
                    }}>★</div>
                )}
                {dir.thumbnail ? (
                    <img src={`media:///${encodeURIComponent(dir.thumbnail.replace(/\\/g, '/'))}`} alt={dir.name} loading="lazy" />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-surface-hover)',
                        color: 'var(--text-muted)',
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {dir.isFile && dir.path.toLowerCase().endsWith('.pdf') ? (
                            <PdfThumbnail path={dir.path} width={data.columnWidth - 32} />
                        ) : dir.isFile ? (
                            <>
                                <span style={{ fontSize: '2rem' }}>📄</span>
                                <span>File</span>
                            </>
                        ) : (
                            <span>No Image</span>
                        )}
                    </div>
                )}
                <div className="card-title">{dir.name}</div>
            </div>
        </div>
    );
});

interface ListRowProps {
    index: number;
    style: CSSProperties;
    data: {
        items: Subdirectory[];
        onSelect: (path: string, isFile?: boolean) => void;
        handleContextMenu: (e: React.MouseEvent, dir: Subdirectory) => void;
        favorites: string[];
    }
}

const ListRow = React.memo(({ index, style, data }: ListRowProps) => {
    const dir = data.items[index];
    return (
        <div style={{ ...style, padding: '0.25rem 1rem' }}>
            <div
                className="list-item"
                onClick={() => {
                    if (dir.thumbnail || dir.isFile) {
                        data.onSelect(dir.path, dir.isFile);
                    }
                }}
                onContextMenu={(e) => data.handleContextMenu(e, dir)}
                style={{
                    position: 'relative',
                    height: '100%',
                    cursor: (!dir.thumbnail && !dir.isFile) ? 'default' : 'pointer'
                }}
            >
                <svg
                    className="list-item-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="var(--accent-color)"
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                >
                    <path d="M280.74-122.82q-31.81 0-54.87-21.03-23.05-21.03-23.05-52.03v-531.91q0-30.39 20.33-53.49 20.33-23.09 50.95-29.59l341.54-74.31v574.23l-343.31 76.42q-15.13 3.76-26.1 14.14t-10.97 24.6q0 17.73 13.38 29.13 13.39 11.4 32 11.4h444.1v-601.92h32.44v634.36H280.74Zm48.49-156.53 253.98-56.7v-508.78l-253.98 55.07v510.41Zm-32.44 7.98v-510.84l-18.09 3.93q-18.83 3.64-31.14 17.63-12.3 13.99-12.3 32.6v476.65q8.37-5.02 17.73-8.72 9.37-3.7 19.34-6.12l24.46-5.13Zm-61.53-501.55v521.52-521.52Z" />
                </svg>
                <span className="list-item-name">{dir.name}</span>
                {data.favorites.includes(dir.path) && (
                    <span style={{
                        marginLeft: 'auto',
                        color: '#ffd700',
                        fontSize: '1.2rem',
                        marginRight: '10px'
                    }}>★</span>
                )}
            </div>
        </div>
    );
});
