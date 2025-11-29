import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@shared/../server/routers';

export const trpc = createTRPCReact<AppRouter>();

// Get API URL from environment or use relative path
export const getApiUrl = () => {
    if (typeof window === 'undefined') return 'http://localhost:3000';

    // In production, use the environment variable or fallback to relative path
    return import.meta.env.VITE_API_URL || '/api/trpc';
};
