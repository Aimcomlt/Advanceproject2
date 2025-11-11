import { HardhatUserConfig, NetworksUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;

const networks: NetworksUserConfig = {
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
};

export default config;
