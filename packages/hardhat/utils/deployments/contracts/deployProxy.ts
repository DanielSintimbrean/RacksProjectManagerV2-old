import { ethers, network } from "hardhat";
import {
  developmentChains,
  deploymentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} from "../../../helper-hardhat-config";

type DeployProxy = {
  RacksPrayerManagerAddress: string;
  ERC20Address: string;
};

export const deployProxy = async ({
  RacksPrayerManagerAddress,
  ERC20Address,
}: DeployProxy) => {
  const ProxyAdmin_Factory = await ethers.getContractFactory("ProxyAdmin");
  const ProxyAdmin = await ProxyAdmin_Factory.deploy();

  const TransparentUpgradeableProxy_Factory = await ethers.getContractFactory(
    "TransparentUpgradeableProxy"
  );

  const TransparentUpgradeableProxy =
    await TransparentUpgradeableProxy_Factory.deploy(
      RacksPrayerManagerAddress,
      ProxyAdmin.address,
      []
    );

  const RacksProjectManager = await ethers.getContractAt(
    "RacksProjectManager",
    RacksPrayerManagerAddress
  );

  const RacksProxy = RacksProjectManager.attach(
    TransparentUpgradeableProxy.address
  );
  const owner = await RacksProxy.owner();
  if (owner === ethers.constants.AddressZero) {
    await RacksProxy.initialize(ERC20Address);
  }

  if (
    deploymentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
  }

  return { ProxyAdmin, TransparentUpgradeableProxy };
};
