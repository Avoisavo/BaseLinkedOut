// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PriceConsumer {
    IPyth pyth;
    
    /**
     * @param pythContract The address of the Pyth contract
     * See https://docs.pyth.network/price-feeds/contract-addresses/evm
     */
    constructor(address pythContract) {
        pyth = IPyth(pythContract);
    }

    /**
     * Fetch the price for a given price feed ID.
     * Requires price update to be submitted first via updatePrice().
     * @param priceFeedId The ID of the price feed to fetch
     * @return price The current price (scaled by expo)
     * @return expo The exponent for the price
     */
    function getPrice(bytes32 priceFeedId) public view returns (int64 price, int32 expo) {
        PythStructs.Price memory priceData = pyth.getPriceNoOlderThan(priceFeedId, 60);
        return (priceData.price, priceData.expo);
    }

    /**
     * Update the on-chain price with the latest data from Pyth.
     * Fetch priceUpdate from Hermes: https://docs.pyth.network/price-feeds/fetch-price-updates
     * @param priceUpdate The encoded data to update the contract with the latest price
     */
    function updatePrice(bytes[] calldata priceUpdate) public payable {
        uint fee = pyth.getUpdateFee(priceUpdate);
        pyth.updatePriceFeeds{ value: fee }(priceUpdate);
    }

    /**
     * Get the fee required to update the price.
     * @param priceUpdate The price update data
     * @return fee The fee in wei
     */
    function getUpdateFee(bytes[] calldata priceUpdate) public view returns (uint fee) {
        return pyth.getUpdateFee(priceUpdate);
    }
}