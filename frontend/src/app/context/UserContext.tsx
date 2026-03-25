'use client';

import {createContext, useContext, useState, ReactNode} from 'react';

type User = {
    name: string;
    avatarUrl: string | null;
    roles: string[];
}

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(() => {
        if (typeof window === "undefined") return null;
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const setUser = (user: User | null) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        else {
            localStorage.removeItem('user');
        }
        setUserState(user);
    }

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
