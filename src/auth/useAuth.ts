import { useAuth0 } from "@auth0/auth0-react";
import { useMockAuth0 } from "./mock/MockProvider";

const isMock = import.meta.env.VITE_AUTH0_MOCK === "true";
const hasAuth0Config = import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID;
const shouldUseMock = isMock || !hasAuth0Config;

export const useAuth = () => {
    // Always call useMockAuth0 (safe - uses React context with default value)
    const mock = useMockAuth0();

    // Only call useAuth0 when Auth0Provider is guaranteed to be present
    // This matches the logic in main.tsx and App.tsx
    if (shouldUseMock) {
        return mock;
    }

    // When not in mock mode, Auth0Provider is in the tree (from main.tsx)
    // so useAuth0() is safe to call
    const auth0 = useAuth0();
    return auth0;
};
