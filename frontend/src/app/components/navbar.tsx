'use client';

import Link from 'next/link';
import {Button} from "@/components/Button";
import { type MeUser } from "@/app/lib/getMe"
import { canAccessAdmin } from "@/app/lib/authorization";
import {useState} from "react";
import "./navbar.css"

export default function Navbar({user,} : {user: MeUser | null}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return (first + last).toUpperCase();
  };

  //const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const canSeeAdmin = canAccessAdmin(user);

  return (
    <nav className="navbar">
      <div className="navbar-container">
      <div className="flex gap-6 items-center">
          <Link href="/" className="logo">
              Kajakpolo Danmark
          </Link>
          {/* Desktop menu */}
          <ul className="nav-links desktop-menu">
              <li><Link href="/">Hjem</Link></li>
              <li><Link href="/omkajakpolo">Om Kajakpolo</Link></li>
              <li><Link href="/turneringer">Turneringer</Link></li>
              <li><Link href="/begivenheder">Begivenheder</Link></li>
              <li><Link href="/clubs">Klubber</Link></li>

              {canSeeAdmin && (
                  <li>
                      <Link href="/admin">Admin</Link>
                  </li>
              )}
          </ul>
      </div>
          {/* Right side */}
          <div className="right-section">

              {/* User / Login */}
              {user ? (
                  <Link href="/profil" className="avatar">
                      {getInitials(user.name)}
                  </Link>
              ) : (
                  <Button>
                      <Link href="/login">Sign in</Link>
                  </Button>
              )}

              {/* Burger */}
              <button
                  className="burger"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Menu"
              >
                  <span></span>
                  <span></span>
                  <span></span>
              </button>
          </div>
      </div>
        {/* Mobile menu */}
        {isMenuOpen && (
            <div className="mobile-menu">
                <Link href="/">Hjem</Link>
                <Link href="/omkajakpolo">Om Kajakpolo</Link>
                <Link href="/turneringer">Turneringer</Link>
                <Link href="/begivenheder">Begivenheder</Link>
                <Link href="/clubs">Klubber</Link>

                {canSeeAdmin && (
                    <Link href="/admin">Admin</Link>
                )}
            </div>
        )}
    </nav>
  );
}
