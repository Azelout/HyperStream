// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {IStreamManager} from "./interfaces/IStreamManager.sol";
import {StreamMath} from "./libraries/StreamMath.sol";

/**
 * @title StreamManager
 * @notice Singleton contract managing continuous payment streams on Monad.
 * @dev Pull-based linear streaming: tokens are not pushed — parties interact
 *      to withdraw or cancel. Optimized for Monad's OCC by being stateless
 *      between creation and withdrawal (no per-block updates).
 *
 *      Balance formula: Balance(t) = min(deposit, (t - startTime) × ratePerSecond)
 */
contract StreamManager is IStreamManager, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using StreamMath for uint256;

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @notice Auto-incrementing stream counter. First stream ID is 1.
    uint256 public nextStreamId;

    /// @notice Mapping from stream ID to Stream struct.
    mapping(uint256 => Stream) private _streams;

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    constructor() {
        nextStreamId = 1;
    }

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    /// @dev Reverts if the stream does not exist (i.e., deposit is 0).
    modifier streamExists(uint256 streamId) {
        if (_streams[streamId].deposit == 0) {
            revert StreamDoesNotExist(streamId);
        }
        _;
    }

    /// @dev Reverts if the caller is neither the sender nor the recipient.
    modifier onlySenderOrRecipient(uint256 streamId) {
        Stream storage s = _streams[streamId];
        if (msg.sender != s.sender && msg.sender != s.recipient) {
            revert UnauthorizedCaller(msg.sender);
        }
        _;
    }

    // ──────────────────────────────────────────────
    //  External — Mutative
    // ──────────────────────────────────────────────

    /// @inheritdoc IStreamManager
    function createStream(
        address recipient,
        uint256 deposit,
        address tokenAddress,
        uint256 startTime,
        uint256 stopTime
    ) external override returns (uint256 streamId) {
        // ── Validation ──────────────────────────
        if (recipient == address(0) || tokenAddress == address(0)) {
            revert ZeroAddress();
        }
        if (recipient == address(this)) revert ZeroAddress();
        if (recipient == msg.sender) revert ZeroAddress();
        if (deposit == 0) revert ZeroDeposit();
        if (startTime >= stopTime) revert InvalidTimeFrame();
        if (startTime < block.timestamp) revert InvalidTimeFrame();

        // ── Math (reverts internally on precision loss) ──
        uint256 duration = stopTime - startTime;
        uint256 rate = StreamMath.ratePerSecond(deposit, duration);

        // ── State update ────────────────────────
        streamId = nextStreamId;
        unchecked { nextStreamId++; }

        _streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: deposit,
            tokenAddress: tokenAddress,
            startTime: startTime,
            stopTime: stopTime,
            ratePerSecond: rate,
            remainingBalance: deposit
        });

        // ── Transfer tokens into the contract ───
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), deposit);

        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            deposit,
            tokenAddress,
            startTime,
            stopTime
        );
    }

    /// @inheritdoc IStreamManager
    function withdrawFromStream(
        uint256 streamId,
        uint256 amount
    )
        external
        override
        nonReentrant
        streamExists(streamId)
    {
        Stream storage s = _streams[streamId];

        if (msg.sender != s.recipient) {
            revert UnauthorizedCaller(msg.sender);
        }

        // Compute available balance for recipient
        uint256 available = StreamMath.recipientBalance(
            s.deposit,
            s.remainingBalance,
            block.timestamp,
            s.startTime,
            s.stopTime,
            s.ratePerSecond
        );

        if (amount == 0 || amount > available) {
            revert ArithmeticOverflow();
        }

        // Update state before external call (CEI pattern)
        unchecked {
            s.remainingBalance -= amount;
        }

        // If the stream is fully drained, clean up storage for gas refund
        if (s.remainingBalance == 0) {
            address tokenAddress = s.tokenAddress;
            address recipient = s.recipient;
            delete _streams[streamId];

            IERC20(tokenAddress).safeTransfer(recipient, amount);
        } else {
            IERC20(s.tokenAddress).safeTransfer(s.recipient, amount);
        }

        emit WithdrawFromStream(streamId, msg.sender, amount);
    }

    /// @inheritdoc IStreamManager
    function cancelStream(
        uint256 streamId
    )
        external
        override
        nonReentrant
        streamExists(streamId)
        onlySenderOrRecipient(streamId)
    {
        Stream memory s = _streams[streamId];

        uint256 recipBal = StreamMath.recipientBalance(
            s.deposit,
            s.remainingBalance,
            block.timestamp,
            s.startTime,
            s.stopTime,
            s.ratePerSecond
        );

        uint256 sendBal = s.remainingBalance - recipBal;

        // Delete state before external calls (CEI pattern)
        delete _streams[streamId];

        IERC20(s.tokenAddress).safeTransfer(s.recipient, recipBal);
        if (sendBal > 0) {
            IERC20(s.tokenAddress).safeTransfer(s.sender, sendBal);
        }

        emit StreamCanceled(streamId, sendBal, recipBal);
    }

    // ──────────────────────────────────────────────
    //  External — View
    // ──────────────────────────────────────────────

    /// @inheritdoc IStreamManager
    function balanceOf(
        uint256 streamId,
        address who
    )
        external
        view
        override
        streamExists(streamId)
        returns (uint256 balance)
    {
        Stream storage s = _streams[streamId];

        if (who == s.recipient) {
            return StreamMath.recipientBalance(
                s.deposit,
                s.remainingBalance,
                block.timestamp,
                s.startTime,
                s.stopTime,
                s.ratePerSecond
            );
        } else if (who == s.sender) {
            return StreamMath.senderBalance(
                s.deposit,
                s.remainingBalance,
                block.timestamp,
                s.startTime,
                s.stopTime,
                s.ratePerSecond
            );
        } else {
            revert UnauthorizedCaller(who);
        }
    }

    /// @inheritdoc IStreamManager
    function getStream(
        uint256 streamId
    )
        external
        view
        override
        streamExists(streamId)
        returns (Stream memory stream)
    {
        stream = _streams[streamId];
    }
}
