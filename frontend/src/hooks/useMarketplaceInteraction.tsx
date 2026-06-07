import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { fairPassEventAbi, fairPassMarketplaceAbi } from "@/src/generated";
import { useCallback } from "react";
import { config } from "../wagmi";

export function useMarketplaceInteraction(
  marketPlaceAddress: `0x${string}`,
  eventAddress: `0x${string}`,
) {
  const contract = useWriteContract();

  const listTicket = useCallback(
    async (tokenId: bigint, price: bigint) => {
      try {
        const aproveHash = await contract.mutateAsync({
          abi: fairPassEventAbi,
          address: eventAddress,
          functionName: "approve",
          args: [marketPlaceAddress, tokenId],
        });

        const approveReceipt = await waitForTransactionReceipt(config, {
          hash: aproveHash,
        });

        const listHash = await contract.mutateAsync({
          abi: fairPassMarketplaceAbi,
          address: marketPlaceAddress,
          functionName: "listTicket",
          args: [eventAddress, tokenId, price],
        });

        const listReceipt = await waitForTransactionReceipt(config, {
          hash: listHash,
        });

        return {listReceipt, approveReceipt};
      } catch (err) {
        console.error("Error listing ticket:", err);
        throw err;
      }
    },
    [marketPlaceAddress, eventAddress, contract],
  );

  return {
    listTicket,
    isPending: contract.isPending,
  };
} // <-- Fechamento correto do hook useMarketplaceInteraction
