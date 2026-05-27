import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther } from "viem";

import { fairPassEventAbi } from "../generated";

export function EventPage() {
  const { address } = useParams() as {
    address: `0x${string}`;
  };

  const { address: userAddress } = useAccount();

  const { writeContract, isPending } = useWriteContract();

  const [mintedCount, setMintedCount] = useState(0);

  const [status, setStatus] = useState(0);

  // Contract Reads
  const { data: contractOwner, isLoading } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "owner",
  });

  /// preciso saber o id do ticket, mudar smartcontract para só possuir um ticket e funcao para retornar o id

  const { data: eventStatus } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "status",
  });

  const { data: ticketPrice } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "ticketPrice",
  });

  const { data: eventName } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "symbol",
  });

  const { data: totalMinted } = useReadContract({
    address,
    abi: fairPassEventAbi,
    functionName: "totalMinted",
  });

  // Sync blockchain data to local state
  useEffect(() => {
    if (totalMinted !== undefined) {
      setMintedCount(Number(totalMinted));
    }
  }, [totalMinted]);

  useEffect(() => {
    if (eventStatus !== undefined) {
      setStatus(Number(eventStatus));
    }
  }, [eventStatus]);

  // Derived States
  const isOwner =
    !!userAddress &&
    !!contractOwner &&
    userAddress.toLowerCase() === contractOwner.toLowerCase();

  // Enum:
  // 0 = Ativo
  // 1 = Finalizado
  // 2 = Cancelado
  const isCancelled = status === 2;

  const eventStatusLabel =
    status === 0 ? "Ativo" : status === 1 ? "Finalizado" : "Cancelado";

  // Actions
  async function handleCancelEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    writeContract(
      {
        address,
        abi: fairPassEventAbi,
        functionName: "cancelEvent",
        args: [],
      },
      {
        onSuccess() {
          setStatus(2);
        },
      },
    );
  }

  async function handleMintTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!ticketPrice) return;

    writeContract(
      {
        address,
        abi: fairPassEventAbi,
        functionName: "mintTicket",
        value: ticketPrice,
      },
      {
        onSuccess() {
          setMintedCount((prev) => prev + 1);
        },
      },
    );
  }

  async function handleRefund() {
    writeContract({
      address,
      abi: fairPassEventAbi,
      functionName: "refundTicket",
      args: [1n], // tokenId
    });
  }

  // Loading
  if (isLoading) {
    return <div className="p-8 text-center">Carregando dados do evento...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-12 px-6 py-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
          🎟️
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          {eventName ?? "Carregando..."}
        </h1>

        <p className="text-slate-500 mt-2">Evento onchain com ingressos NFT</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">Símbolo</p>

          <p className="text-lg font-semibold text-slate-800">
            {symbol ?? "--"}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">Ingressos Emitidos</p>

          <p className="text-lg font-semibold text-slate-800">{mintedCount}</p>
        </div>
      </div>

      {/* Ticket Price */}
      <div className="mb-6 bg-black text-white rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-300 mb-2">Preço do Ingresso</p>

        <p className="text-4xl font-bold">
          {ticketPrice ? `${formatEther(ticketPrice)} ETH` : "--"}
        </p>
      </div>

      {/* Status */}
      <div
        className={`mb-6 rounded-2xl p-4 border ${
          isCancelled
            ? "bg-red-50 border-red-200"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <p className="text-xs text-slate-500 mb-1">Status do Evento</p>

        <p
          className={`text-lg font-semibold ${
            isCancelled ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {eventStatusLabel}
        </p>
      </div>

      {/* Contract */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-500 mb-2">Endereço do contrato</p>

        <p className="font-mono text-xs break-all text-slate-700">{address}</p>
      </div>

      {/* Owner Panel */}
      {isOwner ? (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⭐</span>

            <p className="text-sm font-semibold text-amber-900">
              Painel do Organizador
            </p>
          </div>

          <div className="space-y-3">
            <form onSubmit={handleCancelEvent}>
              <button
                type="submit"
                disabled={isPending || isCancelled}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                {isPending
                  ? "Confirmando..."
                  : isCancelled
                    ? "Evento Cancelado"
                    : "❌ Cancelar Evento"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => alert("Função de administrador disparada!")}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all"
            >
              Sacar fundos
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <p className="text-sm text-slate-500">
            Você está visualizando este evento como participante.
          </p>
        </div>
      )}

      {/* Actions */}
      {isCancelled ? (
        <button
          type="button"
          onClick={handleRefund}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all"
        >
          Solicitar Reembolso
        </button>
      ) : (
        <form onSubmit={handleMintTicket}>
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black hover:opacity-90 text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50"
          >
            {isPending ? "Confirmando compra..." : "Comprar Ingresso"}
          </button>
        </form>
      )}
    </div>
  );
}
