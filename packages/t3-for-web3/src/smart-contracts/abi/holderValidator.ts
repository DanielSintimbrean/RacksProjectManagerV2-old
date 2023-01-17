import { HolderValidation__factory } from "my-hardhat";
import { provider } from "../common";

export const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

export const HolderValidationContract = HolderValidation__factory.connect(
  address,
  provider
);
