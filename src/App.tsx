import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SelecionarCartelas from './pages/SelecionarCartelas';
import Comprar from './pages/Comprar';
import Pagamento from './pages/Pagamento';
import Sucesso from './pages/Sucesso';
import Erro from './pages/Erro';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/selecionar/:eventoId" element={<SelecionarCartelas />} />
              <Route path="/comprar/:eventoId" element={<Comprar />} />
              <Route path="/pagamento/:vendaId" element={<Pagamento />} />
              <Route path="/sucesso/:vendaId" element={<Sucesso />} />
              <Route path="/erro/:vendaId" element={<Erro />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
