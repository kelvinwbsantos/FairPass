import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useFetchEvent } from "../hooks/useFetchEvent";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventInteraction } from "../hooks/useEventInteraction";
import { toast } from "sonner";
import { useUserTicket } from "../hooks/useUserTicket";
import { useConnection } from "wagmi";
import { useMarketplaceInteraction } from "../hooks/useMarketplaceInteraction";
import { useState } from "react";
import { parseEther } from "viem";

export function EventPage() {
  const { address: eventAddress } = useParams() as { address: `0x${string}` };
  const {
    mintTicket,
    cancelEvent,
    withdrawFunds,
    concludeEvent,
    refundTicket,
    isPending,
    hash,
  } = useEventInteraction(eventAddress);
  const { userTicket } = useUserTicket(eventAddress);
  const { address: userAddress } = useConnection();

  const { event, isLoading: isFetchingEvent } = useFetchEvent(eventAddress);

  const isEventOwner = event?.owner == userAddress;

  const statusLabels = ["Ativo", "Finalizado", "Cancelado"];
  const statusColors: Record<number, "default" | "destructive" | "secondary"> =
    {
      0: "default", // Ativo
      1: "secondary", // Finalizado
      2: "destructive", // Cancelado
    };

  const canWithdrawFunds = event?.balance && event.status == 1 ? true : false;

  const timestamp = Number(event?.eventTimestamp);
  const date = new Date(timestamp * 1000);
  const eventDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const isEventPast = timestamp < nowInSeconds;
  const isEventCanceled = event?.status == 2;
  const isEventConcluded = event?.status == 1;
  const isEventRunning = event?.status == 0;

  const executeTx = async (
    action: () => Promise<any>,
    successMsg: string,
    errorMsg: string,
  ) => {
    const toastId = toast.loading("Enviando transação...");

    try {
      await action();
      toast.success(successMsg, {
        id: toastId,
        description: hash ? `Hash: ${hash.slice(0, 10)}...` : undefined,
        action: hash && {
          label: "Ver no Explorer",
          onClick: () =>
            window.open(`https://sepolia.etherscan.io/tx/${hash}`, "_blank"),
        },
      });
    } catch (err: any) {
      toast.error(err?.shortMessage || err?.message || errorMsg, {
        id: toastId,
      });
    }
  };

  const handleMint = () =>
    executeTx(
      () => mintTicket(event?.ticketPrice!),
      "Ingresso comprado com sucesso!",
      "Falha ao comprar ingresso",
    );

  const handleCancelEvent = () =>
    executeTx(
      cancelEvent,
      "Evento cancelado com sucesso!",
      "Falha ao cancelar evento",
    );

  const handleWithdrawFunds = () =>
    executeTx(
      withdrawFunds,
      "Saque realizado com sucesso!",
      "Falha ao realizar saque",
    );

  const handleConcludeEvent = () =>
    executeTx(
      concludeEvent,
      "Evento concluído com sucesso!",
      "Falha ao concluir evento",
    );

  const handleRefund = () =>
    executeTx(
      () => refundTicket(BigInt(userTicket?.ticketId!)),
      "Ticket reembolsado com sucesso!",
      "Falha ao reembolsar ticket",
    );

  // Marketplace interaction
  const marketplaceAddress = import.meta.env
    .VITE_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

  const { listTicket } = useMarketplaceInteraction(
    marketplaceAddress,
    eventAddress,
  );

  const [listPrice, setListPrice] = useState<string>("");

  const handleListTicket = () => {
    executeTx(
      () => listTicket(BigInt(userTicket?.ticketId!), parseEther(listPrice)),
      "Ticket listado com sucesso no marketplace!",
      "Falha ao listar ticket",
    );
  };

  if (isFetchingEvent || !event) {
    return <Skeleton className="w-full h-24" />;
  }

  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      <div className="flex flex-col gap-4 w-150">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              {event.name} ({event.symbol})
            </CardTitle>
            <CardDescription>Endereço: {eventAddress}</CardDescription>
            <CardAction className="flex gap-2">
              <Badge variant={statusColors[event.status]}>
                {statusLabels[event.status]}
              </Badge>
              <Badge>{event.formattedPrice} ETH</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex flex-row justify-between">
            <Button
              onClick={handleMint}
              disabled={isPending || userTicket?.hasTicket || !isEventRunning}
            >
              {userTicket?.hasTicket
                ? "Ingresso já adquirido"
                : isPending
                  ? "Processando..."
                  : "Comprar ingresso"}
            </Button>
            <Badge>{eventDate}</Badge>
          </CardFooter>
        </Card>

        {isEventOwner && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Painel do Organizador</CardTitle>
              </CardHeader>
              <CardFooter className="flex flex-row gap-2">
                <Button
                  onClick={handleConcludeEvent}
                  disabled={isPending || (event.status == 1 && !isEventPast || isEventCanceled)}
                >
                  {event.status == 2
                    ? "Evento concluido"
                    : isPending
                      ? "Processando..."
                      : "Concluir evento"}
                </Button>

                <Button
                  onClick={handleCancelEvent}
                  disabled={isPending || event.status != 0}
                >
                  {event.status == 2
                    ? "Evento cancelado"
                    : isPending
                      ? "Processando..."
                      : "Cancelar evento"}
                </Button>

                <Button
                  onClick={handleWithdrawFunds}
                  disabled={isPending || !canWithdrawFunds}
                >
                  {!canWithdrawFunds
                    ? "Não há fundos para sacar"
                    : isPending
                      ? "Processando..."
                      : "Sacar fundos"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      {/* Ticket */}
      {userTicket?.hasTicket && (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Seu ingresso</CardTitle>
            <CardDescription>
              {event.name} ({event.symbol})
            </CardDescription>
            <CardAction className="flex gap-2">
              <Badge variant={statusColors[event.status]}>
                {statusLabels[event.status]}
              </Badge>
            </CardAction>
          </CardHeader>

          <CardFooter className="flex flex-col items-start gap-3">
            <p>Id do ingresso: {userTicket.ticketId}</p>

            {isEventCanceled && (
              <Button onClick={handleRefund} disabled={isPending}>
                Pedir reembolso
              </Button>
            )}

            {!isEventCanceled && !isEventConcluded && (
              <div className="w-full space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Preço de venda (ETH)
                  </label>
                  <Input
                    type="text"
                    placeholder="0.05"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleListTicket}
                  disabled={isPending || !listPrice || Number(listPrice) <= 0}
                  className="w-full"
                >
                  Listar no Marketplace
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
