import { ethers, network } from "hardhat";

import { readDeploymentArtifacts } from "./utils/artifacts";

type MintOptions = {
  to?: string;
  cid?: string;
};

function parseArgs(): MintOptions {
  const args = process.argv.slice(2);
  const options: MintOptions = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--to":
      case "-t":
        options.to = args[++i];
        break;
      case "--cid":
      case "-c":
        options.cid = args[++i];
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

async function main() {
  const { name } = network;
  const manifestFilename = `${name}.json`;
  const manifest = await readDeploymentArtifacts(manifestFilename);
  const bookEntry = manifest.contracts.BookNFT;

  if (!bookEntry) {
    throw new Error("Deployment manifest does not include BookNFT. Deploy core contracts first.");
  }

  const [deployer, fallbackRecipient] = await ethers.getSigners();
  const options = parseArgs();
  const recipient = options.to ?? fallbackRecipient.address;
  const metadataCid = options.cid ?? "QmExampleBookCid";

  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error(`Invalid recipient address: ${recipient}`);
  }

  console.info(`\n📘 Minting BookNFT edition on ${name}`);
  console.info(`   → Recipient: ${recipient}`);
  console.info(`   → Metadata CID: ${metadataCid}`);

  const bookNft = await ethers.getContractAt("BookNFT", bookEntry.address, deployer);
  const tx = await bookNft.mintEdition(recipient, metadataCid);
  const receipt = await tx.wait();

  const tokenId = receipt?.logs
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

  console.info(`\n✅ Minted BookNFT token${tokenId ? ` #${tokenId}` : ""}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
