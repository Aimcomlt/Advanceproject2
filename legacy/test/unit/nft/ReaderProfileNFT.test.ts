import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ReaderProfileNFT", function () {
  async function deployFixture() {
    const [admin, reader, other] = await ethers.getSigners();

    const ReaderProfileNFT = await ethers.getContractFactory("ReaderProfileNFT");
    const readerProfileNFT = await ReaderProfileNFT.deploy(admin.address, "ipfs://profile/");
    await readerProfileNFT.waitForDeployment();

    return { admin, reader, other, readerProfileNFT };
  }

  it("issues soulbound profiles with IPFS metadata", async function () {
    const { admin, readerProfileNFT } = await loadFixture(deployFixture);

    await expect(readerProfileNFT.connect(admin).mintProfile(admin.address, "QmReaderProfile"))
      .to.emit(readerProfileNFT, "ProfileMinted")
      .withArgs(admin.address, 1n, "QmReaderProfile");

    expect(await readerProfileNFT.tokenURI(1)).to.equal("ipfs://profile/QmReaderProfile");
    expect(await readerProfileNFT.profileOf(admin.address)).to.equal(1n);
    expect(await readerProfileNFT.hasProfile(admin.address)).to.equal(true);

    await expect(readerProfileNFT.connect(admin).updateProfileMetadata(1, "QmUpdatedProfile"))
      .to.emit(readerProfileNFT, "ProfileMetadataUpdated")
      .withArgs(1n, "QmUpdatedProfile", admin.address);

    expect(await readerProfileNFT.tokenURI(1)).to.equal("ipfs://profile/QmUpdatedProfile");

    await expect(readerProfileNFT.connect(admin).setBaseURI("https://profiles.example/"))
      .to.emit(readerProfileNFT, "BaseUriUpdated")
      .withArgs("https://profiles.example/");

    expect(await readerProfileNFT.tokenURI(1)).to.equal("https://profiles.example/QmUpdatedProfile");
  });

  it("enforces non-transferability and single issuance", async function () {
    const { admin, reader, other, readerProfileNFT } = await loadFixture(deployFixture);

    await readerProfileNFT.connect(admin).mintProfile(reader.address, "QmSoulboundProfile");

    await expect(
      readerProfileNFT.connect(admin).mintProfile(reader.address, "QmSoulboundProfile2")
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__AlreadyIssued");

    await expect(
      readerProfileNFT.connect(reader).transferFrom(reader.address, other.address, 1)
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__Soulbound");

    await expect(
      readerProfileNFT.connect(reader).safeTransferFrom(reader.address, other.address, 1)
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__Soulbound");

    await expect(
      readerProfileNFT
        .connect(reader)
        .safeTransferFrom(reader.address, other.address, 1, ethers.toUtf8Bytes("data"))
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__Soulbound");

    await expect(readerProfileNFT.connect(reader).approve(other.address, 1)).to.be.revertedWithCustomError(
      readerProfileNFT,
      "ReaderProfileNFT__Soulbound"
    );

    await expect(
      readerProfileNFT.connect(reader).setApprovalForAll(other.address, true)
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__Soulbound");
  });

  it("restricts metadata changes and allows revocation", async function () {
    const { admin, reader, other, readerProfileNFT } = await loadFixture(deployFixture);

    await readerProfileNFT.connect(admin).mintProfile(reader.address, "QmReaderMetadata");

    await expect(
      readerProfileNFT.connect(other).updateProfileMetadata(1, "QmHackerMetadata")
    ).to.be.revertedWithCustomError(readerProfileNFT, "ReaderProfileNFT__NotProfileOwner");

    await expect(readerProfileNFT.connect(other).burn(1)).to.be.revertedWithCustomError(
      readerProfileNFT,
      "ReaderProfileNFT__NotProfileOwner"
    );

    await expect(readerProfileNFT.connect(reader).burn(1))
      .to.emit(readerProfileNFT, "ProfileRevoked")
      .withArgs(1n, reader.address);

    expect(await readerProfileNFT.hasProfile(reader.address)).to.equal(false);
    expect(await readerProfileNFT.profileOf(reader.address)).to.equal(0n);

    await expect(readerProfileNFT.connect(admin).mintProfile(reader.address, "QmNewProfile"))
      .to.emit(readerProfileNFT, "ProfileMinted")
      .withArgs(reader.address, 2n, "QmNewProfile");

    await expect(readerProfileNFT.connect(admin).burn(2))
      .to.emit(readerProfileNFT, "ProfileRevoked")
      .withArgs(2n, admin.address);
  });
});
