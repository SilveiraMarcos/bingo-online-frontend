import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center space-x-3">
          <Ticket className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Bingo Paróquia</h1>
            <p className="text-sm text-purple-200">Compre suas cartelas online</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
