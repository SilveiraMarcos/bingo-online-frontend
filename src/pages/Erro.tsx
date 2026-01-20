import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { XCircle, Home as HomeIcon, RefreshCw } from 'lucide-react';

export default function Erro() {
  const { vendaId } = useParams<{ vendaId: string }>();
  const navigate = useNavigate();

  const { data: venda, isLoading } = useQuery({
    queryKey: ['venda', vendaId],
    queryFn: () => vendaService.getById(vendaId!),
    enabled: !!vendaId,
  });

  if (isLoading) {
    return <LoadingSpinner text="Carregando informações..." />;
  }

  const getMensagem = () => {
    if (!venda) {
      return {
        titulo: 'Venda não encontrada',
        descricao: 'Não foi possível encontrar informações sobre esta venda.',
        podeRetentar: false,
      };
    }

    switch (venda.status) {
      case 'EXPIRADO':
        return {
          titulo: 'Pagamento Expirado',
          descricao:
            'O prazo para realizar o pagamento expirou. A venda foi cancelada automaticamente.',
          podeRetentar: true,
        };
      case 'CANCELADO':
        return {
          titulo: 'Pagamento Cancelado',
          descricao: 'Esta venda foi cancelada.',
          podeRetentar: true,
        };
      case 'ERRO':
        return {
          titulo: 'Erro no Pagamento',
          descricao:
            'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.',
          podeRetentar: true,
        };
      default:
        return {
          titulo: 'Pagamento Pendente',
          descricao: 'O pagamento ainda não foi confirmado.',
          podeRetentar: false,
        };
    }
  };

  const { titulo, descricao, podeRetentar } = getMensagem();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Cabeçalho de Erro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{titulo}</h2>
        <p className="text-xl text-gray-600">{descricao}</p>
      </div>

      {/* Detalhes da Venda (se disponível) */}
      {venda && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalhes da Tentativa
          </h3>

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
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-medium ${
                  venda.status === 'EXPIRADO' || venda.status === 'CANCELADO'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {venda.status}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Valor:</span>
              <span className="text-xl font-bold text-gray-700">
                R$ {(venda.valorTotal / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Orientações */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-yellow-900 mb-3">O que fazer agora?</h4>
        <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
          {podeRetentar && (
            <>
              <li>Você pode fazer uma nova tentativa de compra</li>
              <li>Verifique se há cartelas disponíveis para o evento</li>
              <li>Certifique-se de realizar o pagamento dentro do prazo</li>
            </>
          )}
          <li>Em caso de dúvidas, entre em contato com a organização</li>
          <li>Se o valor foi debitado, aguarde o estorno automático</li>
        </ul>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-3">
        {podeRetentar && venda && (
          <button
            onClick={() => navigate(`/comprar/${venda.evento._id}`)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <HomeIcon className="w-5 h-5" />
          Voltar para Início
        </button>
      </div>

      {/* Suporte */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Precisa de ajuda?{' '}
          <a href="mailto:contato@paroquia.com" className="text-purple-600 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
