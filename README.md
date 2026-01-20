# Frontend - Sistema de Venda de Cartelas de Bingo

Interface web desenvolvida em React + TypeScript + Vite para compra de cartelas de bingo online.

## 🚀 Tecnologias

- **React 18.2** - Biblioteca UI
- **TypeScript 5.3** - Tipagem estática
- **Vite 5.0** - Build tool e dev server
- **Tailwind CSS 3.4** - Estilização
- **React Router 6.21** - Roteamento
- **React Query 5.17** - Gerenciamento de estado e cache
- **React Hook Form 7.49** - Formulários
- **Zod 3.22** - Validação de schemas
- **Axios 1.6** - Cliente HTTP
- **QRCode.react 3.1** - Geração de QR Codes
- **Lucide React 0.309** - Ícones

## 📁 Estrutura

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── QRCodePix.tsx
│   │   └── ContagemRegressiva.tsx
│   ├── pages/            # Páginas da aplicação
│   │   ├── Home.tsx      # Lista de eventos
│   │   ├── Comprar.tsx   # Formulário de compra
│   │   ├── Pagamento.tsx # Pagamento Pix
│   │   ├── Sucesso.tsx   # Confirmação
│   │   └── Erro.tsx      # Erro/Expiração
│   ├── services/         # Integração com API
│   │   ├── api.ts
│   │   └── vendaService.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Componente principal
│   ├── main.tsx          # Entry point
│   └── index.css         # Estilos globais
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env
```

## 🛠️ Instalação

```bash
cd frontend
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do frontend:

```env
VITE_API_URL=http://localhost:3000
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```
Acesse: http://localhost:5173

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📱 Páginas e Funcionalidades

### 1. Home (`/`)
- Lista todos os eventos ativos
- Exibe informações: data, local, preço, cartelas disponíveis
- Botão para comprar cartelas

### 2. Comprar (`/comprar/:eventoId`)
- Formulário com validação (React Hook Form + Zod)
- Campos: nome, email, telefone, quantidade
- Validações:
  - Nome mínimo 3 caracteres
  - Email válido
  - Telefone formato (XX) XXXXX-XXXX
  - Quantidade máxima por comprador
- Resumo do pedido em tempo real

### 3. Pagamento (`/pagamento/:vendaId`)
- QR Code Pix para pagamento
- Código Pix Copia e Cola
- Contagem regressiva para expiração (30 minutos)
- Polling automático do status (a cada 3 segundos)
- Redirecionamento automático quando pago

### 4. Sucesso (`/sucesso/:vendaId`)
- Confirmação de pagamento
- Lista de cartelas compradas
- Botão para reenviar email
- Instruções para o dia do evento

### 5. Erro (`/erro/:vendaId`)
- Tratamento de erros (expirado, cancelado)
- Opção de tentar novamente
- Instruções sobre estorno

## 🎨 Componentes

### Header
- Logo da aplicação
- Título "Bingo Paróquia"
- Link para home

### Footer
- Copyright
- Informação sobre Cakto (gateway de pagamento)

### LoadingSpinner
- Spinner animado
- Texto customizável
- Tamanhos: sm, md, lg

### QRCodePix
- Exibe QR Code gerado
- Campo Pix Copia e Cola
- Botão copiar com feedback
- Instruções de pagamento

### ContagemRegressiva
- Timer com minutos e segundos
- Alerta visual quando < 5 minutos
- Callback quando expira

## 🔄 Integração com Backend

### Configuração Axios
```typescript
// src/services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### React Query
- Cache automático de 5 minutos
- Retry automático (1 tentativa)
- Refetch desabilitado no foco

### Polling de Status
```typescript
refetchInterval: (data) => {
  if (data?.status === 'PENDENTE') {
    return 3000; // 3 segundos
  }
  return false;
}
```

## 🎯 Validações de Formulário

### Schema Zod
```typescript
const compradorSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido'),
  quantidade: z.number().min(1, 'Selecione pelo menos 1 cartela'),
});
```

## 🎨 Estilização

### Tailwind CSS
- Design responsivo (mobile-first)
- Tema personalizado com cores roxas
- Componentes utilitários no index.css

### Classes Customizadas
```css
.btn-primary      - Botão primário roxo
.btn-secondary    - Botão secundário cinza
.input-field      - Campo de input padrão
.card             - Card com shadow
```

## 📊 Estados e Status

### Status de Venda
- `PENDENTE` - Aguardando pagamento
- `PAGO` - Pagamento confirmado
- `EXPIRADO` - Prazo expirado (30 min)
- `CANCELADO` - Cancelado manualmente
- `ERRO` - Erro no processamento

### Indicadores Visuais
- 🟡 Amarelo - Pendente
- 🟢 Verde - Sucesso
- 🔴 Vermelho - Erro/Expirado
- 🔵 Azul - Informativo

## 🚀 Deploy

### Variáveis de Ambiente (Produção)
```env
VITE_API_URL=https://api.seudominio.com
```

### Build
```bash
npm run build
```

Arquivos gerados em `dist/`

### Servidor Estático
Pode ser servido por:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx
- Apache

### Exemplo Nginx
```nginx
server {
  listen 80;
  server_name seudominio.com;
  root /var/www/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🧪 Testes (TODO)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Boas Práticas Implementadas

✅ TypeScript para type safety  
✅ React Query para cache e sync  
✅ React Hook Form para performance  
✅ Zod para validação runtime  
✅ Componentização e reutilização  
✅ Loading states e feedback visual  
✅ Error boundaries  
✅ Responsividade mobile-first  
✅ Acessibilidade (ARIA labels)  
✅ SEO (meta tags)  

## 🔐 Segurança

- ✅ Validação no frontend E backend
- ✅ Sanitização de inputs
- ✅ HTTPS obrigatório em produção
- ✅ Sem dados sensíveis em localStorage
- ✅ CORS configurado no backend

## 📞 Suporte

Em caso de problemas:
1. Verifique se o backend está rodando
2. Verifique a URL da API no .env
3. Limpe o cache do navegador
4. Verifique o console do navegador

## 📄 Licença

Propriedade da Paróquia - Uso interno
