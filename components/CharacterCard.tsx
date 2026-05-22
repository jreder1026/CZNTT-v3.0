
import React, { useState } from 'react';
import { CharacterData, ActionName, OperationType, LogEntry } from '../config';
import ActionOperationModal from './ActionOperationModal';
import ManualAdjustmentModal from './ManualAdjustmentModal';

interface CharacterCardProps {
    character: CharacterData;
    totalScore: number;
    maxLimit: number;
    onCountChange: (charId: string, actionName: ActionName, count: number) => void;
    onBatchCountChange: (charId: string, updates: { action: ActionName, delta: number }[], opType?: OperationType, logDetail?: string) => void;
    onNameChange: (charId: string, name: string) => void;
    onResetCharacter: (charId: string, name: string) => void;
    actionOrder: ActionName[];
    quickActionOrder: OperationType[];
    isManualInputLocked: boolean;
    logs: LogEntry[];
}

const REMOVE_LIMIT = 5;
const COPY_LIMIT = 3;

const CharacterCard: React.FC<CharacterCardProps> = ({ character, totalScore, maxLimit, onCountChange, onBatchCountChange, onNameChange, onResetCharacter, actionOrder, quickActionOrder, isManualInputLocked, logs }) => {
    // 預設展開詳細資訊
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeOperation, setActiveOperation] = useState<OperationType | null>(null);
    
    const isOverLimit = totalScore > maxLimit;
    const remaining = maxLimit - totalScore;
    const percentage = Math.min(100, (totalScore / maxLimit) * 100);

    // Calculate current counts for limits
    // 修改：移除次數 = 一般移除 + 移除起始卡
    const removeCount = (character.counts['一般移除'] || 0) + (character.counts['移除起始卡'] || 0);
    const copyCount = character.counts['複製卡片'] || 0;

    const handleOperationClick = (type: OperationType) => {
        setActiveOperation(type);
    };

    const handleOperationConfirm = (updates: { action: ActionName; delta: number }[], logDetail?: string) => {
        if (activeOperation) {
            onBatchCountChange(character.id, updates, activeOperation, logDetail);
        }
    };

    // Helper for consistent button styling - Minimalist Theme
    const getActionButtonClass = (isDisabled: boolean = false) => {
        let baseClass = "flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/30 text-gray-700 dark:text-gray-300 transition-all duration-200 shadow-sm h-[4.5rem] group relative ";
        
        if (isDisabled) {
            return baseClass + "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-800 grayscale";
        }
        
        return baseClass + "active:scale-95 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-700 dark:hover:text-indigo-300";
    };

    const renderButton = (type: OperationType) => {
        switch (type) {
            case 'DELETE':
                const isDeleteDisabled = removeCount >= REMOVE_LIMIT;
                return (
                    <button 
                        key="DELETE" 
                        onClick={() => !isDeleteDisabled && handleOperationClick('DELETE')} 
                        disabled={isDeleteDisabled}
                        className={getActionButtonClass(isDeleteDisabled)}
                    >
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-lg leading-tight">移除</span>
                            <span className={`text-sm font-bold ${isDeleteDisabled ? 'text-red-500 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                ({removeCount}/{REMOVE_LIMIT})
                            </span>
                        </div>
                        <span className="text-xs opacity-70 font-medium group-hover:opacity-100 transition-opacity">
                            {isDeleteDisabled ? '已達上限' : '起始/一般/複製'}
                        </span>
                    </button>
                );
            case 'COPY':
                const isCopyDisabled = copyCount >= COPY_LIMIT;
                return (
                    <button 
                        key="COPY" 
                        onClick={() => !isCopyDisabled && handleOperationClick('COPY')} 
                        disabled={isCopyDisabled}
                        className={getActionButtonClass(isCopyDisabled)}
                    >
                         <div className="flex items-center gap-1.5">
                            <span className="font-bold text-lg leading-tight">複製</span>
                            <span className={`text-sm font-bold ${isCopyDisabled ? 'text-red-500 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                ({copyCount}/{COPY_LIMIT})
                            </span>
                        </div>
                    </button>
                );
            case 'TRANSFORM':
                // 轉化也算作一次移除，故受移除上限限制
                const isTransformDisabled = removeCount >= REMOVE_LIMIT;
                return (
                    <button 
                        key="TRANSFORM" 
                        onClick={() => !isTransformDisabled && handleOperationClick('TRANSFORM')} 
                        disabled={isTransformDisabled}
                        className={getActionButtonClass(isTransformDisabled)}
                    >
                        <span className="font-bold text-lg leading-tight">轉化</span>
                        <span className="text-xs opacity-70 font-medium group-hover:opacity-100 transition-opacity">
                            {isTransformDisabled ? '移除上限' : '移除並獲得中立'}
                        </span>
                    </button>
                );
            case 'ADD':
                return (
                    <button key="ADD" onClick={() => handleOperationClick('ADD')} className={getActionButtonClass()}>
                        <span className="font-bold text-lg leading-tight">獲得</span>
                        <span className="text-xs opacity-70 font-medium group-hover:opacity-100 transition-opacity">卡片 / 神閃 / 重鑄</span>
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="card bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl flex flex-col transition-colors duration-300 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 gap-4">
                <input 
                    type="text" 
                    value={character.name}
                    onChange={(e) => onNameChange(character.id, e.target.value)}
                    placeholder="輸入角色名稱"
                    className="name-input text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 border-b-2 focus:border-indigo-500 w-full p-0 transition duration-150 bg-transparent"
                />
                <button type="button" onClick={() => onResetCharacter(character.id, character.name)}
                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-red-500 dark:bg-red-600/80 rounded-lg hover:bg-red-600 dark:hover:bg-red-600 transition duration-150 active:scale-95 flex-shrink-0 shadow">
                    重置
                </button>
            </div>

            {/* Progress Bar Score Status */}
            <div className="mb-5 px-1">
                <div className="flex justify-between items-end mb-1.5">
                    <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                        累計 <span className="text-base">{totalScore}</span> <span className="text-xs font-normal text-gray-500">pt</span>
                    </span>
                    <span className="text-xs font-medium">
                        {remaining >= 0 ? (
                            <span className="text-gray-500 dark:text-gray-400">剩餘 {remaining} pt</span>
                        ) : (
                            <span className="text-red-500 dark:text-red-400">超過 {Math.abs(remaining)} pt</span>
                        )}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isOverLimit
                                ? 'bg-red-500 dark:bg-red-500' // Over limit color
                                : 'bg-indigo-500 dark:bg-indigo-500' // Unified Theme Color
                        }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            {/* Quick Actions - Dynamic Order */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {quickActionOrder.map(type => renderButton(type))}
            </div>

            {/* Manual Adjustment Toggle Button */}
            <div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center justify-center w-full py-3 px-4 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                        isExpanded 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-700/50' 
                            : 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 mr-2 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span>詳細數據 / 操作紀錄</span>
                    {isManualInputLocked && !isExpanded && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded">
                            已鎖定
                        </span>
                    )}
                </button>
            </div>

            {/* Collapsible Manual Adjustment Section */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                <ManualAdjustmentModal
                    character={character}
                    actionOrder={actionOrder}
                    onCountChange={onCountChange}
                    isManualInputLocked={isManualInputLocked}
                    logs={logs}
                />
            </div>

            {/* Modals */}
            <ActionOperationModal 
                isOpen={!!activeOperation}
                operationType={activeOperation}
                currentCounts={character.counts}
                onClose={() => setActiveOperation(null)}
                onConfirm={handleOperationConfirm}
            />
        </div>
    );
};

export default CharacterCard;
