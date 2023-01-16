import { ethers } from "ethers";
import { Lock__factory } from "my-hardhat";

const provider = new ethers.providers.JsonRpcProvider("localhost:8545");

export const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;
export const LockContract = Lock__factory.connect(address, provider);

export const abi = Lock__factory.abi;
