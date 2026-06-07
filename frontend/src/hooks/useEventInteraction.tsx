import {
  useConnection,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { fairPassEventAbi } from "@/src/generated";
import { useCallback } from "react";

export function useEventInteraction(eventAddress: `0x${string}`) {
  const { address: userAddress } = useConnection();

  const {
    mutateAsync: writeContractAsync,
    data: hash,
    isPending: isWritePending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isPending = isWritePending || isConfirming;

  const mintTicket = useCallback(
    async (value: bigint) => {
      return writeContractAsync({
        abi: fairPassEventAbi,
        address: eventAddress,
        functionName: "mintTicket",
        args: [],
        value,
      });
    },
    [userAddress, eventAddress, writeContractAsync],
  );

  const withdrawFunds = useCallback(async () => {
    return writeContractAsync({
      abi: fairPassEventAbi,
      address: eventAddress,
      functionName: "withdrawFunds",
      args: [],
    });
  }, [userAddress, eventAddress, writeContractAsync]);

  const cancelEvent = useCallback(async () => {
    return writeContractAsync({
      abi: fairPassEventAbi,
      address: eventAddress,
      functionName: "cancelEvent",
      args: [],
    });
  }, [userAddress, eventAddress, writeContractAsync]);

    const concludeEvent = useCallback(async () => {
    return writeContractAsync({
      abi: fairPassEventAbi,
      address: eventAddress,
      functionName: "concludeEvent",
      args: [],
    });
  }, [userAddress, eventAddress, writeContractAsync]);
  
      const refundTicket = useCallback(async (tokenId: bigint) => {
    return writeContractAsync({
      abi: fairPassEventAbi,
      address: eventAddress,
      functionName: "refundTicket",
      args: [tokenId],
    });
  }, [userAddress, eventAddress, writeContractAsync]);

  return {
    mintTicket,
    cancelEvent,
    withdrawFunds,
    concludeEvent,
    refundTicket,
    isPending,
    isSuccess,
    hash,
  };
}
