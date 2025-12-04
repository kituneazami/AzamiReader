import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    ignoredPatterns: string[];
    onUpdateIgnoredPatterns: (patterns: string[]) => void;
    onReset: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, ignoredPatterns, onUpdateIgnoredPatterns, onReset }) => {
    const [newPattern, setNewPattern] = useState('');
    const { t, i18n } = useTranslation();

    if (!isOpen) return null;

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the app? This will clear all settings and history.')) {
            onReset();
        }
    };

    const handleAddPattern = () => {
        if (newPattern && !ignoredPatterns.includes(newPattern)) {
            onUpdateIgnoredPatterns([...ignoredPatterns, newPattern]);
            setNewPattern('');
        }
    };

    const handleRemovePattern = (patternToRemove: string) => {
        onUpdateIgnoredPatterns(ignoredPatterns.filter(p => p !== patternToRemove));
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = event.target.value;
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{t('settings.title')}</h2>
                    <button onClick={onClose} className="close-button"></button>
                </div>

                <div className="settings-section">
                    <h3>{t('settings.language')}</h3>
                    <select
                        value={i18n.language}
                        onChange={handleLanguageChange}
                        className="settings-input"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-surface)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                    <h3>{t('settings.ignoreList')}</h3>
                    <p className="settings-description">{t('settings.ignoreDescription')}</p>

                    <div className="input-group">
                        <input
                            type="text"
                            value={newPattern}
                            onChange={(e) => setNewPattern(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddPattern();
                                }
                            }}
                            placeholder={t('settings.placeholder')}
                            className="settings-input"
                        />
                        <button onClick={handleAddPattern} className="add-button">{t('settings.addPattern')}</button>
                    </div>

                    <ul className="ignored-list">
                        {ignoredPatterns.map((pattern) => (
                            <li key={pattern} className="ignored-item">
                                <span>{pattern}</span>
                                <button onClick={() => handleRemovePattern(pattern)} className="remove-button">{t('settings.remove')}</button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="settings-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <h3 style={{ color: '#ff6b6b' }}>{t('settings.dangerZone')}</h3>
                    <button
                        onClick={handleReset}
                        className="reset-button"
                        style={{
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            color: '#ff6b6b',
                            border: '1px solid #ff6b6b',
                            width: '100%'
                        }}
                    >
                        {t('settings.resetApp')}
                    </button>
                </div>
            </div>
        </div>
    );
};
