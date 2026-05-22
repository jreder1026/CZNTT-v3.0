
import React from 'react';
import { useModalEffects } from '../hooks/useModalEffects';

interface InfoModalProps {
    onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    useModalEffects(true, onClose, 'info-modal-content');

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                id="info-modal-content"
                className="card bg-white dark:bg-slate-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out opacity-0 scale-95"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">計分規則說明 (S3)</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="text-gray-700 dark:text-gray-300 space-y-3 text-base">
                    <p className="font-bold text-lg text-indigo-700 dark:text-indigo-400">計分詳情</p>
                    <ul className="list-none space-y-3">
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">01. 獲得中立卡牌：</strong>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">每次 <code>+20pt</code>。</span>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">02. 獲得賽季卡：</strong>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">每次 <code>+20pt</code>。</span>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">03. 獲得怪物卡：</strong>
                            <p className="pl-6 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                一般 <code>+20pt</code> / 稀有 <code>+50pt</code> / 傳說 <code>+80pt</code>。
                            </p>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">04. 普閃：</strong>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">所有卡片普閃皆 <strong className="text-red-500">不計分</strong>。</span>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">05. 神閃：</strong>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">所有卡片獲得神閃，統一 <code>+20pt</code>。</span>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">06. 複製卡片：</strong>
                            <p className="pl-6 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                單一角色最多複製 3 次。首 2 張不計 pt，第 3 張 <code>+40pt</code>。
                            </p>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">07. 複製卡移除規則：</strong>
                            <p className="pl-6 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                若複製的卡片被移除，則該複製卡的計分點數退回。
                            </p>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">08. 轉化規則：</strong>
                            <p className="pl-6 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                轉化視同「移除一次」並「獲得一張中立卡」。<br/>
                                (若轉化起始卡 +20pt；若轉化複製卡則退回分數；若轉化其他卡則不計移除分)。
                            </p>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">09. 移除操作：</strong>
                            <p className="pl-6 mt-1 text-gray-600 dark:text-gray-400 text-sm">
                                移除起始卡 <code>+20pt</code>。移除其他卡片不計分。<br/>
                                單一角色最多移除 5 次。
                            </p>
                        </li>
                        <li>
                            <strong className="font-semibold text-gray-900 dark:text-gray-100">10. 重鑄 / 神之錘：</strong>
                            <span className="ml-1 text-gray-600 dark:text-gray-400">每次 <code>+10pt</code>。</span>
                        </li>
                    </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700/80 text-white font-semibold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm active:scale-95"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
