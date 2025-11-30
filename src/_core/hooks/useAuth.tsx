import { useState } from "react";

export function useAuth() {
    // Mock user - always authenticated for demo
    const [user] = useState({ name: "Demo User", email: "demo@example.com" });
    const loading = false;

    const logout = () => {
        window.location.href = "/";
    };

    return { user, loading, logout };
}
