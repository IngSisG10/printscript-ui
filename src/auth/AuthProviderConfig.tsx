// import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {registerTokenGetter} from "../api/tokenProvider";
import {useAuth} from "./useAuth.ts";

export const AuthProviderConfig = () => {
    const { getAccessTokenSilently } = useAuth();

    useEffect(() => {
        registerTokenGetter(() => getAccessTokenSilently());
    }, []);

    return null;
};
