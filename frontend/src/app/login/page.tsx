'use client';

import {useCallback, useEffect, useRef, useState} from "react";
import { useUser } from "@/app/context/UserContext";
import { createSession } from "../lib/session";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const isDev = process.env.NODE_ENV === 'development';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verified, setVerified] = useState(isDev);
    const ref = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const {setUser} = useUser();
    const [error, setError] = useState<Error | null>(null);
    const router = useRouter();

    const handleVerify = useCallback(() => {
        setVerified(true);
    }, []);

    const handleError = useCallback(() => {
        setVerified(false);
    }, []);

    useEffect(() => {
        if (isDev) return;
        if (!ref.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(ref.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
            callback: handleVerify,
            'error-callback': handleError,
        });

        return () => {
            if (window.turnstile && widgetIdRef.current) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, [handleError, handleVerify, isDev]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        // Her kan du kalde dit login API
        const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
        const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

        console.log(`Login med: ${email}`);

        const query = `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    name
                }
            }
        `;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) throw new Error('API URL not configured')

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    query,
                    variables: {email: email, password: password},
                }),
            });

            const data = await res.json();
            if (data.errors) {
                setError(data.errors[0].message || 'Login failed');
                return;
            }
            
            const loginData = data.data.login;
            if (loginData) {
                
                await createSession(loginData.token);
                
                setUser({
                    name: loginData.name,
                    avatarUrl: null,
                    token: loginData.token,
                });
        
            }
        

        } catch (err) {
            console.error(err);
            setError(new Error('Login fejlede - prøv igen'));
        }
        router.push('/profil');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <form
                onSubmit={handleSubmit}
                className="bg-card text-foreground p-8 rounded-xl shadow-lg border border-foreground/10 w-full max-w-sm flex flex-col gap-4"
            >
                <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

                <input
                    type="email"
                    name="email"
                    placeholder="E-mail: example@example.dk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {error && (
                    <p className="text-sm text-red-600 text-center">
                        {error.message}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={!verified}
                    className="bg-blue-600 text-white p-2 rounded-md disabled:hover:bg-gray-400 hover:bg-blue-700 transition cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Login
                </button>
                {!isDev && <div ref={ref}></div>}
                <p className="text-center text-gray-500 text-sm mt-2">
                    Don&apos;t have an account? Ask your club manager
                </p>
            </form>

        </div>
    )
}