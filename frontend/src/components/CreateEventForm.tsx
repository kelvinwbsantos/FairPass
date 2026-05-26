import {
  BaseError,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { fairPassEventFactoryAbi } from "../generated";
import { parseEther } from "viem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FACTORY_CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

export function CreateEventForm() {
  const navigate = useNavigate();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dateString = formData.get("_eventTimestamp") as string;
    const timestampInSeconds = Math.floor(
      new Date(dateString).getTime() / 1000,
    );

    const ticketPriceInput = formData.get("_ticketPrice") as string;
    const ticketPriceInWei = parseEther(ticketPriceInput);

    const txPayload = {
      address: FACTORY_CONTRACT_ADDRESS,
      abi: fairPassEventFactoryAbi,
      functionName: "createEvent",
      args: [
        formData.get("_name") as string,
        formData.get("_symbol") as string,
        ticketPriceInWei,
        BigInt(formData.get("_maxSupply") as string),
        BigInt(timestampInSeconds),
      ],
    } as const;

    console.log("🚀 Enviando transação com os seguintes dados:", {
      Contrato: txPayload.address,
      Funcao: txPayload.functionName,
      Argumentos: {
        _name: txPayload.args[0],
        _symbol: txPayload.args[1],
        _ticketPrice_Wei: txPayload.args[2].toString(), // .toString() ajuda a ler o BigInt no console
        _maxSupply: txPayload.args[3].toString(),
        _eventTimestamp_Unix: txPayload.args[4].toString(),
      },
      ObjetoCompleto: txPayload,
    });

    writeContract(txPayload);
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useWatchContractEvent({
    address: FACTORY_CONTRACT_ADDRESS,
    abi: fairPassEventFactoryAbi,
    eventName: "EventCreated",
    onLogs(logs) {
      logs.forEach((log) => {
        const eventArgs = log.args as any;
        if (eventArgs && eventArgs.eventContractAddress) {
          console.log(
            "📍 Novo contrato detectado:",
            eventArgs.eventContractAddress,
          );
          setDeployedAddress(eventArgs.eventContractAddress);
        }
      });
    },
  });

  return (
    <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <h2 className="text-black text-xl font-bold">Criar evento</h2>
        <input
          name="_name"
          placeholder="Event Name"
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400"
        />
        <input
          name="_symbol"
          placeholder="Event Symbol"
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400"
        />
        <input
          name="_ticketPrice"
          placeholder="Ticket Price"
          type="number"
          step="any"
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400"
        />
        <input
          name="_maxSupply"
          placeholder="Max Supply"
          type="number"
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400"
        />
        <input
          name="_eventTimestamp"
          placeholder="Event Timestamp"
          type="datetime-local"
          required
          className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400"
        />

        <button
          disabled={isPending}
          type="submit"
          className="bg-black text-white py-2 rounded-md hover:opacity-80"
        >
          {isPending ? "Confirming..." : "Mint"}
        </button>
        <div className="px-3 py-2 border border-slate-300 rounded-md text-black placeholder:text-slate-400">
          {hash && <div>Transaction Hash: {hash}</div>}
          {isConfirming && <div>Waiting for confirmation...</div>}
          {isConfirmed && <div>Transaction confirmed.</div>}
          {error && (
            <div>
              Error: {(error as BaseError).shortMessage || error.message}
            </div>
          )}
        </div>
      </form>

      {deployedAddress && (
        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-2 animate-fadeIn">
          {/* Título de Sucesso */}
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
            <span>🚀</span> Contrato Deployado com Sucesso!
          </div>

          {/* Conteúdo: Endereço + Botões */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white border border-emerald-100 p-2 rounded-lg justify-between shadow-inner">
            <code className="font-mono text-xs text-emerald-900 truncate select-all pr-2">
              {deployedAddress}
            </code>

            {/* Grupo de Botões */}
            <div className="flex gap-2 shrink-0 justify-end">
              {/* Botão Copiar */}
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(deployedAddress)}
                className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md hover:bg-slate-200 active:scale-95 transition-all font-medium"
              >
                Copiar
              </button>

              {/* BOTÃO COMPORTAMENTO DE ROTA (VITE + REACT ROUTER) */}
              <button
                type="button"
                onClick={() => navigate(`/event/${deployedAddress}`)}
                className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-md hover:bg-emerald-700 active:scale-95 transition-all font-medium shadow-sm flex items-center gap-1"
              >
                Ver Evento ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// { name: '_name', internalType: 'string', type: 'string' },
// { name: '_symbol', internalType: 'string', type: 'string' },
// { name: '_ticketPrice', internalType: 'uint256', type: 'uint256' },
// { name: '_maxSupply', internalType: 'uint256', type: 'uint256' },
// { name: '_eventTimestamp', internalType: 'uint256', type: 'uint256' },
