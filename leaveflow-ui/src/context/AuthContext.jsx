import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const storedToken = localStorage.getItem('leaveflow_token');
        const storedUser = localStorage.getItem('leaveflow_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Invalid credentials');
        }

        const data = await response.json();

        // Decode JWT to get user info
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const userData = {
            id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
            email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        };

        localStorage.setItem('leaveflow_token', data.token);
        localStorage.setItem('leaveflow_user', JSON.stringify(userData));

        setToken(data.token);
        setUser(userData);

        return userData;
    };

    const register = async (email, password, role = 'Employee') => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const url = `${apiUrl}/api/auth/register`;

        console.log('[AuthContext] Registering user...');
        console.log('[AuthContext] API URL:', apiUrl);
        console.log('[AuthContext] Full URL:', url);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('[AuthContext] Registration failed:', error);
                throw new Error(error || 'Registration failed');
            }

            console.log('[AuthContext] Registration successful!');
            return await response.json();
        } catch (error) {
            console.error('[AuthContext] Registration error:', error);
            console.error('[AuthContext] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('leaveflow_token');
        localStorage.removeItem('leaveflow_user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isManager: user?.role === 'Manager',
        isEmployee: user?.role === 'Employee',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
