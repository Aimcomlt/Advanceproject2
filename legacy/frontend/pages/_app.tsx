import type { AppProps } from 'next/app';
import Head from 'next/head';
import { WagmiConfig } from 'wagmi';

import Layout from '../components/Layout';
import { wagmiConfig } from '../lib/web3';

import '../styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <Head>
        <title>Literary Sovereignty</title>
        <meta
          name="description"
          content="Explore the Literary Sovereignty reader and on-chain publishing tools."
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WagmiConfig>
  );
};

export default App;
