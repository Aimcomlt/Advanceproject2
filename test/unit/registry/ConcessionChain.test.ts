import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("ConcessionChain", function () {
  async function deployFixture() {
    const [admin, alice, bob, carol, dave] = await ethers.getSigners();

    const FeedbackNFTMock = await ethers.getContractFactory("FeedbackNFTMock");
    const feedbackNFT = await FeedbackNFTMock.deploy();
    await feedbackNFT.waitForDeployment();

    const ConcessionChain = await ethers.getContractFactory("ConcessionChain");
    const consensusThreshold = 3n;
    const concessionChain = await ConcessionChain.deploy(admin.address, await feedbackNFT.getAddress(), consensusThreshold);
    await concessionChain.waitForDeployment();

    return { admin, alice, bob, carol, dave, concessionChain, feedbackNFT, consensusThreshold };
  }

  it("computes deterministic hashes for highlights and comments", async function () {
    const { concessionChain } = await loadFixture(deployFixture);

    const bookId = 42n;
    const highlight = "A luminous highlight";
    const comment = "A thoughtful comment";

    const expectedHighlightHash = ethers.solidityPackedKeccak256(
      ["string", "uint256", "string"],
      ["HIGHLIGHT", bookId, highlight]
    );
    const expectedCommentHash = ethers.solidityPackedKeccak256(
      ["string", "uint256", "string"],
      ["COMMENT", bookId, comment]
    );

    expect(await concessionChain.hashHighlight(bookId, highlight)).to.equal(expectedHighlightHash);
    expect(await concessionChain.hashComment(bookId, comment)).to.equal(expectedCommentHash);
  });

  it("requires consensus before minting feedback NFTs", async function () {
    const { concessionChain, feedbackNFT, alice, bob, carol, dave, consensusThreshold } = await loadFixture(deployFixture);

    const recordHash = await concessionChain.hashHighlight(7n, "Consensus worthy line");

    await expect(concessionChain.connect(alice).recordFeedback(recordHash, 0))
      .to.emit(concessionChain, "FeedbackRecorded")
      .withArgs(recordHash, 0, alice.address, anyValue)
      .and.to.emit(concessionChain, "FeedbackSupported")
      .withArgs(recordHash, alice.address, 1n);

    await expect(concessionChain.connect(alice).recordFeedback(recordHash, 0)).to.be.revertedWith(
      "ConcessionChain: already supported"
    );

    await expect(concessionChain.connect(bob).recordFeedback(recordHash, 1)).to.be.revertedWith(
      "ConcessionChain: feedback type mismatch"
    );

    await expect(concessionChain.connect(bob).recordFeedback(recordHash, 0))
      .to.emit(concessionChain, "FeedbackSupported")
      .withArgs(recordHash, bob.address, 2n);

    await expect(concessionChain.connect(carol).recordFeedback(recordHash, 0))
      .to.emit(concessionChain, "FeedbackSupported")
      .withArgs(recordHash, carol.address, consensusThreshold)
      .and.to.emit(concessionChain, "FeedbackMintRequested")
      .withArgs(await feedbackNFT.getAddress(), recordHash, alice.address, consensusThreshold)
      .and.to.emit(concessionChain, "ConsensusReached")
      .withArgs(recordHash, alice.address, consensusThreshold)
      .and.to.emit(feedbackNFT, "FeedbackMinted")
      .withArgs(alice.address, recordHash, 1n);

    const status = await concessionChain.recordStatus(recordHash);
    expect(status[0]).to.equal(0n); // kind
    expect(status[1]).to.equal(alice.address); // submitter
    expect(status[3]).to.equal(consensusThreshold); // approvals
    expect(status[4]).to.equal(true); // minted

    await expect(concessionChain.connect(dave).recordFeedback(recordHash, 0))
      .to.emit(concessionChain, "FeedbackSupported")
      .withArgs(recordHash, dave.address, consensusThreshold + 1n)
      .and.to.not.emit(concessionChain, "ConsensusReached");
  });

  it("allows administrators to update configuration", async function () {
    const { concessionChain, admin } = await loadFixture(deployFixture);

    await expect(concessionChain.connect(admin).setConsensusThreshold(5n))
      .to.emit(concessionChain, "ConsensusThresholdUpdated")
      .withArgs(5n);

    await expect(concessionChain.connect(admin).setFeedbackNFT(ethers.ZeroAddress))
      .to.emit(concessionChain, "FeedbackNFTUpdated")
      .withArgs(ethers.ZeroAddress);

    await expect(concessionChain.connect(admin).setConsensusThreshold(0n)).to.be.revertedWith(
      "ConcessionChain: threshold required"
    );
  });
});
