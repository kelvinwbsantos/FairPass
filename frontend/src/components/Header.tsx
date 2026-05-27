import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Header() {
  // 1. useAccount substitui o useConnection para pegar dados do usuário conectado
  const { address, isConnected } = useAccount()
  
  // 2. Na v2, pegamos os connectors diretamente de dentro do useConnect
  const { connect, connectors, status, error } = useConnect()
  const { disconnect } = useDisconnect()

  // Função auxiliar para encurtar o endereço da carteira (ex: 0x1234...abcd)
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-2">
          <span>🎫</span> FairPass Eventos
        </h3>
        {/* Botão Marketplace */}
        <Link
          to="/marketplace"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl transition"
        >
          Marketplace
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 pl-4 pr-2 py-1.5 rounded-xl shadow-sm">
            <span className="text-sm font-mono font-semibold text-slate-700">
              {formatAddress(address)}
            </span>
            <button 
              type="button" 
              onClick={() => disconnect()} 
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-3 py-1.5 rounded-lg transition"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            {connectors.map((connector) => (
              <button 
                key={connector.uid} 
                onClick={() => connect({ connector })} 
                type="button" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                Conectar {connector.name}
              </button>
            ))}
          </div>
        )}

        {/* Feedback visual de carregamento ou erro da carteira */}
        {status === 'pending' && (
          <div className="text-xs text-amber-600 font-medium animate-pulse">
            Aguardando assinatura...
          </div>
        )}
        
        {error && (
          <div className="text-xs text-rose-600 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
            {error.message.includes('rejected') ? 'Conexão rejeitada' : 'Erro ao conectar'}
          </div>
        )}
      </div>
    </header>
  )
}