import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { eventoService, vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, User, Mail, Phone, Ticket, CreditCard, Check, Edit2 } from 'lucide-react';
import type { Cartela } from '../types';

const compradorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido (XX) XXXXX-XXXX'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (XXX.XXX.XXX-XX)'),
  metodoPagamento: z.enum(['PIX', 'CREDIT_CARD'], {
    required_error: 'Selecione um método de pagamento',
  }),
});

type CompradorFormData = z.infer<typeof compradorSchema>;

export default function Comprar() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();

  // Recuperar cartelas selecionadas do sessionStorage
  const [cartelasSelecionadasIds, setCartelasSelecionadasIds] = useState<string[]>([]);
  
  useEffect(() => {
    const cartelasSalvas = sessionStorage.getItem('cartelasSelecionadas');
    if (cartelasSalvas) {
      try {
        const ids = JSON.parse(cartelasSalvas);
        if (Array.isArray(ids) && ids.length > 0) {
          setCartelasSelecionadasIds(ids);
        } else {
          // Se não houver cartelas selecionadas, redirecionar para seleção
          navigate(`/selecionar/${eventoId}`);
        }
      } catch {
        navigate(`/selecionar/${eventoId}`);
      }
    } else {
      // Se não houver cartelas selecionadas, redirecionar para seleção
      navigate(`/selecionar/${eventoId}`);
    }
  }, [eventoId, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompradorFormData>({
    resolver: zodResolver(compradorSchema),
    defaultValues: {
      metodoPagamento: 'PIX', // PIX como padrão
    },
  });

  const metodoPagamento = watch('metodoPagamento');

  // Carregar dados do evento
  const { data: evento, isLoading: loadingEvento } = useQuery({
    queryKey: ['evento', eventoId],
    queryFn: () => eventoService.getById(eventoId!),
    enabled: !!eventoId,
  });

  // Carregar dados das cartelas selecionadas
  const { data: cartelasData, isLoading: loadingCartelas } = useQuery({
    queryKey: ['cartelas-disponiveis', eventoId],
    queryFn: () => eventoService.getCartelasDisponiveis(eventoId!, 500),
    enabled: !!eventoId,
  });

  // Filtrar apenas as cartelas selecionadas
  const cartelasSelecionadas = cartelasData?.cartelas?.filter(
    (c: Cartela) => cartelasSelecionadasIds.includes(c._id)
  ) || [];

  const quantidade = cartelasSelecionadasIds.length;

  // Mutation para criar venda
  const createVendaMutation = useMutation({
    mutationFn: vendaService.criar,
    onSuccess: (data) => {
      // Limpar seleção de cartelas após sucesso
      sessionStorage.removeItem('cartelasSelecionadas');
      // Navegar para página de pagamento interna com QR Code PIX
      navigate(`/pagamento/${data.vendaId}`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar venda:', error);
    },
  });

  const onSubmit = (data: CompradorFormData) => {
    if (!eventoId || cartelasSelecionadasIds.length === 0) return;

    createVendaMutation.mutate({
      eventoId,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      metodoPagamento: data.metodoPagamento,
      quantidade: cartelasSelecionadasIds.length,
      cartelasIds: cartelasSelecionadasIds,
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

  // Formatar CPF enquanto digita
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 8) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
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

  const valorTotal = (evento.valorCartela) * (quantidade || 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(`/selecionar/${eventoId}`)}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para seleção de cartelas
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
            {new Date(evento.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
        
        {/* Cartelas Selecionadas */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-purple-900 font-medium flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              {quantidade} cartela(s) selecionada(s)
            </p>
            <button
              type="button"
              onClick={() => navigate(`/selecionar/${eventoId}`)}
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              Alterar seleção
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cartelasSelecionadas.slice(0, 10).map((cartela: Cartela) => (
              <span
                key={cartela._id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
              >
                <Check className="w-3 h-3" />
                #{cartela.codigo}
              </span>
            ))}
            {cartelasSelecionadas.length > 10 && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-200 text-purple-800 rounded-lg text-sm font-medium">
                +{cartelasSelecionadas.length - 10} mais
              </span>
            )}
          </div>
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
              Email (Opcional)
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

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              CPF
            </label>
            <input
              type="text"
              {...register('cpf')}
              onChange={handleCpfChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="000.000.000-00"
            />
            {errors.cpf && (
              <p className="text-red-600 text-sm mt-1">{errors.cpf.message}</p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                metodoPagamento === 'PIX' 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}>
                <input
                  type="radio"
                  value="PIX"
                  {...register('metodoPagamento')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <div className="font-medium text-gray-900">PIX</div>
                  <div className="text-xs text-gray-500">Aprovação instantânea</div>
                </div>
              </label>
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                metodoPagamento === 'CREDIT_CARD' 
                  ? 'border-purple-600 bg-purple-50' 
                  : 'border-gray-300 hover:border-purple-300'
              }`}>
                <input
                  type="radio"
                  value="CREDIT_CARD"
                  {...register('metodoPagamento')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <div className="font-medium text-gray-900">Cartão</div>
                  <div className="text-xs text-gray-500">Crédito ou Débito</div>
                </div>
              </label>
            </div>
            {errors.metodoPagamento && (
              <p className="text-red-600 text-sm mt-1">{errors.metodoPagamento.message}</p>
            )}
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Resumo do Pedido</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantidade:</span>
              <span className="font-medium">{quantidade} cartela(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor por cartela:</span>
              <span className="font-medium">
                R$ {evento.valorCartela.toFixed(2)}
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
            <p className="text-red-800 font-medium mb-2">
              {(createVendaMutation.error as any)?.response?.data?.message || 
               'Erro ao criar venda. Tente novamente.'}
            </p>
            
            {/* Se houver venda pendente, mostrar informações e botão */}
            {(createVendaMutation.error as any)?.response?.data?.data?.vendaId && (
              <>
                {(createVendaMutation.error as any)?.response?.data?.data?.expiresAt && (
                  <p className="text-red-700 text-sm mb-3">
                    Expira em: {new Date((createVendaMutation.error as any).response.data.data.expiresAt).toLocaleString('pt-BR')}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/pagamento/${(createVendaMutation.error as any).response.data.data.vendaId}`)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Continuar com pagamento pendente
                </button>
              </>
            )}
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
