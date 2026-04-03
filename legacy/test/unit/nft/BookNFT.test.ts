import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BookNFT", function () {
  async function deployFixture() {
    const [admin, other, recorder] = await ethers.getSigners();

    const BookNFT = await ethers.getContractFactory("BookNFT");
    const bookNFT = await BookNFT.deploy(admin.address, "ipfs://");
    await bookNFT.waitForDeployment();

    return { admin, other, recorder, bookNFT };
  }

  it("mints editions with IPFS metadata", async function () {
    const { admin, bookNFT } = await loadFixture(deployFixture);

    const cid = "QmBookMetadata";

    await expect(bookNFT.connect(admin).mintEdition(admin.address, cid))
      .to.emit(bookNFT, "EditionMinted")
      .withArgs(1n, admin.address, cid);

    expect(await bookNFT.tokenURI(1)).to.equal(`ipfs://${cid}`);

    await expect(bookNFT.connect(admin).setBaseURI("https://metadata.example/"))
      .to.emit(bookNFT, "BaseUriUpdated")
      .withArgs("https://metadata.example/");

    expect(await bookNFT.tokenURI(1)).to.equal(`https://metadata.example/${cid}`);
  });

  it("records reader highlights and prevents duplicates", async function () {
    const { admin, bookNFT, other } = await loadFixture(deployFixture);

    const tokenId = await bookNFT
      .connect(admin)
      .mintEdition(admin.address, "QmBookWithHighlights");
    expect(tokenId).to.equal(1n);

    const highlightHash = ethers.keccak256(ethers.toUtf8Bytes("A powerful passage"));
    const highlightCid = "QmHighlightMetadata";

    await expect(bookNFT.connect(admin).recordHighlight(1, highlightHash, highlightCid))
      .to.emit(bookNFT, "HighlightRecorded")
      .withArgs(1n, highlightHash, highlightCid, admin.address);

    expect(await bookNFT.highlightCount(1)).to.equal(1n);

    const storedHighlight = await bookNFT.highlightAt(1, 0);
    expect(storedHighlight.highlightHash).to.equal(highlightHash);
    expect(storedHighlight.metadataCid).to.equal(highlightCid);
    expect(storedHighlight.recorder).to.equal(admin.address);
    expect(storedHighlight.recordedAt).to.be.greaterThan(0n);

    const highlights = await bookNFT.highlightsOf(1);
    expect(highlights.length).to.equal(1);

    await expect(bookNFT.connect(other).recordHighlight(1, highlightHash, highlightCid)).to.be.revertedWith(
      "BookNFT: not owner or approved"
    );

    await expect(bookNFT.connect(admin).recordHighlight(1, highlightHash, highlightCid)).to.be.revertedWith(
      "BookNFT: highlight already recorded"
    );

    await expect(bookNFT.connect(admin).highlightAt(1, 1)).to.be.revertedWith(
      "BookNFT: highlight index out of bounds"
    );
  });
});
