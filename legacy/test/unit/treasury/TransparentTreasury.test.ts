import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("TransparentTreasury", function () {
  async function deployFixture() {
    const [admin, dao, executor, reader, contributor, outsider] = await ethers.getSigners();

    const AuthorCoin = await ethers.getContractFactory("AuthorCoin");
    const authorCoin = await AuthorCoin.deploy(admin.address, dao.address);
    await authorCoin.waitForDeployment();

    const saleExecutorRole = await authorCoin.SALE_EXECUTOR_ROLE();
    await authorCoin.connect(admin).grantRole(saleExecutorRole, executor.address);

    const Oracle = await ethers.getContractFactory("BookSaleOracleMock");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();

    await authorCoin.connect(admin).setSaleOracle(await oracle.getAddress());

    const Treasury = await ethers.getContractFactory("TransparentTreasury");
    const treasury = await Treasury.deploy(await authorCoin.getAddress(), dao.address);
    await treasury.waitForDeployment();

    await authorCoin.connect(admin).setTreasury(await treasury.getAddress());

    const streamRole = await treasury.STREAM_MANAGER_ROLE();
    const rewardRole = await treasury.REWARD_MANAGER_ROLE();

    // Delegate management permissions to the executor for testing.
    await treasury.connect(dao).grantRole(streamRole, executor.address);
    await treasury.connect(dao).grantRole(rewardRole, executor.address);

    return {
      admin,
      dao,
      executor,
      reader,
      contributor,
      outsider,
      authorCoin,
      oracle,
      treasury,
      streamRole,
      rewardRole,
    };
  }

  async function mintTreasuryShare(
    authorCoin: any,
    oracle: any,
    executor: any,
    author: string,
    saleLabel: string,
    mintAmount: bigint
  ) {
    const saleId = ethers.encodeBytes32String(saleLabel);
    await oracle.setSale(saleId, true, mintAmount);
    await authorCoin
      .connect(executor)
      .recordBookSale(author, saleId, ethers.getBytes("0x1234"));
    const [, treasuryShare] = await authorCoin.previewSaleSplit(mintAmount);
    return treasuryShare;
  }

  it("records revenue and streams payouts with accurate accounting", async function () {
    const { executor, reader, authorCoin, oracle, treasury } = await loadFixture(deployFixture);

    const mintAmount = 5_000n * 10n ** 18n;
    const treasuryShare = await mintTreasuryShare(
      authorCoin,
      oracle,
      executor,
      reader.address,
      "stream",
      mintAmount
    );

    const streamId = ethers.encodeBytes32String("book-1");
    const recordAmount = treasuryShare - 100n * 10n ** 18n;

    await expect(treasury.connect(executor).recordStreamRevenue(streamId, recordAmount))
      .to.emit(treasury, "StreamRevenueRecorded")
      .withArgs(streamId, recordAmount, recordAmount, executor.address);

    await expect(
      treasury.connect(executor).recordStreamRevenue(streamId, 200n * 10n ** 18n)
    ).to.be.revertedWithCustomError(
      treasury,
      "TransparentTreasury__InsufficientUnallocatedBalance"
    );

    const [totalRecorded, totalReleased, available] = await treasury.streamInfo(streamId);
    expect(totalRecorded).to.equal(recordAmount);
    expect(totalReleased).to.equal(0);
    expect(available).to.equal(recordAmount);

    await expect(treasury.connect(executor).streamTo(streamId, reader.address, recordAmount / 2n))
      .to.emit(treasury, "StreamPayout")
      .withArgs(streamId, reader.address, recordAmount / 2n, executor.address);

    const [recordedAfter, releasedAfter, availableAfter] = await treasury.streamInfo(streamId);
    expect(recordedAfter).to.equal(recordAmount);
    expect(releasedAfter).to.equal(recordAmount / 2n);
    expect(availableAfter).to.equal(recordAmount / 2n);

    expect(await authorCoin.balanceOf(reader.address)).to.equal(recordAmount / 2n);
    expect(await treasury.accountedBalance()).to.equal(recordAmount / 2n);

    await expect(
      treasury.connect(executor).streamTo(streamId, reader.address, recordAmount)
    ).to.be.revertedWithCustomError(treasury, "TransparentTreasury__InsufficientStreamBalance");
  });

  it("distributes contributor rewards from unallocated funds", async function () {
    const { executor, authorCoin, oracle, treasury, reader, contributor } = await loadFixture(
      deployFixture
    );

    const mintAmount = 3_000n * 10n ** 18n;
    const treasuryShare = await mintTreasuryShare(
      authorCoin,
      oracle,
      executor,
      reader.address,
      "reward",
      mintAmount
    );

    const streamId = ethers.encodeBytes32String("reward-stream");
    const allocation = treasuryShare - 200n * 10n ** 18n;

    await treasury.connect(executor).recordStreamRevenue(streamId, allocation);

    const unallocated = (await authorCoin.balanceOf(await treasury.getAddress())) - allocation;
    expect(unallocated).to.equal(200n * 10n ** 18n);

    await expect(treasury.connect(executor).rewardContributor(contributor.address, 150n * 10n ** 18n))
      .to.emit(treasury, "ContributorRewarded")
      .withArgs(contributor.address, 150n * 10n ** 18n, executor.address);

    expect(await authorCoin.balanceOf(contributor.address)).to.equal(150n * 10n ** 18n);

    await expect(
      treasury.connect(executor).rewardContributor(contributor.address, 100n * 10n ** 18n)
    ).to.be.revertedWithCustomError(
      treasury,
      "TransparentTreasury__InsufficientUnallocatedBalance"
    );
  });

  it("enforces StoryDAO-managed access control", async function () {
    const { outsider, executor, treasury, streamRole, rewardRole } = await loadFixture(
      deployFixture
    );

    const streamId = ethers.encodeBytes32String("permissions");

    await expect(
      treasury.connect(outsider).recordStreamRevenue(streamId, 1n)
    ).to.be.revertedWithCustomError(treasury, "AccessControlUnauthorizedAccount");

    await expect(
      treasury.connect(outsider).streamTo(streamId, executor.address, 1n)
    ).to.be.revertedWithCustomError(treasury, "AccessControlUnauthorizedAccount");

    await expect(
      treasury.connect(outsider).rewardContributor(executor.address, 1n)
    ).to.be.revertedWithCustomError(treasury, "AccessControlUnauthorizedAccount");

    await treasury.connect(executor).renounceRole(streamRole, executor.address);
    await treasury.connect(executor).renounceRole(rewardRole, executor.address);

    await expect(
      treasury.connect(executor).recordStreamRevenue(streamId, 1n)
    ).to.be.revertedWithCustomError(treasury, "AccessControlUnauthorizedAccount");
  });

  it("validates inputs", async function () {
    const { executor, treasury, reader } = await loadFixture(deployFixture);

    const streamId = ethers.encodeBytes32String("input");
    await expect(
      treasury.connect(executor).recordStreamRevenue(streamId, 0)
    ).to.be.revertedWithCustomError(treasury, "TransparentTreasury__InvalidAmount");

    await expect(
      treasury.connect(executor).streamTo(streamId, reader.address, 0)
    ).to.be.revertedWithCustomError(treasury, "TransparentTreasury__InvalidAmount");

    await expect(
      treasury.connect(executor).streamTo(streamId, ethers.ZeroAddress, 1n)
    ).to.be.revertedWithCustomError(treasury, "TransparentTreasury__ZeroAddress");

    await expect(
      treasury.connect(executor).rewardContributor(ethers.ZeroAddress, 1n)
    ).to.be.revertedWithCustomError(treasury, "TransparentTreasury__ZeroAddress");
  });
});
