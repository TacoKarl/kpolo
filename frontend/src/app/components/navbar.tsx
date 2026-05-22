import Link from 'next/link';
import {Button} from "@/components/Button";
import { type MeUser } from "@/app/lib/getMe"
import { canAccessAdmin } from "@/app/lib/authorization";

export default async function Navbar({user,} : {user: MeUser | null}) {
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
    <nav className="sticky top-0 left-0 z-50 bg-gray-800 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Kajakpolo Danmark
        </Link>
        <ul className="flex gap-6">
          <li><Link href="/" className="text-white">Hjem</Link></li>
          <li><Link href="/omkajakpolo" className="text-white">Om Kajakpolo</Link></li>
          <li><Link href="/turneringer" className="text-white">Turneringer</Link></li>
          <li><Link href="/begivenheder" className="text-white">Begivenheder</Link></li>
            <li><Link href="/clubs" className="text-white">Klubber</Link></li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
          {canSeeAdmin && (
              <Link href="/admin" className="text-white font-semibold">
                  Admin
              </Link>
          )}
        {user ? (
            <Link href="/profil" className="flex items-center gap-2 bg-gray-700 rounded-full text-white">

              {/*  {user.avatarUrl ? (*/}
              {/*    <Image*/}
              {/*        src={user.avatarUrl}*/}
              {/*        alt="Profilbillede"*/}
              {/*        width={32}*/}
              {/*        height={32}*/}
              {/*        className="rounded-full" />*/}
              {/*) : */}
                    (
                  <span className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  {getInitials(user.name)}
                </span>
              )
            {/*}*/}
            </Link>
        ) : (
            <Button><Link href="/login">Sign in</Link></Button>
        )}
      </div>
      </div>
    </nav>
  );
}
