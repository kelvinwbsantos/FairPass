import { useReadContract } from "wagmi";
import { EventCard } from "../components/EventCard";
import { fairPassEventFactoryAbi } from "../generated";

export function AllEvents() {
  const factoryAddress = import.meta.env
    .VITE_FACTORY_CONTRACT_ADDRESS as `0x${string}`;

  const {
    data: eventAddresses,
    isLoading,
    error,
  } = useReadContract({
    address: factoryAddress,
    abi: fairPassEventFactoryAbi,
    functionName: "getAllEvents",
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center py-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Todos os <span className="text-indigo-600">Eventos</span>
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Explore e participe de todos os eventos ativos e criados de forma
          transparente no FairPass.
        </p>
      </div>

      {/* Skeletons de Carregamento */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse h-48"
            />
          ))}
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div className="text-center py-10 bg-rose-50 rounded-2xl border border-rose-100 max-w-md mx-auto p-6">
          <div className="text-3xl mb-2">❌</div>
          <h3 className="text-sm font-bold text-rose-800 mb-1">
            Erro ao carregar eventos
          </h3>
          <p className="text-xs text-rose-600 leading-relaxed">
            Não foi possível ler a lista de eventos da blockchain.
          </p>
        </div>
      )}

      {/* Estado Vazio (Array veio vazio do contrato) */}
      {!isLoading &&
        !error &&
        (!eventAddresses || eventAddresses.length === 0) && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Nenhum evento encontrado
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Nenhum contrato de evento foi gerado na rede até ao momento.
            </p>
          </div>
        )}

      {/* Lista de Eventos */}
      {!isLoading && !error && eventAddresses && eventAddresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 🔥 Adicionado o tipo explicitamente aqui: (address: `0x${string}`) */}
          {(eventAddresses as readonly `0x${string}`[]).map(
            (address: `0x${string}`) => (
              <EventCard key={address} eventAddress={address} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
