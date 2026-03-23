'use client';

import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import { getAccessToken, refreshAccessToken, subscribeToAccessToken } from "@/app/lib/auth";

type User = {
    name: string;
    avatarUrl: string | null;
}

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    authReady: boolean;
    accessToken: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(() => {
        if (typeof window === "undefined") return null;
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [authReady, setAuthReady] = useState(false);
    const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());

    const setUser = (user: User | null) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        else {
            localStorage.removeItem('user');
        }
        setUserState(user);
    }

    useEffect(() => {
        let active = true;
        refreshAccessToken().finally(() => {
            if (active) setAuthReady(true);
        });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        return subscribeToAccessToken((token) => {
            setAccessTokenState(token);
        });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, authReady, accessToken }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
