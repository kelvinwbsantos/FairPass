import { useReadContract } from "wagmi";

import { MarketplaceCard } from "../components/MarketplaceCard";
import { fairPassMarketplaceAbi } from "../generated";

export function Marketplace() {
  const marketplaceAddress = import.meta.env.VITE_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`;

  const { data: listings, isLoading } = useReadContract({
    address: marketplaceAddress,
    abi: fairPassMarketplaceAbi,
    functionName: "getAllListings",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Marketplace FairPass
        </h1>

        <p className="text-slate-500">
          Compre ingressos NFT listados por outros usuarios
        </p>
      </div>

      {isLoading && (
        <div className="text-center text-slate-500 py-12">
          Carregando listagens...
        </div>
      )}

      {!isLoading && listings?.length === 0 && (
        <div className="text-center text-slate-500 py-12 border border-dashed border-slate-200 rounded-3xl">
          Nenhum ingresso listado no momento.
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map((listing) => (
          <MarketplaceCard
            key={`${listing.eventContract}-${listing.tokenId.toString()}`}
            marketplaceAddress={marketplaceAddress}
            eventAddress={listing.eventContract}
            tokenId={listing.tokenId}
            seller={listing.seller}
            price={listing.price}
          />
        ))}
      </div>
    </div>
  );
}
