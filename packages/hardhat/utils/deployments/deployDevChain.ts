import { deployMocks } from "./contracts/deployMocks";
import { deployProxy } from "./contracts/deployProxy";
import { deployRacksPM } from "./contracts/deployRacksPM";

export const deployDevChain = async () => {
  const { MrCryptoNFT, MockErc20 } = await deployMocks();
  const { RacksPM, HolderValidation } = await deployRacksPM({
    ERC20Address: MockErc20.address,
    MrCryptoAddress: MrCryptoNFT.address,
  });
  const { ProxyAdmin, TransparentUpgradeableProxy } = await deployProxy({
    RacksPrayerManagerAddress: RacksPM.address,
    ERC20Address: MockErc20.address,
  });

  return {
    MockErc20,
    MrCryptoNFT,
    RacksPM,
    HolderValidation,
    ProxyAdmin,
    TransparentUpgradeableProxy,
  };
};
