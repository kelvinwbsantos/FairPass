import { useReadContract } from "wagmi";
import { EventCard } from "@/src/components/EventCard";
import { fairPassEventFactoryAbi } from "../generated";

import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Mic } from "lucide-react";

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
    <div className="space-y-10 animate-fade-in container mx-auto px-4 max-w-7xl">
      {/* Cabeçalho */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground mb-3">
          Todos os <span className="text-primary">Eventos</span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-balance">
          Explore e participe de todos os eventos ativos e criados de forma
          transparente no FairPass.
        </p>
      </div>

      {/* Skeletons de Carregamento (usando o Skeleton do shadcn) */}
      {isLoading && (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col space-y-3 p-6 border rounded-xl bg-card"
            >
              <Skeleton className="h-[125px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar eventos</AlertTitle>
          <AlertDescription>
            Não foi possível ler a lista de eventos da blockchain. Por favor,
            verifique sua conexão.
          </AlertDescription>
        </Alert>
      )}

      {/* Estado Vazio */}
      {!isLoading &&
        !error &&
        (!eventAddresses || eventAddresses.length === 0) && (
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl max-w-md mx-auto bg-background animate-in fade-in-50 duration-300">
            <div className="p-4 bg-muted rounded-full mb-4 text-muted-foreground">
              <Mic className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight mb-1">
              Nenhum evento encontrado
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Nenhum contrato de evento foi gerado na rede até o momento.
            </p>
          </div>
        )}

      {/* Lista de Eventos */}
      {!isLoading && !error && eventAddresses && eventAddresses.length > 0 && (
        <div className="flex flex-col gap-6">
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
