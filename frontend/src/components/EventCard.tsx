import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchEvent } from "@/src/hooks/useFetchEvent";
import { Link } from "react-router-dom";

interface EventCardProps {
  eventAddress: `0x${string}`;
}

export function EventCard({ eventAddress }: EventCardProps) {
  const { event, isLoading } = useFetchEvent(eventAddress);

  const capacityPercentage = event?.maxSupply
    ? Math.min((event.totalMinted / event.maxSupply) * 100, 100)
    : 0;

  const statusLabels = ["Ativo", "Finalizado", "Cancelado"];
  const statusColors: Record<number, "default" | "destructive" | "secondary"> =
    {
      0: "default", // Ativo
      1: "secondary", // Finalizado
      2: "destructive", // Cancelado
    };

  if (isLoading || !event) {
    return <Skeleton className="w-full h-24" />;
  }

  return (
    <Card className="w-full">

      <CardHeader>
        <CardTitle>
          {event.name} ({event.symbol})
        </CardTitle>
        <CardDescription>Endereço: {eventAddress}</CardDescription>
        <CardAction>
          <Badge>{event.formattedPrice} ETH</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-row items-center gap-2">
        <Badge variant={statusColors[event.status]}>
          {statusLabels[event.status]}
        </Badge>
        <Badge variant="outline">Ingressos Emitidos: {event.totalMinted}</Badge>
        <Badge variant="outline">Quantidade Disponível: {event.maxSupply - event.totalMinted}</Badge>
      </CardContent>

      <CardFooter className="grid gap-2">
        <p>Lotação</p>
        <Progress value={capacityPercentage} />
        <Button asChild>
          <Link to={`/event/${eventAddress}`}>Ver Detalhes</Link>
        </Button>
      </CardFooter>
      
    </Card>
  );
}
