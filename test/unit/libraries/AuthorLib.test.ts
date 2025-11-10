import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AuthorLib", function () {
  async function deployHarnessFixture() {
    const Factory = await ethers.getContractFactory("AuthorLibHarness");
    const harness = await Factory.deploy();
    await harness.waitForDeployment();

    return { harness };
  }

  it("derives complementary treasury share", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    const treasuryShare = await harness.complementaryShare(8_750);
    expect(treasuryShare).to.equal(1_250);
  });

  it("reverts when complementary share exceeds maximum", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    await expect(harness.complementaryShare(10_001)).to.be.revertedWithCustomError(
      harness,
      "AuthorLib__ShareExceedsMax"
    );
  });

  it("checks whether a split sums to 100%", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    expect(await harness.isValidSplit(9_000, 1_000)).to.equal(true);
    expect(await harness.isValidSplit(9_000, 999)).to.equal(false);
  });

  it("computes sale splits and allocates remainder to treasury", async function () {
    const { harness } = await loadFixture(deployHarnessFixture);

    const mintAmount = 1_000n;
    const [authorAmount, treasuryAmount] = await harness.computeSaleSplit(mintAmount, 3_333, 6_667);

    expect(authorAmount).to.equal((mintAmount * 3_333n) / 10_000n);
    expect(authorAmount + treasuryAmount).to.equal(mintAmount);
  });
});
