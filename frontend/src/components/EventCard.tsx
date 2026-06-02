import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { fairPassEventAbi } from "../generated";
import { Link } from "react-router-dom";

interface EventCardProps {
  eventAddress: `0x${string}`;
}

// Mapeamento visual para o Enum de Status do contrato inteligente
const STATUS_MAP = {
  0: {
    label: "Ativo",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  1: {
    label: "Concluído",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
  2: {
    label: "Cancelado",
    classes: "bg-rose-50 text-rose-700 border-rose-100",
  },
};

export function EventCard({ eventAddress }: EventCardProps) {
  // 1. Buscar Nome do Evento (Nome do NFT)
  const { data: name, isLoading: loadingName } = useReadContract({
    address: eventAddress,
    abi: fairPassEventAbi,
    functionName: "name",
  });

  // 2. Buscar Preço do Ingresso (Retorna em uint256 / Wei)
  const { data: ticketPrice } = useReadContract({
    address: eventAddress,
    abi: fairPassEventAbi,
    functionName: "ticketPrice",
  });

  // 3. Buscar Máximo de Ingressos Disponíveis
  const { data: maxSupply } = useReadContract({
    address: eventAddress,
    abi: fairPassEventAbi,
    functionName: "maxSupply",
  });

  // 4. Buscar Total de Ingressos já Emitidos
  const { data: totalMinted } = useReadContract({
    address: eventAddress,
    abi: fairPassEventAbi,
    functionName: "totalMinted",
  });

  // 5. Buscar Status Atual do Evento (Enum: 0 = Active, 1 = Completed, 2 = Canceled)
  const { data: status } = useReadContract({
    address: eventAddress,
    abi: fairPassEventAbi,
    functionName: "status",
  });

  const isLoading = loadingName;

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse h-[220px]" />
    );
  }

  // Prepara as propriedades do badge de status com base no retorno do contrato
  const currentStatus = status !== undefined ? (status as 0 | 1 | 2) : 0;
  const statusConfig = STATUS_MAP[currentStatus];

  // Tratamento da quantidade de ingressos restantes
  const total = maxSupply ? Number(maxSupply) : 0;
  const minted = totalMinted ? Number(totalMinted) : 0;
  const available = total - minted;

  return (
    <div className="bg-white border border-slate-200 hover:border-indigo-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between transition group relative overflow-hidden">
      {/* Badge Superior de Status */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.classes}`}
        >
          {statusConfig.label}
        </span>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
          {`${eventAddress.slice(0, 6)}...${eventAddress.slice(-4)}`}
        </span>
      </div>

      {/* Detalhes Principais */}
      <div className="space-y-2 flex-grow">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition">
          {name || "Evento Sem Nome"}
        </h3>

        <div className="flex justify-between items-baseline pt-2 border-t border-slate-50">
          <span className="text-xs text-slate-400">Preço do Ingresso</span>
          <span className="text-lg font-extrabold text-slate-900">
            {ticketPrice
              ? `${parseFloat(formatEther(ticketPrice)).toFixed(4)} ETH`
              : "0.00 ETH"}
          </span>
        </div>
      </div>

      {/* Barra de Progresso e Ingressos Disponíveis */}
      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Disponibilidade</span>
          <span className="font-semibold text-slate-700">
            {currentStatus === 2
              ? "Esgotado (Cancelado)"
              : `${available} / ${total} restantes`}
          </span>
        </div>

        {/* Barra Visual */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${currentStatus === 2 ? "bg-rose-400" : "bg-indigo-600"}`}
            style={{ width: `${total > 0 ? (available / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Botão */}
      <Link
        to={`/event/${eventAddress}`}
        className="w-full text-center bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition mt-5"
      >
        Ver detalhes
      </Link>
    </div>
  );
}
