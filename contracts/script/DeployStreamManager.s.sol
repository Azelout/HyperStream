// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {StreamManager} from "../StreamManager.sol";

/**
 * @title DeployStreamManager
 * @notice Foundry deployment script for the HyperStream protocol on Monad.
 *
 * Usage:
 *   # Dry-run (simulate)
 *   forge script script/DeployStreamManager.s.sol --rpc-url $RPC_URL
 *
 *   # Deploy + verify
 *   forge script script/DeployStreamManager.s.sol \
 *     --rpc-url $RPC_URL \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast \
 *     --verify
 */
contract DeployStreamManager is Script {
    function run() external returns (StreamManager manager) {
        // Log deployer info
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address deployer = deployerPrivateKey != 0
            ? vm.addr(deployerPrivateKey)
            : msg.sender;

        console2.log("=== HyperStream Deployment ===");
        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);

        // Start broadcasting transactions
        if (deployerPrivateKey != 0) {
            vm.startBroadcast(deployerPrivateKey);
        } else {
            vm.startBroadcast();
        }

        // Deploy StreamManager singleton
        manager = new StreamManager();

        vm.stopBroadcast();

        // Log results
        console2.log("---");
        console2.log("StreamManager deployed at:", address(manager));
        console2.log("Next stream ID:", manager.nextStreamId());
    }
}
