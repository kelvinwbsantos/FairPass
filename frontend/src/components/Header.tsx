import { Link } from "react-router-dom";
import { useConnection, useConnect, useDisconnect, useConnectors } from "wagmi";
import { Button } from "@/components/ui/button";

export function Header() {
  const { address, isConnected } = useConnection();
  
  const connectors = useConnectors();
  
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="flex flex-col gap-4 border-b border-border bg-background px-6 py-4 lg:flex-row lg:items-center lg:justify-between shadow-sm">
      {/* Navegação / Links */}
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-extrabold text-primary tracking-tight mr-2">
          FairPass Eventos
        </h3>

        <Button asChild variant="secondary" size="sm" className="rounded-xl">
          <Link to="/">Inicio</Link>
        </Button>

        <Button asChild variant="secondary" size="sm" className="rounded-xl">
          <Link to="/create-event">Criar evento</Link>
        </Button>

        <Button asChild variant="secondary" size="sm" className="rounded-xl">
          <Link to="/marketplace">Marketplace</Link>
        </Button>

        <Button asChild variant="secondary" size="sm" className="rounded-xl">
          <Link to="/all-events">Todos os eventos</Link>
        </Button>
      </div>

      {/* Autenticação */}
      <div className="flex flex-wrap items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 py-1 pl-4 pr-1 shadow-sm">
            <span className="font-mono text-sm font-semibold text-muted-foreground">
              {formatAddress(address)}
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              className="h-8 rounded-lg text-xs font-bold"
              disabled={disconnectMutation.isPending}
            >
              Desconectar
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connectMutation.mutate({ connector })}
                type="button"
                size="sm"
                className="rounded-xl shadow-sm active:scale-95 transition-transform"
                disabled={connectMutation.isPending}
              >
                Conectar {connector.name}
              </Button>
            ))}
          </div>
        )}

        {/* Status de Carregamento */}
        {connectMutation.isPending && (
          <div className="animate-pulse text-xs font-medium text-amber-500">
            Aguardando assinatura...
          </div>
        )}

        {/* Mensagem de Erro */}
        {connectMutation.error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            {connectMutation.error.message.includes("rejected")
              ? "Conexão rejeitada"
              : "Erro ao conectar"}
          </div>
        )}
      </div>
    </header>
  );
}