
import React, { useState } from 'react';
import { ActionName, CharacterData, LogEntry } from '../config';

// Constants for limits
const REMOVE_LIMIT = 5;
const COPY_LIMIT = 4;

interface ManualAdjustmentModalProps {
    character: CharacterData;
    actionOrder: ActionName[];
    onCountChange: (charId: string, actionName: ActionName, count: number) => void;
    isManualInputLocked: boolean;
    logs: LogEntry[];
}

interface ActionInputProps {
    charId: string;
    actionName: ActionName;
    count: number;
    onCountChange: (charId: string, actionName: ActionName, count: number) => void;
    disabled: boolean;
    isIncrementDisabled?: boolean;
}

const ActionInput: React.FC<ActionInputProps> = ({ charId, actionName, count, onCountChange, disabled, isIncrementDisabled }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const value = parseInt(e.target.value, 10);
        onCountChange(charId, actionName, isNaN(value) ? 0 : value);
    };

    const handleIncrement = () => {
        if (!disabled && !isIncrementDisabled) onCountChange(charId, actionName, count + 1);
    }
    
    const handleDecrement = () => {
        if (!disabled && count > 0) {
            onCountChange(charId, actionName, count - 1);
        }
    };

    return (
        <div className={`flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 h-full select-none ${
            disabled 
                ? 'bg-gray-50/80 dark:bg-slate-800/40 border-gray-100 dark:border-slate-700/50 opacity-80' 
                : 'bg-white dark:bg-slate-700/40 border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50'
        }`}>
            {/* Label Area - Flex grow handles vertical alignment, centering label in available space */}
            <div className="flex items-center justify-center flex-grow min-h-[2rem] mb-2">
                <label 
                    htmlFor={`${charId}-${actionName}`} 
                    className="text-sm font-bold text-gray-700 dark:text-gray-200 text-center leading-tight break-words cursor-pointer select-none" 
                    title={actionName}
                >
                    {actionName}
                </label>
            </div>
            
            {/* Unified Stepper Control - Buttons and Input joined together */}
            <div className={`flex items-center w-full rounded-lg border overflow-hidden transition-colors ${
                disabled
                    ? 'bg-gray-100 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-500 hover:border-indigo-400 dark:hover:border-indigo-400'
            }`}>
                <button type="button" onClick={handleDecrement} disabled={disabled}
                    className="w-10 h-9 flex items-center justify-center text-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-r border-gray-200 dark:border-slate-600/50 active:bg-indigo-100 dark:active:bg-slate-600 flex-shrink-0">
                    &minus;
                </button>
                <input 
                    type="number" 
                    id={`${charId}-${actionName}`}
                    value={count} 
                    onChange={handleInputChange}
                    disabled={disabled}
                    className="flex-1 w-full min-w-0 h-9 text-center bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-100 font-bold font-mono text-base p-0 disabled:text-gray-500"
                />
                <button type="button" onClick={handleIncrement} disabled={disabled || isIncrementDisabled}
                    className={`w-10 h-9 flex items-center justify-center text-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-l border-gray-200 dark:border-slate-600/50 active:bg-indigo-100 dark:active:bg-slate-600 flex-shrink-0 ${
                        isIncrementDisabled ? 'bg-gray-100 dark:bg-slate-800 cursor-not-allowed' : ''
                    }`}>
                    +
                </button>
            </div>
        </div>
    );
};

const ManualAdjustmentModal: React.FC<ManualAdjustmentModalProps> = ({ 
    character, 
    actionOrder, 
    onCountChange, 
    isManualInputLocked,
    logs
}) => {
    // 預設顯示操作紀錄
    const [activeTab, setActiveTab] = useState<'logs' | 'values'>('logs');

    // 計算當前累積數量
    const totalRemoveCount = (character.counts['一般移除'] || 0) + (character.counts['移除起始卡'] || 0);
    const totalCopyCount = character.counts['複製卡片'] || 0;

    // 檢查是否應該禁用增加按鈕
    const checkIncrementDisabled = (actionName: ActionName) => {
        // 移除類動作
        if (actionName === '一般移除' || actionName === '移除起始卡') {
            return totalRemoveCount >= REMOVE_LIMIT;
        }
        // 複製類動作
        if (actionName === '複製卡片') {
            return totalCopyCount >= COPY_LIMIT;
        }
        return false;
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="w-full rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 flex flex-col shadow-inner overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-slate-800/50">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                        activeTab === 'logs'
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                    }`}
                >
                    操作紀錄
                </button>
                <button
                    onClick={() => setActiveTab('values')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                        activeTab === 'values'
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                    }`}
                >
                    數值調整
                </button>
            </div>

            {/* Content Area */}
            <div className={`p-3 sm:p-4 ${activeTab === 'logs' ? 'max-h-[350px] overflow-y-auto custom-scrollbar' : ''}`}>
                {activeTab === 'values' ? (
                    <>
                        {isManualInputLocked && (
                            <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs sm:text-sm text-amber-700 dark:text-amber-400 flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="flex-1 leading-snug">
                                    手動輸入已鎖定 <span className="opacity-80 ml-1">請至「全局設定」解鎖。</span>
                                </span>
                            </div>
                        )}
                        {/* Grid layout for ActionInputs - Auto rows ensure equal height */}
                        {/* Fixed 2 columns as requested */}
                        <div className="grid grid-cols-2 gap-3">
                            {actionOrder.map(actionName => (
                                <ActionInput
                                    key={actionName}
                                    charId={character.id}
                                    actionName={actionName}
                                    count={character.counts[actionName]}
                                    onCountChange={onCountChange}
                                    disabled={isManualInputLocked}
                                    isIncrementDisabled={checkIncrementDisabled(actionName)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <div className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">
                                尚無操作紀錄
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2 space-y-5 py-1">
                                {logs.map((log) => (
                                    <div key={log.id} className="relative pl-5">
                                        <span className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 ${
                                            log.actionType.includes('刪除') ? 'bg-red-500' :
                                            log.actionType.includes('複製') ? 'bg-blue-500' :
                                            log.actionType.includes('轉化') ? 'bg-purple-500' :
                                            log.actionType.includes('獲得') ? 'bg-emerald-500' :
                                            'bg-gray-400'
                                        }`}></span>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase">
                                                    {formatTime(log.timestamp)}
                                                </span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-gray-300">
                                                    {log.actionType}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-snug">
                                                {log.description}
                                            </div>
                                            {log.details && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                    {log.details}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualAdjustmentModal;
