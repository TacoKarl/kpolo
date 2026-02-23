// app/components/Navbar.jsx
'use client';
import Link from 'next/link';
import { useEffect } from "react";
import { useUser} from "@/app/context/UserContext";
import Image from "next/image";

export default function Navbar() {
    const { user } = useUser();

  useEffect(() => {
    // Her kan du hente brugerdata fra fx session eller API
    // Eksempel:
    // setUser({ name: "John Doe", avatarUrl: null });
  }, []);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return (first + last).toUpperCase();
  };

  return (
    <nav className="sticky top-0 left-0 z-50 bg-gray-800 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Kajakpolo Danmark
        </Link>
        <ul className="flex gap-6">
          <li><Link href="/" className="text-white">Hjem</Link></li>
          <li><Link href="/omkajakpolo" className="text-white">Om Kajakpolo</Link></li>
          <li><Link href="/turneringsliste" className="text-white">Turneringsliste</Link></li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
            <Link href="/profil" className="flex items-center gap-2 bg-gray-700 rounded-full text-white">
              {user.avatarUrl ? (
                  <Image
                      src={user.avatarUrl}
                      alt="Profilbillede"
                      width={32}
                      height={32}
                      className="rounded-full" />
              ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  {getInitials(user.name)}
                </span>
              )}
            </Link>
        ) : (
            <Link href="/login" className="text-white">Login</Link>
        )}
      </div>
      </div>
    </nav>
  );
}
