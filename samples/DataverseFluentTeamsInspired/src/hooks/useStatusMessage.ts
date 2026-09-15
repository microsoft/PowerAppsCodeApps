import { useCallback, useState } from 'react';

export interface StatusMessage {
    intent: 'success' | 'error' | 'warning' | 'info';
    text: string;
    id: number;
}

export function useStatusMessage(timeoutMs = 6000) {
    const [message, setMessage] = useState<StatusMessage | null>(null);

    const show = useCallback((intent: StatusMessage['intent'], text: string) => {
        const id = Date.now();
        setMessage({ intent, text, id });
        if (timeoutMs > 0) {
            setTimeout(() => {
                setMessage(current => (current && current.id === id ? null : current));
            }, timeoutMs);
        }
    }, [timeoutMs]);

    const clear = useCallback(() => setMessage(null), []);

    return { message, showSuccess: (t: string) => show('success', t), showError: (t: string) => show('error', t), clear };
}
