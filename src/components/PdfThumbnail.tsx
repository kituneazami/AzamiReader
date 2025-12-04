import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { ErrorBoundary } from './ErrorBoundary';

import { pdfOptions } from '../constants';

interface PdfThumbnailProps {
    path: string;
    height?: number;
    width?: number;
}

const PdfThumbnailContent: React.FC<PdfThumbnailProps> = ({ path, height, width }) => {
    const [error, setError] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);
    const handleError = useCallback(() => setError(true), []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldLoad(true);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [path]);

    if (error) {
        return (
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
                <span style={{ fontSize: '2rem' }}>📄</span>
                <span>PDF</span>
            </div>
        );
    }

    if (!shouldLoad) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff' }}>
            <Document
                file={`media:///${encodeURIComponent(path.replace(/\\/g, '/'))}`}
                onLoadError={handleError}
                loading={<div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>}
                className="pdf-thumbnail-document"
                options={pdfOptions}
            >
                <Page
                    pageNumber={1}
                    height={height}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="pdf-thumbnail-page"
                />
            </Document>
        </div>
    );
};

export const PdfThumbnail: React.FC<PdfThumbnailProps> = (props) => {
    return (
        <ErrorBoundary fallback={
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
                <span style={{ fontSize: '2rem' }}>📄</span>
                <span>PDF</span>
            </div>
        }>
            <PdfThumbnailContent {...props} />
        </ErrorBoundary>
    );
};
