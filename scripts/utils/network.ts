import { zeroPadValue, hexlify } from "ethers";

type NumericLike = string | number | bigint;

type NetworkName = "localhost" | "sepolia" | "baseGoerli" | string;

export interface StoryDaoConfig {
  votingDelay: number;
  votingPeriod: number;
  proposalThreshold: NumericLike;
  quorumBps: number;
  beforeExecuteHook?: string;
  afterExecuteHook?: string;
}

export interface DeploymentConfig {
  admin?: string;
  treasury?: string;
  saleOracle?: string;
  readerBaseUri: string;
  bookBaseUri: string;
  storyDao: StoryDaoConfig;
}

export interface TimelockConfig {
  minDelay: number;
  proposers: string[];
  executors: string[];
  cancellers: string[];
  admin?: string;
  emergencyCouncil?: string;
}

const DEFAULT_CONFIG: Record<string, Omit<DeploymentConfig, "admin" | "treasury" | "saleOracle">> = {
  localhost: {
    readerBaseUri: "ipfs://reader-local/",
    bookBaseUri: "ipfs://book-local/",
    storyDao: {
      votingDelay: 1,
      votingPeriod: 45818,
      proposalThreshold: 1,
      quorumBps: 1_000,
    },
  },
  sepolia: {
    readerBaseUri: "ipfs://reader-sepolia/",
    bookBaseUri: "ipfs://book-sepolia/",
    storyDao: {
      votingDelay: 5_760,
      votingPeriod: 40_320,
      proposalThreshold: 10,
      quorumBps: 500,
    },
  },
  baseGoerli: {
    readerBaseUri: "ipfs://reader-base-goerli/",
    bookBaseUri: "ipfs://book-base-goerli/",
    storyDao: {
      votingDelay: 2_160,
      votingPeriod: 32_400,
      proposalThreshold: 5,
      quorumBps: 500,
    },
  },
};

const DEFAULT_TIMELOCK_CONFIG: Record<string, Omit<TimelockConfig, "admin" | "emergencyCouncil">> = {
  localhost: {
    minDelay: 60,
    proposers: [],
    executors: ["0x0000000000000000000000000000000000000000"],
    cancellers: [],
  },
  sepolia: {
    minDelay: 43_200,
    proposers: [],
    executors: ["0x0000000000000000000000000000000000000000"],
    cancellers: [],
  },
  baseGoerli: {
    minDelay: 43_200,
    proposers: [],
    executors: ["0x0000000000000000000000000000000000000000"],
    cancellers: [],
  },
};

function toEnvPrefix(networkName: NetworkName): string {
  return networkName
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]/g, "_")
    .toUpperCase();
}

function readEnv(prefix: string, key: string): string | undefined {
  return process.env[`${prefix}_${key}`];
}

function coerceAddress(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return trimmed;
  }
  throw new Error(`Invalid address provided for ${value}`);
}

function coerceNumeric(value: NumericLike | undefined): NumericLike | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("0x")) {
    return trimmed;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }
  throw new Error(`Invalid numeric value provided: ${value}`);
}

function coerceAddressList(value?: string): string[] | undefined {
  if (!value) {
    return undefined;
  }
  const entries = value
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const result = coerceAddress(entry);
      if (!result) {
        throw new Error(`Invalid address provided in list: ${entry}`);
      }
      return result;
    });
  return [...new Set(entries)];
}

export function resolveDeploymentConfig(networkName: NetworkName): DeploymentConfig {
  const prefix = toEnvPrefix(networkName);
  const defaults = DEFAULT_CONFIG[networkName] ?? DEFAULT_CONFIG.localhost;

  const admin = coerceAddress(readEnv(prefix, "DAO_ADMIN"));
  const treasury = coerceAddress(readEnv(prefix, "TREASURY"));
  const saleOracle = coerceAddress(readEnv(prefix, "SALE_ORACLE"));

  const readerBaseUri = readEnv(prefix, "READER_BASE_URI") ?? defaults.readerBaseUri;
  const bookBaseUri = readEnv(prefix, "BOOK_BASE_URI") ?? defaults.bookBaseUri;

  const storyDaoDefaults = defaults.storyDao;
  const storyDao: StoryDaoConfig = {
    votingDelay: Number(readEnv(prefix, "DAO_VOTING_DELAY") ?? storyDaoDefaults.votingDelay),
    votingPeriod: Number(readEnv(prefix, "DAO_VOTING_PERIOD") ?? storyDaoDefaults.votingPeriod),
    proposalThreshold:
      coerceNumeric(readEnv(prefix, "DAO_PROPOSAL_THRESHOLD") ?? storyDaoDefaults.proposalThreshold) ?? 1,
    quorumBps: Number(readEnv(prefix, "DAO_QUORUM_BPS") ?? storyDaoDefaults.quorumBps),
    beforeExecuteHook: coerceAddress(readEnv(prefix, "DAO_BEFORE_HOOK")),
    afterExecuteHook: coerceAddress(readEnv(prefix, "DAO_AFTER_HOOK")),
  };

  return {
    admin,
    treasury,
    saleOracle,
    readerBaseUri,
    bookBaseUri,
    storyDao,
  };
}

export function resolveTimelockConfig(networkName: NetworkName, fallbackAdmin?: string): TimelockConfig {
  const prefix = toEnvPrefix(networkName);
  const defaults = DEFAULT_TIMELOCK_CONFIG[networkName] ?? DEFAULT_TIMELOCK_CONFIG.localhost;

  const minDelay = Number(readEnv(prefix, "TIMELOCK_MIN_DELAY") ?? defaults.minDelay);
  const proposers = coerceAddressList(readEnv(prefix, "TIMELOCK_PROPOSERS")) ?? defaults.proposers;
  const executors = coerceAddressList(readEnv(prefix, "TIMELOCK_EXECUTORS")) ?? defaults.executors;
  const cancellers = coerceAddressList(readEnv(prefix, "TIMELOCK_CANCELLERS")) ?? defaults.cancellers;
  const admin = coerceAddress(readEnv(prefix, "TIMELOCK_ADMIN")) ?? fallbackAdmin;
  const emergencyCouncil = coerceAddress(readEnv(prefix, "EMERGENCY_COUNCIL"));

  return {
    minDelay,
    proposers,
    executors,
    cancellers,
    admin,
    emergencyCouncil,
  };
}

export function toUpgradeId(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("0x")) {
    if (trimmed.length !== 66) {
      throw new Error(`Upgrade id ${value} must be a 32-byte hex string`);
    }
    return trimmed;
  }
  const encoded = Buffer.from(trimmed, "utf8");
  if (encoded.length > 32) {
    throw new Error(`Upgrade id ${value} exceeds 32 bytes once encoded`);
  }
  return hexlify(zeroPadValue(encoded, 32));
}
