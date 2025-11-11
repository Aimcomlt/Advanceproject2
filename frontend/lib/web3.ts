import { createConfig, http } from 'wagmi';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';
import { createPublicClient, type HttpTransport, type PublicClient } from 'viem';

const chains = [mainnet, sepolia] as const;

const rpcUrls: Record<number, string | undefined> = {
  [mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  [sepolia.id]: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
};

const transports = chains.reduce<Record<number, HttpTransport>>((acc, chain) => {
  const rpcUrl = rpcUrls[chain.id];
  acc[chain.id] = rpcUrl ? http(rpcUrl) : http();
  return acc;
}, {});

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected({ shimDisconnect: true }),
  coinbaseWallet({ appName: 'Literary Sovereignty Blueprint' }),
  ...(projectId ? [walletConnect({ projectId })] : []),
];

export const wagmiConfig = createConfig({
  chains: [...chains],
  connectors,
  ssr: true,
  transports,
});

const publicClients = chains.reduce<Record<number, PublicClient>>((acc, chain) => {
  acc[chain.id] = createPublicClient({
    chain,
    transport: transports[chain.id],
  });
  return acc;
}, {});

export function getPublicClient(chainId: number) {
  return publicClients[chainId];
}

export { chains };
