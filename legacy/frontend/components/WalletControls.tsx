import { Menu, Transition } from '@headlessui/react';
import { Fragment, useMemo } from 'react';
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsName,
  useSwitchChain,
} from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { chains as configuredChains } from '../lib/web3';
import { cn, formatAddress } from '../lib/utils';

export const WalletControls = () => {
  const { address, chain, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { enabled: Boolean(address) },
  });
  const { data: balance } = useBalance({
    address,
    chainId: chain?.id,
    query: { enabled: Boolean(address && chain?.id) },
    watch: true,
  });
  const { connectors, connect, error, isPending, pendingConnector } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains: supportedChains = configuredChains, switchChain, isPending: isSwitching } = useSwitchChain();

  const displayName = useMemo(() => {
    if (ensName) return ensName;
    if (address) return formatAddress(address);
    return 'Connect Wallet';
  }, [ensName, address]);

  if (!isConnected) {
    return (
      <Menu as="div" className="relative">
        <Menu.Button className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow">
          {isPending && pendingConnector ? `Connecting ${pendingConnector.name}...` : 'Connect'}
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg border border-slate-200 bg-white shadow-lg">
            <div className="p-2">
              {connectors.map((connector) => (
                <Menu.Item key={connector.id}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => connect({ connector })}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-brand/10',
                        active && 'bg-brand/10',
                        !connector.ready && 'cursor-not-allowed opacity-50',
                      )}
                      disabled={!connector.ready}
                    >
                      {connector.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
              {error ? <p className="px-3 py-2 text-xs text-red-500">{error.message}</p> : null}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  }

  const selectableChains = supportedChains.length ? supportedChains : configuredChains;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-full border border-brand/30 bg-white px-4 py-2 text-sm font-semibold text-brand shadow">
        {displayName}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-lg">
          <div>
            <p className="text-xs uppercase text-slate-400">Wallet</p>
            <p className="font-semibold text-slate-700">{displayName}</p>
            {balance ? (
              <p className="text-xs text-slate-500">
                {Number(balance.formatted).toFixed(4)} {balance.symbol} on {chain?.name}
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-400">Switch network</p>
            {selectableChains.map((supportedChain) => (
              <button
                key={supportedChain.id}
                type="button"
                onClick={() => switchChain?.({ chainId: supportedChain.id })}
                className={cn(
                  'w-full rounded-md px-3 py-2 text-left text-sm hover:bg-brand/10',
                  chain?.id === supportedChain.id ? 'bg-brand/10 text-brand' : 'text-slate-700',
                  !switchChain && 'cursor-not-allowed opacity-50',
                )}
                disabled={!switchChain || isSwitching}
              >
                {supportedChain.name}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => disconnect()}
            className="w-full rounded-md border border-brand px-3 py-2 text-center text-sm font-semibold text-brand hover:bg-brand/10"
          >
            Disconnect
          </button>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
