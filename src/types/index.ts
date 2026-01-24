export interface Evento {
  _id: string;
  nome: string;
  data: string;
  valorCartela: number;
  descricao?: string;
  local?: string;
  dataEvento?: string;
  status: 'ativo' | 'finalizado' | 'cancelado';
  cartelasDisponiveis?: number;
}

export interface Cartela {
  _id: string;
  codigo: string;
  numeros: string[];
  eventoId: string;
  status: 'disponivel' | 'reservada' | 'vendida';
  arquivoUrl: string;
}

export interface Comprador {
  _id: string;
  nome: string;
  email: string;
  telefone?: string;
}

export interface Venda {
  _id: string;
  compradorId: string | Comprador;
  eventoId: string | Evento;
  cartelas: string[] | Cartela[];
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  status: 'pendente' | 'processando' | 'pago' | 'cancelado' | 'expirado';
  metodoPagamento?: 'pix' | 'cartao';
  gateway: 'asaas';
  gatewayId?: string;
  paymentUrl?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  emailEnviado: boolean;
  expiresAt: string;
  paidAt?: string;
  createdAt: string;
}

export interface CriarVendaRequest {
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  quantidade: number;
  eventoId: string;
  metodoPagamento: 'PIX' | 'CREDIT_CARD';
}

export interface CriarVendaResponse {
  vendaId: string;
  paymentUrl: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  valorTotal: number;
  expiresAt: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
