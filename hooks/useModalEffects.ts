import { useEffect } from 'react';

export const useModalEffects = (
    isOpen: boolean, 
    onClose: () => void, 
    modalId: string
) => {
    useEffect(() => {
        if (!isOpen) return;

        const modalContent = document.getElementById(modalId);
        if (modalContent) {
            // Use a short timeout to allow the initial styles to apply before transitioning
            setTimeout(() => {
                modalContent.classList.remove('opacity-0', 'scale-95');
                modalContent.classList.add('opacity-100', 'scale-100');
            }, 10);
        }

        // Add keydown listener for Esc key
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, modalId]);
};
