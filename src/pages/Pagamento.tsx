import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCodePix from '../components/QRCodePix';
import ContagemRegressiva from '../components/ContagemRegressiva';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function Pagamento() {
  const { vendaId } = useParams<{ vendaId: string }>();
  const navigate = useNavigate();

  // Buscar status da venda com polling
  const {
    data: venda,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['venda', vendaId],
    queryFn: () => vendaService.getById(vendaId!),
    enabled: !!vendaId,
    refetchInterval: (data) => {
      // Continua polling se status for PENDENTE
      if (data?.status === 'PENDENTE') {
        return 3000; // 3 segundos
      }
      return false;
    },
  });

  // Redirecionar quando status mudar
  useEffect(() => {
    if (!venda) return;

    if (venda.status === 'PAGO') {
      navigate(`/sucesso/${venda._id}`);
    } else if (venda.status === 'EXPIRADO' || venda.status === 'CANCELADO') {
      navigate(`/erro/${venda._id}`);
    }
  }, [venda, navigate]);

  if (isLoading) {
    return <LoadingSpinner text="Carregando informações de pagamento..." />;
  }

  if (!venda) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Venda não encontrada.</p>
        </div>
      </div>
    );
  }

  const handleExpire = () => {
    refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Finalize seu Pagamento
        </h2>
        <p className="text-gray-600">
          Escaneie o QR Code ou copie o código Pix para pagar
        </p>
      </div>

      {/* Status Cards */}
      <div className="mb-6">
        {venda.status === 'PENDENTE' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-900">Aguardando Pagamento</p>
              <p className="text-sm text-yellow-700">
                Realize o pagamento para confirmar sua compra
              </p>
            </div>
          </div>
        )}

        {venda.status === 'PAGO' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Pagamento Confirmado!</p>
              <p className="text-sm text-green-700">
                Redirecionando para confirmação...
              </p>
            </div>
          </div>
        )}

        {(venda.status === 'EXPIRADO' || venda.status === 'CANCELADO') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Pagamento Expirado</p>
              <p className="text-sm text-red-700">
                O prazo para pagamento expirou
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contagem Regressiva */}
      {venda.status === 'PENDENTE' && (
        <div className="mb-6">
          <ContagemRegressiva expiresAt={venda.expiresAt} onExpire={handleExpire} />
        </div>
      )}

      {/* Resumo da Compra */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Compra</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Evento:</span>
            <span className="font-medium">{venda.evento.nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Quantidade:</span>
            <span className="font-medium">{venda.cartelas.length} cartela(s)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Comprador:</span>
            <span className="font-medium">{venda.comprador.nome}</span>
          </div>
          <div className="border-t pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="text-xl font-bold text-purple-600">
              R$ {(venda.valorTotal / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* QR Code e Código Pix */}
      {venda.status === 'PENDENTE' && venda.pagamento.pixCode && venda.pagamento.pixCopyPaste && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <QRCodePix
            pixCode={venda.pagamento.pixCode}
            pixCopyPaste={venda.pagamento.pixCopyPaste}
          />
        </div>
      )}

      {/* Informações Adicionais */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Informações Importantes:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>O pagamento será confirmado automaticamente após a aprovação</li>
          <li>Você receberá suas cartelas por email</li>
          <li>Guarde o email com suas cartelas para o dia do evento</li>
          <li>Em caso de dúvidas, entre em contato com a organização</li>
        </ul>
      </div>
    </div>
  );
}
