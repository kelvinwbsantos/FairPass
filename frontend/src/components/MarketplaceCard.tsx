import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

import { fairPassMarketplaceAbi } from "../generated";

type MarketplaceCardProps = {
  marketplaceAddress: `0x${string}`;
  eventAddress: `0x${string}`;
  tokenId: bigint;
  seller: `0x${string}`;
  price: bigint;
};

export function MarketplaceCard({
  marketplaceAddress,
  eventAddress,
  tokenId,
  seller,
  price,
}: MarketplaceCardProps) {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSeller = !!address && address.toLowerCase() === seller.toLowerCase();

  const { isFetching: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isSuccess) queryClient.invalidateQueries();
  }, [isSuccess]);

  const isWorking = isPending || isConfirming;

  async function handleBuyTicket() {
    try {
      setErrorMessage(null);
      await writeContractAsync({
        address: marketplaceAddress,
        abi: fairPassMarketplaceAbi,
        functionName: "buyTicket",
        args: [eventAddress, tokenId],
        value: price,
      });
    } catch (error) {
      console.error("Erro ao comprar ticket:", error);
      setErrorMessage("Não foi possível comprar o ticket.");
    }
  }

  async function handleCancelListing() {
    try {
      setErrorMessage(null);
      await writeContractAsync({
        address: marketplaceAddress,
        abi: fairPassMarketplaceAbi,
        functionName: "cancelListing",
        args: [eventAddress, tokenId],
      });
    } catch (error) {
      console.error("Erro ao cancelar listagem:", error);
      setErrorMessage("Não foi possível cancelar a listagem.");
    }
  }

  return (
    <div className="bg-white border border-slate-200 hover:border-indigo-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between transition group relative overflow-hidden">
      {/* Badge Superior de Status */}
      <div className="flex justify-between items-start mb-4">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isSeller
              ? "bg-rose-50 text-rose-700 border-rose-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}
        >
          {isSeller ? "Sua Listagem" : "À Venda"}
        </span>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
          {`${eventAddress.slice(0, 6)}...${eventAddress.slice(-4)}`}
        </span>
      </div>

      {/* Detalhes Principais */}
      <div className="space-y-2 flex-grow">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight line-clamp-1 group-hover:text-indigo-600 transition">
          Ticket #{tokenId.toString()}
        </h3>

        {/* Vendedor */}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-50">
          <span className="text-xs text-slate-400">Vendedor</span>
          <span className="text-xs font-mono text-slate-600">
            {isSeller ? "Você" : `${seller.slice(0, 6)}...${seller.slice(-4)}`}
          </span>
        </div>

        {/* Preço */}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-50">
          <span className="text-xs text-slate-400">Preço do Ticket</span>
          <span className="text-lg font-extrabold text-slate-900">
            {formatEther(price)} ETH
          </span>
        </div>
      </div>

      {/* Botões de Ação */}
      {isSeller ? (
        <button
          onClick={handleCancelListing}
          disabled={isWorking}
          className="w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition mt-5 disabled:opacity-50"
        >
          {isWorking ? "Cancelando..." : "Cancelar listagem"}
        </button>
      ) : (
        <button
          onClick={handleBuyTicket}
          disabled={isWorking}
          className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition mt-5 disabled:opacity-50"
        >
          {isWorking ? "Comprando..." : "Comprar ticket"}
        </button>
      )}

      {errorMessage && (
        <p className="mt-3 text-center text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
}