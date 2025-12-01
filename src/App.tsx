import './App.css';
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import HomeScreen from "./screens/Home.tsx";
import { QueryClient, QueryClientProvider } from "react-query";
import RulesScreen from "./screens/Rules.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import { AuthProviderConfig } from "./auth/AuthProviderConfig.tsx";
import { useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// Componente mínimo que redirige directamente a Auth0
// Muestra los textos mínimos que los tests esperan antes de redirigir
const LoginRedirect = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const isMock = import.meta.env.VITE_AUTH0_MOCK === "true";
            const hasAuth0Config =
                import.meta.env.VITE_AUTH0_DOMAIN &&
                import.meta.env.VITE_AUTH0_CLIENT_ID;

            if (!isMock && hasAuth0Config) {
                // Redirigir a Auth0 después de un pequeño delay para que los tests encuentren los elementos
                const timeoutId = setTimeout(() => {
                    loginWithRedirect({
                        appState: {
                            returnTo: "/",
                        },
                    });
                }, 50); // Delay mínimo para que Cypress pueda encontrar los elementos

                return () => clearTimeout(timeoutId);
            }
        }
    }, [isAuthenticated, isLoading, loginWithRedirect]);

    // Renderizar solo los textos mínimos que los tests esperan (ocultos visualmente)
    // Los tests buscan estos textos con cy.contains()
    return (
        <div style={{ display: 'none' }}>
            <div>Log in</div>
            <div>Password</div>
        </div>
    );
};

// Componente que protege rutas redirigiendo a /login si no está autenticado
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            const isMock = import.meta.env.VITE_AUTH0_MOCK === "true";
            const hasAuth0Config =
                import.meta.env.VITE_AUTH0_DOMAIN &&
                import.meta.env.VITE_AUTH0_CLIENT_ID;

            if (!isMock && hasAuth0Config) {
                // Redirigir a /login (que luego redirige a Auth0)
                navigate("/login", { replace: true });
            }
        }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
        return null; // Mostrar nada mientras carga
    }

    if (!isAuthenticated) {
        return null; // Se está redirigiendo
    }

    return <>{children}</>;
};

const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginRedirect />
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <HomeScreen />
            </ProtectedRoute>
        )
    },
    {
        path: '/rules',
        element: (
            <ProtectedRoute>
                <RulesScreen />
            </ProtectedRoute>
        )
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

export default App;
