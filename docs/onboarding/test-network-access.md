# Test Network Onboarding

This guide walks new contributors through configuring their environment to deploy and test contracts against Hardhat's local network and public Ethereum test networks.

## 1. Prerequisites

- Node.js and npm installed (see the project README for the recommended versions).
- A funded testnet account (e.g., Sepolia ETH) if you plan to deploy to public networks.
- MetaMask or another wallet that supports importing accounts via a private key.

## 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env` in the project root:

   ```bash
   cp .env.example .env
   ```

2. Fill in the variables with your credentials:

   - `PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY`: private key for the account you want to deploy with. **Never commit real secrets.**
   - `SEPOLIA_RPC_URL` / `BASE_GOERLI_RPC_URL`: RPC endpoints from your provider (Alchemy, Infura, etc.).
   - `ETHERSCAN_API_KEY` / `BASESCAN_API_KEY`: optional, only needed for contract verification.
   - `LOCALHOST_RPC_URL`: leave at the default unless you expose Hardhat on another port.

3. For frontend testing, provide the `NEXT_PUBLIC_*` keys so the dApp can connect to the same networks.

## 3. Use the Hardhat Test Network

Hardhat now exposes an explicit in-memory test network configuration in `hardhat.config.ts`. To start a local node:

```bash
npx hardhat node
```

The node runs on `http://127.0.0.1:8545` and generates funded accounts. When your `.env` contains a `PRIVATE_KEY`, it will also be used automatically by the Hardhat network for deploying scripts and tests.

Run the automated tests against the Hardhat network with:

```bash
npx hardhat test
```

## 4. Connect MetaMask to Hardhat

1. Open MetaMask and click the network dropdown at the top of the wallet.
2. Select **Add network** and then **Add a network manually**.
3. Enter the following details:
   - **Network Name:** `Hardhat Localhost`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Save the network. MetaMask will now point to your local Hardhat node.

## 5. Import Your Deployment Account into MetaMask

1. In MetaMask, open the account menu and choose **Import account**.
2. Paste the private key that matches `PRIVATE_KEY`/`DEPLOYER_PRIVATE_KEY` in your `.env` file.
3. Confirm the import. MetaMask will now display your Hardhat-funded account. When connected to the `Hardhat Localhost` network, the account balance should match the balance from the local node.

## 6. Public Test Network Tips

- Faucet links: use [https://sepoliafaucet.com](https://sepoliafaucet.com) or provider-specific faucets to fund your account before deploying.
- Keep your testnet private keys separate from mainnet accounts.
- Reset MetaMask's account and network data if you switch providers frequently (**Settings → Advanced → Reset Account**).

You're ready to deploy contracts locally and on test networks!
