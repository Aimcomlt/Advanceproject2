import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("UUPSManager integration", function () {
  async function deployFixture() {
    const [deployer, dao, operator, other] = await ethers.getSigners();

    const UpgradeBeacon = await ethers.getContractFactory("UpgradeBeacon");
    const upgradeBeaconImpl = await UpgradeBeacon.deploy();
    await upgradeBeaconImpl.waitForDeployment();

    const ERC1967Proxy = await ethers.getContractFactory("ERC1967Proxy");

    const beaconInitData = UpgradeBeacon.interface.encodeFunctionData("initialize", [dao.address]);
    const upgradeBeaconProxy = await ERC1967Proxy.deploy(
      await upgradeBeaconImpl.getAddress(),
      beaconInitData
    );
    await upgradeBeaconProxy.waitForDeployment();
    const upgradeBeacon = UpgradeBeacon.attach(await upgradeBeaconProxy.getAddress());

    const UUPSManager = await ethers.getContractFactory("UUPSManager");
    const managerImpl = await UUPSManager.deploy();
    await managerImpl.waitForDeployment();

    const managerInitData = UUPSManager.interface.encodeFunctionData("initialize", [
      dao.address,
      await upgradeBeacon.getAddress(),
    ]);
    const managerProxy = await ERC1967Proxy.deploy(
      await managerImpl.getAddress(),
      managerInitData
    );
    await managerProxy.waitForDeployment();
    const manager = UUPSManager.attach(await managerProxy.getAddress());

    const ModuleV1 = await ethers.getContractFactory("ManagedModuleV1");
    const moduleImplV1 = await ModuleV1.deploy();
    await moduleImplV1.waitForDeployment();
    const moduleImplV1Address = await moduleImplV1.getAddress();

    const upgradeId = ethers.id("managed-module");

    await upgradeBeacon.connect(dao).registerLogic(upgradeId, moduleImplV1Address);

    const moduleInitData = ModuleV1.interface.encodeFunctionData("initialize", [
      await manager.getAddress(),
      upgradeId,
      1,
    ]);

    const moduleProxy = await ERC1967Proxy.deploy(moduleImplV1Address, moduleInitData);
    await moduleProxy.waitForDeployment();
    const module = ModuleV1.attach(await moduleProxy.getAddress());

    const proxyAdminRole = await manager.PROXY_ADMIN_ROLE();
    await manager.connect(dao).grantRole(proxyAdminRole, operator.address);
    await manager.connect(dao).registerProxy(await module.getAddress(), upgradeId);

    return {
      deployer,
      dao,
      operator,
      other,
      upgradeBeacon,
      upgradeBeaconImplAddress: await upgradeBeaconImpl.getAddress(),
      manager,
      managerImplAddress: await managerImpl.getAddress(),
      module,
      moduleImplV1Address,
      upgradeId,
      ERC1967Proxy,
      ModuleV1,
    };
  }

  it("executes DAO-authorised upgrades using the beacon registry", async function () {
    const { dao, operator, upgradeBeacon, manager, upgradeId, module, moduleImplV1Address } =
      await loadFixture(deployFixture);

    expect(await module.version()).to.equal("v1");

    const ModuleV2 = await ethers.getContractFactory("ManagedModuleV2");
    const moduleImplV2 = await ModuleV2.deploy();
    await moduleImplV2.waitForDeployment();
    const moduleImplV2Address = await moduleImplV2.getAddress();

    await expect(upgradeBeacon.connect(dao).updateLogic(upgradeId, moduleImplV2Address))
      .to.emit(upgradeBeacon, "LogicUpdated")
      .withArgs(upgradeId, moduleImplV1Address, moduleImplV2Address, dao.address);

    await expect(manager.connect(operator).upgradeProxy(await module.getAddress()))
      .to.emit(manager, "ProxyUpgraded")
      .withArgs(await module.getAddress(), upgradeId, moduleImplV2Address);

    const moduleV2 = ModuleV2.attach(await module.getAddress());
    expect(await moduleV2.version()).to.equal("v2");

    await expect(moduleV2.increment()).to.not.be.reverted;
    expect(await moduleV2.value()).to.equal(2n);
  });

  it("prevents upgrades without manager mediation and enforces role checks", async function () {
    const { dao, other, operator, manager, upgradeBeacon, upgradeId, module, ERC1967Proxy } = await loadFixture(
      deployFixture
    );

    const ModuleV2 = await ethers.getContractFactory("ManagedModuleV2");
    const moduleImplV2 = await ModuleV2.deploy();
    await moduleImplV2.waitForDeployment();
    const moduleImplV2Address = await moduleImplV2.getAddress();

    await upgradeBeacon.connect(dao).updateLogic(upgradeId, moduleImplV2Address);

    await expect(module.connect(other).upgradeTo(moduleImplV2Address)).to.be.revertedWithCustomError(
      module,
      "ManagedModule__UnauthorizedUpgrade"
    );

    await expect(manager.connect(other).upgradeProxy(await module.getAddress()))
      .to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount")
      .withArgs(other.address, await manager.PROXY_ADMIN_ROLE());

    const UpgradeBeacon = await ethers.getContractFactory("UpgradeBeacon");
    const newBeaconImpl = await UpgradeBeacon.deploy();
    await newBeaconImpl.waitForDeployment();

    const beaconInitData = UpgradeBeacon.interface.encodeFunctionData("initialize", [dao.address]);
    const newBeaconProxy = await ERC1967Proxy.deploy(
      await newBeaconImpl.getAddress(),
      beaconInitData
    );
    await newBeaconProxy.waitForDeployment();

    await manager.connect(dao).setUpgradeBeacon(await newBeaconProxy.getAddress());

    await expect(
      manager.connect(operator).upgradeProxyWithData(await module.getAddress(), "0x")
    ).to.be.revertedWithCustomError(manager, "UUPSManager__ImplementationNotRegistered");
  });

  it("validates beacon registrations and proxy onboarding", async function () {
    const { dao, operator, other, manager, upgradeBeacon, ERC1967Proxy, ModuleV1, moduleImplV1Address } =
      await loadFixture(deployFixture);

    const newUpgradeId = ethers.id("new-module");
    await expect(
      upgradeBeacon.connect(other).registerLogic(newUpgradeId, moduleImplV1Address)
    ).to.be.revertedWithCustomError(upgradeBeacon, "AccessControlUnauthorizedAccount");

    await upgradeBeacon.connect(dao).registerLogic(newUpgradeId, moduleImplV1Address);

    const moduleInitData = ModuleV1.interface.encodeFunctionData("initialize", [
      await manager.getAddress(),
      newUpgradeId,
      5,
    ]);
    const secondProxy = await ERC1967Proxy.deploy(moduleImplV1Address, moduleInitData);
    await secondProxy.waitForDeployment();
    const secondModule = ModuleV1.attach(await secondProxy.getAddress());

    await expect(
      manager.connect(other).registerProxy(await secondModule.getAddress(), newUpgradeId)
    ).to.be.revertedWithCustomError(manager, "AccessControlUnauthorizedAccount");

    await expect(
      manager.connect(dao).registerProxy(await secondModule.getAddress(), newUpgradeId)
    )
      .to.emit(manager, "ProxyRegistered")
      .withArgs(await secondModule.getAddress(), newUpgradeId, moduleImplV1Address);

    await expect(
      manager.connect(operator).upgradeProxyWithData(await secondModule.getAddress(), "0x")
    ).to.not.be.reverted;

    await expect(manager.connect(dao).setUpgradeBeacon(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      manager,
      "UUPSManager__ZeroAddress"
    );
  });
});
