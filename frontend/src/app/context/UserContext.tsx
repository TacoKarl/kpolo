'use client';

import {createContext, useContext, useState, ReactNode, useEffect} from 'react';

type User = {
    name: string;
    avatarUrl: string | null;
    token: string;
}

type UserContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);

    const setUser = (user: User | null) => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', user.token);
        }
        else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        setUserState(user);
    }

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser){
            setUserState(JSON.parse(savedUser));
        }
    }, [])

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