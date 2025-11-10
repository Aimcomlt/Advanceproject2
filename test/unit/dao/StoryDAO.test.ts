import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";

const DESCRIPTION = "Update proposal target";

async function deployStoryDaoFixture() {
  const [deployer, proposer, voter, outsider] = await ethers.getSigners();

  const AuthorCoin = await ethers.getContractFactory("AuthorCoin");
  const authorCoin = await AuthorCoin.deploy(
    await deployer.getAddress(),
    await deployer.getAddress()
  );

  const ReaderProfile = await ethers.getContractFactory("ReaderProfileNFT");
  const readerProfile = await ReaderProfile.deploy(
    await deployer.getAddress(),
    "ipfs://"
  );

  const Hook = await ethers.getContractFactory("ProposalExecutionHookMock");
  const hook = await Hook.deploy();

  const StoryDAO = await ethers.getContractFactory("StoryDAO");
  const dao = await StoryDAO.deploy(
    await authorCoin.getAddress(),
    await readerProfile.getAddress(),
    1n,
    5n,
    ethers.parseUnits("100", 18),
    2000,
    await hook.getAddress(),
    await hook.getAddress()
  );

  const Oracle = await ethers.getContractFactory("BookSaleOracleMock");
  const oracle = await Oracle.deploy();
  await authorCoin.setSaleOracle(await oracle.getAddress());

  const mintAmount = ethers.parseUnits("1000", 18);

  const proposerSale = ethers.id("sale-proposer");
  const voterSale = ethers.id("sale-voter");
  const outsiderSale = ethers.id("sale-outsider");

  await oracle.setSale(proposerSale, true, mintAmount);
  await authorCoin.recordBookSale(await proposer.getAddress(), proposerSale, "0x");

  await oracle.setSale(voterSale, true, mintAmount);
  await authorCoin.recordBookSale(await voter.getAddress(), voterSale, "0x");

  await oracle.setSale(outsiderSale, true, mintAmount);
  await authorCoin.recordBookSale(await outsider.getAddress(), outsiderSale, "0x");

  await readerProfile.mintProfile(await proposer.getAddress(), "ipfs://proposer");
  await readerProfile.mintProfile(await voter.getAddress(), "ipfs://voter");

  const Target = await ethers.getContractFactory("ProposalTargetMock");
  const target = await Target.deploy();

  return {
    dao,
    hook,
    authorCoin,
    readerProfile,
    proposer,
    voter,
    outsider,
    target,
  };
}

describe("StoryDAO", function () {
  it("requires a reader profile to create proposals", async function () {
    const { dao, outsider, target } = await loadFixture(deployStoryDaoFixture);

    const proposalCalldata = target.interface.encodeFunctionData("storeValue", [42n]);

    await expect(
      dao.connect(outsider).propose(
        [await target.getAddress()],
        [0],
        [proposalCalldata],
        DESCRIPTION
      )
    )
      .to.be.revertedWithCustomError(dao, "StoryDAO__ReaderProfileRequired")
      .withArgs(await outsider.getAddress());
  });

  it("enforces reader profile gating when casting votes", async function () {
    const { dao, proposer, outsider, target } = await loadFixture(deployStoryDaoFixture);

    const proposalCalldata = target.interface.encodeFunctionData("storeValue", [42n]);

    await dao
      .connect(proposer)
      .propose([await target.getAddress()], [0], [proposalCalldata], DESCRIPTION);

    const proposalId = await dao.hashProposal(
      [await target.getAddress()],
      [0],
      [proposalCalldata],
      ethers.id(DESCRIPTION)
    );

    await mine(1);

    await expect(dao.connect(outsider).castVote(proposalId, 1))
      .to.be.revertedWithCustomError(dao, "StoryDAO__ReaderProfileRequired")
      .withArgs(await outsider.getAddress());
  });

  it("derives quorum as a fraction of AuthorCoin total supply", async function () {
    const { dao, authorCoin } = await loadFixture(deployStoryDaoFixture);

    const totalSupply = await authorCoin.totalSupply();
    const expected = (totalSupply * 2000n) / 10_000n;

    expect(await dao.quorum(0)).to.equal(expected);
  });

  it("processes the full proposal lifecycle and triggers hooks", async function () {
    const { dao, hook, proposer, voter, target } = await loadFixture(deployStoryDaoFixture);

    const proposalCalldata = target.interface.encodeFunctionData("storeValue", [777n]);

    await dao
      .connect(proposer)
      .propose([await target.getAddress()], [0], [proposalCalldata], DESCRIPTION);

    const proposalId = await dao.hashProposal(
      [await target.getAddress()],
      [0],
      [proposalCalldata],
      ethers.id(DESCRIPTION)
    );

    await mine(1);

    await dao.connect(proposer).castVote(proposalId, 1);
    await dao.connect(voter).castVote(proposalId, 1);

    await mine(5);

    expect(await dao.state(proposalId)).to.equal(4n);

    await dao.execute(
      [await target.getAddress()],
      [0],
      [proposalCalldata],
      ethers.id(DESCRIPTION)
    );

    expect(await dao.state(proposalId)).to.equal(7n);
    expect(await target.storedValue()).to.equal(777n);
    expect(await hook.beforeCount()).to.equal(1n);
    expect(await hook.afterCount()).to.equal(1n);
    expect(await hook.lastBeforeProposalId()).to.equal(proposalId);
    expect(await hook.lastAfterProposalId()).to.equal(proposalId);
  });
});
