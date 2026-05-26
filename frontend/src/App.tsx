import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useConnection } from 'wagmi';
import { Header } from './components/Header';
import { CreateEventForm } from './components/CreateEventForm';
import { EventPage } from './components/EventPage';

function AppContent() {
  const { isConnected } = useConnection();

  if (!isConnected) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto px-6 mt-12">
        <div className="text-4xl mb-4">🔑</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Carteira Desconectada</h2>
        <p className="text-slate-500 text-sm">
          Por favor, utilize o botão de conexão no topo da página para autenticar e começar a criar ou interagir com os eventos do FairPass.
        </p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota Principal: Fábrica de Eventos */}
      <Route path="/" element={<CreateEventForm />} />
      
      /* Rota Dinâmica: Passando o endereço do contrato na URL
      <Route path="/event/:address" element={<EventPage />} /> 
      
      {/* fallback para qualquer rota inexistente */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <AppContent />
        </main>
      </div>
    </BrowserRouter>
  );
}