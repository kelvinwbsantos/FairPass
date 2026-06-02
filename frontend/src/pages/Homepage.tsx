import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="space-y-16 animate-fade-in py-6">
      {/* Seção Hero / Boas-vindas */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Bem-vindo ao <span className="text-indigo-600">FairPass</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A plataforma de ingressos descentralizada para eventos justos, 
          seguros e 100% transparentes na blockchain.
        </p>
      </div>

      {/* Grade de Recursos / Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Criar Evento */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-indigo-200 transition group">
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl mb-4 group-hover:bg-indigo-100 transition">
              🎟️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Organize Eventos</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Crie seu evento personalizado, defina as regras dos ingressos e gerencie seus participantes de forma simples.
            </p>
          </div>
          <Link
            to="/create-event"
            className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            Criar novo evento
          </Link>
        </div>

        {/* Card: Marketplace */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:border-emerald-200 transition group">
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xl mb-4 group-hover:bg-emerald-100 transition">
              🛒
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Compre Ingressos</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Explore os eventos disponíveis na plataforma e adquira seus ingressos diretamente pelo mercado secundário ou oficial.
            </p>
          </div>
          <Link
            to="/marketplace"
            className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            Explorar Marketplace
          </Link>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Benefícios da Plataforma */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Por que escolher o FairPass?
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Segurança criptográfica e regras programadas diretamente em contratos inteligentes auditáveis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Benefício 1 */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="text-2xl">🛑</div>
            <h4 className="font-bold text-slate-800 text-base">Fim do Cambismo</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              O preço do ingresso no mercado secundário nunca supera o valor original oficial. Proteção real para o bolso do fã.
            </p>
          </div>

          {/* Benefício 2 */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="text-2xl">🛡️</div>
            <h4 className="font-bold text-slate-800 text-base">Anti-Fraude (NFTs)</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Cada ingresso é um ativo digital único baseado no padrão ERC-721. Impossível de clonar ou falsificar.
            </p>
          </div>

          {/* Benefício 3 */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="text-2xl">💰</div>
            <h4 className="font-bold text-slate-800 text-base">Reembolso Garantido</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Se o organizador cancelar o evento, o contrato libera o resgate do seu dinheiro de forma 100% automatizada.
            </p>
          </div>

          {/* Benefício 4 */}
          <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-xl space-y-3">
            <div className="text-2xl">🤝</div>
            <h4 className="font-bold text-slate-800 text-base">Transações P2P Seguras</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              As transferências diretas são bloqueadas. Toda revenda passa pelo nosso intermediador descentralizado via custódia segura.
            </p>
          </div>
        </div>
      </div>

      {/* Ver todos os eventos */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm text-center">
        <h4 className="text-slate-800 font-semibold mb-2">Quer apenas dar uma olhada?</h4>
        <p className="text-slate-500 text-sm mb-4">Veja a lista completa de todos os eventos ativos na rede.</p>
        <Link
          to="/all-events"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-semibold text-sm gap-1 transition"
        >
          Ver todos os eventos &rarr;
        </Link>
      </div>
    </div>
  );
}