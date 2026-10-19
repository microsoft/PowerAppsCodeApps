import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PowerRuntimeContext, type PowerRuntimeContextType } from "./contexts/powerRuntimeContext";

interface PowerProviderProps {
    children: ReactNode;
}

export default function PowerProvider({ children }: PowerProviderProps) {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initializedAt, setInitializedAt] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const initApp = async () => {
            try {
                // Dynamically import to allow the SDK (and its dependencies) to be code-split from the initial UI shell.
                const mod = await import("@pa-client/power-code-sdk/lib/Lifecycle");
                if (cancelled) return;
                await mod.initialize();
                if (cancelled) return;
                setIsReady(true);
                setInitializedAt(new Date().toISOString());
                console.log('Power Platform SDK initialized successfully');
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : 'Unknown error';
                setError(message);
                console.error('Failed to initialize Power Platform SDK:', err);
            }
        };
        initApp();
        return () => { cancelled = true; };
    }, []);

    const value = useMemo<PowerRuntimeContextType>(() => ({ isReady, error, initializedAt }), [isReady, error, initializedAt]);

    return (
        <PowerRuntimeContext.Provider value={value}>
            {children}
        </PowerRuntimeContext.Provider>
    );
}