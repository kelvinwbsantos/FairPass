import { useState } from "react";
import { parseEther } from "viem";
import { usePublicClient, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

import { fairPassEventAbi, fairPassMarketplaceAbi } from "../generated";

type ListTicketButtonProps = {
  marketplaceAddress: `0x${string}`;
  eventAddress: `0x${string}`;
  tokenId: bigint;
};

export function ListTicketButton({
  marketplaceAddress,
  eventAddress,
  tokenId,
}: ListTicketButtonProps) {
  const [price, setPrice] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();

  async function handleListFlow() {
    if (!price || !publicClient) return;

    try {
      setCustomLoading(true);
      setErrorMessage(null);

      const approvalHash = await writeContractAsync({
        address: eventAddress,
        abi: fairPassEventAbi,
        functionName: "approve",
        args: [marketplaceAddress, tokenId],
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalHash });

      const listingHash = await writeContractAsync({
        address: marketplaceAddress,
        abi: fairPassMarketplaceAbi,
        functionName: "listTicket",
        args: [eventAddress, tokenId, parseEther(price)],
      });

      await publicClient.waitForTransactionReceipt({ hash: listingHash });

      await queryClient.invalidateQueries();
      setPrice("");
    } catch (error) {
      console.error("Erro ao listar ticket:", error);
      setErrorMessage("Nao foi possivel listar o ticket.");
    } finally {
      setCustomLoading(false);
    }
  }

  return (
    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-black text-slate-700">SALE</span>
        <p className="text-sm font-semibold text-slate-900">
          Listar ticket no marketplace
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="0.01"
          value={price}
          disabled={customLoading}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
        />

        <button
          onClick={handleListFlow}
          disabled={customLoading || !price}
          className="w-full bg-black hover:opacity-90 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
        >
          {customLoading ? "Processando transacoes..." : "Listar ticket"}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
