import React, { useEffect, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Document, Page } from 'react-pdf';
import { useTranslation } from 'react-i18next';

interface ReaderProps {
    images: string[];
    pdfPath?: string | null;
    onBack: () => void;
}



interface ReaderProps {
    images: string[];
    pdfPath?: string | null;
    onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ images, pdfPath, onBack }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const [showPageList, setShowPageList] = useState(false);
    const [boundaryFeedback, setBoundaryFeedback] = useState<'first' | 'last' | null>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const controlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const feedbackTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const [imageLoading, setImageLoading] = useState(false);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            controlsTimeoutRef.current = setTimeout(() => {
                if (!showPageList) {
                    setShowControls(false);
                }
            }, 3000);
        };

        window.addEventListener('mousemove', handleMouseMove);
        handleMouseMove(); // Initial show

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [showPageList]);

    const totalPages = pdfPath ? (numPages || 0) : images.length;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (showPageList) {
                if (e.key === 'Escape') {
                    setShowPageList(false);
                }
                return;
            }

            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextPage();
            } else if (e.key === 'ArrowLeft') {
                prevPage();
            } else if (e.key === 'Escape') {
                onBack();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, showPageList, totalPages]);

    const lastWheelTime = React.useRef(0);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (showPageList) return;

            const now = Date.now();
            if (now - lastWheelTime.current < 300) return; // Cooldown

            if (e.deltaY > 0) {
                nextPage();
                lastWheelTime.current = now;
            } else if (e.deltaY < 0) {
                prevPage();
                lastWheelTime.current = now;
            }
        };

        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [currentIndex, showPageList, totalPages]);

    const showBoundaryFeedback = (type: 'first' | 'last') => {
        setBoundaryFeedback(type);
        if (feedbackTimeoutRef.current) {
            clearTimeout(feedbackTimeoutRef.current);
        }
        feedbackTimeoutRef.current = setTimeout(() => {
            setBoundaryFeedback(null);
        }, 1000);
    };

    const nextPage = () => {
        if (currentIndex < totalPages - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            showBoundaryFeedback('last');
        }
    };

    const prevPage = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        } else {
            showBoundaryFeedback('first');
        }
    };

    const handlePageSelect = (index: number) => {
        setCurrentIndex(index);
        setShowPageList(false);
    };

    if (!pdfPath && images.length === 0) {
        return <div className="viewer-container">No images found</div>;
    }

    const PageListCell = ({ columnIndex, rowIndex, style, data }: { columnIndex: number; rowIndex: number; style: CSSProperties; data: { images: string[]; currentIndex: number; columnCount: number; columnWidth: number; pdfPath?: string | null } }) => {
        const index = rowIndex * data.columnCount + columnIndex;
        const total = data.pdfPath ? (numPages || 0) : data.images.length;
        if (index >= total) return null;

        const isActive = index === data.currentIndex;

        return (
            <div style={{ ...style, padding: '0.75rem' }}>
                <div
                    className={`page-list-item ${isActive ? 'active' : ''}`}
                    onClick={() => handlePageSelect(index)}
                    style={{ height: '100%', width: '100%', overflow: 'hidden' }}
                >
                    {data.pdfPath ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', color: '#fff', position: 'relative' }}>
                            <Page
                                pageNumber={index + 1}
                                width={data.columnWidth - 24} // 0.75rem * 2 padding approx 24px
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={<div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>}
                            />
                        </div>
                    ) : (
                        <img
                            src={`media:///${encodeURIComponent(data.images[index].replace(/\\/g, '/'))}`}
                            alt={`Page ${index + 1}`}
                            loading="lazy"
                        />
                    )}
                    <div className="page-number">{index + 1}</div>
                </div>
            </div>
        );
    };

    const content = (
        <>
            <button className="back-button" onClick={onBack}>
                &larr; {t('reader.back')}
            </button>

            <button
                className="page-list-button"
                onClick={() => setShowPageList(!showPageList)}
                title="Page List"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em'
                }}
            >
                {t('reader.index')}
            </button>

            <button className="nav-button nav-prev" onClick={prevPage} disabled={showPageList}>
                &lt;
            </button>

            {pdfPath ? (
                <div className="viewer-image-container" onClick={(e) => {
                    if (showPageList) return;
                    const width = e.currentTarget.clientWidth;
                    const clickX = e.nativeEvent.offsetX;
                    if (clickX > width / 2) {
                        nextPage();
                    } else {
                        prevPage();
                    }
                }}>
                    <Page
                        pageNumber={currentIndex + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        height={window.innerHeight}
                        className="pdf-page"
                        loading={<div className="loading-spinner"></div>}
                    />
                </div>
            ) : (
                <>
                    {imageLoading && <div className="loading-spinner"></div>}
                    <img
                        ref={(img) => {
                            // Handle case where image is already cached
                            if (img && img.complete) {
                                setImageLoading(false);
                            }
                        }}
                        src={`media:///${encodeURIComponent(images[currentIndex].replace(/\\/g, '/'))}`}
                        alt={`Page ${currentIndex + 1}`}
                        className="viewer-image"
                        style={{ display: imageLoading ? 'none' : 'block' }}
                        onLoadStart={() => setImageLoading(true)}
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                            console.error('Reader image load error:', images[currentIndex], e);
                            setImageLoading(false);
                        }}
                        onClick={(e) => {
                            if (showPageList) return;
                            // 画面の右半分をクリックで次へ、左半分で前へ
                            const width = e.currentTarget.clientWidth;
                            const clickX = e.nativeEvent.offsetX;
                            if (clickX > width / 2) {
                                nextPage();
                            } else {
                                prevPage();
                            }
                        }}
                    />
                </>
            )}

            <button className="nav-button nav-next" onClick={nextPage} disabled={showPageList}>
                &gt;
            </button>

            <div className="viewer-footer">
                <div className="progress-container">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentIndex + 1) / totalPages) * 100}%` }}
                    />
                </div>
            </div>

            {boundaryFeedback && (
                <div className="boundary-feedback">
                    {boundaryFeedback === 'first' ? t('reader.firstPage') : t('reader.lastPage')}
                </div>
            )}

            {showPageList && (
                <div className="page-list-overlay" onClick={() => setShowPageList(false)}>
                    <button
                        className="page-list-close-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPageList(false);
                        }}
                        title="Close"
                    >
                        ×
                    </button>
                    <div style={{ width: '100%', height: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <AutoSizer>
                            {({ height, width }) => {
                                const columnCount = 8;
                                const columnWidth = width / columnCount;
                                const rowHeight = columnWidth * 1.5; // Aspect ratio 2:3

                                return (
                                    <Grid
                                        columnCount={columnCount}
                                        columnWidth={columnWidth}
                                        height={height}
                                        rowCount={Math.ceil(totalPages / columnCount)}
                                        rowHeight={rowHeight}
                                        width={width}
                                        itemData={{ images, currentIndex, columnCount, columnWidth, pdfPath }}
                                        style={{ overflowX: 'hidden' }}
                                    >
                                        {PageListCell}
                                    </Grid>
                                );
                            }}
                        </AutoSizer>
                    </div>
                </div>
            )}
        </>
    );

    if (pdfPath) {
        return (
            <Document
                file={`media:///${encodeURIComponent(pdfPath.replace(/\\/g, '/'))}`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="loading-spinner"></div>}
                className={`viewer-container ${showControls || showPageList ? 'ui-visible' : ''}`}
                options={{
                    cMapUrl: window.location.protocol === 'file:' ? './cmaps/' : '/cmaps/',
                    cMapPacked: true,
                    standardFontDataUrl: window.location.protocol === 'file:' ? './standard_fonts/' : '/standard_fonts/',
                }}
            >
                {content}
            </Document>
        );
    }

    return (
        <div className={`viewer-container ${showControls || showPageList ? 'ui-visible' : ''}`}>
            {content}
        </div>
    );
};
