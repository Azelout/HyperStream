// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title StreamMath
 * @notice Pure/stateless library for streaming payment calculations.
 * @dev Isolates precision-critical arithmetic to keep the main contract clean.
 *      All functions are `internal pure` so they inline at compile time and
 *      incur zero external-call overhead.
 */
library StreamMath {
    /// @notice Computes the per-second streaming rate.
    /// @dev Reverts if `deposit` is not evenly divisible by the duration to
    ///      prevent silent precision loss.
    /// @param deposit  Total tokens deposited into the stream.
    /// @param duration The stream duration in seconds (stopTime - startTime).
    /// @return rate    Tokens unlocked per second.
    function ratePerSecond(uint256 deposit, uint256 duration) internal pure returns (uint256 rate) {
        require(duration > 0, "StreamMath: zero duration");
        rate = deposit / duration;
        require(rate * duration == deposit, "StreamMath: deposit not divisible by duration");
    }

    /// @notice Computes the time delta clamped to the stream window.
    /// @dev Returns 0 before `startTime` and `stopTime - startTime` after `stopTime`.
    /// @param currentTime The current block timestamp.
    /// @param startTime   Stream start timestamp.
    /// @param stopTime    Stream stop timestamp.
    /// @return delta      Elapsed seconds within the stream window.
    function deltaOf(
        uint256 currentTime,
        uint256 startTime,
        uint256 stopTime
    ) internal pure returns (uint256 delta) {
        if (currentTime <= startTime) return 0;
        if (currentTime >= stopTime) return stopTime - startTime;
        return currentTime - startTime;
    }

    /// @notice Computes the total amount streamed (earned) up to `currentTime`.
    /// @dev Uses the formula: earned = delta * ratePerSecond, capped at `deposit`.
    /// @param deposit      Total deposit in the stream.
    /// @param currentTime  The current block timestamp.
    /// @param startTime    Stream start timestamp.
    /// @param stopTime     Stream stop timestamp.
    /// @param rate         Tokens per second.
    /// @return earned      Total tokens earned by the recipient so far.
    function streamedAmount(
        uint256 deposit,
        uint256 currentTime,
        uint256 startTime,
        uint256 stopTime,
        uint256 rate
    ) internal pure returns (uint256 earned) {
        uint256 delta = deltaOf(currentTime, startTime, stopTime);
        earned = delta * rate;
        // Safety cap — should never exceed deposit due to rate calculation,
        // but we add a guard against edge cases.
        if (earned > deposit) earned = deposit;
    }

    /// @notice Computes the recipient's withdrawable balance.
    /// @dev   recipientBalance = streamedAmount - alreadyWithdrawn
    ///        where alreadyWithdrawn = deposit - remainingBalance
    /// @param deposit          Total deposit in the stream.
    /// @param remainingBalance Tokens still held in the stream.
    /// @param currentTime      The current block timestamp.
    /// @param startTime        Stream start timestamp.
    /// @param stopTime         Stream stop timestamp.
    /// @param rate             Tokens per second.
    /// @return balance         Tokens the recipient can withdraw right now.
    function recipientBalance(
        uint256 deposit,
        uint256 remainingBalance,
        uint256 currentTime,
        uint256 startTime,
        uint256 stopTime,
        uint256 rate
    ) internal pure returns (uint256 balance) {
        uint256 earned = streamedAmount(deposit, currentTime, startTime, stopTime, rate);
        uint256 withdrawn = deposit - remainingBalance;
        if (earned > withdrawn) {
            balance = earned - withdrawn;
        }
        // else balance = 0 (default)
    }

    /// @notice Computes the sender's reclaimable balance.
    /// @dev   senderBalance = remainingBalance - recipientWithdrawable
    /// @param deposit          Total deposit in the stream.
    /// @param remainingBalance Tokens still held in the stream.
    /// @param currentTime      The current block timestamp.
    /// @param startTime        Stream start timestamp.
    /// @param stopTime         Stream stop timestamp.
    /// @param rate             Tokens per second.
    /// @return balance         Tokens the sender would recover upon cancellation.
    function senderBalance(
        uint256 deposit,
        uint256 remainingBalance,
        uint256 currentTime,
        uint256 startTime,
        uint256 stopTime,
        uint256 rate
    ) internal pure returns (uint256 balance) {
        uint256 recipBal = recipientBalance(
            deposit, remainingBalance, currentTime, startTime, stopTime, rate
        );
        if (remainingBalance > recipBal) {
            balance = remainingBalance - recipBal;
        }
        // else balance = 0 (default)
    }
}
