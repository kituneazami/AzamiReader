import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import starIcon from '../assets/icons/star.svg';
import ignoreIcon from '../assets/icons/do_not_disturb_on.svg';
import folderOpenIcon from '../assets/icons/folder_open.svg';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onAddToFavorites: () => void;
    onRemoveFromFavorites: () => void;
    onAddToIgnore: () => void;
    onOpenFolder: () => void;
    isFavorite: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    onClose,
    onAddToFavorites,
    onRemoveFromFavorites,
    onAddToIgnore,
    onOpenFolder,
    isFavorite
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: y,
                left: x,
                backgroundColor: '#2d2d2d',
                border: '1px solid #444',
                borderRadius: '4px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                zIndex: 1000,
                minWidth: '150px',
                overflow: 'hidden',
            }}
        >
            <div
                className="context-menu-item"
                onClick={() => {
                    if (isFavorite) {
                        onRemoveFromFavorites();
                    } else {
                        onAddToFavorites();
                    }
                    onClose();
                }}
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid #444',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d3d3d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <img
                    src={starIcon}
                    alt="favorite"
                    style={{
                        width: '16px',
                        height: '16px',
                        filter: isFavorite ? 'brightness(0) saturate(100%) invert(74%) sepia(96%) saturate(1832%) hue-rotate(355deg) brightness(102%) contrast(107%)' : 'none'
                    }}
                />
                <span>{isFavorite ? t('contextMenu.removeFromFavorites') : t('contextMenu.addToFavorites')}</span>
            </div>

            <div
                className="context-menu-item"
                onClick={() => {
                    onAddToIgnore();
                    onClose();
                }}
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid #444',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d3d3d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <img src={ignoreIcon} alt="ignore" style={{ width: '16px', height: '16px' }} />
                <span>{t('contextMenu.addToIgnore')}</span>
            </div>

            <div
                className="context-menu-item"
                onClick={() => {
                    onOpenFolder();
                    onClose();
                }}
                style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    color: '#e0e0e0',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3d3d3d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <img src={folderOpenIcon} alt="open folder" style={{ width: '16px', height: '16px' }} />
                <span>{t('contextMenu.openFolder')}</span>
            </div>
        </div>
    );
};
