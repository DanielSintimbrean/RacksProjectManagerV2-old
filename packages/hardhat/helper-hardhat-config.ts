export const networkConfig = {
  31337: {
    name: "localhost",
  },
  5: {
    name: "goerli",
  },
  80001: {
    name: "mumbai",
  },
  137: {
    name: "polygon",
  },
} as const;

export const developmentChains = ["hardhat", "localhost", "goerli"];
export const deploymentChains = ["goerli", "polygon"];
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6;

export const isDevelopmentChain = (networkName: string) =>
  developmentChains.includes(networkName);

export const isDeploymentChain = (networkName: string) =>
  deploymentChains.includes(networkName);
