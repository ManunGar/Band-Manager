import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const timerRef = useRef(null);

    const showToast = useCallback((title, message = '', type = 'info', duration = 3500) => {
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast({ title, message, type, key: Date.now() });

        timerRef.current = setTimeout(() => {
            setToast(null);
        }, duration);
    }, []);

    const hideToast = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            <View style={{ flex: 1 }}>
                {children}
                {toast && (
                    <Toast
                        key={toast.key}
                        title={toast.title}
                        message={toast.message}
                        type={toast.type}
                        onClose={hideToast}
                    />
                )}
            </View>
        </ToastContext.Provider>
    );
};

export default ToastContext;
