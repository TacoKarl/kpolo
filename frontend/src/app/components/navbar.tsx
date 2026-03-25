// app/components/Navbar.jsx
'use client';
import Link from 'next/link';
import {useEffect, useState} from "react";
import { useUser } from "@/app/context/UserContext";
import Image from "next/image";
import {jwtDecode} from "jwt-decode";
import {MyJwtPayload} from "@/app/components/interfaces/MyJwtPayload";
import {useIsAdmin} from "@/app/components/hooks/useIsAdmin";
import { checkIfUserHasRoles, getAccessToken, getUserRoles } from '../lib/auth';
import { useAuth } from './authProvider';

export default function Navbar() {
    const { user, setUser } = useUser();
    const { roles } = useAuth();
    const isAdmin = roles.includes("System Admin") || roles.includes("Club Admin");

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return (first + last).toUpperCase();
  };

  console.log("navbar:")
  console.log(roles);


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
            <li><Link href="/clubs" className="text-white">Klubber</Link></li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
          {isAdmin && (
              <Link href="/admin" className="text-white font-semibold">
                  Admin
              </Link>
          )}
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
