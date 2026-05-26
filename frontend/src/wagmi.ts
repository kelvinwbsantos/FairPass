import { createConfig, http, webSocket, fallback } from 'wagmi'
import { localhost } from 'wagmi/chains'

export const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: fallback([
      webSocket('ws://127.0.0.1:8545'), 
      http('http://127.0.0.1:8545')
    ]),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}