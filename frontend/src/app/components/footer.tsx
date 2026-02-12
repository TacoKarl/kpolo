// app/components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white p-8 mt-auto">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-4">Om</h3>
          <p>Denne side er et bachelorprojekt løsningsforslag til Kajakpolo Danmark</p>
        </div>
        <div>
          <h3 className="font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/privacy">Privatlivs Politik</Link></li>
            <li><Link href="/terms">Betingelser for Service</Link></li>
            <li><Link href="/contact">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-4">Connect</h3>
          <p>Social media links her</p>
        </div>
      </div>
      <div className="text-center mt-8 pt-4 border-t border-gray-700">
        <p>© {new Date().getFullYear()} Kajakpolo Danmark (Bachelorprojekt). Alle rettigheder resererveret.</p>
      </div>
    </footer>
  );
}
