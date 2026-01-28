import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { eventoService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Check, ShoppingCart, Search, Grid, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Cartela } from '../types';

const CARTELAS_POR_PAGINA = 100;

export default function SelecionarCartelas() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();
  
  const [cartelasSelecionadas, setCartelasSelecionadas] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [paginaAtual, setPaginaAtual] = useState(1);

  // Carregar dados do evento
  const { data: evento, isLoading: loadingEvento } = useQuery({
    queryKey: ['evento', eventoId],
    queryFn: () => eventoService.getById(eventoId!),
    enabled: !!eventoId,
  });

  // Carregar cartelas disponíveis
  const { data: cartelasData, isLoading: loadingCartelas } = useQuery({
    queryKey: ['cartelas-disponiveis', eventoId],
    queryFn: () => eventoService.getCartelasDisponiveis(eventoId!, 500),
    enabled: !!eventoId,
  });

  // Filtrar cartelas pela busca
  const cartelasFiltradas = useMemo(() => {
    if (!cartelasData?.cartelas) return [];
    
    if (!busca.trim()) return cartelasData.cartelas;
    
    const termoBusca = busca.toLowerCase().trim();
    return cartelasData.cartelas.filter((cartela: Cartela) => 
      cartela.codigo.toLowerCase().includes(termoBusca) ||
      cartela.numeros.some(n => n.includes(termoBusca))
    );
  }, [cartelasData?.cartelas, busca]);

  // Calcular paginação
  const totalPaginas = Math.ceil(cartelasFiltradas.length / CARTELAS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * CARTELAS_POR_PAGINA;
  const indiceFim = indiceInicio + CARTELAS_POR_PAGINA;
  const cartelasPaginadas = cartelasFiltradas.slice(indiceInicio, indiceFim);

  // Resetar para primeira página quando busca mudar
  useMemo(() => {
    setPaginaAtual(1);
  }, [busca]);

  const toggleCartela = (cartelaId: string) => {
    setCartelasSelecionadas(prev => {
      if (prev.includes(cartelaId)) {
        return prev.filter(id => id !== cartelaId);
      }
      return [...prev, cartelaId];
    });
  };

  const selecionarTodas = () => {
    const todasIds = cartelasFiltradas.map((c: Cartela) => c._id);
    setCartelasSelecionadas(todasIds);
  };

  const selecionarPaginaAtual = () => {
    const idsNovos = cartelasPaginadas.map((c: Cartela) => c._id);
    setCartelasSelecionadas(prev => {
      const novoSet = new Set([...prev, ...idsNovos]);
      return Array.from(novoSet);
    });
  };

  const limparSelecao = () => {
    setCartelasSelecionadas([]);
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prosseguirParaCompra = () => {
    if (cartelasSelecionadas.length === 0) return;
    
    // Salvar cartelas selecionadas no sessionStorage
    sessionStorage.setItem('cartelasSelecionadas', JSON.stringify(cartelasSelecionadas));
    navigate(`/comprar/${eventoId}`);
  };

  if (loadingEvento || loadingCartelas) {
    return <LoadingSpinner text="Carregando cartelas disponíveis..." />;
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

  const valorTotal = (evento.valorCartela || 0) * cartelasSelecionadas.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para eventos
        </button>

        {/* Informações do Evento */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{evento.nome}</h2>
              <p className="text-gray-600 text-sm">
                Selecione as cartelas que deseja comprar
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Valor por cartela</p>
                <p className="text-lg font-bold text-purple-600">
                  R$ {evento.valorCartela?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de busca e controles */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por código ou número..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Controles */}
            <div className="flex items-center gap-2">
              {/* Toggle de visualização */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Botões de seleção */}
              <button
                onClick={selecionarPaginaAtual}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
              >
                Selecionar página
              </button>
              <button
                onClick={selecionarTodas}
                className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors whitespace-nowrap"
              >
                Selecionar todas
              </button>
              {cartelasSelecionadas.length > 0 && (
                <button
                  onClick={limparSelecao}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Limpar ({cartelasSelecionadas.length})
                </button>
              )}
            </div>
          </div>

          {/* Status da busca e paginação */}
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500">
            <span>
              Exibindo {indiceInicio + 1}-{Math.min(indiceFim, cartelasFiltradas.length)} de {cartelasFiltradas.length} cartela(s)
              {cartelasData?.total && ` (${cartelasData.total} total disponíveis)`}
            </span>
            <span className="font-medium text-purple-600">
              {cartelasSelecionadas.length} selecionada(s)
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Cartelas */}
      {cartelasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">
            {busca 
              ? 'Nenhuma cartela encontrada para essa busca.' 
              : 'Não há cartelas disponíveis para este evento.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-8">
            {cartelasPaginadas.map((cartela: Cartela) => (
              <CartelaCard
                key={cartela._id}
                cartela={cartela}
                selecionada={cartelasSelecionadas.includes(cartela._id)}
                onClick={() => toggleCartela(cartela._id)}
              />
            ))}
          </div>
          
          {/* Controles de Paginação */}
          {totalPaginas > 1 && (
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onPaginaAnterior={paginaAnterior}
              onProximaPagina={proximaPagina}
              onIrParaPagina={irParaPagina}
            />
          )}
        </>
      ) : (
        <>
          <div className="space-y-2 pb-8">
            {cartelasPaginadas.map((cartela: Cartela) => (
              <CartelaListItem
                key={cartela._id}
                cartela={cartela}
                selecionada={cartelasSelecionadas.includes(cartela._id)}
                onClick={() => toggleCartela(cartela._id)}
              />
            ))}
          </div>
          
          {/* Controles de Paginação */}
          {totalPaginas > 1 && (
            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              onPaginaAnterior={paginaAnterior}
              onProximaPagina={proximaPagina}
              onIrParaPagina={irParaPagina}
            />
          )}
        </>
      )}

      {/* Barra de ação fixa no rodapé - adicionar padding bottom maior */}
      <div className="pb-32" />

      {/* Barra de ação fixa no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-20">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">
              {cartelasSelecionadas.length} cartela(s) selecionada(s)
            </p>
            <p className="text-xl font-bold text-purple-600">
              Total: R$ {valorTotal.toFixed(2)}
            </p>
          </div>
          <button
            onClick={prosseguirParaCompra}
            disabled={cartelasSelecionadas.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            <ShoppingCart className="w-5 h-5" />
            Prosseguir para compra
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de cartão da cartela (modo grid)
interface CartelaCardProps {
  cartela: Cartela;
  selecionada: boolean;
  onClick: () => void;
}

function CartelaCard({ cartela, selecionada, onClick }: CartelaCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selecionada
          ? 'border-purple-600 bg-purple-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-purple-300'
      }`}
    >
      {/* Indicador de seleção */}
      {selecionada && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Código da cartela */}
      <div className="mb-3">
        <span className="text-lg font-bold text-gray-900">
          #{cartela.codigo}
        </span>
      </div>

      {/* Números da cartela em grade 5x5 */}
      <div className="grid grid-cols-5 gap-1">
        {cartela.numeros.slice(0, 25).map((numero, idx) => (
          <div
            key={idx}
            className={`aspect-square flex items-center justify-center text-xs font-medium rounded ${
              numero === 'FREE' || numero === ''
                ? 'bg-purple-200 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {numero === 'FREE' ? '★' : numero}
          </div>
        ))}
      </div>
    </button>
  );
}

// Componente de item da lista (modo lista)
interface CartelaListItemProps {
  cartela: Cartela;
  selecionada: boolean;
  onClick: () => void;
}

function CartelaListItem({ cartela, selecionada, onClick }: CartelaListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        selecionada
          ? 'border-purple-600 bg-purple-50'
          : 'border-gray-200 bg-white hover:border-purple-300'
      }`}
    >
      {/* Checkbox visual */}
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          selecionada
            ? 'bg-purple-600 border-purple-600'
            : 'border-gray-300'
        }`}
      >
        {selecionada && <Check className="w-4 h-4 text-white" />}
      </div>

      {/* Código */}
      <div className="flex-shrink-0">
        <span className="text-lg font-bold text-gray-900">
          #{cartela.codigo}
        </span>
      </div>

      {/* Números em linha */}
      <div className="flex-1 flex flex-wrap gap-1">
        {cartela.numeros.slice(0, 25).map((numero, idx) => (
          <span
            key={idx}
            className={`inline-flex items-center justify-center w-7 h-7 text-xs font-medium rounded ${
              numero === 'FREE' || numero === ''
                ? 'bg-purple-200 text-purple-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {numero === 'FREE' ? '★' : numero}
          </span>
        ))}
      </div>
    </button>
  );
}

// Componente de Paginação
interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  onPaginaAnterior: () => void;
  onProximaPagina: () => void;
  onIrParaPagina: (pagina: number) => void;
}

