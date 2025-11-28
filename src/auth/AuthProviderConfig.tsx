// import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {registerTokenGetter} from "../api/tokenProvider";
import {useAuth} from "./useAuth.ts";
import {useUserSync} from "../hooks/useUserSync.ts";

export const AuthProviderConfig = () => {
    const { getAccessTokenSilently } = useAuth();

    useEffect(() => {
        registerTokenGetter(() => getAccessTokenSilently());
    }, []);

    // Sincronizar usuario con el backend después del login
    useUserSync('/users/sync');

    return null;
};
