import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock auth check
        setTimeout(() => {
            setUser({ name: "Demo User", email: "demo@example.com" });
            setLoading(false);
        }, 500);
    }, []);

    const logout = () => {
        setUser(null);
        window.location.href = "/login";
    };

    return { user, loading, logout };
}
