
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CharacterData, ActionName, POINT_TABLE, ACTION_NAMES, MIN_TIER, MAX_TIER, INITIAL_TIER, getInitialCharactersData, OperationType, LogEntry, OPERATION_LABELS } from './config';
import TierControlCard from './components/TierControlCard';
import CharacterCard from './components/CharacterCard';
import ConfirmationModal from './components/ConfirmationModal';
import SortOrderModal from './components/SortOrderModal';

// --- LocalStorage Logic ---
const SAVED_STATE_KEY = 'chaos-simulator-state';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(SAVED_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("讀取儲存資料時發生錯誤:", err);
    return undefined;
  }
};

const savedState = loadState();

// --- Helper Functions ---

const getPointsForAction = (actionName: ActionName, count: number): number => {
    const points = POINT_TABLE[actionName];
    if (!points) return 0;

    const validCount = count || 0;
    if (validCount <= 0) return 0;

    if (validCount <= 5) {
        return points[validCount - 1];
    } else {
        const costOfStep5 = points[4] - points[3];
        return points[4] + (validCount - 5) * costOfStep5;
    }
};

const calculateTotalScore = (character: CharacterData): number => {
    return ACTION_NAMES.reduce((total, name) => {
        return total + getPointsForAction(name, character.counts[name]);
    }, 0);
};

const calculateMaxLimit = (tier: number): number => {
    const base = 30;
    const perTierBonus = 10;
    const validTier = Math.max(MIN_TIER, tier || MIN_TIER);
    return base + (validTier - 1) * perTierBonus;
};

const DEFAULT_QUICK_ACTION_ORDER: OperationType[] = ['DELETE', 'COPY', 'TRANSFORM', 'ADD'];

// Helper to create initial logs
const getInitialLogs = (chars: CharacterData[]) => {
    const logs: Record<string, LogEntry[]> = {};
    chars.forEach(c => logs[c.id] = []);
    return logs;
};

