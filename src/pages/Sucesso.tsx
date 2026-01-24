import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Mail, Calendar, Ticket, Home as HomeIcon } from 'lucide-react';

export default function Sucesso() {
  const { vendaId } = useParams<{ vendaId: string }>();
  const navigate = useNavigate();

  const { data: venda, isLoading } = useQuery({
    queryKey: ['venda', vendaId],
    queryFn: () => vendaService.getById(vendaId!),
    enabled: !!vendaId,
  });

  const reenviarEmailMutation = useMutation({
    mutationFn: () => vendaService.reenviarEmail(vendaId!),
    onSuccess: () => {
      alert('Email reenviado com sucesso!');
    },
    onError: () => {
      alert('Erro ao reenviar email. Tente novamente.');
    },
  });

  if (isLoading) {
    return <LoadingSpinner text="Carregando confirmação..." />;
  }

  if (!venda || venda.status !== 'pago') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">
            {venda?.status === 'pendente' 
              ? 'Pagamento ainda pendente'
              : 'Venda não encontrada ou ainda não confirmada'}
          </p>
          {venda?.status === 'pendente' && (
            <button
              onClick={() => navigate(`/pagamento/${vendaId}`)}
              className="mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
            >
              Voltar para Pagamento
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Cabeçalho de Sucesso */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Pagamento Confirmado!
        </h2>
        <p className="text-xl text-gray-600">
          Sua compra foi realizada com sucesso
        </p>
      </div>

      {/* Informações da Compra */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detalhes da Compra
        </h3>

        <div className="space-y-4">
          {/* Evento */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{venda.evento.nome}</p>
              <p className="text-sm text-gray-600">
                {new Date(venda.evento.data).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Cartelas */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <Ticket className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-2">
                Suas Cartelas ({venda.cartelas.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {venda.cartelas.map((cartela) => (
                  <div
                    key={cartela._id}
                    className="bg-purple-50 border border-purple-200 rounded px-3 py-2 text-center"
                  >
                    <span className="font-mono text-sm font-medium text-purple-900">
                      {cartela.codigo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comprador */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">{venda.comprador.nome}</p>
              <p className="text-sm text-gray-600">{venda.comprador.email}</p>
              <p className="text-sm text-gray-600">{venda.comprador.telefone}</p>
            </div>
          </div>

          {/* Valor */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-gray-900">Total Pago:</span>
            <span className="text-2xl font-bold text-purple-600">
              R$ {(venda.valorTotal / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">📧 Verifique seu Email</h4>
        <p className="text-sm text-blue-800 mb-4">
          Enviamos suas cartelas para <strong>{venda.comprador.email}</strong>
        </p>
        <p className="text-sm text-blue-800 mb-4">
          Não recebeu? Verifique sua caixa de spam ou reenvie o email.
        </p>
        <button
          onClick={() => reenviarEmailMutation.mutate()}
          disabled={reenviarEmailMutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-400"
        >
          {reenviarEmailMutation.isPending ? 'Reenviando...' : 'Reenviar Email'}
        </button>
      </div>

      {/* Próximos Passos */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-900 mb-3">✅ Próximos Passos:</h4>
        <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
          <li>Guarde o email com suas cartelas</li>
          <li>Imprima ou tenha as cartelas no celular no dia do evento</li>
          <li>Chegue com antecedência ao local</li>
          <li>Boa sorte! 🍀</li>
        </ol>
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <HomeIcon className="w-5 h-5" />
        Voltar para Início
      </button>
    </div>
  );
}
