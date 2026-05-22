
import React, { useState, useEffect } from 'react';
import { ActionName, ACTION_NAMES, OperationType, OPERATION_LABELS } from '../config';
import { useModalEffects } from '../hooks/useModalEffects';

interface SortOrderModalProps {
    isOpen: boolean;
    currentActionOrder: ActionName[];
    currentQuickOrder: OperationType[];
    onClose: () => void;
    onSave: (newActionOrder: ActionName[], newQuickOrder: OperationType[]) => void;
}

const SortOrderModal: React.FC<SortOrderModalProps> = ({ isOpen, currentActionOrder, currentQuickOrder, onClose, onSave }) => {
    const [localActionOrder, setLocalActionOrder] = useState<ActionName[]>(currentActionOrder);
    const [localQuickOrder, setLocalQuickOrder] = useState<OperationType[]>(currentQuickOrder);
    
    useModalEffects(isOpen, onClose, 'sort-modal-content');

    useEffect(() => {
        if (isOpen) {
            setLocalActionOrder(currentActionOrder);
            setLocalQuickOrder(currentQuickOrder);
        }
    }, [isOpen, currentActionOrder, currentQuickOrder]);

    // Generic move function
    const moveItem = <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, index: number, direction: 'up' | 'down') => {
        const newOrder = [...list];
        if (direction === 'up' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'down' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setList(newOrder);
    };

    const handleReset = () => {
        setLocalActionOrder([...ACTION_NAMES]);
        setLocalQuickOrder(['DELETE', 'COPY', 'TRANSFORM', 'ADD']);
    };

    if (!isOpen) return null;

    // Generic List Render Component
    const renderSortList = <T extends string>(
        items: T[], 
        setItems: React.Dispatch<React.SetStateAction<T[]>>,
        getLabel: (item: T) => string,
        keyPrefix: string
    ) => (
        <ul className="grid grid-cols-2 gap-2">
            {items.map((item, index) => (
                <li key={`${keyPrefix}-${item}`} className="flex flex-col justify-between bg-gray-50 dark:bg-slate-700/40 p-2 rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm transition-colors duration-200">
                     <div className="flex items-center justify-center mb-1">
                        <span className="text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base leading-tight text-center">
                            {getLabel(item)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 bg-white dark:bg-slate-800/50 rounded-md p-1 border border-gray-100 dark:border-slate-600">
                        <button 
                            onClick={() => moveItem(items, setItems, index, 'up')}
                            disabled={index === 0}
                            className="flex-1 flex justify-center items-center py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600/50 disabled:opacity-20 disabled:cursor-not-allowed text-indigo-600 dark:text-indigo-400 transition-colors"
                            title="向前/向上移動"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="w-px h-3 bg-gray-200 dark:bg-slate-600"></div>
                        <button 
                            onClick={() => moveItem(items, setItems, index, 'down')}
                            disabled={index === items.length - 1}
                            className="flex-1 flex justify-center items-center py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-600/50 disabled:opacity-20 disabled:cursor-not-allowed text-indigo-600 dark:text-indigo-400 transition-colors"
                            title="向後/向下移動"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10 4.293 14.293a1 1 0 000 1.414zm6 0a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                id="sort-modal-content"
                className="card bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out opacity-0 scale-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">設定操作順序</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto flex-grow pr-1 space-y-6">
                    {/* Quick Actions Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                            快捷操作按鈕
                        </h3>
                        {renderSortList(
                            localQuickOrder, 
                            setLocalQuickOrder, 
                            (item) => OPERATION_LABELS[item], 
                            'quick'
                        )}
                    </section>

                    {/* Detailed Actions Section */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 pb-1">
                            詳細數據欄位
                        </h3>
                         {renderSortList(
                            localActionOrder, 
                            setLocalActionOrder, 
                            (item) => item, 
                            'action'
                        )}
                    </section>
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 z-10 flex-shrink-0">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:underline"
                    >
                        恢復預設
                    </button>
                    <div className="flex space-x-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600/50 transition-colors active:scale-95"
                        >
                            取消
                        </button>
                        <button 
                            onClick={() => onSave(localActionOrder, localQuickOrder)}
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-700/80 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm active:scale-95"
                        >
                            儲存變更
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortOrderModal;
