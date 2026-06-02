import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAccount } from "wagmi";

import { Header } from "./components/Header";
import { CreateEventForm } from "./pages/CreateEventForm";
import { EventPage } from "./pages/EventPage";
import { Marketplace } from "./pages/Marketplace";
import { AllEvents } from "./pages/AllEvents";
import Homepage from "./pages/Homepage";

function AppContent() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto px-6 mt-12">
        <div className="text-4xl mb-4 font-black text-indigo-600">FairPass</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Carteira desconectada
        </h2>
        <p className="text-slate-500 text-sm">
          Use o botão de conexão no topo da pagina para autenticar e interagir
          com os eventos do FairPass.
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/create-event" element={<CreateEventForm />} />
      <Route path="/event/:address" element={<EventPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/all-events" element={<AllEvents />} />
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
