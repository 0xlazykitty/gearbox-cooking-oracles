## Overview

The script aims to update all lower bounds within the system according to the Gearbox Protocol. It targets LP capped oracles, which extend LPPriceFeed.sol. The process involves fetching the current lower bound value and adjusting it by setting the new center for the range to be 1% lower than the current value. This ensures the lower bound remains updated and aligned with the protocol requirements.

## Steps

1. Extract a list of oracles from the PriceOracle contract by listening to `SetPriceFeed` events.
2. Retrieve the price feed types from the events.
3. Get the current price using the Chainlink `latestRoundData()` method, then subtract 1% from it.
4. Update the lower bound via `setLimiter` method.

## How to run

1. Install all dependencies using `yarn install`.
2. Set environment variables from `.env.example`.
3. `yarn start` will start the script, the script launches a cron job to run every 2 weeks.

## References

- https://www.youtube.com/watch?v=I46OGQDf6E4
- https://github.com/Gearbox-protocol/oracles-v3/blob/main/contracts/oracles/LPPriceFeed.sol
- https://github.com/Gearbox-protocol/core-v3/blob/832fe64d7194ad74b93543b1314da38aa6d413ea/contracts/core/PriceOracleV3.sol#L216
- https://github.com/Gearbox-protocol/core-v2/blob/98a984d37fa590e89ff976fe9e2a523b217d50ef/contracts/interfaces/IPriceFeedType.sol#L8
- https://github.com/Gearbox-protocol/sdk-gov/blob/bff27a133f155c064be61a52ba3aa4552d8df978/src/oracles/pricefeedType.ts#L12-L32
- https://github.com/Gearbox-protocol/oracles-v3/blob/f53f67cb303e1de2788a6f844c50847c553b9d1b/contracts/oracles/LPPriceFeed.sol#L135
