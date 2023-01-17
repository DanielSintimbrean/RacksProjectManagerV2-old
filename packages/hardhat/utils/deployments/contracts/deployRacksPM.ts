import {ethers, network} from "hardhat";
import {deploymentChains} from "./../../../helper-hardhat-config";

type DeployRacksPM = {
  MrCryptoAddress: string;
  ERC20Address: string;
};

export const deployRacksPM = async ({
  MrCryptoAddress,
  ERC20Address,
}: DeployRacksPM) => {
  const HolderValidation_Factory = await ethers.getContractFactory(
    "HolderValidation",
  );
  const RacksPM_Factory = await ethers.getContractFactory(
    "RacksProjectManager",
  );

  const HolderValidation = await HolderValidation_Factory.deploy(
    MrCryptoAddress,
  );

  const RacksPM = await RacksPM_Factory.deploy(HolderValidation.address);

  RacksPM.initialize(ERC20Address);

  if (
    deploymentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // TODO: add etherscan verification
  }

  return {RacksPM, HolderValidation};
};

module.exports.tags = ["all", "rackspm"];
