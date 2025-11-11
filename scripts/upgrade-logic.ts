import { artifacts, ethers, network } from "hardhat";

import { readDeploymentArtifacts, writeDeploymentArtifacts } from "./utils/artifacts";
import { toUpgradeId } from "./utils/network";

type UpgradeOptions = {
  upgradeId: string;
  contract: string;
  proxy?: string;
  data?: string;
};

function parseArgs(): UpgradeOptions {
  const args = process.argv.slice(2);
  const options: Partial<UpgradeOptions> = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--upgrade-id":
      case "-i":
        options.upgradeId = args[++i];
        break;
      case "--contract":
      case "-c":
        options.contract = args[++i];
        break;
      case "--proxy":
      case "-p":
        options.proxy = args[++i];
        break;
      case "--data":
      case "-d":
        options.data = args[++i];
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.upgradeId) {
    throw new Error("Missing required --upgrade-id argument");
  }
  if (!options.contract) {
    throw new Error("Missing required --contract argument");
  }

  return options as UpgradeOptions;
}

async function deployImplementation(contractName: string) {
  console.info(`   • Deploying new implementation for ${contractName}`);
  const factory = await ethers.getContractFactory(contractName);
  const instance = await factory.deploy();
  await instance.waitForDeployment();
  const address = await instance.getAddress();
  console.info(`     ↳ Implementation deployed at ${address}`);
  const abi = (await artifacts.readArtifact(contractName)).abi;
  return { address, abi } as const;
}

async function main() {
  const { name } = network;
  const chainId = Number(network.config.chainId ?? (await ethers.provider.getNetwork()).chainId);
  const options = parseArgs();
  const upgradeId = toUpgradeId(options.upgradeId);

  console.info(`\n🔄 Executing upgrade on ${name} (${chainId})`);
  console.info(`   Upgrade identifier: ${upgradeId}`);

  const manifestFilename = `${name}.json`;
  const manifest = await readDeploymentArtifacts(manifestFilename);
  const contracts = manifest.contracts;

  const beaconEntry = contracts.UpgradeBeacon;
  const managerEntry = contracts.UUPSManager;

  if (!beaconEntry || !managerEntry) {
    throw new Error("Deployment manifest does not include UpgradeBeacon or UUPSManager addresses");
  }

  const [operator] = await ethers.getSigners();
  console.info(`   Using signer ${operator.address}`);

  const { address: implementationAddress, abi } = await deployImplementation(options.contract);

  const upgradeBeacon = await ethers.getContractAt("UpgradeBeacon", beaconEntry.address, operator);
  const currentImplementation = await upgradeBeacon.implementationOf(upgradeId);

  if (currentImplementation === ethers.ZeroAddress) {
    console.info("   • Registering upgrade identifier for the first time");
    const tx = await upgradeBeacon.registerLogic(upgradeId, implementationAddress);
    await tx.wait();
  } else {
    console.info(`   • Updating implementation from ${currentImplementation} to ${implementationAddress}`);
    const tx = await upgradeBeacon.updateLogic(upgradeId, implementationAddress);
    await tx.wait();
  }

  if (options.proxy) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(options.proxy)) {
      throw new Error(`Provided proxy address is invalid: ${options.proxy}`);
    }
    const manager = await ethers.getContractAt("UUPSManager", managerEntry.address, operator);
    if (options.data) {
      if (!options.data.startsWith("0x")) {
        throw new Error("Upgrade call data must be provided as a 0x-prefixed hex string");
      }
      console.info(`   • Upgrading proxy ${options.proxy} with initialization data`);
      const tx = await manager.upgradeProxyWithData(options.proxy, options.data);
      await tx.wait();
    } else {
      console.info(`   • Upgrading proxy ${options.proxy}`);
      const tx = await manager.upgradeProxy(options.proxy);
      await tx.wait();
    }
  }

  contracts[options.contract] = {
    address: implementationAddress,
    abi,
  };

  const updatedManifest = {
    ...manifest,
    lastUpdated: new Date().toISOString(),
    contracts,
  };

  await writeDeploymentArtifacts(manifestFilename, updatedManifest);
  console.info(`\n✅ Upgrade manifest updated (${manifestFilename})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
