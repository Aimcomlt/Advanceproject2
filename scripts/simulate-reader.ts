import { ethers, network } from "hardhat";

import { readDeploymentArtifacts } from "./utils/artifacts";

async function main() {
  const { name } = network;
  const manifestFilename = `${name}.json`;
  const manifest = await readDeploymentArtifacts(manifestFilename);
  const { ReaderProfileNFT, BookNFT } = manifest.contracts;

  if (!ReaderProfileNFT || !BookNFT) {
    throw new Error("Deployment manifest missing ReaderProfileNFT or BookNFT contracts.");
  }

  const [admin, reader] = await ethers.getSigners();

  console.info(`\n🎭 Simulating reader lifecycle on ${name}`);
  console.info(`   Admin:  ${admin.address}`);
  console.info(`   Reader: ${reader.address}`);

  const readerProfile = await ethers.getContractAt("ReaderProfileNFT", ReaderProfileNFT.address, admin);
  const hasProfile = await readerProfile.hasProfile(reader.address);

  if (!hasProfile) {
    const profileCid = "QmReaderProfileMetadata";
    console.info("   • Minting reader profile NFT");
    const tx = await readerProfile.mintProfile(reader.address, profileCid);
    await tx.wait();
  } else {
    console.info("   • Reader already has a profile. Skipping mint.");
  }

  const bookNft = await ethers.getContractAt("BookNFT", BookNFT.address, admin);
  const mintTx = await bookNft.mintEdition(reader.address, "QmBookMetadataCid");
  const mintReceipt = await mintTx.wait();
  const transferEvent = mintReceipt?.logs
    ?.map((log) => {
      try {
        const parsed = bookNft.interface.parseLog(log);
        if (parsed?.name === "Transfer") {
          return parsed.args[2];
        }
        return undefined;
      } catch {
        return undefined;
      }
    })
    .filter((value): value is bigint => value !== undefined)[0];

  const tokenId = transferEvent ?? 1n;
  console.info(`   • Book edition minted for reader (token #${tokenId})`);

  const readerBookNft = await ethers.getContractAt("BookNFT", BookNFT.address, reader);
  const highlightText = "Fragments of a Decentralized Library";
  const highlightHash = ethers.keccak256(ethers.toUtf8Bytes(highlightText));
  const highlightCid = "QmHighlightMetadata";

  console.info("   • Recording reader highlight");
  await (await readerBookNft.recordHighlight(tokenId, highlightHash, highlightCid)).wait();

  console.info("\n✅ Reader simulation complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
