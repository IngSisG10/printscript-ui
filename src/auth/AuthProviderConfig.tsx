import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {registerTokenGetter} from "../api/tokenProvider";

export const AuthProviderConfig = () => {
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        registerTokenGetter(() => getAccessTokenSilently());
    }, []);

    return null;
};
