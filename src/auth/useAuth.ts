import { useAuth0 } from "@auth0/auth0-react";
import { useMockAuth0 } from "./mock/MockProvider";

const isMock = import.meta.env.VITE_AUTH0_MOCK === "true";

export const useAuth = () => {
    const auth0 = useAuth0();
    const mock = useMockAuth0();

    return isMock ? mock : auth0;
};
