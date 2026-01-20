import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodePixProps {
  pixCode: string;
  pixCopyPaste: string;
}

export default function QRCodePix({ pixCode, pixCopyPaste }: QRCodePixProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCopyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="bg-white p-6 rounded-lg flex justify-center">
        <QRCodeSVG
          value={pixCode}
          size={256}
          level="M"
          includeMargin={true}
        />
      </div>

      {/* Pix Copia e Cola */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código Pix Copia e Cola:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pixCopyPaste}
            readOnly
            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-mono"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escolha pagar com Pix</li>
          <li>Escaneie o QR Code ou cole o código</li>
          <li>Confirme o pagamento</li>
        </ol>
      </div>
    </div>
  );
}
