import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Auth actions
    const login = async (email, password) => {
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('token', data.data.token);
            setCurrentUser(data.data.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const data = await authApi.register(userData);
            localStorage.setItem('token', data.data.token);
            setCurrentUser(data.data.user);
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        try {
            if (currentUser) {
                await authApi.logout(currentUser.id);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setCurrentUser(null);
            setIsAuthenticated(false);
        }
    };

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await authApi.verifyToken();
                    setCurrentUser(data.data.user);
                    setIsAuthenticated(true);
                } catch (error) {
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                    setIsAuthenticated(false);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const [matches, setMatches] = useState([]);
    const [notifications, setNotifications] = useState(3);
    const [theme, setTheme] = useState('light');
    const [socket, setSocket] = useState(null);

    // Initialize Socket
    useEffect(() => {
        if (isAuthenticated && currentUser) {
            const newSocket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
            setSocket(newSocket);

            newSocket.emit('user-online', currentUser.id);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, currentUser]);

    const addMatch = (user) => {
        setMatches(prev => [...prev, user]);
    };

    const incrementNotifications = () => {
        setNotifications(prev => prev + 1);
    };

    const clearNotifications = () => {
        setNotifications(0);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        matches,
        addMatch,
        notifications,
        incrementNotifications,
        clearNotifications,
        theme,
        toggleTheme,
        socket
    };

    return (
        <AppContext.Provider value={value}>
            {!isLoading && children}
        </AppContext.Provider>
    );
};
