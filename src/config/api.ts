export const API_CONFIG = {
    SNIPPET_URL: import.meta.env.VITE_SNIPPET_URL,
};


await fetch(`${API_CONFIG.SNIPPET_URL}/snippets/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        "name": "My first snippet",
        "description": "A basic example of PrintScript code",
        "code": "let x: number = 5;",
        "languageName": "PrintScript",
        "version": "1.0"
    }),
});
