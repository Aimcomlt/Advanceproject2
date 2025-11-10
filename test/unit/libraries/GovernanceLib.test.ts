import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("GovernanceLib", function () {
  async function deployHarnessFixture() {
    const Factory = await ethers.getContractFactory("GovernanceLibHarness");
    const harness = await Factory.deploy();
    await harness.waitForDeployment();

    return { harness };
  }

  it("validates quorum basis points", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    expect(await harness.isValidQuorumBps(9_999)).to.equal(true);
    expect(await harness.isValidQuorumBps(10_000)).to.equal(true);
    expect(await harness.isValidQuorumBps(10_001)).to.equal(false);
  });

  it("computes quorum vote requirement", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    const totalSupply = 1_000_000n * 10n ** 18n;
    const votes = await harness.computeQuorum(totalSupply, 2_500);

    expect(votes).to.equal((totalSupply * 2_500n) / 10_000n);
  });
});
