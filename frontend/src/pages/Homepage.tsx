import { Link } from "react-router-dom";
import { Ticket, ShoppingCart, ShieldAlert, ShieldCheck, Coins, Handshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Homepage() {
  return (
    <div className="space-y-16 animate-fade-in py-6">
      {/* Seção Hero / Boas-vindas */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-4">
          Bem-vindo ao <span className="text-primary">FairPass</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A plataforma de ingressos descentralizada para eventos justos, 
          seguros e 100% transparentes na blockchain.
        </p>
      </div>

      {/* Grade de Recursos / Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Criar Evento */}
        <Card className="flex flex-col justify-between hover:border-primary/50 transition group">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition">
              <Ticket className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-card-foreground">Organize Eventos</CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed">
              Crie seu evento personalizado, defina as regras dos ingressos e gerencie seus participantes de forma simples.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full font-semibold rounded-xl shadow-sm">
              <Link to="/create-event">Criar novo evento</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Card: Marketplace */}
        <Card className="flex flex-col justify-between hover:border-accent-foreground/30 transition group">
          <CardHeader>
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-accent-foreground mb-4 group-hover:bg-accent/80 transition">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-card-foreground">Compre Ingressos</CardTitle>
            <CardDescription className="text-muted-foreground text-sm leading-relaxed">
              Explore os eventos disponíveis na plataforma e adquira seus ingressos diretamente pelo mercado secundário ou oficial.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="secondary" className="w-full font-semibold rounded-xl">
              <Link to="/marketplace">Explorar Marketplace</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {/* Benefícios da Plataforma */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            Por que escolher o FairPass?
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Segurança criptográfica e regras programadas diretamente em contratos inteligentes auditáveis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Benefício 1 */}
          <Card className="bg-muted/40 border-muted shadow-none">
            <CardHeader className="space-y-3 p-5">
              <div className="text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <CardTitle className="font-bold text-card-foreground text-base">Fim do Cambismo</CardTitle>
              <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                O preço do ingresso no mercado secundário nunca supera o valor original oficial. Proteção real para o bolso do fã.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Benefício 2 */}
          <Card className="bg-muted/40 border-muted shadow-none">
            <CardHeader className="space-y-3 p-5">
              <div className="text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="font-bold text-card-foreground text-base">Anti-Fraude (NFTs)</CardTitle>
              <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                Cada ingresso é um ativo digital único baseado no padrão ERC-721. Impossível de clonar ou falsificar.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Benefício 3 */}
          <Card className="bg-muted/40 border-muted shadow-none">
            <CardHeader className="space-y-3 p-5">
              <div className="text-primary">
                <Coins className="w-6 h-6" />
              </div>
              <CardTitle className="font-bold text-card-foreground text-base">Reembolso Garantido</CardTitle>
              <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                Se o organizador cancelar o evento, o contrato libera o resgate do seu dinheiro de forma 100% automatizada.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Benefício 4 */}
          <Card className="bg-muted/40 border-muted shadow-none">
            <CardHeader className="space-y-3 p-5">
              <div className="text-primary">
                <Handshake className="w-6 h-6" />
              </div>
              <CardTitle className="font-bold text-card-foreground text-base">Transações P2P Seguras</CardTitle>
              <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                As transferências diretas são bloqueadas. Toda revenda passa pelo nosso intermediador descentralizado via custódia segura.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Ver todos os eventos */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <h4 className="text-card-foreground font-semibold mb-2">Quer apenas dar uma olhada?</h4>
          <p className="text-muted-foreground text-sm mb-4">Veja a lista completa de todos os eventos ativos na rede.</p>
          <Button asChild variant="link" className="text-primary hover:text-primary/80 font-semibold text-sm gap-1 h-auto p-0">
            <Link to="/all-events">
              Ver todos os eventos <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}