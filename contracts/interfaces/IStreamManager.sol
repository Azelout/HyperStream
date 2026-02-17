// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IStreamManager
 * @notice Interface for the HyperStream payment streaming protocol on Monad.
 * @dev Defines the ABI for a pull-based linear streaming system where
 *      unlocked balance is computed as: Balance(t) = min(deposit, (t - startTime) * ratePerSecond).
 */
interface IStreamManager {
    // ──────────────────────────────────────────────
    //  Structs
    // ──────────────────────────────────────────────

    /// @notice Represents a single payment stream.
    /// @param sender       The address that funded the stream.
    /// @param recipient    The address that receives the streamed tokens.
    /// @param deposit      Total tokens deposited into the stream.
    /// @param tokenAddress The ERC-20 token being streamed.
    /// @param startTime    Unix timestamp when streaming begins.
    /// @param stopTime     Unix timestamp when streaming ends.
    /// @param ratePerSecond Tokens unlocked per second (deposit / duration).
    /// @param remainingBalance Tokens still locked inside the stream.
    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        address tokenAddress;
        uint256 startTime;
        uint256 stopTime;
        uint256 ratePerSecond;
        uint256 remainingBalance;
    }

    // ──────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────

    /// @notice Thrown when a zero address is supplied where a valid address is required.
    error ZeroAddress();

    /// @notice Thrown when the start time is not strictly before the stop time,
    ///         or the start time is in the past.
    error InvalidTimeFrame();

    /// @notice Thrown when the deposit amount is zero.
    error ZeroDeposit();

    /// @notice Thrown when referencing a stream ID that has not been created.
    /// @param streamId The non-existent stream ID.
    error StreamDoesNotExist(uint256 streamId);

    /// @notice Thrown when msg.sender is not authorized to interact with a stream.
    /// @param caller The unauthorized address.
    error UnauthorizedCaller(address caller);

    /// @notice Thrown when an arithmetic operation would overflow or produce an
    ///         invalid result (e.g. deposit not divisible into a clean rate).
    error ArithmeticOverflow();

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    /// @notice Emitted when a new payment stream is created.
    /// @param streamId     Unique identifier of the newly created stream.
    /// @param sender       Address that funded the stream.
    /// @param recipient    Address that will receive the tokens.
    /// @param deposit      Total amount deposited.
    /// @param tokenAddress ERC-20 token being streamed.
    /// @param startTime    When the stream begins (unix timestamp).
    /// @param stopTime     When the stream ends (unix timestamp).
    event StreamCreated(
        uint256 indexed streamId,
        address indexed sender,
        address indexed recipient,
        uint256 deposit,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    );

    /// @notice Emitted when tokens are withdrawn from a stream by the recipient.
    /// @param streamId Unique identifier of the stream.
    /// @param recipient Address that received the withdrawal.
    /// @param amount    Amount of tokens withdrawn.
    event WithdrawFromStream(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    /// @notice Emitted when a stream is canceled by its sender or recipient.
    /// @param streamId        Unique identifier of the stream.
    /// @param senderBalance   Remaining tokens returned to the sender.
    /// @param recipientBalance Tokens already earned sent to the recipient.
    event StreamCanceled(
        uint256 indexed streamId,
        uint256 senderBalance,
        uint256 recipientBalance
    );

    // ──────────────────────────────────────────────
    //  External Functions
    // ──────────────────────────────────────────────

    /// @notice Creates a new payment stream from `msg.sender` to `recipient`.
    /// @dev The caller must have approved this contract for at least `deposit`
    ///      tokens. The deposit must be evenly divisible by the stream duration
    ///      to avoid precision loss.
    /// @param recipient    Address that will receive the streamed tokens.
    /// @param deposit      Total amount of tokens to stream.
    /// @param tokenAddress ERC-20 token to stream.
    /// @param startTime    Unix timestamp for the stream start.
    /// @param stopTime     Unix timestamp for the stream end.
    /// @return streamId    The unique identifier of the created stream.
    function createStream(
        address recipient,
        uint256 deposit,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    ) external returns (uint256 streamId);

    /// @notice Returns the real-time balance of a party in a given stream.
    /// @dev Computes the currently withdrawable or reclaimable amount based on
    ///      elapsed time and withdrawals already made.
    /// @param streamId The unique identifier of the stream.
    /// @param who      The address to query (must be sender or recipient).
    /// @return balance The real-time token balance for `who`.
    function balanceOf(uint256 streamId, address who) external view returns (uint256 balance);

    /// @notice Allows the recipient to withdraw earned tokens from a stream.
    /// @dev Reverts if the caller is not the recipient or if the amount exceeds
    ///      the available balance.
    /// @param streamId The unique identifier of the stream.
    /// @param amount   The amount of tokens to withdraw.
    function withdrawFromStream(uint256 streamId, uint256 amount) external;

    /// @notice Cancels a stream, distributing remaining funds proportionally.
    /// @dev Only the sender or the recipient may cancel. Earned tokens go to
    ///      the recipient, unearned tokens are refunded to the sender.
    /// @param streamId The unique identifier of the stream to cancel.
    function cancelStream(uint256 streamId) external;

    /// @notice Returns the full Stream struct for a given stream ID.
    /// @param streamId The unique identifier of the stream.
    /// @return stream  The Stream struct containing all stream details.
    function getStream(uint256 streamId) external view returns (Stream memory stream);
}
