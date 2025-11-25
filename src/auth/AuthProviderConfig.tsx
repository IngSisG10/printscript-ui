import {useEffect} from "react";
import {registerTokenGetter} from "../api/tokenProvider";
import {useAuth0} from "@auth0/auth0-react";

export const AuthProviderConfig = () => {
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        registerTokenGetter(() => getAccessTokenSilently());
    }, []);

    return null;
};
