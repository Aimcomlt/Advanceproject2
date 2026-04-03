import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AuthorCoin", function () {
  async function deployFixture() {
    const [admin, treasury, executor, author, other] = await ethers.getSigners();

    const AuthorCoin = await ethers.getContractFactory("AuthorCoin");
    const authorCoin = await AuthorCoin.deploy(admin.address, treasury.address);
    await authorCoin.waitForDeployment();

    const saleExecutorRole = await authorCoin.SALE_EXECUTOR_ROLE();
    const treasuryRole = await authorCoin.TREASURY_ROLE();

    await authorCoin.connect(admin).grantRole(saleExecutorRole, executor.address);
    await authorCoin.connect(admin).grantRole(treasuryRole, treasury.address);

    const Oracle = await ethers.getContractFactory("BookSaleOracleMock");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();

    await authorCoin.connect(admin).setSaleOracle(await oracle.getAddress());
    await authorCoin.connect(admin).setSaleSplits(8_500, 1_500);

    return {
      admin,
      treasury,
      executor,
      author,
      other,
      authorCoin,
      oracle,
      saleExecutorRole,
      treasuryRole,
    };
  }

  it("initializes roles, treasury and sale split", async function () {
    const { admin, treasury, authorCoin } = await loadFixture(deployFixture);

    expect(await authorCoin.hasRole(await authorCoin.DEFAULT_ADMIN_ROLE(), admin.address)).to.be
      .true;
    expect(await authorCoin.treasury()).to.equal(treasury.address);
    expect(await authorCoin.authorShareBps()).to.equal(8_500);
    expect(await authorCoin.treasuryShareBps()).to.equal(1_500);
  });

  it("mints tokens to author and treasury for a verified sale", async function () {
    const { executor, author, treasury, authorCoin, oracle } = await loadFixture(deployFixture);

    const saleId = ethers.encodeBytes32String("sale-1");
    const mintAmount = 1_000n * 10n ** 18n;
    const [authorShare, treasuryShare] = [
      (mintAmount * 8_500n) / 10_000n,
      (mintAmount * 1_500n) / 10_000n,
    ];

    await oracle.setSale(saleId, true, mintAmount);

    await expect(
      authorCoin
        .connect(executor)
        .recordBookSale(author.address, saleId, ethers.toUtf8Bytes("metadata"))
    )
      .to.emit(authorCoin, "SaleRewardMinted")
      .withArgs(saleId, author.address, authorShare, treasuryShare, mintAmount);

    expect(await authorCoin.balanceOf(author.address)).to.equal(authorShare);
    expect(await authorCoin.balanceOf(treasury.address)).to.equal(treasuryShare);
    expect(await authorCoin.totalSaleBasedMints()).to.equal(mintAmount);
  });

  it("holds treasury share on contract when treasury unset and allows withdrawal", async function () {
    const { admin, treasury, executor, author, authorCoin, oracle } = await loadFixture(
      deployFixture
    );

    await authorCoin.connect(admin).setTreasury(ethers.ZeroAddress);

    const saleId = ethers.encodeBytes32String("sale-2");
    const mintAmount = 2_500n * 10n ** 18n;
    await oracle.setSale(saleId, true, mintAmount);

    const [, treasuryShare] = await authorCoin.previewSaleSplit(mintAmount);

    await authorCoin
      .connect(executor)
      .recordBookSale(author.address, saleId, ethers.getBytes("0x1234"));

    expect(await authorCoin.balanceOf(await authorCoin.getAddress())).to.equal(treasuryShare);

    await expect(authorCoin.connect(treasury).treasuryWithdraw(treasury.address, treasuryShare))
      .to.emit(authorCoin, "TreasuryWithdrawal")
      .withArgs(treasury.address, treasuryShare, treasury.address);
    expect(await authorCoin.balanceOf(treasury.address)).to.equal(treasuryShare);
  });

  it("reverts for invalid oracle results", async function () {
    const { executor, authorCoin, oracle, author } = await loadFixture(deployFixture);

    const saleId = ethers.encodeBytes32String("sale-3");
    await oracle.setSale(saleId, false, 1_000n * 10n ** 18n);

    await expect(
      authorCoin
        .connect(executor)
        .recordBookSale(author.address, saleId, new Uint8Array())
    ).to.be.revertedWith("AuthorCoin: sale not verified");

    await oracle.setSale(saleId, true, 0n);
    await expect(
      authorCoin
        .connect(executor)
        .recordBookSale(author.address, saleId, new Uint8Array())
    ).to.be.revertedWith("AuthorCoin: nothing to mint");
  });

  it("restricts privileged functions to appropriate roles", async function () {
    const { other, executor, treasury, authorCoin } = await loadFixture(deployFixture);

    await expect(
      authorCoin.connect(other).recordBookSale(other.address, ethers.ZeroHash, new Uint8Array())
    ).to.be.revertedWithCustomError(authorCoin, "AccessControlUnauthorizedAccount");

    await expect(authorCoin.connect(other).treasuryWithdraw(other.address, 1n)).to.be.revertedWithCustomError(
      authorCoin,
      "AccessControlUnauthorizedAccount"
    );

    await expect(authorCoin.connect(executor).treasuryWithdraw(other.address, 1n)).to.be.revertedWithCustomError(
      authorCoin,
      "AccessControlUnauthorizedAccount"
    );

    await expect(
      authorCoin.connect(other).setSaleSplits(5_000, 5_000)
    ).to.be.revertedWithCustomError(authorCoin, "AccessControlUnauthorizedAccount");
  });

  it("validates sale split configuration", async function () {
    const { admin, authorCoin } = await loadFixture(deployFixture);

    await expect(authorCoin.connect(admin).setSaleSplits(10_001, 0)).to.be.revertedWith(
      "AuthorCoin: invalid split"
    );

    await authorCoin.connect(admin).setSaleSplits(7_000, 3_000);
    expect(await authorCoin.authorShareBps()).to.equal(7_000);
    expect(await authorCoin.treasuryShareBps()).to.equal(3_000);
  });
});
