import { RacksProjectManager__factory } from "my-hardhat";
import { provider } from "../common";

export const abi = RacksProjectManager__factory.abi;

export const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export const RacksProjectManagerContract = RacksProjectManager__factory.connect(
  address,
  provider
);
