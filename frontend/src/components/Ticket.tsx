import { formatEther } from "viem";

interface MyTicketProps {
  eventName: string;
  symbol: string;
  tokenId: bigint | number;
  ticketPrice: bigint | undefined;
  contractAddress: string;
  userAddress: string;
  isCancelled: boolean;
  onRefund?: () => void;
  listTicketButton?: React.ReactNode;
}

export function Ticket({
  eventName,
  symbol,
  tokenId,
  ticketPrice,
  contractAddress,
  userAddress,
  isCancelled,
  onRefund,
  listTicketButton,
}: MyTicketProps) {
  const formatAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "--";

  return (
    <div className="max-w-md mx-auto my-8 filter drop-shadow-md">
      <div className="bg-slate-900 text-white rounded-t-3xl p-6 relative overflow-hidden border-b border-dashed border-slate-700">
        <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-slate-100 rounded-full z-10" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-100 rounded-full z-10" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {symbol || "NFT"} Pass
            </span>
            <h2 className="text-2xl font-bold mt-2 text-slate-100 tracking-tight">
              {eventName || "Nome do evento"}
            </h2>
          </div>
          <div className="text-sm font-black text-slate-300">NFT</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">
              Ticket ID
            </p>
            <p className="text-xl font-mono font-bold text-emerald-400">
              #{tokenId?.toString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">
              Preco pago
            </p>
            <p className="text-lg font-semibold">
              {ticketPrice ? `${formatEther(ticketPrice)} ETH` : "0 ETH"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-3xl p-6 pt-8 relative bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-slate-100 rounded-full z-10" />
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-100 rounded-full z-10" />

        <div className="space-y-3 text-sm border-b border-slate-100 pb-4 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Dono do ingresso:</span>
            <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
              {formatAddress(userAddress)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Contrato do evento:</span>
            <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
              {formatAddress(contractAddress)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {isCancelled ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-3 text-center">
              <p className="text-xs text-red-600 mb-2 font-medium">
                Este evento foi cancelado. Voce pode pedir reembolso.
              </p>
              {onRefund && (
                <button
                  type="button"
                  onClick={onRefund}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-red-200"
                >
                  Solicitar reembolso
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-3 rounded-xl font-medium text-center text-sm flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Ingresso valido / confirmado
              </div>

              {listTicketButton && <div className="pt-1">{listTicketButton}</div>}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center opacity-60">
          <div
            className="h-8 w-4/5 bg-repeat-x"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #000 0px, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px)",
            }}
          />
          <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
            FAIRPASS ONCHAIN VERIFIED
          </span>
        </div>
      </div>
    </div>
  );
}
