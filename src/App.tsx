import './App.css';
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { AuthProviderConfig } from "./auth/AuthProviderConfig.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomeScreen />
    },
    {
        path: '/rules',
        element: <RulesScreen />
    }
]);

export const queryClient = new QueryClient()
const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProviderConfig />
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

// Check if we're in mock mode or if Auth0 is not configured
const isMock = import.meta.env.VITE_AUTH0_MOCK === "true";
const hasAuth0Config = import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID;

// Only apply authentication requirement when Auth0 is configured (not in mock mode)
// withAuthenticationRequired will redirect unauthenticated users to Auth0 login
const AppWithAuth = !isMock && hasAuth0Config
    ? withAuthenticationRequired(App, {
        // Optional: customize the returnTo path after login
        returnTo: window.location.pathname,
        // Optional: show a loading component while checking authentication
        // onRedirecting: () => <div>Loading...</div>,
    })
    : App;

export default AppWithAuth;
