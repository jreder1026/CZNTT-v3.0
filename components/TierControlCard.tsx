import React, { useState } from 'react';
import { MIN_TIER, MAX_TIER } from '../config';
import InfoModal from './InfoModal';

interface TierControlCardProps {
    tier: number;
    maxLimit: number;
    onTierChange: (tier: number) => void;
    onResetAll: () => void;
    isConfirmationEnabled: boolean;
    onConfirmationToggle: () => void;
    isDarkMode: boolean;
    onThemeToggle: () => void;
    onUndo: () => void;
    canUndo: boolean;
    isManualInputLocked: boolean;
    onToggleLock: () => void;
    onOpenSort: () => void;
}

const TierControlCard: React.FC<TierControlCardProps> = ({ 
    tier, 
    maxLimit, 
    onTierChange, 
    onResetAll, 
    isConfirmationEnabled, 
    onConfirmationToggle, 
    isDarkMode, 
    onThemeToggle,
    onUndo,
    canUndo,
    isManualInputLocked,
    onToggleLock,
    onOpenSort
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Default to collapsed

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? MIN_TIER : parseInt(e.target.value, 10);
        onTierChange(value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (isNaN(value) || value < MIN_TIER) {
            onTierChange(MIN_TIER);
        } else if (value > MAX_TIER) {
            onTierChange(MAX_TIER);
        }
    };
    
    const handleIncrement = () => {
        if (tier < MAX_TIER) onTierChange(tier + 1);
    };

    const handleDecrement = () => {
        if (tier > MIN_TIER) onTierChange(tier - 1);
    };

    // Prevent the accordion from toggling when clicking input controls
    const stopPropagation = (e: React.MouseEvent | React.ChangeEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <div className="card bg-white dark:bg-slate-800 p-6 rounded-xl mb-8 border-t-4 border-indigo-500 transition-colors duration-300">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                    {/* Left Side: Toggle Button & Title */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-expanded={isOpen}
                        aria-controls="global-settings-content"
                        className="flex items-center gap-2 text-left flex-shrink-0 mr-auto group"
                    >
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">全局設定</span>
                        
                        {/* Mobile Only: Simple Text Summary when collapsed */}
                        {!isOpen && (
                            <span className="md:hidden text-lg font-bold text-indigo-600 dark:text-indigo-400 animate-pulse ml-1">
                                TIER {tier}
                            </span>
                        )}

                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Desktop Only: Interactive TIER Control when collapsed */}
                    {!isOpen && (
                        <div className="hidden md:flex items-center gap-3 mr-auto ml-4 animate-fadeIn px-4 border-l border-gray-200 dark:border-gray-700 h-8">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">TIER</span>
                                <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-0.5 border border-gray-200 dark:border-slate-600">
                                    <button 
                                        type="button" 
                                        onClick={(e) => { stopPropagation(e); handleDecrement(); }}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 rounded shadow-sm transition-colors"
                                    >
                                        &minus;
                                    </button>
                                    <input 
                                        type="number" 
                                        value={tier} 
                                        min={MIN_TIER} 
                                        max={MAX_TIER}
                                        onClick={stopPropagation}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        className="w-10 text-center bg-transparent border-none p-0 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:ring-0 appearance-none"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={(e) => { stopPropagation(e); handleIncrement(); }}
                                        className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-600 rounded shadow-sm transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <span>上限:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">{maxLimit} pt</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {/* Undo Button */}
                        <button
                            type="button"
                            onClick={onUndo}
                            disabled={!canUndo}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition duration-150 active:scale-95 flex-shrink-0 shadow-sm ${
                                canUndo 
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-slate-700/50 border-indigo-200 dark:border-slate-600 hover:bg-indigo-100 dark:hover:bg-slate-600' 
                                : 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 cursor-not-allowed'
                            }`}
                            aria-label="撤銷上一步"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                            <span className="hidden sm:inline">撤銷</span>
                        </button>

                        {/* Lock/Unlock Button */}
                         <button
                            type="button"
                            onClick={onToggleLock}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition duration-150 active:scale-95 flex-shrink-0 shadow-sm ${
                                isManualInputLocked
                                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                    : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                            }`}
                            aria-label={isManualInputLocked ? "解鎖手動輸入" : "鎖定手動輸入"}
                        >
                            {isManualInputLocked ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span className="hidden sm:inline">鎖定</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                    </svg>
                                    <span className="hidden sm:inline">解鎖</span>
                                </>
                            )}
                        </button>

                        {/* Info Button */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-500 dark:bg-indigo-600/80 rounded-lg hover:bg-indigo-600 dark:hover:bg-indigo-600 transition duration-150 active:scale-95 flex-shrink-0 shadow"
                            aria-label="顯示計分說明"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">說明</span>
                        </button>

                        {/* Reset All Button */}
                        <button
                            type="button"
                            onClick={onResetAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 dark:bg-red-600/80 rounded-lg hover:bg-red-600 dark:hover:bg-red-600 transition duration-150 active:scale-95 flex-shrink-0 shadow"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                             <span className="hidden sm:inline">全部重置</span>
                        </button>
                    </div>
                </div>
                
                <div
                    id="global-settings-content"
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] pt-4 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="flex flex-col">
                            <label htmlFor="tier-input" className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                存檔資料價值 <span className="text-red-500">(TIER)</span>
                            </label>
                            <div className="flex items-center space-x-2">
                                <button type="button" onClick={handleDecrement} 
                                        className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600/50 transition duration-150 text-2xl font-bold p-1 leading-none active:scale-95">
                                        &minus;
                                </button>
                                <input 
                                    type="number" 
                                    id="tier-input" 
                                    value={tier} 
                                    min={MIN_TIER} 
                                    max={MAX_TIER}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    className="flex-1 min-w-[4rem] p-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 border-2 border-indigo-300 dark:border-slate-600 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 text-lg font-semibold text-center transition duration-150 ease-in-out"
                                />
                                <button type="button" onClick={handleIncrement} 
                                        className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-700/50 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600/50 transition duration-150 text-2xl font-bold p-1 leading-none active:scale-95">
                                        +
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">基礎 30pt，每 1 階多 10pt。</p>
                        </div>

                        <div className="p-4 bg-indigo-50 dark:bg-slate-900/50 rounded-lg text-center h-full flex flex-col justify-center">
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">階級分數上限</p>
                            <p id="max-limit" className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-200 mt-1">{maxLimit} pt</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                         {/* Sort Order Button Row */}
                         <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-700 dark:text-gray-300">
                                    操作介面排序
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">自訂操作按鈕與數值欄位的顯示順序。</p>
                            </div>
                            <button
                                type="button"
                                onClick={onOpenSort}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-700/50 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600/50 transition duration-150 active:scale-95 flex-shrink-0 shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                設定
                            </button>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label htmlFor="confirm-toggle" className="font-medium text-gray-700 dark:text-gray-300">
                                    重置前確認
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">啟用後，執行重置操作前會彈出確認視窗。</p>
                            </div>
                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="confirm-toggle"
                                    id="confirm-toggle"
                                    checked={isConfirmationEnabled}
                                    onChange={onConfirmationToggle}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                />
                                <label htmlFor="confirm-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-slate-600 cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <label htmlFor="theme-toggle" className="font-medium text-gray-700 dark:text-gray-300">
                                    深色模式
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">切換至適合低光源環境的介面主題。</p>
                            </div>
                            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    name="theme-toggle"
                                    id="theme-toggle"
                                    checked={isDarkMode}
                                    onChange={onThemeToggle}
                                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                />
                                <label htmlFor="theme-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-slate-600 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && <InfoModal onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default TierControlCard;