const App: React.FC = () => {
    const [sharedTier, setSharedTier] = useState<number>(savedState?.sharedTier ?? INITIAL_TIER);
    const [charactersData, setCharactersData] = useState<CharacterData[]>(savedState?.charactersData ?? getInitialCharactersData());
    const [characterLogs, setCharacterLogs] = useState<Record<string, LogEntry[]>>(savedState?.characterLogs ?? getInitialLogs(getInitialCharactersData()));
    const [activeCharacterId, setActiveCharacterId] = useState<string>(savedState?.activeCharacterId ?? getInitialCharactersData()[0].id);
    const [isConfirmationEnabled, setIsConfirmationEnabled] = useState<boolean>(savedState?.isConfirmationEnabled ?? true);
    
    // Initialize Dark Mode
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (savedState?.isDarkMode !== undefined) {
            return savedState.isDarkMode;
        }
        if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    });
    
    const [isManualInputLocked, setIsManualInputLocked] = useState<boolean>(savedState?.isManualInputLocked ?? true);

    // Robust initialization for actionOrder to handle updates or missing keys
    const [actionOrder, setActionOrder] = useState<ActionName[]>(() => {
        if (savedState?.actionOrder && Array.isArray(savedState.actionOrder)) {
            const saved = savedState.actionOrder;
            // 1. Filter: Keep only keys that still exist in current config
            const validSaved = saved.filter((name: string) => ACTION_NAMES.includes(name as ActionName));
            // 2. Merge: Add any new keys from config that are missing in saved state
            const missing = ACTION_NAMES.filter(name => !validSaved.includes(name));
            return [...validSaved, ...missing] as ActionName[];
        }
        return ACTION_NAMES;
    });

    const [quickActionOrder, setQuickActionOrder] = useState<OperationType[]>(() => {
        if (savedState?.quickActionOrder && Array.isArray(savedState.quickActionOrder)) {
            const saved = savedState.quickActionOrder;
            
            // 1. Force Filter: Strict match against allowed types for this version to clean up old buttons
            const allowedTypes: OperationType[] = ['DELETE', 'COPY', 'TRANSFORM', 'ADD'];
            const validSaved = saved.filter((op: string) => allowedTypes.includes(op as any));
            
            // 2. Return valid saved order if exists, otherwise default
            return validSaved.length > 0 ? validSaved as OperationType[] : DEFAULT_QUICK_ACTION_ORDER;
        }
        return DEFAULT_QUICK_ACTION_ORDER;
    });

    const [isSortModalOpen, setIsSortModalOpen] = useState(false);

    // --- Undo History State ---
    // Now includes characterLogs to keep logs in sync with undo
    // Removed sharedTier from history so undoing doesn't revert tier changes
    const [history, setHistory] = useState<{
        charactersData: CharacterData[];
        characterLogs: Record<string, LogEntry[]>;
    }[]>(savedState?.history ?? []);

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (() => void) | null;
    }>({ isOpen: false, title: '', message: '', onConfirm: null });

    // Effect for save state to localStorage
    useEffect(() => {
        try {
            const stateToSave = {
                sharedTier,
                charactersData,
                characterLogs,
                activeCharacterId,
                isConfirmationEnabled,
                isDarkMode,
                isManualInputLocked,
                actionOrder,
                quickActionOrder,
                history
            };
            const serializedState = JSON.stringify(stateToSave);
            localStorage.setItem(SAVED_STATE_KEY, serializedState);
        } catch (err) {
            console.error("儲存資料時發生錯誤:", err);
        }
    }, [sharedTier, charactersData, characterLogs, activeCharacterId, isConfirmationEnabled, isDarkMode, isManualInputLocked, actionOrder, quickActionOrder, history]);
    
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    // --- Undo Logic ---
    const saveHistory = useCallback(() => {
        setHistory(prev => {
            const snapshot = {
                charactersData: JSON.parse(JSON.stringify(charactersData)),
                characterLogs: JSON.parse(JSON.stringify(characterLogs))
            };
            const newHistory = [...prev, snapshot];
            if (newHistory.length > 50) {
                return newHistory.slice(newHistory.length - 50);
            }
            return newHistory;
        });
    }, [charactersData, characterLogs]);

    const handleUndo = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const lastState = newHistory.pop();
            
            if (lastState) {
                setCharactersData(lastState.charactersData);
                // 如果是舊的歷史紀錄沒有 logs，則使用初始 logs (空陣列) 防止崩潰
                setCharacterLogs(lastState.characterLogs || getInitialLogs(lastState.charactersData));
                // sharedTier is no longer restored from history
            }
            
            return newHistory;
        });
    }, []);

    const handleTierChange = useCallback((newTier: number) => {
        // Do not save history for Tier changes
        const validatedTier = Math.max(MIN_TIER, Math.min(MAX_TIER, newTier));
        setSharedTier(validatedTier);
    }, []);
    
    const performResetAll = useCallback(() => {
        setHistory([]); // Clear history on reset
        
        setCharactersData(prevData =>
            prevData.map(char => {
                const initialCharData = getInitialCharactersData().find(c => c.id === char.id);
                return { 
                    ...char, 
                    counts: initialCharData ? { ...initialCharData.counts } : char.counts 
                };
            })
        );
        // Clear all logs
        setCharacterLogs(getInitialLogs(getInitialCharactersData()));
    }, []);

    const handleResetAll = useCallback(() => {
        if (isConfirmationEnabled) {
            setConfirmationState({
                isOpen: true,
                title: '確認全部重置',
                message: '您確定要重置所有角色的分數與操作紀錄嗎？(TIER 等級將保留) 此操作無法復原。',
                onConfirm: performResetAll,
            });
        } else {
            performResetAll();
        }
    }, [isConfirmationEnabled, performResetAll]);

    const performResetCharacter = useCallback((charId: string) => {
        setHistory([]); // Clear history
        
        setCharactersData(prevData =>
            prevData.map(char => {
                if (char.id !== charId) return char;
                const initialCharData = getInitialCharactersData().find(c => c.id === charId);
                return { ...char, counts: initialCharData ? { ...initialCharData.counts } : char.counts };
            })
        );
        // Clear specific log
        setCharacterLogs(prev => ({
            ...prev,
            [charId]: []
        }));
    }, []);

    const handleResetCharacter = useCallback((charId: string, charName: string) => {
        if (isConfirmationEnabled) {
             setConfirmationState({
                isOpen: true,
                title: `確認重置角色`,
                message: `您確定要重置角色「${charName}」的所有分數與操作紀錄嗎？此操作無法復原。`,
                onConfirm: () => performResetCharacter(charId),
            });
        } else {
            performResetCharacter(charId);
        }
    }, [isConfirmationEnabled, performResetCharacter]);

    // Helper to add log
    const addLog = useCallback((charId: string, actionType: string, description: string, details: string = "") => {
        const newLog: LogEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            actionType,
            description,
            details
        };
        setCharacterLogs(prev => ({
            ...prev,
            [charId]: [newLog, ...(prev[charId] || [])]
        }));
    }, []);

    const handleCountChange = useCallback((charId: string, actionName: ActionName, newCount: number) => {
        saveHistory();
        setCharactersData(prevData =>
            prevData.map(char => {
                if (char.id !== charId) return char;

                const currentCount = char.counts[actionName];
                const delta = newCount - currentCount;
                
                if (delta === 0) return char;

                const updatedCounts = { ...char.counts };
                updatedCounts[actionName] = Math.max(0, newCount);

                let logDescription = `${actionName} ${delta > 0 ? '+' : ''}${delta}`;
                let logDetails = `數值變更：${currentCount} ➔ ${newCount}`;

                addLog(charId, "手動調整", logDescription, logDetails);

                return { ...char, counts: updatedCounts };
            })
        );
    }, [saveHistory, addLog]);

    const handleBatchCountChange = useCallback((charId: string, updates: { action: ActionName, delta: number }[], opType?: OperationType, logDetail?: string) => {
        saveHistory();
        
        const opLabel = opType ? OPERATION_LABELS[opType] : "批量操作";
        
        let numericDesc = "";
        if (updates.length > 0) {
            numericDesc = updates.map(u => {
                if (u.delta === 0) return `${u.action} (不計)`;
                return `${u.action} ${u.delta > 0 ? '+' : ''}${u.delta}`;
            }).join("、");
        }

        let mainDesc = "";
        let details = "";

        if (numericDesc) {
            mainDesc = numericDesc;
            if (logDetail) {
                details = logDetail;
            }
        } else {
            // No numeric updates (e.g., DELETE_REMOVE or CHAR_TO_REMOVE)
            mainDesc = logDetail || "無數值變動";
        }
        
        // Ensure we don't log empty entries if for some reason both are empty, 
        // though UI interaction should prevent this.
        if (mainDesc || details) {
             addLog(charId, opLabel, mainDesc, details);
        }

        setCharactersData(prevData =>
            prevData.map(char => {
                if (char.id !== charId) return char;
                const updatedCounts = { ...char.counts };
                
                updates.forEach(({ action, delta }) => {
                    const current = updatedCounts[action] || 0;
                    updatedCounts[action] = Math.max(0, current + delta);
                });

                return { ...char, counts: updatedCounts };
            })
        );
    }, [saveHistory, addLog]);

    const handleNameChange = useCallback((charId: string, newName: string) => {
        saveHistory();
        setCharactersData(prevData =>
            prevData.map(char => (char.id === charId ? { ...char, name: newName } : char))
        );
    }, [saveHistory]);

    const handleSortOrderChange = useCallback((newActionOrder: ActionName[], newQuickActionOrder: OperationType[]) => {
        setActionOrder(newActionOrder);
        setQuickActionOrder(newQuickActionOrder);
        setIsSortModalOpen(false);
    }, []);

    const closeConfirmationModal = () => {
        setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    const handleConfirm = () => {
        if (confirmationState.onConfirm) {
            confirmationState.onConfirm();
        }
        closeConfirmationModal();
    };

    const maxLimit = useMemo(() => calculateMaxLimit(sharedTier), [sharedTier]);
    
    const characterScores = useMemo(() => {
        const scores: { [key: string]: number } = {};
        charactersData.forEach(char => {
            scores[char.id] = calculateTotalScore(char);
        });
        return scores;
    }, [charactersData]);

    return (
        <div className="container mx-auto max-w-7xl p-4 lg:p-8 min-h-screen flex flex-col pb-24">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
                卡厄思計分模擬器 <span className="text-sm font-normal text-gray-500 dark:text-gray-400 align-middle ml-2">v3.0.0</span>
            </h1>
            
            <TierControlCard 
                tier={sharedTier}
                maxLimit={maxLimit}
                onTierChange={handleTierChange}
                onResetAll={handleResetAll}
                isConfirmationEnabled={isConfirmationEnabled}
                onConfirmationToggle={() => setIsConfirmationEnabled(prev => !prev)}
                isDarkMode={isDarkMode}
                onThemeToggle={() => setIsDarkMode(prev => !prev)}
                onUndo={handleUndo}
                canUndo={history.length > 0}
                isManualInputLocked={isManualInputLocked}
                onToggleLock={() => setIsManualInputLocked(prev => !prev)}
                onOpenSort={() => setIsSortModalOpen(true)}
            />

            <div id="characters-container" className="flex-grow">
                {/* --- Tab view for smaller screens (< 960px) --- */}
                <div className="min-[960px]:hidden">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        {charactersData.map(char => (
                            <button
                                key={char.id}
                                onClick={() => setActiveCharacterId(char.id)}
                                className={`px-4 py-2 font-semibold text-base transition-colors duration-200 w-1/3 text-center ${
                                    activeCharacterId === char.id
                                        ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-slate-800 dark:text-indigo-400 rounded-t-lg'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-indigo-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                {char.name}
                            </button>
                        ))}
                    </div>
                    <div>
                        {charactersData
                            .filter(char => char.id === activeCharacterId)
                            .map(char => (
                                 <CharacterCard
                                    key={char.id}
                                    character={char}
                                    totalScore={characterScores[char.id]}
                                    maxLimit={maxLimit}
                                    onCountChange={handleCountChange}
                                    onBatchCountChange={handleBatchCountChange}
                                    onNameChange={handleNameChange}
                                    onResetCharacter={handleResetCharacter}
                                    actionOrder={actionOrder}
                                    quickActionOrder={quickActionOrder}
                                    isManualInputLocked={isManualInputLocked}
                                    logs={characterLogs[char.id] || []}
                                />
                            ))}
                    </div>
                </div>

                {/* --- Grid view for larger screens (>= 960px) --- */}
                <div className="hidden min-[960px]:grid min-[960px]:grid-cols-3 min-[960px]:gap-6 items-start">
                    {charactersData.map(char => (
                        <CharacterCard
                            key={char.id}
                            character={char}
                            totalScore={characterScores[char.id]}
                            maxLimit={maxLimit}
                            onCountChange={handleCountChange}
                            onBatchCountChange={handleBatchCountChange}
                            onNameChange={handleNameChange}
                            onResetCharacter={handleResetCharacter}
                            actionOrder={actionOrder}
                            quickActionOrder={quickActionOrder}
                            isManualInputLocked={isManualInputLocked}
                            logs={characterLogs[char.id] || []}
                        />
                    ))}
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                title={confirmationState.title}
                message={confirmationState.message}
                onClose={closeConfirmationModal}
                onConfirm={handleConfirm}
            />

            <SortOrderModal 
                isOpen={isSortModalOpen}
                currentActionOrder={actionOrder}
                currentQuickOrder={quickActionOrder}
                onClose={() => setIsSortModalOpen(false)}
                onSave={handleSortOrderChange}
            />
        </div>
    );
};

export default App;
