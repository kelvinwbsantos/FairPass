import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BaseError,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";

import { fairPassEventFactoryAbi } from "../generated";

const FACTORY_CONTRACT_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS as `0x${string}`;

export function CreateEventForm() {
  const navigate = useNavigate();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [deployedAddress, setDeployedAddress] = useState<`0x${string}` | null>(
    null,
  );

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const dateString = formData.get("_eventTimestamp") as string;
    const timestampInSeconds = Math.floor(
      new Date(dateString).getTime() / 1000,
    );

    writeContract({
      address: FACTORY_CONTRACT_ADDRESS,
      abi: fairPassEventFactoryAbi,
      functionName: "createEvent",
      args: [
        formData.get("_name") as string,
        formData.get("_symbol") as string,
        parseEther(formData.get("_ticketPrice") as string),
        BigInt(formData.get("_maxSupply") as string),
        BigInt(timestampInSeconds),
      ],
    });
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
      for (const log of logs) {
        const eventAddress = log.args.eventContractAddress;

        if (eventAddress) {
          setDeployedAddress(eventAddress);
        }
      }
    },
  });

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
      <form className="flex flex-col gap-5" onSubmit={submit}>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Criar novo evento</h2>
          <p className="text-xs text-slate-500 mt-1">Preencha os dados abaixo para publicar o contrato do evento na blockchain.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nome do Evento</label>
            <input
              name="_name"
              placeholder="Ex: Rock in Rio Pass"
              required
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Símbolo do Ingresso</label>
            <input
              name="_symbol"
              placeholder="Ex: RIR-PASS"
              required
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Preço (ETH)</label>
              <input
                name="_ticketPrice"
                placeholder="0.05"
                type="number"
                step="any"
                required
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantidade Máxima</label>
              <input
                name="_maxSupply"
                placeholder="500"
                type="number"
                required
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data e Hora do Evento</label>
            <input
              name="_eventTimestamp"
              type="datetime-local"
              required
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          disabled={isPending || isConfirming}
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-sm transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2"
        >
          {isPending ? "Aguardando carteira..." : isConfirming ? "Criando na Blockchain..." : "Criar evento"}
        </button>

        {/* Feedbacks de Status */}
        {(hash || isConfirming || isConfirmed || error) && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-2 flex flex-col">
            {hash && (
              <div className="text-slate-600 truncate">
                <span className="font-semibold text-slate-700">Hash:</span>{" "}
                <code className="text-xs font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 select-all">{hash}</code>
              </div>
            )}
            
            {isConfirming && (
              <div className="text-amber-600 font-medium animate-pulse flex items-center gap-1.5">
                ⏳ Enviando transação para a rede...
              </div>
            )}
            
            {isConfirmed && !deployedAddress && (
              <div className="text-emerald-600 font-medium">
                ✅ Transação confirmada! Aguardando o endereço do evento...
              </div>
            )}
            
            {error && (
              <div className="text-rose-600 font-medium bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-xs">
                ❌ Erro: {(error as BaseError).shortMessage || error.message}
              </div>
            )}
          </div>
        )}
      </form>

      {/* Caixa de Sucesso Final */}
      {deployedAddress && (
        <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col gap-3 animate-fade-in">
          <div>
            <div className="text-emerald-800 font-bold text-sm">
              🎉 Contrato criado com sucesso!
            </div>
            <p className="text-xs text-emerald-600 mt-0.5">Seu evento já possui um endereço exclusivo na blockchain.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white border border-emerald-100 p-2.5 rounded-xl justify-between shadow-sm">
            <code className="font-mono text-xs text-emerald-900 truncate select-all pr-2">
              {deployedAddress}
            </code>

            <div className="flex gap-2 shrink-0 justify-end">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(deployedAddress)}
                className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-200 active:scale-95 transition"
              >
                Copiar
              </button>

              <button
                type="button"
                onClick={() => navigate(`/event/${deployedAddress}`)}
                className="text-xs bg-indigo-600 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-700 active:scale-95 transition shadow-sm"
              >
                Ver evento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}