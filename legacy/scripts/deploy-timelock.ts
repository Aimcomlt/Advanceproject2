import { artifacts, ethers, network } from "hardhat";

import { createManifest, readDeploymentArtifacts, writeDeploymentArtifacts } from "./utils/artifacts";
import { resolveTimelockConfig } from "./utils/network";

async function loadManifest(filename: string, chainId: number) {
  try {
    return await readDeploymentArtifacts(filename);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "ENOENT") {
      return createManifest(network.name, chainId, {});
    }
    throw error;
  }
}

async function grantRoleIfMissing(contract: ethers.Contract, role: string, grantees: string[], label: string) {
  if (grantees.length === 0) {
    return;
  }

  const unique = [...new Set(grantees.map((address) => address.toLowerCase()))];
  for (const address of unique) {
    const hasRole = await contract.hasRole(role, address);
    if (!hasRole) {
      console.info(`   • Granting ${label} to ${address}`);
      const tx = await contract.grantRole(role, address);
      await tx.wait();
    }
  }
}

async function main() {
  const { name } = network;
  const chainId = Number(network.config.chainId ?? (await ethers.provider.getNetwork()).chainId);
  const [deployer] = await ethers.getSigners();
  const timelockConfig = resolveTimelockConfig(name, deployer.address);

  if (!timelockConfig.admin) {
    throw new Error("Timelock admin must be specified via TIMELOCK_ADMIN or DAO_ADMIN");
  }

  console.info(`\n⏱️  Deploying TimelockController to ${name} (chain id ${chainId})`);
  console.info(`   Using deployer: ${deployer.address}`);
  console.info(`   Admin account: ${timelockConfig.admin}`);
  console.info(`   Minimum delay: ${timelockConfig.minDelay} seconds`);

  const proposers = timelockConfig.proposers.length > 0 ? timelockConfig.proposers : [timelockConfig.admin];
  const executors = timelockConfig.executors.length > 0 ? timelockConfig.executors : [ethers.ZeroAddress];

  const timelockFactory = await ethers.getContractFactory("TimelockController");
  const timelock = await timelockFactory.deploy(timelockConfig.minDelay, proposers, executors, timelockConfig.admin);
  await timelock.waitForDeployment();

  const timelockAddress = await timelock.getAddress();
  console.info(`   • TimelockController deployed at ${timelockAddress}`);

  const cancellerCandidates = timelockConfig.cancellers.slice();
  if (timelockConfig.emergencyCouncil) {
    cancellerCandidates.push(timelockConfig.emergencyCouncil);
  }
  if (cancellerCandidates.length > 0) {
    const cancellerRole = await timelock.CANCELLER_ROLE();
    await grantRoleIfMissing(timelock, cancellerRole, cancellerCandidates, "canceller role");
  }

  const manifestFilename = `${name}.json`;
  const manifest = await loadManifest(manifestFilename, chainId);
  const abi = (await artifacts.readArtifact("TimelockController")).abi;

  manifest.contracts.TimelockController = {
    address: timelockAddress,
    abi,
  };
  manifest.lastUpdated = new Date().toISOString();

  await writeDeploymentArtifacts(manifestFilename, manifest);
  console.info(`\n🗂️  Deployment manifest updated with TimelockController (${manifestFilename})`);

  if (timelockConfig.emergencyCouncil) {
    console.info(`   Emergency council ${timelockConfig.emergencyCouncil} granted canceller permissions.`);
  }
  console.info("\nNext steps:");
  console.info("  • Transfer DAO roles on UpgradeBeacon and UUPSManager to the timelock using governance proposals.");
  console.info("  • Register the timelock as the administrator in deployment config before core deployments.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
