import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

import { useEventData } from "../hooks/useEventData";
import { ListTicketButton } from "../components/ListTicket";
import { Ticket } from "../components/Ticket";

export function EventPage() {
  const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;
  const { address } = useParams() as { address: `0x${string}` };
  const { address: userAddress } = useAccount();

  const {
    eventName,
    symbol,
    ticketPrice,
    tokenId,
    tokenIdBigInt,
    mintedCount,
    hasTicket,
    hasValidToken,
    isOwner,
    isActive,
    isCompleted,
    isCancelled,
    eventStatusLabel,
    isLoading,
    isPending,
    writeError,
    handleCancelEvent,
    handleConcludeEvent,
    handleWithdrawFunds,
    handleMintTicket,
    handleRefund,
  } = useEventData(address, userAddress);

  if (isLoading) {
    return <div className="p-8 text-center">Carregando dados do evento...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-12 px-6 py-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold">
          FP
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          {eventName ?? "Carregando..."}
        </h1>
        <p className="text-slate-500 mt-2">Evento onchain com ingressos NFT</p>
      </div>

      {/* Símbolo + ingressos emitidos */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">Simbolo</p>
          <p className="text-lg font-semibold text-slate-800">{symbol ?? "--"}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 mb-1">Ingressos emitidos</p>
          <p className="text-lg font-semibold text-slate-800">{mintedCount}</p>
        </div>
      </div>

      {/* Preço */}
      <div className="mb-6 bg-black text-white rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-300 mb-2">Preco do ingresso</p>
        <p className="text-4xl font-bold">
          {ticketPrice ? `${formatEther(ticketPrice)} ETH` : "--"}
        </p>
      </div>

      {/* Status */}
      <div
        className={`mb-6 rounded-2xl p-4 border ${
          isCancelled ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <p className="text-xs text-slate-500 mb-1">Status do evento</p>
        <p className={`text-lg font-semibold ${isCancelled ? "text-red-700" : "text-emerald-700"}`}>
          {eventStatusLabel}
        </p>
      </div>

      {/* Endereço do contrato */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-500 mb-2">Endereco do contrato</p>
        <p className="font-mono text-xs break-all text-slate-700">{address}</p>
      </div>

      {/* Erro de transação */}
      {writeError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-xs text-red-500 mb-1">Erro na transação</p>
          <p className="text-sm text-red-700 break-all">{writeError.message}</p>
        </div>
      )}

      {/* Painel do organizador */}
      {isOwner ? (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-black text-amber-700">OWNER</span>
            <p className="text-sm font-semibold text-amber-900">Painel do organizador</p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCancelEvent}
              disabled={isPending || !isActive}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {isPending ? "Confirmando..." : isCancelled ? "Evento cancelado" : "Cancelar evento"}
            </button>

            <button
              type="button"
              onClick={handleConcludeEvent}
              disabled={isPending || !isActive}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              Finalizar evento
            </button>

            <button
              type="button"
              onClick={handleWithdrawFunds}
              disabled={isPending || !isCompleted}
              className="w-full bg-black hover:opacity-90 text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              Sacar fundos
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <p className="text-sm text-slate-500">
            Voce esta visualizando este evento como participante.
          </p>
        </div>
      )}

      {/* Ação principal do participante */}
      {hasTicket ? (
        <div className="mb-6 text-center text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
          Voce ja possui um ingresso para este evento.
        </div>
      ) : isCancelled ? (
        <div className="mb-6 text-center text-sm text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          Evento cancelado. Apenas o dono atual de um ingresso pode solicitar reembolso.
        </div>
      ) : (
        <button
          type="button"
          onClick={handleMintTicket}
          disabled={isPending}
          className="w-full bg-black hover:opacity-90 text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-50"
        >
          {isPending ? "Confirmando compra..." : "Comprar ingresso"}
        </button>
      )}

      {/* Ticket do usuário */}
      {hasTicket && hasValidToken && tokenId !== undefined && tokenId !== null && (
        <div className="mt-8 pt-8 border-t border-slate-100">
          <Ticket
            eventName={eventName ?? "Carregando..."}
            symbol={symbol ?? "FP"}
            tokenId={tokenId}
            ticketPrice={ticketPrice}
            contractAddress={address}
            userAddress={userAddress ?? "0x0"}
            isCancelled={isCancelled}
            onRefund={handleRefund}
            listTicketButton={
              <ListTicketButton
                marketplaceAddress={marketplaceAddress}
                eventAddress={address}
                tokenId={tokenIdBigInt!}
              />
            }
          />
        </div>
      )}
    </div>
  );
}