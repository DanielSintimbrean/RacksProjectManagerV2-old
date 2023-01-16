import { ethers, network } from "hardhat";
import {
  isDeploymentChain,
  isDevelopmentChain,
} from "../../../helper-hardhat-config";

export const deployMocks = async () => {
  const MrCryptoNFT_Factory = await ethers.getContractFactory("MrCryptoNFT");
  const MockErc20_Factory = await ethers.getContractFactory("ERC20Mock");

  const MrCryptoNFT = await MrCryptoNFT_Factory.deploy(
    "Mr. Crypto",
    "MRC",
    "https://apinft.racksmafia.com/api/",
    "https://apinft.racksmafia.com/api/hidden.json"
  );

  const MockErc20 = await MockErc20_Factory.deploy("USC Coin", "USDC");

  if (process.env.ETHERSCAN_API_KEY && isDeploymentChain(network.name)) {
    // TODO: Verify contracts on Etherscan
  }

  return { MrCryptoNFT, MockErc20 };
};