function Paginacao({
  paginaAtual,
  totalPaginas,
  onPaginaAnterior,
  onProximaPagina,
  onIrParaPagina,
}: PaginacaoProps) {
  // Gerar array de páginas a serem exibidas
  const gerarPaginas = () => {
    const paginas: (number | string)[] = [];
    const maxPaginasVisiveis = 5;

    if (totalPaginas <= maxPaginasVisiveis + 2) {
      // Mostrar todas as páginas se forem poucas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Sempre mostrar primeira página
      paginas.push(1);

      if (paginaAtual > 3) {
        paginas.push('...');
      }

      // Páginas ao redor da atual
      const inicio = Math.max(2, paginaAtual - 1);
      const fim = Math.min(totalPaginas - 1, paginaAtual + 1);

      for (let i = inicio; i <= fim; i++) {
        paginas.push(i);
      }

      if (paginaAtual < totalPaginas - 2) {
        paginas.push('...');
      }

      // Sempre mostrar última página
      paginas.push(totalPaginas);
    }

    return paginas;
  };

  const paginas = gerarPaginas();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Botão Anterior */}
        <button
          onClick={onPaginaAnterior}
          disabled={paginaAtual === 1}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {/* Números das páginas */}
        {paginas.map((pagina, idx) => {
          if (pagina === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const numeroPagina = pagina as number;
          const isAtual = numeroPagina === paginaAtual;

          return (
            <button
              key={numeroPagina}
              onClick={() => onIrParaPagina(numeroPagina)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isAtual
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {numeroPagina}
            </button>
          );
        })}

        {/* Botão Próximo */}
        <button
          onClick={onProximaPagina}
          disabled={paginaAtual === totalPaginas}
          className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          Próximo
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Informação adicional */}
      <div className="text-center mt-3 text-sm text-gray-500">
        Página {paginaAtual} de {totalPaginas}
      </div>
    </div>
  );
}
