import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ContagemRegressivaProps {
  expiresAt: string;
  onExpire?: () => void;
}

export default function ContagemRegressiva({ expiresAt, onExpire }: ContagemRegressivaProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);

      if (left === 0 && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isExpiringSoon = timeLeft < 300; // Menos de 5 minutos

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isExpiringSoon ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
      }`}
    >
      <Clock className="w-5 h-5" />
      <span className="font-medium">
        {timeLeft > 0 ? (
          <>Tempo restante: {minutes}:{seconds.toString().padStart(2, '0')}</>
        ) : (
          'Pagamento expirado'
        )}
      </span>
    </div>
  );
}
