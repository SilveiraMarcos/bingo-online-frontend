import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { vendaService } from '../services/vendaService';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, Mail, Calendar, Ticket, Home as HomeIcon, Download, MessageCircle, FileText, Copy, User, Phone } from 'lucide-react';
import { useState } from 'react';

// Número do WhatsApp para contato (configurável)
const WHATSAPP_NUMBER = '5594991022112'; // Altere para o número real
const WHATSAPP_MESSAGE = 'Olá! Preciso de ajuda com minha compra de cartelas de bingo.';

export default function Sucesso() {
  const { vendaId } = useParams<{ vendaId: string }>();
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

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

  const copiarComprovante = () => {
    if (!venda) return;
    
    const comprador = typeof venda.compradorId === 'object' ? venda.compradorId : null;
    const evento = typeof venda.eventoId === 'object' ? venda.eventoId : null;
    const cartelas = Array.isArray(venda.cartelas) 
      ? venda.cartelas.filter(c => typeof c !== 'string').map(c => (c as any).codigo).join(', ')
      : '';

    const textoComprovante = `
═══════════════════════════════════
    COMPROVANTE DE COMPRA - BINGO
═══════════════════════════════════

📋 DADOS DA COMPRA
-----------------------------------
Código: #${venda._id}
Hash: ${venda.hashComprovante || 'N/A'}
Data: ${new Date(venda.createdAt).toLocaleString('pt-BR')}
Status: PAGO ✓

👤 COMPRADOR
-----------------------------------
Nome: ${comprador?.nome || 'N/A'}
CPF: ${comprador?.cpf || 'N/A'}
Telefone: ${comprador?.telefone || 'N/A'}
Email: ${comprador?.email || 'N/A'}

🎯 EVENTO
-----------------------------------
${evento?.nome || 'N/A'}
Data: ${evento?.data ? new Date(evento.data).toLocaleDateString('pt-BR') : 'N/A'}

🎫 CARTELAS
-----------------------------------
${cartelas || 'N/A'}
Quantidade: ${venda.quantidade}

💰 PAGAMENTO
-----------------------------------
Valor Total: R$ ${(venda.valorTotal / 100).toFixed(2)}
Método: ${venda.metodoPagamento === 'pix' ? 'PIX' : 'Cartão'}
Pago em: ${venda.paidAt ? new Date(venda.paidAt).toLocaleString('pt-BR') : 'N/A'}

═══════════════════════════════════
    Guarde este comprovante!
═══════════════════════════════════
    `.trim();

    navigator.clipboard.writeText(textoComprovante);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const abrirWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

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

  const comprador = typeof venda.compradorId === 'object' ? venda.compradorId : null;
  const evento = typeof venda.eventoId === 'object' ? venda.eventoId : null;

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

      {/* Comprovante */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Comprovante de Compra</h3>
          </div>
          <button
            onClick={copiarComprovante}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Código:</span>
            <span className="font-mono font-medium">#{venda._id.slice(-8).toUpperCase()}</span>
          </div>
          {venda.hashComprovante && (
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Hash:</span>
              <span className="font-mono font-medium text-xs">{venda.hashComprovante}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="opacity-80">Data:</span>
            <span className="font-medium">{new Date(venda.createdAt).toLocaleString('pt-BR')}</span>
          </div>
        </div>
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
              <p className="font-medium text-gray-900">
                {evento?.nome || 'Evento'}
              </p>
              <p className="text-sm text-gray-600">
                {evento?.data && new Date(evento.data).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Cartelas com Download */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <Ticket className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-3">
                Suas Cartelas ({Array.isArray(venda.cartelas) ? venda.cartelas.length : 0})
              </p>
              
              {/* Botão para baixar todas as cartelas */}
              {vendaId && (
                <a
                  href={vendaService.getDownloadUrl(vendaId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium mb-4 w-full"
                >
                  <Download className="w-5 h-5" />
                  Baixar Todas as Cartelas (PDF)
                </a>
              )}

              <div className="space-y-2">
                {Array.isArray(venda.cartelas) && venda.cartelas.map((cartela) => {
                  if (typeof cartela === 'string') return null;
                  return (
                    <div
                      key={cartela._id}
                      className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-purple-900">
                          {cartela.codigo}
                        </span>
                      </div>
                      {vendaId && (
                        <a
                          href={vendaService.getCartelaDownloadUrl(vendaId, cartela._id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Baixar PDF
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comprador */}
          <div className="flex items-start gap-3 pb-4 border-b">
            <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {comprador?.nome || 'Comprador'}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-3 h-3" />
                {comprador?.telefone || ''}
              </div>
              {comprador?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3 h-3" />
                  {comprador.email}
                </div>
              )}
              <p className="text-sm text-gray-500">
                CPF: {comprador?.cpf ? `***.***.${comprador.cpf.slice(-6)}` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Valor */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-gray-900">Total Pago:</span>
            <span className="text-2xl font-bold text-purple-600">
              R$ {(venda.valorTotal).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Email (se informado) */}
      {comprador?.email && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">📧 Verifique seu Email</h4>
          <p className="text-sm text-blue-800 mb-4">
            Enviamos suas cartelas para <strong>{comprador.email}</strong>
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
      )}

      {/* Contato WhatsApp */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-green-900 mb-2">💬 Precisa de Ajuda?</h4>
        <p className="text-sm text-green-800 mb-4">
          Dúvidas sobre sua compra, estorno ou qualquer outra questão? 
          Entre em contato conosco pelo WhatsApp!
        </p>
        <button
          onClick={abrirWhatsApp}
          className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <MessageCircle className="w-5 h-5" />
          Falar no WhatsApp
        </button>
      </div>

      {/* Próximos Passos */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-purple-900 mb-3">✅ Próximos Passos:</h4>
        <ol className="text-sm text-purple-800 space-y-2 list-decimal list-inside">
          <li>Baixe suas cartelas em PDF clicando no botão acima</li>
          <li>Guarde o comprovante da compra (você pode copiar clicando no botão)</li>
          <li>Imprima ou tenha as cartelas no celular no dia do evento</li>
          <li>Chegue com antecedência ao local</li>
          <li>Boa sorte! 🍀</li>
        </ol>
      </div>

      {/* Aviso sobre estorno */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Sobre estornos:</strong> Para solicitar estorno do pagamento, 
          entre em contato pelo WhatsApp informando o código da compra.
        </p>
      </div>

      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
      >
        <HomeIcon className="w-5 h-5" />
        Voltar para Início
      </button>
    </div>
  );
}
