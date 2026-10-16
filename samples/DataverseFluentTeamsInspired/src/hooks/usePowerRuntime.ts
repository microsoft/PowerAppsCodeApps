import { useContext } from 'react';
import { PowerRuntimeContext, type PowerRuntimeContextType } from '../contexts/powerRuntimeContext';

export function usePowerRuntime(): PowerRuntimeContextType {
    const ctx = useContext(PowerRuntimeContext);
    if (!ctx) throw new Error('usePowerRuntime must be used within PowerProvider');
    return ctx;
}
