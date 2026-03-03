import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState({ isOpen: false, message: '', title: '', resolve: null });

    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const confirm = useCallback((message, title = "Confirm Action") => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                message,
                title: title || "Are you sure?",
                resolve
            });
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState.resolve) confirmState.resolve(true);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (confirmState.resolve) confirmState.resolve(false);
        setConfirmState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[10001] space-y-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                message={toast.message}
                                type={toast.type}
                                onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Global Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
