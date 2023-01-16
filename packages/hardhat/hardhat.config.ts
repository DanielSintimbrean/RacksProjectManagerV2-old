import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-docgen";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  typechain: {
    outDir: "types/contracts",
    alwaysGenerateOverloads: true,
    dontOverrideCompile: false,
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  docgen: {
    pages: "files",
  },
};

export default config;
