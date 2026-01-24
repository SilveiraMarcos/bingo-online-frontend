# Fluxo de Pagamento com Cakto

## Visão Geral

A integração com a Cakto funciona através de **redirecionamento para checkout externo**, não com geração direta de QR Code Pix.

## Fluxo Completo

### 1. Cliente Seleciona Cartelas
- **Página**: `/comprar/:eventoId`
- **Ação**: Cliente preenche formulário (nome, email, telefone, quantidade)
- **Componente**: `Comprar.tsx`

### 2. Backend Cria Venda
- **Endpoint**: `POST /api/vendas/criar`
- **Processo**:
  1. Valida dados do cliente
  2. Reserva cartelas no banco de dados
  3. Gera link de checkout Cakto personalizado
  4. Retorna `vendaId` e `paymentUrl`

### 3. Redirecionamento para Cakto
- **Ação**: Frontend redireciona automaticamente para `paymentUrl`
- **URL Cakto**: `https://pay.cakto.com.br/[OFFER_ID]?name=...&email=...`
- **Parâmetros**:
  - `name`: Nome do cliente
  - `email`: Email do cliente
  - `phone`: Telefone (opcional)
  - `external_reference`: ID da venda

### 4. Cliente Paga na Cakto
- **Página**: Checkout da Cakto (externo)
- **Opções**: Pix, Cartão de Crédito
- **Processo**: Cakto processa o pagamento

### 5. Notificação via Webhook
- **Endpoint**: `POST /api/webhook/cakto`
- **Evento**: `purchase_approved`
- **Processo**:
  1. Backend recebe notificação
  2. Valida assinatura do webhook
  3. Atualiza status da venda para "pago"
  4. Marca cartelas como "vendidas"
  5. Envia email com cartelas

### 6. Retorno ao Sistema
- **URL Sucesso**: `https://seu-frontend.com/sucesso/:vendaId`
- **Página**: `Sucesso.tsx`
- **Exibe**:
  - Confirmação de pagamento
  - Detalhes da compra
  - Lista de cartelas
  - Informações do evento

## Páginas e Seus Propósitos

### `/comprar/:eventoId` - Formulário de Compra
- Coleta dados do cliente
- Seleciona quantidade de cartelas
- Cria a venda

### `/pagamento/:vendaId` - Redirecionamento/Status
- **Se venda pendente com paymentUrl**: Redireciona para Cakto
- **Se venda pendente sem paymentUrl**: Mostra aguardando pagamento
- **Se venda paga**: Redireciona para `/sucesso`
- **Polling**: Atualiza status a cada 5 segundos

### `/sucesso/:vendaId` - Confirmação
- Mostra detalhes da compra confirmada
- Lista cartelas compradas
- Opção para reenviar email

## Configuração Necessária

### Backend (.env)
```env
CAKTO_API_KEY=seu_client_id
CAKTO_WEBHOOK_SECRET=secret_do_webhook
CAKTO_API_URL=https://api.cakto.com.br
CAKTO_PRODUCT_ID=id_do_produto
CAKTO_OFFER_ID=id_da_oferta
```

### Cakto Dashboard
1. Criar Produto
2. Criar Oferta com preço fixo
3. Configurar Webhook:
   - URL: `https://seu-backend.com/api/webhook/cakto`
   - Evento: "Compra aprovada"
4. Anotar IDs e secrets

## Importante

❌ **NÃO** tente gerar QR Code Pix diretamente  
❌ **NÃO** espere `pixQrCode` ou `pixCopyPaste` no response  
✅ **USE** `paymentUrl` para redirecionar o cliente  
✅ **CONFIE** no webhook para confirmar pagamento  
✅ **CONFIGURE** `success_url` e `cancel_url` na Cakto

## Modo de Desenvolvimento

Se `CAKTO_PRODUCT_ID` ou `CAKTO_OFFER_ID` não estiverem configurados:
- Backend retorna link simulado
- Não há redirecionamento real
- Use para testar o fluxo sem integração completa

## Testes

1. **Teste sem configuração**: Crie venda sem IDs da Cakto
2. **Teste com configuração**: Configure IDs e teste redirecionamento
3. **Teste webhook**: Use ferramenta de teste de webhook da Cakto
4. **Teste completo**: Faça uma compra real de teste
