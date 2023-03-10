import { HolderValidationContract } from "../../../smart-contracts/abi/holderValidator";
import type { MrCryptoMetadataType } from "../../../smart-contracts/abi/metadata";
import { MrCryptoContract } from "../../../smart-contracts/abi/mrcrypto";
import { ipfsGateway } from "../../../utils/ipfs";

import { router, protectedProcedure } from "../trpc";

export const mrCryptoRouter = router({
  getMrcNftImages: protectedProcedure.query(async ({ ctx }) => {
    const mrcNfts = await MrCryptoContract.walletOfOwner(ctx.user.address);

    const mrcNftsIds = mrcNfts.map((nft) => nft.toNumber());

    const mrcNftsURIs = await Promise.all(
      mrcNftsIds.map((nft) => MrCryptoContract.tokenURI(nft))
    );

    const mrcNftsData = (await Promise.all(
      mrcNftsURIs.map(async (uri) => {
        const uriToFetch = ipfsGateway(uri);
        const req = await fetch(uriToFetch);
        return await req.json();
      })
    )) as MrCryptoMetadataType[];

    const data = mrcNftsData.map((nft) => ipfsGateway(nft.image));

    return { data };
  }),

  /**
   * Check if the current user is a holder of the NFT that are in the contract HolderValidation.sol
   */
  isHolder: protectedProcedure.query(async ({ ctx }) => {
    const isHolder = await HolderValidationContract.isHolder(ctx.user.address);

    return { isHolder };
  }),
});
