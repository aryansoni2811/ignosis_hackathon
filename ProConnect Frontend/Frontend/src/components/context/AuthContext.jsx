import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({
    user: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    checkAuth: () => {}
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Initialize auth state from localStorage
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        const email = localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName');

        if (token && userType && email && name) {
            setUser({
                token,
                userType,
                email,
                name
            });
            setIsAuthenticated(true);
            return true;
        } else {
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
    };

    const login = (userData) => {
        if (!userData || !userData.token) {
            throw new Error('Invalid user data');
        }

        // Store user data in localStorage
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userType', userData.userType);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userName', userData.name);

        // Update state
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');

        // Reset state
        setUser(null);
        setIsAuthenticated(false);
    };

    const contextValue = {
        user,
        isAuthenticated,
        login,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};