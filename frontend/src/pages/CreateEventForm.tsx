import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BaseError,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";

import { fairPassEventFactoryAbi } from "../generated";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FACTORY_CONTRACT_ADDRESS =
  import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS as `0x${string}`;

export function CreateEventForm() {
  const navigate = useNavigate();

  const { data: hash, error, isPending, writeContract } =
    useWriteContract();

  const [deployedAddress, setDeployedAddress] =
    useState<`0x${string}` | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const dateString = formData.get("_eventTimestamp") as string;

    const timestampInSeconds = Math.floor(
      new Date(dateString).getTime() / 1000
    );

    writeContract({
      address: FACTORY_CONTRACT_ADDRESS,
      abi: fairPassEventFactoryAbi,
      functionName: "createEvent",
      args: [
        formData.get("_name") as string,
        formData.get("_symbol") as string,
        parseEther(formData.get("_ticketPrice") as string),
        BigInt(formData.get("_maxSupply") as string),
        BigInt(timestampInSeconds),
      ],
    });
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useWatchContractEvent({
    address: FACTORY_CONTRACT_ADDRESS,
    abi: fairPassEventFactoryAbi,
    eventName: "EventCreated",
    onLogs(logs) {
      for (const log of logs) {
        const eventAddress = log.args.eventContractAddress;

        if (eventAddress) {
          setDeployedAddress(eventAddress);
        }
      }
    },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Criar novo evento</CardTitle>

          <CardDescription>
            Preencha os dados abaixo para publicar o contrato do
            evento na blockchain.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Evento</Label>

              <Input
                id="name"
                name="_name"
                placeholder="Ex: Rock in Rio Pass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">
                Símbolo do Ingresso
              </Label>

              <Input
                id="symbol"
                name="_symbol"
                placeholder="Ex: RIR-PASS"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ticketPrice">
                  Preço (ETH)
                </Label>

                <Input
                  id="ticketPrice"
                  name="_ticketPrice"
                  type="number"
                  step="any"
                  placeholder="0.05"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSupply">
                  Quantidade Máxima
                </Label>

                <Input
                  id="maxSupply"
                  name="_maxSupply"
                  type="number"
                  placeholder="500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">
                Data e Hora do Evento
              </Label>

              <Input
                id="eventDate"
                name="_eventTimestamp"
                type="datetime-local"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isConfirming}
            >
              {isPending
                ? "Aguardando carteira..."
                : isConfirming
                ? "Criando na Blockchain..."
                : "Criar evento"}
            </Button>

            {(hash || isConfirming || isConfirmed || error) && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                {hash && (
                  <div className="text-sm">
                    <span className="font-medium">
                      Hash:
                    </span>

                    <code className="ml-2 rounded bg-muted px-2 py-1 text-xs">
                      {hash}
                    </code>
                  </div>
                )}

                {isConfirming && (
                  <p className="text-sm text-muted-foreground">
                    ⏳ Enviando transação para a rede...
                  </p>
                )}

                {isConfirmed && !deployedAddress && (
                  <p className="text-sm text-green-600">
                    ✅ Transação confirmada! Aguardando o
                    endereço do evento...
                  </p>
                )}

                {error && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                    {(error as BaseError).shortMessage ||
                      error.message}
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {deployedAddress && (
        <Card className="mt-6 border-green-500/20">
          <CardHeader>
            <CardTitle>
              🎉 Contrato criado com sucesso!
            </CardTitle>

            <CardDescription>
              Seu evento já possui um endereço exclusivo na
              blockchain.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted p-3">
              <code className="text-sm break-all">
                {deployedAddress}
              </code>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(
                    deployedAddress
                  )
                }
              >
                Copiar
              </Button>

              <Button
                onClick={() =>
                  navigate(`/event/${deployedAddress}`)
                }
              >
                Ver evento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}