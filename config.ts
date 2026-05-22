
// --- 類型定義 (原 types.ts) ---

export type ActionName = keyof typeof POINT_TABLE;

export type OperationType = 'DELETE' | 'COPY' | 'TRANSFORM' | 'ADD' | 'DELETE_REMOVE' | 'TRANSFORM_TO_REMOVE';

export interface CharacterData {
  id: string;
  name: string;
  counts: Record<ActionName, number>;
}

export interface LogEntry {
    id: string;
    timestamp: number;
    actionType: string; // e.g. "數值變更", "刪除操作"
    description: string;
    details?: string;
}

// --- 常數與設定 (原 constants.ts) ---

export const OPERATION_LABELS: Record<OperationType, string> = {
    'DELETE': '移除',
    'COPY': '複製',
    'TRANSFORM': '轉化',
    'ADD': '獲得',
    'DELETE_REMOVE': '移除(複製卡)', // 語意調整
    'TRANSFORM_TO_REMOVE': '轉化(特殊)'
};

// 核心計分規則表 (根據 2025/11/15 新版規則更新)
export const POINT_TABLE = {
    // 1. 獲得中立卡牌 +20pt
    "中立卡": [20, 40, 60, 80, 100],
    
    // 2. 獲得賽季卡 +20pt
    "賽季卡": [20, 40, 60, 80, 100],

    // 3. 獲得怪物卡 (一般+20, 稀有+50, 傳說+80)
    "怪物卡_一般": [20, 40, 60, 80, 100],
    "怪物卡_稀有": [50, 100, 150, 200, 250],
    "怪物卡_傳說": [80, 160, 240, 320, 400],

    // 5. 神閃統一 +20pt
    "神閃": [20, 40, 60, 80, 100],

    // 6. 複製卡片: 前2張0，之後每張+40 (0, 0, 40, 80)。
    // 公式 getPointsForAction 處理大於5的情況會依據最後一階差值(40)累加，故定義到第5階即可。
    "複製卡片": [0, 0, 40, 80, 120],

    // 9. 移除起始卡 +20pt
    "移除起始卡": [20, 40, 60, 80, 100],

    // 9. 移除其他卡 +0pt (但需要記錄次數)
    "一般移除": [0, 0, 0, 0, 0],

    // 11. 重鑄/神之錘 +10pt
    "重鑄_神之錘": [10, 20, 30, 40, 50]
};

export const ACTION_NAMES = Object.keys(POINT_TABLE) as ActionName[];

export const MIN_TIER = 1;
export const MAX_TIER = 100;
export const INITIAL_TIER = 1;

const createInitialCharacterState = (id: string, name: string): CharacterData => {
    const counts = {} as Record<ActionName, number>;
    ACTION_NAMES.forEach(action => {
        counts[action] = 0;
    });
    return { id, name, counts };
};

export const getInitialCharactersData = (): CharacterData[] => [
    createInitialCharacterState('char1', '角色 1'),
    createInitialCharacterState('char2', '角色 2'),
    createInitialCharacterState('char3', '角色 3'),
];
