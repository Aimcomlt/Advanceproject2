import { artifacts, ethers, network } from "hardhat";

import { createManifest, writeDeploymentArtifacts } from "./utils/artifacts";
import { resolveDeploymentConfig } from "./utils/network";

async function main() {
  const { name } = network;
  const chainId = Number(network.config.chainId ?? (await ethers.provider.getNetwork()).chainId);
  const deploymentConfig = resolveDeploymentConfig(name);
  const [deployer] = await ethers.getSigners();

  console.info(`\n📡 Deploying core contracts to ${name} (chain id ${chainId})`);
  console.info(`   Using deployer: ${deployer.address}`);

  const admin = deploymentConfig.admin ?? deployer.address;
  const treasury = deploymentConfig.treasury ?? deployer.address;

  const authorCoinFactory = await ethers.getContractFactory("AuthorCoin");
  const authorCoin = await authorCoinFactory.deploy(admin, treasury);
  await authorCoin.waitForDeployment();
  console.info(`   • AuthorCoin deployed at ${authorCoin.target}`);

  if (deploymentConfig.saleOracle) {
    const tx = await authorCoin.setSaleOracle(deploymentConfig.saleOracle);
    await tx.wait();
    console.info(`     ↳ Sale oracle configured: ${deploymentConfig.saleOracle}`);
  }

  const readerProfileFactory = await ethers.getContractFactory("ReaderProfileNFT");
  const readerProfile = await readerProfileFactory.deploy(admin, deploymentConfig.readerBaseUri);
  await readerProfile.waitForDeployment();
  console.info(`   • ReaderProfileNFT deployed at ${readerProfile.target}`);

  const bookNftFactory = await ethers.getContractFactory("BookNFT");
  const bookNft = await bookNftFactory.deploy(admin, deploymentConfig.bookBaseUri);
  await bookNft.waitForDeployment();
  console.info(`   • BookNFT deployed at ${bookNft.target}`);

  const proposalThresholdInput = deploymentConfig.storyDao.proposalThreshold;
  const proposalThresholdValue =
    typeof proposalThresholdInput === "string"
      ? proposalThresholdInput.includes(".")
        ? ethers.parseUnits(proposalThresholdInput, 18)
        : ethers.toBigInt(proposalThresholdInput)
      : ethers.toBigInt(proposalThresholdInput);

  const storyDaoFactory = await ethers.getContractFactory("StoryDAO");
  const storyDao = await storyDaoFactory.deploy(
    await authorCoin.getAddress(),
    await readerProfile.getAddress(),
    deploymentConfig.storyDao.votingDelay,
    deploymentConfig.storyDao.votingPeriod,
    proposalThresholdValue,
    deploymentConfig.storyDao.quorumBps,
    deploymentConfig.storyDao.beforeExecuteHook ?? ethers.ZeroAddress,
    deploymentConfig.storyDao.afterExecuteHook ?? ethers.ZeroAddress
  );
  await storyDao.waitForDeployment();
  console.info(`   • StoryDAO deployed at ${storyDao.target}`);

  const upgradeBeaconFactory = await ethers.getContractFactory("UpgradeBeacon");
  const upgradeBeacon = await upgradeBeaconFactory.deploy();
  await upgradeBeacon.waitForDeployment();
  await (await upgradeBeacon.initialize(admin)).wait();
  console.info(`   • UpgradeBeacon deployed at ${upgradeBeacon.target}`);

  const uupsManagerFactory = await ethers.getContractFactory("UUPSManager");
  const uupsManager = await uupsManagerFactory.deploy();
  await uupsManager.waitForDeployment();
  await (await uupsManager.initialize(admin, await upgradeBeacon.getAddress())).wait();
  console.info(`   • UUPSManager deployed at ${uupsManager.target}`);

  const manifest = createManifest(name, chainId, {
    AuthorCoin: {
      address: await authorCoin.getAddress(),
      abi: (await artifacts.readArtifact("AuthorCoin")).abi,
    },
    ReaderProfileNFT: {
      address: await readerProfile.getAddress(),
      abi: (await artifacts.readArtifact("ReaderProfileNFT")).abi,
    },
    BookNFT: {
      address: await bookNft.getAddress(),
      abi: (await artifacts.readArtifact("BookNFT")).abi,
    },
    StoryDAO: {
      address: await storyDao.getAddress(),
      abi: (await artifacts.readArtifact("StoryDAO")).abi,
    },
    UpgradeBeacon: {
      address: await upgradeBeacon.getAddress(),
      abi: (await artifacts.readArtifact("UpgradeBeacon")).abi,
    },
    UUPSManager: {
      address: await uupsManager.getAddress(),
      abi: (await artifacts.readArtifact("UUPSManager")).abi,
    },
  });

  const filename = `${name}.json`;
  await writeDeploymentArtifacts(filename, manifest);
  console.info(`\n🗂️  Deployment manifest written to deployments/${filename} and frontend/lib/contracts/${filename}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
