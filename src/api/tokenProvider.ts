let tokenGetter: (() => Promise<string | null>) | null = null;

export function registerTokenGetter(fn: () => Promise<string | null>) {
    tokenGetter = fn;
}

export async function getToken(): Promise<string | null> {
    if (tokenGetter) {
        return await tokenGetter();
    }
    return null;
}
