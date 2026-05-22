
import React, { useState, useEffect } from 'react';
import { ActionName, OperationType } from '../config';
import { useModalEffects } from '../hooks/useModalEffects';

interface ActionOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    operationType: OperationType | null;
    currentCounts: Record<ActionName, number>;
    onConfirm: (updates: { action: ActionName; delta: number }[], logDetail?: string) => void;
}

// Section Wrapper Component for visual distinction - Compact Version
const SectionWrapper: React.FC<{ title: string, children: React.ReactNode, borderColor?: string }> = ({ title, children, borderColor }) => (
    <div className="bg-gray-50 dark:bg-slate-700/30 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700 space-y-2">
        <h4 className={`text-xs font-bold text-gray-700 dark:text-gray-300 border-l-4 ${borderColor || 'border-indigo-500'} pl-2 leading-none`}>
            {title}
        </h4>
        {children}
    </div>
);

const ActionOperationModal: React.FC<ActionOperationModalProps> = ({ isOpen, onClose, operationType, currentCounts, onConfirm }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    useModalEffects(isOpen, onClose, 'action-operation-modal');

    useEffect(() => {
        if (isOpen) {
            setErrorMessage(null);
        }
    }, [isOpen]);

    if (!isOpen || !operationType) return null;

    const getTitle = () => {
        switch (operationType) {
            case 'DELETE': return '執行移除';
            case 'COPY': return '執行複製';
            case 'TRANSFORM': return '執行轉化';
            case 'ADD': return '獲得卡片 / 資源';
            default: return '';
        }
    };

    const getDescription = () => {
        switch (operationType) {
            case 'DELETE': return '選擇要移除的卡片類型。移除起始卡+20pt。移除其他卡片會增加移除次數，並扣除對應卡片的分數（若有）。';
            case 'COPY': return '選擇複製對象。複製會增加「複製卡片」次數 (首2張免費，之後+40pt)。複製中立卡與怪物卡時會同時獲得該卡片。';
            case 'TRANSFORM': return '轉化視同「移除」並同時「獲得」一張中立卡(+20pt)。請選擇來源卡片類型。';
            case 'ADD': return '新增卡片或特殊計分項目。所有卡片普閃不計分，神閃統一+20pt。';
            default: return '';
        }
    };

    // Helper to generate updates based on selection
    const getUpdates = (category: string): { action: ActionName; delta: number }[] => {
        
        // --- ADD 獲得 ---
        if (operationType === 'ADD') {
            switch (category) {
                case 'NEUTRAL': return [{ action: '中立卡', delta: 1 }];
                case 'TABOO': return [{ action: '賽季卡', delta: 1 }];
                case 'REFORGE': return [{ action: '重鑄_神之錘', delta: 1 }];
                
                case 'MONSTER_NORMAL': return [{ action: '怪物卡_一般', delta: 1 }];
                case 'MONSTER_RARE': return [{ action: '怪物卡_稀有', delta: 1 }];
                case 'MONSTER_LEGEND': return [{ action: '怪物卡_傳說', delta: 1 }];
                
                case 'GOD_FLASH': return [{ action: '神閃', delta: 1 }];
                default: return [];
            }
        }

        // --- COPY 複製 ---
        if (operationType === 'COPY') {
            const baseCopy = { action: '複製卡片' as ActionName, delta: 1 };
            const godFlash = { action: '神閃' as ActionName, delta: 1 };

            switch (category) {
                // 角色卡
                case 'COPY_CHAR_NORMAL': return [baseCopy];
                case 'COPY_CHAR_GOD': return [baseCopy, godFlash];
                
                // 中立卡 (修正：同時增加中立卡數量)
                case 'COPY_NEUTRAL_NORMAL': 
                    return [baseCopy, { action: '中立卡', delta: 1 }];
                case 'COPY_NEUTRAL_GOD': 
                    return [baseCopy, godFlash, { action: '中立卡', delta: 1 }];

                // 怪物卡 (同時增加卡片數量)
                // 一般
                case 'COPY_MONSTER_NORMAL': 
                    return [baseCopy, { action: '怪物卡_一般', delta: 1 }];
                case 'COPY_MONSTER_NORMAL_GOD': 
                    return [baseCopy, godFlash, { action: '怪物卡_一般', delta: 1 }];
                
                // 稀有
                case 'COPY_MONSTER_RARE': 
                    return [baseCopy, { action: '怪物卡_稀有', delta: 1 }];
                case 'COPY_MONSTER_RARE_GOD': 
                    return [baseCopy, godFlash, { action: '怪物卡_稀有', delta: 1 }];
                
                // 傳說
                case 'COPY_MONSTER_LEGEND': 
                    return [baseCopy, { action: '怪物卡_傳說', delta: 1 }];
                case 'COPY_MONSTER_LEGEND_GOD': 
                    return [baseCopy, godFlash, { action: '怪物卡_傳說', delta: 1 }];
                
                default: return [baseCopy];
            }
        }

        // --- DELETE 移除 ---
        if (operationType === 'DELETE') {
            const removeAction = { action: '一般移除' as ActionName, delta: 1 }; // 增加移除次數
            const removeGodFlash = { action: '神閃' as ActionName, delta: -1 }; // 扣除神閃分

            switch (category) {
                // 1. 角色卡
                case 'DEL_CHAR_STARTER': 
                    return [{ action: '移除起始卡', delta: 1 }];
                case 'DEL_CHAR_STARTER_GOD': // 新增：起始神閃
                    return [{ action: '移除起始卡', delta: 1 }, removeGodFlash];
                case 'DEL_CHAR_NORMAL': 
                    // 移除一般角色卡：僅增加移除次數 (角色卡本身無分數計數)
                    return [removeAction];
                case 'DEL_CHAR_GOD': 
                    // 移除神閃角色卡：增加移除次數 + 扣除神閃
                    return [removeAction, removeGodFlash];

                // 2. 中立卡
                case 'DEL_NEUTRAL_NORMAL':
                    // 移除一般中立卡：增加移除次數 + 扣除中立卡數量
                    return [removeAction, { action: '中立卡', delta: -1 }];
                case 'DEL_NEUTRAL_GOD':
                    // 移除神閃中立卡：增加移除次數 + 扣除中立卡數量 + 扣除神閃
                    return [removeAction, { action: '中立卡', delta: -1 }, removeGodFlash];

                // 3. 怪物卡 (一般)
                case 'DEL_MONSTER_NORMAL':
                    return [removeAction, { action: '怪物卡_一般', delta: -1 }];
                case 'DEL_MONSTER_NORMAL_GOD':
                    return [removeAction, { action: '怪物卡_一般', delta: -1 }, removeGodFlash];

                // 3. 怪物卡 (稀有)
                case 'DEL_MONSTER_RARE':
                    return [removeAction, { action: '怪物卡_稀有', delta: -1 }];
                case 'DEL_MONSTER_RARE_GOD':
                    return [removeAction, { action: '怪物卡_稀有', delta: -1 }, removeGodFlash];

                // 3. 怪物卡 (傳說)
                case 'DEL_MONSTER_LEGEND':
                    return [removeAction, { action: '怪物卡_傳說', delta: -1 }];
                case 'DEL_MONSTER_LEGEND_GOD':
                    return [removeAction, { action: '怪物卡_傳說', delta: -1 }, removeGodFlash];

                // 4. 賽季卡
                case 'DEL_TABOO':
                    // 移除賽季卡：增加移除次數 + 扣除賽季卡數量
                    return [removeAction, { action: '賽季卡', delta: -1 }];

                default: return [];
            }
        }

        // --- TRANSFORM 轉化 ---
        if (operationType === 'TRANSFORM') {
            // 規則8: 轉化 = 移除來源 + 獲得新卡 (中立卡)
            // 移除邏輯與 DELETE 相同，但最後會多一個 "中立卡 +1"
            
            const gainNeutral = { action: '中立卡' as ActionName, delta: 1 };
            const removeAction = { action: '一般移除' as ActionName, delta: 1 };
            const removeGodFlash = { action: '神閃' as ActionName, delta: -1 };

            switch (category) {
                // 1. 角色卡
                case 'TRF_CHAR_STARTER': 
                    return [{ action: '移除起始卡', delta: 1 }, gainNeutral];
                case 'TRF_CHAR_STARTER_GOD': // 新增：起始神閃
                    return [{ action: '移除起始卡', delta: 1 }, removeGodFlash, gainNeutral];
                case 'TRF_CHAR_NORMAL':
                    return [removeAction, gainNeutral];
                case 'TRF_CHAR_GOD':
                    return [removeAction, removeGodFlash, gainNeutral];
                
                // 2. 中立卡
                case 'TRF_NEUTRAL_NORMAL':
                    return [removeAction, { action: '中立卡', delta: -1 }, gainNeutral];
                case 'TRF_NEUTRAL_GOD':
                    return [removeAction, { action: '中立卡', delta: -1 }, removeGodFlash, gainNeutral];
                
                // 3. 怪物卡
                case 'TRF_MONSTER_NORMAL':
                    return [removeAction, { action: '怪物卡_一般', delta: -1 }, gainNeutral];
                case 'TRF_MONSTER_NORMAL_GOD':
                    return [removeAction, { action: '怪物卡_一般', delta: -1 }, removeGodFlash, gainNeutral];
                
                case 'TRF_MONSTER_RARE':
                    return [removeAction, { action: '怪物卡_稀有', delta: -1 }, gainNeutral];
                case 'TRF_MONSTER_RARE_GOD':
                    return [removeAction, { action: '怪物卡_稀有', delta: -1 }, removeGodFlash, gainNeutral];
                
                case 'TRF_MONSTER_LEGEND':
                    return [removeAction, { action: '怪物卡_傳說', delta: -1 }, gainNeutral];
                case 'TRF_MONSTER_LEGEND_GOD':
                    return [removeAction, { action: '怪物卡_傳說', delta: -1 }, removeGodFlash, gainNeutral];

                // 4. 賽季卡
                case 'TRF_TABOO':
                    return [removeAction, { action: '賽季卡', delta: -1 }, gainNeutral];

                default: return [];
            }
        }

        return [];
    };

    const getLogDescription = (category: string): string => {
        switch (operationType) {
            case 'ADD':
                 switch (category) {
                    case 'NEUTRAL': return '獲得中立卡';
                    case 'TABOO': return '獲得賽季卡';
                    case 'REFORGE': return '重鑄/神之錘';
                    case 'MONSTER_NORMAL': return '獲得怪物卡(一般)';
                    case 'MONSTER_RARE': return '獲得怪物卡(稀有)';
                    case 'MONSTER_LEGEND': return '獲得怪物卡(傳說)';
                    case 'GOD_FLASH': return '獲得神閃';
                    default: return '';
                }
            case 'COPY': 
                switch (category) {
                    case 'COPY_CHAR_NORMAL': return '複製角色卡';
                    case 'COPY_CHAR_GOD': return '複製角色卡(神閃)';
                    case 'COPY_NEUTRAL_NORMAL': return '複製中立卡';
                    case 'COPY_NEUTRAL_GOD': return '複製中立卡(神閃)';
                    
                    case 'COPY_MONSTER_NORMAL': return '複製怪物卡(一般)';
                    case 'COPY_MONSTER_NORMAL_GOD': return '複製怪物卡(一般/神閃)';
                    case 'COPY_MONSTER_RARE': return '複製怪物卡(稀有)';
                    case 'COPY_MONSTER_RARE_GOD': return '複製怪物卡(稀有/神閃)';
                    case 'COPY_MONSTER_LEGEND': return '複製怪物卡(傳說)';
                    case 'COPY_MONSTER_LEGEND_GOD': return '複製怪物卡(傳說/神閃)';
                    
                    default: return '複製卡片';
                }
            case 'DELETE':
                switch(category) {
                     case 'DEL_CHAR_STARTER': return '移除起始卡';
                     case 'DEL_CHAR_STARTER_GOD': return '移除起始卡(神閃)';
                     case 'DEL_CHAR_GOD': return '移除角色卡(神閃)';
                     case 'DEL_CHAR_NORMAL': return '移除角色卡(非起始)';
                     case 'DEL_NEUTRAL_NORMAL': return '移除中立卡(一般/普閃)';
                     case 'DEL_NEUTRAL_GOD': return '移除中立卡(神閃)';
                     
                     case 'DEL_MONSTER_NORMAL': return '移除怪物卡(一般/普閃)';
                     case 'DEL_MONSTER_NORMAL_GOD': return '移除怪物卡(一般/神閃)';
                     case 'DEL_MONSTER_RARE': return '移除怪物卡(稀有/普閃)';
                     case 'DEL_MONSTER_RARE_GOD': return '移除怪物卡(稀有/神閃)';
                     case 'DEL_MONSTER_LEGEND': return '移除怪物卡(傳說/普閃)';
                     case 'DEL_MONSTER_LEGEND_GOD': return '移除怪物卡(傳說/神閃)';

                     case 'DEL_TABOO': return '移除賽季卡';
                     default: return '移除卡片';
                }
             case 'TRANSFORM':
                switch(category) {
                     case 'TRF_CHAR_STARTER': return '轉化起始卡';
                     case 'TRF_CHAR_STARTER_GOD': return '轉化起始卡(神閃)';
                     case 'TRF_CHAR_NORMAL': return '轉化角色卡(非起始)';
                     case 'TRF_CHAR_GOD': return '轉化角色卡(神閃)';
                     
                     case 'TRF_NEUTRAL_NORMAL': return '轉化中立卡(一般/普閃)';
                     case 'TRF_NEUTRAL_GOD': return '轉化中立卡(神閃)';
                     
                     case 'TRF_MONSTER_NORMAL': return '轉化怪物卡(一般/普閃)';
                     case 'TRF_MONSTER_NORMAL_GOD': return '轉化怪物卡(一般/神閃)';
                     case 'TRF_MONSTER_RARE': return '轉化怪物卡(稀有/普閃)';
                     case 'TRF_MONSTER_RARE_GOD': return '轉化怪物卡(稀有/神閃)';
                     case 'TRF_MONSTER_LEGEND': return '轉化怪物卡(傳說/普閃)';
                     case 'TRF_MONSTER_LEGEND_GOD': return '轉化怪物卡(傳說/神閃)';

                     case 'TRF_TABOO': return '轉化賽季卡';
                     default: return '';
                }
            default: return '';
        }
    };

    const handleSelection = (category: string) => {
        setErrorMessage(null);
        const updates = getUpdates(category);
        const logDetail = getLogDescription(category);

        // Validation Logic: Check for negative results and limits
        const missingItems: string[] = [];
        let newCopyCount = currentCounts['複製卡片'] || 0;
        let newTotalRemoveCount = (currentCounts['移除起始卡'] || 0) + (currentCounts['一般移除'] || 0);

        updates.forEach(({ action, delta }) => {
            if (delta < 0) {
                const currentCount = currentCounts[action] || 0;
                if (currentCount + delta < 0) {
                    missingItems.push(action);
                }
            }
            if (action === '複製卡片') {
                newCopyCount += delta;
            }
            if (action === '移除起始卡' || action === '一般移除') {
                newTotalRemoveCount += delta;
            }
        });

        if (missingItems.length > 0) {
            setErrorMessage(`無法執行操作：您的「${missingItems.join('、')}」數量不足。`);
            return;
        }

        if (newCopyCount > 4) {
            setErrorMessage(`無法執行操作：單一角色最多只能複製 4 次。`);
            return;
        }

        if (newTotalRemoveCount > 5) {
            setErrorMessage(`無法執行操作：單一角色最多只能移除 5 次。`);
            return;
        }

        onConfirm(updates, logDetail);
        onClose();
    };

    // Style Constants - Compact Version
    const baseBtnClass = "w-full py-2 px-1.5 rounded-lg border font-semibold text-sm transition-all active:scale-95 shadow-sm flex flex-col items-center justify-center gap-0.5 min-h-[3.25rem]";
    
    const blueBtnClass = `${baseBtnClass} bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50 dark:hover:bg-blue-900/30`;
    const greenBtnClass = `${baseBtnClass} bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/50 dark:hover:bg-emerald-900/30`;
    const purpleBtnClass = `${baseBtnClass} bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50 dark:hover:bg-purple-900/30`;
    const amberBtnClass = `${baseBtnClass} bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50 dark:hover:bg-amber-900/30`;
    const redBtnClass = `${baseBtnClass} bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/50 dark:hover:bg-red-900/30`;
    const grayBtnClass = `${baseBtnClass} bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-slate-700/40 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700/60`;

    // Subtext style
    const subtextClass = "text-[10px] sm:text-xs opacity-80 font-normal leading-tight";

    // --- Content Renderers ---

    const renderAddContent = () => (
        <div className="space-y-2">
            <SectionWrapper title="基礎卡片" borderColor="border-emerald-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('NEUTRAL')} className={greenBtnClass}>
                        <span>中立卡</span>
                        <span className={subtextClass}>+20pt</span>
                    </button>
                    <button onClick={() => handleSelection('TABOO')} className={purpleBtnClass}>
                        <span>賽季卡</span>
                        <span className={subtextClass}>+20pt</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="怪物卡" borderColor="border-red-500">
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleSelection('MONSTER_NORMAL')} className={redBtnClass}>
                        <span>一般</span>
                        <span className={subtextClass}>+20pt</span>
                    </button>
                    <button onClick={() => handleSelection('MONSTER_RARE')} className={redBtnClass}>
                        <span>稀有</span>
                        <span className={subtextClass}>+50pt</span>
                    </button>
                    <button onClick={() => handleSelection('MONSTER_LEGEND')} className={redBtnClass}>
                        <span>傳說</span>
                        <span className={subtextClass}>+80pt</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="特殊" borderColor="border-amber-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('REFORGE')} className={blueBtnClass}>
                        <span>重鑄 / 神之錘</span>
                        <span className={subtextClass}>+10pt</span>
                    </button>
                    <button onClick={() => handleSelection('GOD_FLASH')} className={amberBtnClass}>
                        <span>獲得神閃</span>
                        <span className={subtextClass}>統一 +20pt</span>
                    </button>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 px-1">
                    * 普閃不計分，請勿記錄。神閃適用於任何種類卡片。
                </p>
            </SectionWrapper>
        </div>
    );

    const renderCopyContent = () => (
        <div className="space-y-2">
            <SectionWrapper title="複製角色卡" borderColor="border-blue-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('COPY_CHAR_NORMAL')} className={blueBtnClass}>
                        <span>非神閃</span>
                        <span className={subtextClass}>複製+1</span>
                    </button>
                    <button onClick={() => handleSelection('COPY_CHAR_GOD')} className={amberBtnClass}>
                        <span>神閃</span>
                        <span className={subtextClass}>複製+1 / 神閃+1</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="複製中立卡" borderColor="border-green-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('COPY_NEUTRAL_NORMAL')} className={blueBtnClass}>
                        <span>非神閃</span>
                        <span className={subtextClass}>複製+1 / 中立+1</span>
                    </button>
                    <button onClick={() => handleSelection('COPY_NEUTRAL_GOD')} className={amberBtnClass}>
                        <span>神閃</span>
                        <span className={subtextClass}>複製+1 / 神閃+1 / 中立+1</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="複製怪物卡" borderColor="border-red-500">
                <div className="grid grid-cols-2 gap-2">
                    {/* 一般 */}
                    <button onClick={() => handleSelection('COPY_MONSTER_NORMAL')} className={blueBtnClass}>
                        <span>一般 / 普閃</span>
                        <span className={subtextClass}>複製+1 / 一般+1</span>
                    </button>
                    <button onClick={() => handleSelection('COPY_MONSTER_NORMAL_GOD')} className={amberBtnClass}>
                        <span>一般 / 神閃</span>
                        <span className={subtextClass}>複製+1 / 一般+1 / 神閃+1</span>
                    </button>
                    
                    {/* 稀有 */}
                    <button onClick={() => handleSelection('COPY_MONSTER_RARE')} className={blueBtnClass}>
                        <span>稀有 / 普閃</span>
                        <span className={subtextClass}>複製+1 / 稀有+1</span>
                    </button>
                    <button onClick={() => handleSelection('COPY_MONSTER_RARE_GOD')} className={amberBtnClass}>
                        <span>稀有 / 神閃</span>
                        <span className={subtextClass}>複製+1 / 稀有+1 / 神閃+1</span>
                    </button>

                    {/* 傳說 */}
                    <button onClick={() => handleSelection('COPY_MONSTER_LEGEND')} className={blueBtnClass}>
                        <span>傳說 / 普閃</span>
                        <span className={subtextClass}>複製+1 / 傳說+1</span>
                    </button>
                    <button onClick={() => handleSelection('COPY_MONSTER_LEGEND_GOD')} className={amberBtnClass}>
                        <span>傳說 / 神閃</span>
                        <span className={subtextClass}>複製+1 / 傳說+1 / 神閃+1</span>
                    </button>
                </div>
            </SectionWrapper>
        </div>
    );

    const renderDeleteContent = () => (
        <div className="space-y-2">
            <SectionWrapper title="1. 角色卡" borderColor="border-blue-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('DEL_CHAR_STARTER')} className={redBtnClass}>
                        <span>起始卡</span>
                        <span className={subtextClass}>+20pt</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_CHAR_STARTER_GOD')} className={amberBtnClass}>
                        <span>起始神閃</span>
                        <span className={subtextClass}>+20pt / 神閃-1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_CHAR_NORMAL')} className={grayBtnClass}>
                        <span>非起始卡</span>
                        <span className={subtextClass}>移除+1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_CHAR_GOD')} className={amberBtnClass}>
                        <span>非起始神閃</span>
                        <span className={subtextClass}>移除+1 / 神閃-1</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="2. 中立卡" borderColor="border-green-500">
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('DEL_NEUTRAL_NORMAL')} className={grayBtnClass}>
                        <span>一般 / 普閃</span>
                        <span className={subtextClass}>移除+1 / 卡片-1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_NEUTRAL_GOD')} className={amberBtnClass}>
                        <span>神閃</span>
                        <span className={subtextClass}>移除+1 / 神閃-1</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="3. 怪物卡" borderColor="border-red-500">
                <div className="grid grid-cols-2 gap-2">
                    {/* 一般 */}
                     <button onClick={() => handleSelection('DEL_MONSTER_NORMAL')} className={grayBtnClass}>
                        <span>一般 / 普閃</span>
                        <span className={subtextClass}>移除+1 / 一般-1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_MONSTER_NORMAL_GOD')} className={amberBtnClass}>
                        <span>一般 / 神閃</span>
                        <span className={subtextClass}>移除+1 / 一般-1 / 神閃-1</span>
                    </button>
                    
                    {/* 稀有 */}
                    <button onClick={() => handleSelection('DEL_MONSTER_RARE')} className={grayBtnClass}>
                        <span>稀有 / 普閃</span>
                        <span className={subtextClass}>移除+1 / 稀有-1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_MONSTER_RARE_GOD')} className={amberBtnClass}>
                        <span>稀有 / 神閃</span>
                        <span className={subtextClass}>移除+1 / 稀有-1 / 神閃-1</span>
                    </button>

                    {/* 傳說 */}
                    <button onClick={() => handleSelection('DEL_MONSTER_LEGEND')} className={grayBtnClass}>
                        <span>傳說 / 普閃</span>
                        <span className={subtextClass}>移除+1 / 傳說-1</span>
                    </button>
                    <button onClick={() => handleSelection('DEL_MONSTER_LEGEND_GOD')} className={amberBtnClass}>
                        <span>傳說 / 神閃</span>
                        <span className={subtextClass}>移除+1 / 傳說-1 / 神閃-1</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="4. 其他" borderColor="border-gray-500">
                <div className="grid grid-cols-1 gap-2">
                     <button onClick={() => handleSelection('DEL_TABOO')} className={purpleBtnClass}>
                        <span>賽季卡</span>
                        <span className={subtextClass}>移除+1 / 卡片-1</span>
                    </button>
                </div>
            </SectionWrapper>
        </div>
    );

    const renderTransformContent = () => (
        <div className="space-y-2">
            <SectionWrapper title="1. 轉化角色卡" borderColor="border-purple-500">
                <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => handleSelection('TRF_CHAR_STARTER')} className={purpleBtnClass}>
                        <span>起始卡</span>
                        <span className={subtextClass}>移除(+20) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_CHAR_STARTER_GOD')} className={amberBtnClass}>
                        <span>起始神閃</span>
                        <span className={subtextClass}>移除(+20) + 神閃(-20) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_CHAR_NORMAL')} className={grayBtnClass}>
                        <span>非起始卡</span>
                        <span className={subtextClass}>移除(0) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_CHAR_GOD')} className={amberBtnClass}>
                        <span>非起始神閃</span>
                        <span className={subtextClass}>移除(0) + 神閃(-20) + 中立(+20)</span>
                    </button>
                </div>
            </SectionWrapper>
            
            <SectionWrapper title="2. 轉化中立卡" borderColor="border-green-500">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleSelection('TRF_NEUTRAL_NORMAL')} className={grayBtnClass}>
                        <span>一般 / 普閃</span>
                        <span className={subtextClass}>中立(-20) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_NEUTRAL_GOD')} className={amberBtnClass}>
                        <span>神閃</span>
                        <span className={subtextClass}>中立(-20) + 神閃(-20) + 中立(+20)</span>
                    </button>
                </div>
            </SectionWrapper>

            <SectionWrapper title="3. 轉化怪物卡" borderColor="border-red-500">
                <div className="grid grid-cols-2 gap-2">
                    {/* 一般 */}
                    <button onClick={() => handleSelection('TRF_MONSTER_NORMAL')} className={grayBtnClass}>
                        <span>一般 / 普閃</span>
                        <span className={subtextClass}>一般(-20) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_MONSTER_NORMAL_GOD')} className={amberBtnClass}>
                        <span>一般 / 神閃</span>
                        <span className={subtextClass}>一般(-20) + 神閃(-20) + 中立(+20)</span>
                    </button>
                    
                    {/* 稀有 */}
                    <button onClick={() => handleSelection('TRF_MONSTER_RARE')} className={grayBtnClass}>
                        <span>稀有 / 普閃</span>
                        <span className={subtextClass}>稀有(-50) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_MONSTER_RARE_GOD')} className={amberBtnClass}>
                        <span>稀有 / 神閃</span>
                        <span className={subtextClass}>稀有(-50) + 神閃(-20) + 中立(+20)</span>
                    </button>

                    {/* 傳說 */}
                    <button onClick={() => handleSelection('TRF_MONSTER_LEGEND')} className={grayBtnClass}>
                        <span>傳說 / 普閃</span>
                        <span className={subtextClass}>傳說(-80) + 中立(+20)</span>
                    </button>
                    <button onClick={() => handleSelection('TRF_MONSTER_LEGEND_GOD')} className={amberBtnClass}>
                        <span>傳說 / 神閃</span>
                        <span className={subtextClass}>傳說(-80) + 神閃(-20) + 中立(+20)</span>
                    </button>
                </div>
            </SectionWrapper>

             <SectionWrapper title="4. 其他" borderColor="border-gray-500">
                <div className="grid grid-cols-1 gap-2">
                     <button onClick={() => handleSelection('TRF_TABOO')} className={purpleBtnClass}>
                        <span>轉化賽季卡</span>
                        <span className={subtextClass}>賽季(-20) + 中立(+20)</span>
                    </button>
                </div>
            </SectionWrapper>
        </div>
    );

    const renderContent = () => {
        switch (operationType) {
            case 'ADD': return renderAddContent();
            case 'COPY': return renderCopyContent();
            case 'DELETE': return renderDeleteContent();
            case 'TRANSFORM': return renderTransformContent();
            default: return null;
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                id="action-operation-modal"
                className="bg-white dark:bg-slate-800 w-full max-w-md rounded-xl p-4 max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out opacity-0 scale-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{getTitle()}</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-tight">{getDescription()}</p>

                {errorMessage && (
                    <div className="mb-2 p-2 bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs flex items-start animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {renderContent()}
                
                <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 text-center">
                     <button 
                        onClick={onClose}
                        className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors py-2"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActionOperationModal;
