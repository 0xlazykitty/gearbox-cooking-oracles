import SafeApiKit from "@safe-global/api-kit";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";
import { ethers } from "ethers";

import {
  RPC_URLS,
  SAFE_ADDRESS,
  SAFE_SIGNER_PRIVATE_KEY,
  SupportedChainsType,
} from "../constants";
import { RawTx } from "./getNewLowerBounds";

export const proposeSafeTransactions = async (
  chainId: SupportedChainsType,
  rawTxns: RawTx[],
) => {
  const provider = new ethers.JsonRpcProvider(RPC_URLS[chainId]);
  const signer = new ethers.Wallet(SAFE_SIGNER_PRIVATE_KEY, provider);

  const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });

  // Create Safe instance
  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress: SAFE_ADDRESS,
  });

  const apiKit = new SafeApiKit({ chainId: BigInt(chainId) });

  // Create transaction
  const transactions: MetaTransactionData[] = rawTxns.map(tx => ({
    to: tx.target,
    value: tx.value,
    data: tx.data,
    operation: OperationType.Call,
  }));

  const safeTransaction = await protocolKit.createTransaction({ transactions });
  const senderAddress = await signer.getAddress();
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signHash(safeTxHash);

  // Propose transaction to the service
  await apiKit.proposeTransaction({
    safeAddress: await protocolKit.getAddress(),
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature: signature.data,
  });
};
