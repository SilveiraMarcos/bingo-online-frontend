import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { eventoService, vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, User, Mail, Phone, Ticket, CreditCard } from 'lucide-react';

const compradorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido (XX) XXXXX-XXXX'),
  quantidade: z.number().min(1, 'Selecione pelo menos 1 cartela'),
});

type CompradorFormData = z.infer<typeof compradorSchema>;

export default function Comprar() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompradorFormData>({
    resolver: zodResolver(compradorSchema),
    defaultValues: {
      quantidade: 1,
    },
  });

  const quantidade = watch('quantidade');

  // Carregar dados do evento
  const { data: evento, isLoading: loadingEvento } = useQuery({
    queryKey: ['evento', eventoId],
    queryFn: () => eventoService.getById(eventoId!),
    enabled: !!eventoId,
  });

  // Verificar cartelas disponíveis
  const { data: cartelasDisponiveis, isLoading: loadingCartelas } = useQuery({
    queryKey: ['cartelas-disponiveis', eventoId],
    queryFn: () => eventoService.getCartelasDisponiveis(eventoId!),
    enabled: !!eventoId,
  });

  // Mutation para criar venda
  const createVendaMutation = useMutation({
    mutationFn: vendaService.criar,
    onSuccess: (data) => {
      navigate(`/pagamento/${data.venda._id}`);
    },
  });

  const onSubmit = (data: CompradorFormData) => {
    if (!eventoId) return;

    createVendaMutation.mutate({
      eventoId,
      comprador: {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
      },
      quantidade: data.quantidade,
    });
  };

  // Formatar telefone enquanto digita
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }

    e.target.value = value;
  };

  if (loadingEvento || loadingCartelas) {
    return <LoadingSpinner text="Carregando informações..." />;
  }

  if (!evento) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Evento não encontrado.</p>
        </div>
      </div>
    );
  }

  const valorTotal = (evento.valorPorCartela / 100) * (quantidade || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para eventos
      </button>

      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{evento.nome}</h2>
        {evento.descricao && (
          <p className="text-gray-600 mb-4">{evento.descricao}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            Data:{' '}
            {new Date(evento.dataEvento).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {evento.local && <span>• {evento.local}</span>}
        </div>
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-900 font-medium">
            Cartelas disponíveis: {cartelasDisponiveis || 0}
          </p>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Informações do Comprador
        </h3>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              {...register('nome')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Seu nome completo"
            />
            {errors.nome && (
              <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              {...register('telefone')}
              onChange={handleTelefoneChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            />
            {errors.telefone && (
              <p className="text-red-600 text-sm mt-1">{errors.telefone.message}</p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ticket className="w-4 h-4 inline mr-2" />
              Quantidade de Cartelas
            </label>
            <input
              type="number"
              {...register('quantidade', { valueAsNumber: true })}
              min={1}
              max={Math.min(evento.maxCartelasPorComprador, cartelasDisponiveis || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Máximo: {Math.min(evento.maxCartelasPorComprador, cartelasDisponiveis || 0)}{' '}
              cartelas
            </p>
            {errors.quantidade && (
              <p className="text-red-600 text-sm mt-1">{errors.quantidade.message}</p>
            )}
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantidade:</span>
              <span className="font-medium">{quantidade || 0} cartela(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor por cartela:</span>
              <span className="font-medium">
                R$ {(evento.valorPorCartela / 100).toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-purple-600">
                R$ {valorTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Erro da Mutation */}
        {createVendaMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              Erro ao criar venda. Tente novamente.
            </p>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={createVendaMutation.isPending}
          className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {createVendaMutation.isPending ? (
            <>Processando...</>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Prosseguir para Pagamento
            </>
          )}
        </button>
      </form>
    </div>
  );
}
