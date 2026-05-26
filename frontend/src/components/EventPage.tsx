import { useParams } from "react-router-dom";

export function EventPage() {
    const { address } = useParams();
    return (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-md mx-auto px-6 mt-12">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Detalhes do Evento</h2>
            <p className="text-slate-500 text-sm">
                Esta página exibirá os detalhes do evento, como nome, símbolo, preço do ingresso, data e hora, e a lista de ingressos vendidos.
                Você pode expandir esta página para incluir funcionalidades adicionais, como a capacidade de comprar ingressos ou visualizar os ingressos que você possui.
            </p>
            <p className="text-slate-500 text-sm mt-4">
                O endereço do contrato do evento é: <span className="font-mono text-sm">{address}</span>
            </p>
        </div>
    );
}