import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { registerTokenGetter } from "../api/tokenProvider";
import { useRegisterOrLoginUser } from "../utils/queries";

export const AuthProviderConfig = () => {
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const registerMutation = useRegisterOrLoginUser();
    const [hasAttemptedRegistration, setHasAttemptedRegistration] = useState(false);


    useEffect(() => {
        registerTokenGetter(async () => {
            try {
                return await getAccessTokenSilently();
            } catch (error) {
                console.error("Failed to get token:", error);
                return null;
            }
        });
    }, [getAccessTokenSilently]);

    useEffect(() => {
        if (isAuthenticated && !isLoading && !hasAttemptedRegistration) {
            setHasAttemptedRegistration(true);

            registerMutation.mutate(undefined, {
                onSuccess: (data) => {
                    console.log("User registered/logged in successfully:", data);
                },
                onError: (error) => {
                    console.error("Failed to register user:", error);
                }
            });
        }
    }, [isAuthenticated, isLoading, hasAttemptedRegistration, registerMutation]);

    return null;
};
