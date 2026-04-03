import { HardhatUserConfig, NetworksUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;

const networks: NetworksUserConfig = {
  hardhat: {
    chainId: 31337,
    ...(PRIVATE_KEY ? { accounts: [PRIVATE_KEY] } : {}),
  },
  localhost: {
    url: process.env.LOCALHOST_RPC_URL ?? "http://127.0.0.1:8545",
  },
};

if (process.env.SEPOLIA_RPC_URL) {
  networks.sepolia = {
    url: process.env.SEPOLIA_RPC_URL,
    chainId: 11155111,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

if (process.env.BASE_GOERLI_RPC_URL) {
  networks.baseGoerli = {
    url: process.env.BASE_GOERLI_RPC_URL,
    chainId: 84531,
    accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  };
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks,
  paths: {
    sources: "./contracts",
    tests: "./test",
    scripts: "./scripts",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY ?? "",
      baseGoerli: process.env.BASESCAN_API_KEY ?? "",
    },
    customChains: [
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org",
        },
      },
    ],
  },
};

export default config;
