import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ReaderLib", function () {
  async function deployHarnessFixture() {
    const Factory = await ethers.getContractFactory("ReaderLibHarness");
    const harness = await Factory.deploy();
    await harness.waitForDeployment();

    return { harness };
  }

  it("hashes highlights deterministically", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    const hash = await harness.hashHighlight(1, "A highlight");
    const expected = ethers.keccak256(ethers.solidityPacked(["string", "uint256", "string"], ["HIGHLIGHT", 1, "A highlight"]));

    expect(hash).to.equal(expected);
  });

  it("hashes comments deterministically", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    const hash = await harness.hashComment(42, "A comment");
    const expected = ethers.keccak256(ethers.solidityPacked(["string", "uint256", "string"], ["COMMENT", 42, "A comment"]));

    expect(hash).to.equal(expected);
  });

  it("evaluates consensus thresholds", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    expect(await harness.hasReachedConsensus(3, 5)).to.equal(false);
    expect(await harness.hasReachedConsensus(5, 5)).to.equal(true);
    expect(await harness.hasReachedConsensus(10, 0)).to.equal(false);
  });
});
