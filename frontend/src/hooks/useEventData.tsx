import { useReadContracts, useWriteContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { fairPassEventAbi } from "../generated";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export function useEventData(
  address: `0x${string}`,
  userAddress: `0x${string}` | undefined,
) {
  const queryClient = useQueryClient();
  const { writeContract, isPending, error: writeError } = useWriteContract();

  const effectiveUser = userAddress ?? ZERO_ADDRESS;

  const { data, isLoading, queryKey } = useReadContracts({
    contracts: [
      { address, abi: fairPassEventAbi, functionName: "owner" },
      { address, abi: fairPassEventAbi, functionName: "balanceOf", args: [effectiveUser] },
      { address, abi: fairPassEventAbi, functionName: "ownedToken", args: [effectiveUser] },
      { address, abi: fairPassEventAbi, functionName: "status" },
      { address, abi: fairPassEventAbi, functionName: "ticketPrice" },
      { address, abi: fairPassEventAbi, functionName: "name" },
      { address, abi: fairPassEventAbi, functionName: "symbol" },
      { address, abi: fairPassEventAbi, functionName: "totalMinted" },
    ],
    query: { enabled: !!address },
  });

  const [
    contractOwner,
    balanceData,
    rawTokenId,
    eventStatus,
    ticketPrice,
    eventName,
    symbol,
    totalMinted,
  ] = data?.map((r) => r.result) ?? [];

    const tokenId =
    rawTokenId != null && typeof rawTokenId !== "string"
      ? (rawTokenId as number | bigint)
      : null;

  const hasTicket = balanceData ? Number(balanceData) > 0 : false;
  const status = eventStatus !== undefined ? Number(eventStatus) : 0;
  const mintedCount = totalMinted !== undefined ? Number(totalMinted) : 0;
  const isActive = status === 0;
  const isCompleted = status === 1;
  const isCancelled = status === 2;

  const isOwner =
    !!userAddress &&
    !!contractOwner &&
    (userAddress as string).toLowerCase() === (contractOwner as string).toLowerCase();

  const eventStatusLabel =
    status === 0 ? "Ativo" : status === 1 ? "Finalizado" : "Cancelado";

  const tokenIdBigInt = tokenId != null ? BigInt(tokenId.toString()) : null;
  const hasValidToken = tokenIdBigInt !== null && tokenIdBigInt !== 0n;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey });
  }

  // Handlers
  function handleCancelEvent() {
    writeContract(
      { address, abi: fairPassEventAbi, functionName: "cancelEvent", args: [] },
      { onSuccess: refresh },
    );
  }

  function handleConcludeEvent() {
    writeContract(
      { address, abi: fairPassEventAbi, functionName: "concludeEvent", args: [] },
      { onSuccess: refresh },
    );
  }

  function handleWithdrawFunds() {
    writeContract(
      { address, abi: fairPassEventAbi, functionName: "withdrawFunds", args: [] },
      { onSuccess: refresh },
    );
  }

  function handleMintTicket() {
    if (!ticketPrice) return;
    writeContract(
      {
        address,
        abi: fairPassEventAbi,
        functionName: "mintTicket",
        value: ticketPrice as bigint,
      },
      { onSuccess: refresh },
    );
  }

  function handleRefund() {
    if (!hasValidToken || !tokenIdBigInt) return;
    writeContract(
      {
        address,
        abi: fairPassEventAbi,
        functionName: "refundTicket",
        args: [tokenIdBigInt],
      },
      { onSuccess: refresh },
    );
  }

  return {
    // Dados brutos
    eventName: eventName as string | undefined,
    symbol: symbol as string | undefined,
    ticketPrice: ticketPrice as bigint | undefined,
    tokenId,
    tokenIdBigInt,
    // Derivações
    mintedCount,
    hasTicket,
    hasValidToken,
    isOwner,
    isActive,
    isCompleted,
    isCancelled,
    eventStatusLabel,
    // Estado de loading/erro
    isLoading,
    isPending,
    writeError,
    // Ações
    handleCancelEvent,
    handleConcludeEvent,
    handleWithdrawFunds,
    handleMintTicket,
    handleRefund,
  };
}