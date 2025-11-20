import {createContext, ReactNode, useContext} from "react";

interface MockAuthContextType {
    isAuthenticated: boolean;
    user: { email: string };
    getAccessTokenSilently: () => Promise<string>;
    loginWithRedirect: () => void;
    logout: () => void;
}

const defaultMockValue: MockAuthContextType = {
    isAuthenticated: true,
    user: { email: "mock@user.com" },
    getAccessTokenSilently: async () => "MOCK_TOKEN_DEFAULT",
    loginWithRedirect: () => console.log("Mock login"),
    logout: () => console.log("Mock logout"),
};


const MockAuthContext = createContext<MockAuthContextType>(defaultMockValue);

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <MockAuthContext.Provider
            value={{
                isAuthenticated: true,
                user: { email: "mock@user.com" },
                getAccessTokenSilently: async () => "MOCK_TOKEN_123",
                loginWithRedirect: () => console.log("Login (mock)"),
                logout: () => console.log("Logout (mock)"),
            }}
        >
            {children}
        </MockAuthContext.Provider>
    );
};


// este hook reemplaza useAuth0 cuando MOCK=true:
export const useMockAuth0 = () => useContext(MockAuthContext);
