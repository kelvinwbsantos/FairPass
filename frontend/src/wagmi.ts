import { createConfig, http, webSocket, fallback } from "wagmi";
import { localhost, sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: fallback([
      webSocket(import.meta.env.VITE_SEPOLIA_RPC_WS_URL),
      http(import.meta.env.VITE_SEPOLIA_RPC_URL),
    ]),
    [localhost.id]: fallback([
      webSocket("ws://127.0.0.1:8545"),
      http("http://127.0.0.1:8545"),
    ]),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
