import {deployDevChain} from "../utils/deployments/deployDevChain";

async function main() {
  console.log("Deploying contracts to the hardhat network");
  const {
    HolderValidation,
    MockErc20,
    MrCryptoNFT,
    ProxyAdmin,
    RacksPM,
    TransparentUpgradeableProxy,
  } = await deployDevChain();

  console.log("HolderValidation deployed to:", HolderValidation.address);
  console.log("MockErc20 deployed to:", MockErc20.address);
  console.log("MrCryptoNFT deployed to:", MrCryptoNFT.address);
  console.log("ProxyAdmin deployed to:", ProxyAdmin.address);
  console.log("RacksPM deployed to:", RacksPM.address);
  console.log(
    "TransparentUpgradeableProxy deployed to:",
    TransparentUpgradeableProxy.address,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
