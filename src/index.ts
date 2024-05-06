import "dotenv/config";

import fs from "fs";
import * as cron from "node-cron";

import {
  SAFE_SIGNER_PRIVATE_KEY,
  SUPPORTED_CHAINS,
  SupportedChainsType,
} from "./constants";
import { getNewLowerBounds } from "./helpers/getNewLowerBounds";
import { proposeSafeTransactions } from "./helpers/proposeSafeTransactions";

const LAST_BLOCK_NUMBERS: Record<SupportedChainsType, number | undefined> = {
  1: undefined,
  10: undefined,
  42161: undefined,
};

console.log("Starting cron job...");

// Setup cron job to run every 2 weeks
cron.schedule("0 0 1,15 * *", async () => {
  const promises = SUPPORTED_CHAINS.map(async chainId => {
    try {
      const { txns, blockNumber } = await getNewLowerBounds(
        chainId,
        LAST_BLOCK_NUMBERS[chainId],
      );
      console.log(`Chain ID: ${chainId}, Txns: ${txns.length}`);

      // Update last block number
      LAST_BLOCK_NUMBERS[chainId] = blockNumber;

      if (!SAFE_SIGNER_PRIVATE_KEY) {
        fs.writeFileSync(
          `${chainId}-${Date.now()}-txns.json`,
          JSON.stringify(txns, null, 2),
        );
      } else {
        // Propose safe transactions
        await proposeSafeTransactions(chainId, txns);
      }
    } catch (err) {
      console.log(err);
    }
  });

  await Promise.all(promises);
});
