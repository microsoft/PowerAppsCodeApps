import { createContext } from 'react';

export type PowerRuntimeContextType = {
    isReady: boolean;
    error: string | null;
    initializedAt: string | null;
};

export const PowerRuntimeContext = createContext<PowerRuntimeContextType | undefined>(undefined);
