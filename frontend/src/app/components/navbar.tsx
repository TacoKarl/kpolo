// app/components/Navbar.jsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 z-50 bg-gray-800 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Kajakpolo Danmark
        </Link>
        <ul className="flex gap-6">
          <li><Link href="/" className="text-white">Home</Link></li>
          <li><Link href="/about" className="text-white">About</Link></li>
          <li><Link href="/contact" className="text-white">Contact</Link></li>
        </ul>
      </div>
    </nav>
  );
}
