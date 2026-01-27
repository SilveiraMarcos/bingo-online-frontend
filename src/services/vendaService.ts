import api from './api';
import type {
  Evento,
  Cartela,
  Venda,
  CriarVendaRequest,
  CriarVendaResponse,
  ApiResponse,
} from '../types';

export const eventoService = {
  getAtivos: async (): Promise<Evento[]> => {
    const { data } = await api.get<ApiResponse<Evento[]>>('/eventos/ativos');
    return data.data || [];
  },

  getById: async (id: string): Promise<Evento> => {
    const { data } = await api.get<ApiResponse<Evento>>(`/eventos/${id}`);
    if (!data.data) throw new Error('Evento não encontrado');
    return data.data;
  },

  getCartelasDisponiveis: async (id: string, limite?: number): Promise<{ cartelas: Cartela[]; total: number }> => {
    const { data } = await api.get<ApiResponse<{ cartelas: Cartela[]; total: number }>>(
      `/eventos/${id}/cartelas/disponiveis`,
      { params: { limite } }
    );
    return data.data || { cartelas: [], total: 0 };
  },
};

export const vendaService = {
  criar: async (vendaData: CriarVendaRequest): Promise<CriarVendaResponse> => {
    const { data } = await api.post<ApiResponse<CriarVendaResponse>>('/vendas/criar', vendaData);
    if (!data.data) throw new Error('Erro ao criar venda');
    return data.data;
  },

  getById: async (id: string): Promise<Venda> => {
    const { data } = await api.get<ApiResponse<Venda>>(`/vendas/${id}`);
    if (!data.data) throw new Error('Venda não encontrada');
    return data.data;
  },

  getStatus: async (id: string): Promise<Pick<Venda, 'status' | 'paidAt' | 'expiresAt' | 'emailEnviado'>> => {
    const { data } = await api.get<ApiResponse<Pick<Venda, 'status' | 'paidAt' | 'expiresAt' | 'emailEnviado'>>>(
      `/vendas/${id}/status`
    );
    if (!data.data) throw new Error('Status não encontrado');
    return data.data;
  },

  reenviarEmail: async (id: string): Promise<void> => {
    await api.post(`/vendas/${id}/reenviar-email`);
  },

  /**
   * Retorna a URL para download de todas as cartelas de uma venda
   */
  getDownloadUrl: (vendaId: string): string => {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/vendas/${vendaId}/cartelas/download`;
  },

  /**
   * Retorna a URL para download de uma cartela específica
   */
  getCartelaDownloadUrl: (vendaId: string, cartelaId: string): string => {
    const baseUrl = api.defaults.baseURL || '';
    return `${baseUrl}/vendas/${vendaId}/cartelas/${cartelaId}/download`;
  },
};
