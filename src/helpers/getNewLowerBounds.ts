import { MulticallProvider } from "@ethers-ext/provider-multicall";
import { PriceFeedType } from "@gearbox-protocol/sdk-gov";
import { ethers } from "ethers";

import {
  LpPriceFeed__factory,
  PriceOracleV3__factory,
} from "../../types/ethers-contracts/factories";
import {
  PRICE_ORACLE_V3_ADDRESSES,
  RPC_URLS,
  SupportedChainsType,
} from "../constants";

export interface RawTx {
  target: string;
  value: string;
  signature: string;
  data: string;
}

export async function getNewLowerBounds(
  chainId: SupportedChainsType,
  _lastBlockNumber?: number,
) {
  console.log(`Getting new lower bounds for chain ID: ${chainId}.`);

  const provider = new ethers.JsonRpcProvider(RPC_URLS[chainId]);

  const priceOracleV3 = PriceOracleV3__factory.connect(
    PRICE_ORACLE_V3_ADDRESSES[chainId],
    provider,
  );

  // Get all SetPriceFeed events since the last block number
  const eventsFilter = priceOracleV3.filters.SetPriceFeed();
  const events = await priceOracleV3.queryFilter(
    eventsFilter,
    _lastBlockNumber,
  );

  const multicall = new MulticallProvider(provider);

  // Get all price feed types from the events
  const priceFeedTypePromises = events.map(event =>
    LpPriceFeed__factory.connect(
      event.args.priceFeed,
      multicall,
    ).priceFeedType(),
  );

  // Get all LP price feeds
  const lpPriceFeeds: string[] = [];
  const priceFeedTypeResults = await Promise.allSettled(priceFeedTypePromises);
  priceFeedTypeResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const { priceFeed } = events[index].args;
      const priceFeedType = Number(result.value);
      if (priceFeedType !== PriceFeedType.ZERO_ORACLE) {
        lpPriceFeeds.push(priceFeed);
      }
    }
  });

  // Get the latest round data for each LP price feed
  const latestRoundDataPromises: Promise<{ answer: bigint }>[] =
    lpPriceFeeds.map(priceFeed =>
      LpPriceFeed__factory.connect(priceFeed, multicall).latestRoundData(),
    );
  const latestRoundDataResults = await Promise.allSettled(
    latestRoundDataPromises,
  );

  // Calculate new lower bounds for each LP price feed
  const txns: RawTx[] = [];
  latestRoundDataResults.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const priceFeed = lpPriceFeeds[index];
      const { answer } = result.value;
      const newLowerBound = (answer * BigInt(99)) / BigInt(100);

      const priceFeedContract = LpPriceFeed__factory.connect(
        priceFeed,
        provider,
      );

      txns.push({
        target: priceFeed,
        value: newLowerBound.toString(),
        signature: "setLimiter(uint256)",
        data: priceFeedContract.interface.encodeFunctionData("setLimiter", [
          newLowerBound,
        ]),
      });
    }
  });

  const blockNumber = await provider.getBlockNumber();

  return { txns, blockNumber };
}
