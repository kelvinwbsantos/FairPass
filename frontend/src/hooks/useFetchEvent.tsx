import { useReadContracts } from "wagmi";
import { fairPassEventAbi } from "@/src/generated";
import { formatEther } from "viem";
import { useMemo } from "react";

export interface EventData {
  owner: `0x${string}`;
  status: number;
  ticketPrice: bigint;
  formattedPrice: string;
  name: string;
  symbol: string;
  totalMinted: number;
  maxSupply: number;
}

export function useFetchEvent(eventAddress: `0x${string}`) {
  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: [
      { address: eventAddress, abi: fairPassEventAbi, functionName: "owner" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "status" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "ticketPrice" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "name" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "symbol" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "totalMinted" },
      { address: eventAddress, abi: fairPassEventAbi, functionName: "maxSupply" },
    ],
  });

  const eventData: EventData | undefined = useMemo(() => {
    if (!data || data.some((res) => res.status === "failure")) return undefined;

    const [owner, status, ticketPrice, name, symbol, totalMinted, maxSupply] = data.map(
      (res) => res.result
    );

    return {
      owner: owner as `0x${string}`,
      status: Number(status),
      ticketPrice: ticketPrice as bigint,
      formattedPrice: formatEther(ticketPrice as bigint),
      name: name as string,
      symbol: symbol as string,
      totalMinted: Number(totalMinted),
      maxSupply: Number(maxSupply),
    };
  }, [data]);

  return {
    event: eventData,
    isLoading,
    isError: !!error,
    refetch,
  };
}