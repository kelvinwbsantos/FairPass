import { useConnection, useReadContracts } from "wagmi";
import { fairPassEventAbi } from "@/src/generated";
import { useMemo } from "react";

export interface UserTicket {
  hasTicket: boolean;
  ticketId: number;
}

export function useUserTicket(eventAddress: `0x${string}`) {
  const { address: userAddress } = useConnection();

  const { data, isLoading, error, refetch } = useReadContracts({
    query: {
      enabled: !!userAddress,
    },
    contracts: [
      {
        address: eventAddress,
        abi: fairPassEventAbi,
        functionName: "userTicket",
        args: [userAddress!],
      },
    ],
  });

  const userTicket = useMemo<UserTicket | undefined>(() => {
    if (!data) return undefined;

    const result = data[0];

    if (result.status === "failure") {
      return undefined;
    }

    const [hasTicket, tokenId] = result.result as [boolean, bigint];

    return {
      hasTicket,
      ticketId: Number(tokenId),
    };
  }, [data]);

  return {
    userTicket,
    isLoading,
    isError: !!error,
    refetch,
  };
}