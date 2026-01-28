import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { eventoService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Ticket, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const { data: eventos, isLoading, error } = useQuery({
    queryKey: ['eventos-ativos'],
    queryFn: eventoService.getAtivos,
  });

  if (isLoading) {
    return <LoadingSpinner text="Carregando eventos..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Erro ao carregar eventos. Tente novamente.</p>
        </div>
      </div>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Nenhum evento disponível no momento.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Eventos de Bingo
        </h2>
        <p className="text-xl text-gray-600">
          Compre suas cartelas online e participe!
        </p>
      </div>

      {/* Lista de Eventos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento) => (
          <div
            key={evento._id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                {evento.nome}
              </h3>
              {evento.descricao && (
                <p className="text-purple-100">{evento.descricao}</p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Data */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Data do Evento</p>
                  <p className="text-gray-600">
                    {new Date(evento.data).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Preço e Cartelas */}
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    R$ {(evento.valorCartela).toFixed(2)} por cartela
                  </p>
                  <p className="text-sm text-gray-500">
                    Disponível para compra
                  </p>
                </div>
              </div>

              {/* Botão para Selecionar Cartelas */}
              <button
                onClick={() => navigate(`/selecionar/${evento._id}`)}
                className="w-full mt-4 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Escolher Cartelas
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
