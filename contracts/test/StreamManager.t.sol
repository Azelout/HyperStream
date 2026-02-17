// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test, console2} from "forge-std/Test.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

import {StreamManager} from "../StreamManager.sol";
import {IStreamManager} from "../interfaces/IStreamManager.sol";
import {StreamMath} from "../libraries/StreamMath.sol";

/**
 * @title StreamManagerTest
 * @notice Comprehensive test suite for the HyperStream protocol.
 *         Covers unit tests, cheatcode-based time manipulation, and stateless fuzzing.
 */
contract StreamManagerTest is Test {
    // ──────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────

    uint256 internal constant INITIAL_BALANCE = 1_000_000e18;
    uint256 internal constant DEPOSIT = 3_600e18; // divisible by 3600s
    uint256 internal constant STREAM_DURATION = 1 hours; // 3600 seconds

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    StreamManager internal manager;
    ERC20Mock internal token;

    address internal alice; // stream sender
    address internal bob; // stream recipient

    // ──────────────────────────────────────────────
    //  Setup
    // ──────────────────────────────────────────────

    function setUp() public {
        // Deploy contracts
        manager = new StreamManager();
        token = new ERC20Mock();

        // Create labelled actors
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        // Fund Alice and approve StreamManager
        token.mint(alice, INITIAL_BALANCE);
        vm.prank(alice);
        token.approve(address(manager), type(uint256).max);
    }

    // ══════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════

    /// @dev Creates a standard 1-hour stream from Alice → Bob starting in +1 second.
    function _createDefaultStream() internal returns (uint256 streamId) {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        vm.prank(alice);
        streamId = manager.createStream(
            bob,
            DEPOSIT,
            address(token),
            start,
            stop
        );
    }

    // ══════════════════════════════════════════════
    //  1. STATE TRANSITION TESTS (Invariants)
    // ══════════════════════════════════════════════

    /// @notice Verifies stream creation: event, mapping state, and ERC20 transfer.
    function test_CreateStream() public {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        // ── Expect the StreamCreated event ──
        vm.expectEmit(true, true, true, true);
        emit IStreamManager.StreamCreated(
            1,
            alice,
            bob,
            DEPOSIT,
            address(token),
            start,
            stop
        );

        vm.prank(alice);
        uint256 streamId = manager.createStream(
            bob,
            DEPOSIT,
            address(token),
            start,
            stop
        );

        // ── Verify stream ID ──
        assertEq(streamId, 1, "first stream ID should be 1");
        assertEq(manager.nextStreamId(), 2, "nextStreamId should increment");

        // ── Verify stored struct ──
        IStreamManager.Stream memory s = manager.getStream(streamId);
        assertEq(s.sender, alice);
        assertEq(s.recipient, bob);
        assertEq(s.deposit, DEPOSIT);
        assertEq(s.tokenAddress, address(token));
        assertEq(s.startTime, start);
        assertEq(s.stopTime, stop);
        assertEq(s.ratePerSecond, DEPOSIT / STREAM_DURATION);
        assertEq(s.remainingBalance, DEPOSIT);

        // ── Verify ERC20 balances ──
        assertEq(
            token.balanceOf(address(manager)),
            DEPOSIT,
            "contract should hold deposit"
        );
        assertEq(
            token.balanceOf(alice),
            INITIAL_BALANCE - DEPOSIT,
            "alice balance should decrease"
        );
    }

    /// @notice Verifies multiple streams increment the ID counter correctly.
    function test_MultipleStreamIds() public {
        uint256 id1 = _createDefaultStream();
        uint256 id2 = _createDefaultStream();
        uint256 id3 = _createDefaultStream();

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(id3, 3);
        assertEq(manager.nextStreamId(), 4);
    }

    // ══════════════════════════════════════════════
    //  2. REVERT TESTS
    // ══════════════════════════════════════════════

    /// @notice Reverts when startTime < block.timestamp.
    function test_RevertIf_StartTimeInPast() public {
        uint256 start = block.timestamp - 1; // past
        uint256 stop = block.timestamp + STREAM_DURATION;

        vm.expectRevert(IStreamManager.InvalidTimeFrame.selector);
        vm.prank(alice);
        manager.createStream(bob, DEPOSIT, address(token), start, stop);
    }

    /// @notice Reverts when startTime >= stopTime.
    function test_RevertIf_StartTimeAfterStopTime() public {
        uint256 start = block.timestamp + 100;
        uint256 stop = start; // equal → invalid

        vm.expectRevert(IStreamManager.InvalidTimeFrame.selector);
        vm.prank(alice);
        manager.createStream(bob, DEPOSIT, address(token), start, stop);
    }

    /// @notice Reverts when startTime > stopTime.
    function test_RevertIf_StartTimeGreaterThanStopTime() public {
        uint256 start = block.timestamp + 200;
        uint256 stop = start - 50;

        vm.expectRevert(IStreamManager.InvalidTimeFrame.selector);
        vm.prank(alice);
        manager.createStream(bob, DEPOSIT, address(token), start, stop);
    }

    /// @notice Reverts on zero deposit.
    function test_RevertIf_ZeroDeposit() public {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        vm.expectRevert(IStreamManager.ZeroDeposit.selector);
        vm.prank(alice);
        manager.createStream(bob, 0, address(token), start, stop);
    }

    /// @notice Reverts on zero recipient address.
    function test_RevertIf_ZeroRecipient() public {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        vm.expectRevert(IStreamManager.ZeroAddress.selector);
        vm.prank(alice);
        manager.createStream(address(0), DEPOSIT, address(token), start, stop);
    }

    /// @notice Reverts on zero token address.
    function test_RevertIf_ZeroToken() public {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        vm.expectRevert(IStreamManager.ZeroAddress.selector);
        vm.prank(alice);
        manager.createStream(bob, DEPOSIT, address(0), start, stop);
    }

    /// @notice Reverts when recipient == sender.
    function test_RevertIf_RecipientIsSender() public {
        uint256 start = block.timestamp + 1;
        uint256 stop = start + STREAM_DURATION;

        vm.expectRevert(IStreamManager.ZeroAddress.selector);
        vm.prank(alice);
        manager.createStream(alice, DEPOSIT, address(token), start, stop);
    }

    /// @notice Reverts when querying a non-existent stream.
    function test_RevertIf_StreamDoesNotExist() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IStreamManager.StreamDoesNotExist.selector,
                999
            )
        );
        manager.getStream(999);
    }

    /// @notice Reverts when an unauthorized caller tries to withdraw.
    function test_RevertIf_UnauthorizedWithdraw() public {
        uint256 streamId = _createDefaultStream();
        vm.warp(block.timestamp + 2 + 1800); // halfway

        address eve = makeAddr("eve");
        vm.expectRevert(
            abi.encodeWithSelector(
                IStreamManager.UnauthorizedCaller.selector,
                eve
            )
        );
        vm.prank(eve);
        manager.withdrawFromStream(streamId, 1e18);
    }

    /// @notice Reverts when an unauthorized caller tries to cancel.
    function test_RevertIf_UnauthorizedCancel() public {
        uint256 streamId = _createDefaultStream();

        address eve = makeAddr("eve");
        vm.expectRevert(
            abi.encodeWithSelector(
                IStreamManager.UnauthorizedCaller.selector,
                eve
            )
        );
        vm.prank(eve);
        manager.cancelStream(streamId);
    }

    /// @notice Reverts when withdrawing more than available.
    function test_RevertIf_WithdrawExceedsBalance() public {
        uint256 streamId = _createDefaultStream();
        // Warp to just after start (+2s into stream: 2 * 1e18 = 2e18 available)
        vm.warp(block.timestamp + 1 + 2);

        vm.expectRevert(IStreamManager.ArithmeticOverflow.selector);
        vm.prank(bob);
        manager.withdrawFromStream(streamId, DEPOSIT); // way too much
    }

    /// @notice Reverts when withdrawing zero.
    function test_RevertIf_WithdrawZero() public {
        uint256 streamId = _createDefaultStream();
        vm.warp(block.timestamp + 1 + 100);

        vm.expectRevert(IStreamManager.ArithmeticOverflow.selector);
        vm.prank(bob);
        manager.withdrawFromStream(streamId, 0);
    }

    // ══════════════════════════════════════════════
    //  3. TIME MANIPULATION TESTS (Cheatcodes)
    // ══════════════════════════════════════════════

    /// @notice Withdraw halfway through the stream — expect exactly 50% of deposit.
    function test_WithdrawHalfway() public {
        uint256 streamId = _createDefaultStream();
        IStreamManager.Stream memory s = manager.getStream(streamId);

        // ── Warp to midpoint ──
        uint256 midpoint = s.startTime + (STREAM_DURATION / 2);
        vm.warp(midpoint);

        uint256 expectedAmount = DEPOSIT / 2; // 1800e18

        // ── Verify balanceOf before withdrawal ──
        uint256 recipientBal = manager.balanceOf(streamId, bob);
        assertEq(
            recipientBal,
            expectedAmount,
            "recipient balance should be 50%"
        );

        uint256 senderBal = manager.balanceOf(streamId, alice);
        assertEq(senderBal, expectedAmount, "sender balance should be 50%");

        // ── Withdraw ──
        vm.expectEmit(true, true, false, true);
        emit IStreamManager.WithdrawFromStream(streamId, bob, expectedAmount);

        vm.prank(bob);
        manager.withdrawFromStream(streamId, expectedAmount);

        // ── Assertions ──
        assertEq(
            token.balanceOf(bob),
            expectedAmount,
            "bob should receive 50%"
        );

        IStreamManager.Stream memory updated = manager.getStream(streamId);
        assertEq(
            updated.remainingBalance,
            DEPOSIT - expectedAmount,
            "remaining should decrease"
        );

        // Recipient balance should now be 0 (just withdrew everything available)
        assertEq(
            manager.balanceOf(streamId, bob),
            0,
            "recipient should have 0 after withdraw"
        );
    }

    /// @notice Withdraw at stream end — should get full deposit.
    function test_WithdrawAfterStreamEnds() public {
        uint256 streamId = _createDefaultStream();
        IStreamManager.Stream memory s = manager.getStream(streamId);

        // Warp past the end
        vm.warp(s.stopTime + 100);

        uint256 recipientBal = manager.balanceOf(streamId, bob);
        assertEq(
            recipientBal,
            DEPOSIT,
            "recipient should have full deposit after end"
        );

        vm.prank(bob);
        manager.withdrawFromStream(streamId, DEPOSIT);

        assertEq(token.balanceOf(bob), DEPOSIT);
        assertEq(
            token.balanceOf(address(manager)),
            0,
            "contract should be empty"
        );

        // Stream should be deleted after full drain
        vm.expectRevert(
            abi.encodeWithSelector(
                IStreamManager.StreamDoesNotExist.selector,
                streamId
            )
        );
        manager.getStream(streamId);
    }

    /// @notice Before stream start, recipient balance should be 0.
    function test_BalanceBeforeStart() public {
        uint256 streamId = _createDefaultStream();

        // Still before start (block.timestamp hasn't moved past startTime)
        assertEq(manager.balanceOf(streamId, bob), 0, "no tokens unlocked yet");
        assertEq(
            manager.balanceOf(streamId, alice),
            DEPOSIT,
            "sender has full balance"
        );
    }

    /// @notice Cancel at 1/3 — sender recovers 2/3, recipient gets 1/3.
    function test_CancelStream() public {
        uint256 streamId = _createDefaultStream();
        IStreamManager.Stream memory s = manager.getStream(streamId);

        // ── Warp to 1/3 of the duration ──
        uint256 oneThird = s.startTime + (STREAM_DURATION / 3);
        vm.warp(oneThird);

        uint256 expectedRecipient = DEPOSIT / 3; // 1200e18
        uint256 expectedSender = DEPOSIT - expectedRecipient; // 2400e18

        uint256 aliceBefore = token.balanceOf(alice);

        // ── Expect event ──
        vm.expectEmit(true, false, false, true);
        emit IStreamManager.StreamCanceled(
            streamId,
            expectedSender,
            expectedRecipient
        );

        // ── Cancel as sender ──
        vm.prank(alice);
        manager.cancelStream(streamId);

        // ── Assertions ──
        assertEq(
            token.balanceOf(bob),
            expectedRecipient,
            "bob should receive 1/3 of deposit"
        );
        assertEq(
            token.balanceOf(alice),
            aliceBefore + expectedSender,
            "alice should recover 2/3 of deposit"
        );
        assertEq(
            token.balanceOf(address(manager)),
            0,
            "contract should be drained"
        );

        // ── Storage purged ──
        vm.expectRevert(
            abi.encodeWithSelector(
                IStreamManager.StreamDoesNotExist.selector,
                streamId
            )
        );
        manager.getStream(streamId);
    }

    /// @notice Recipient can also cancel the stream.
    function test_CancelStreamByRecipient() public {
        uint256 streamId = _createDefaultStream();
        IStreamManager.Stream memory s = manager.getStream(streamId);

        vm.warp(s.startTime + (STREAM_DURATION / 2));

        uint256 aliceBefore = token.balanceOf(alice);

        vm.prank(bob);
        manager.cancelStream(streamId);

        assertEq(token.balanceOf(bob), DEPOSIT / 2, "bob gets 50%");
        assertEq(
            token.balanceOf(alice),
            aliceBefore + DEPOSIT / 2,
            "alice gets 50%"
        );
    }

    /// @notice Partial withdraw, then cancel — totals should be correct.
    function test_WithdrawThenCancel() public {
        uint256 streamId = _createDefaultStream();
        IStreamManager.Stream memory s = manager.getStream(streamId);

        // Warp to 1/4 and withdraw
        vm.warp(s.startTime + (STREAM_DURATION / 4));
        uint256 quarterAmount = DEPOSIT / 4;

        vm.prank(bob);
        manager.withdrawFromStream(streamId, quarterAmount);
        assertEq(token.balanceOf(bob), quarterAmount);

        // Warp to 1/2 and cancel
        vm.warp(s.startTime + (STREAM_DURATION / 2));

        uint256 aliceBefore = token.balanceOf(alice);

        vm.prank(alice);
        manager.cancelStream(streamId);

        // Bob should get the additional 1/4 earned (total 1/2 - already withdrawn 1/4)
        uint256 bobAdditional = DEPOSIT / 2 - quarterAmount; // another 1/4
        assertEq(
            token.balanceOf(bob),
            quarterAmount + bobAdditional,
            "bob total = 1/2 deposit"
        );

        // Alice recovers the other half
        assertEq(
            token.balanceOf(alice),
            aliceBefore + DEPOSIT / 2,
            "alice recovers 1/2"
        );
    }

    // ══════════════════════════════════════════════
    //  4. STATELESS FUZZING (StreamMath)
    // ══════════════════════════════════════════════

    /// @notice Fuzz: unlocked amount should NEVER exceed deposit.
    /// @dev Also verifies truncation favors the protocol/sender (no money creation).
    function testFuzz_CalculateUnlockedAmount(
        uint256 deposit,
        uint256 duration,
        uint256 elapsedTime
    ) public pure {
        // ── Bound inputs ──
        duration = bound(duration, 1, 100 * 365 days); // 1s to 100 years
        deposit = bound(deposit, duration, type(uint128).max); // >= duration to ensure rate >= 1

        // Ensure deposit is divisible by duration (as required by ratePerSecond)
        deposit = (deposit / duration) * duration;
        vm.assume(deposit > 0);

        uint256 rate = StreamMath.ratePerSecond(deposit, duration);

        // Bound elapsed time from 0 to 2x duration (test beyond stream end)
        elapsedTime = bound(elapsedTime, 0, duration * 2);

        uint256 startTime = 1000; // arbitrary fixed start
        uint256 stopTime = startTime + duration;
        uint256 currentTime = startTime + elapsedTime;

        uint256 unlocked = StreamMath.streamedAmount(
            deposit,
            currentTime,
            startTime,
            stopTime,
            rate
        );

        // ── INVARIANT 1: unlocked <= deposit ──
        assertLe(unlocked, deposit, "unlocked must never exceed deposit");

        // ── INVARIANT 2: at or after stopTime, unlocked == deposit ──
        if (currentTime >= stopTime) {
            assertEq(
                unlocked,
                deposit,
                "full amount should be unlocked after end"
            );
        }

        // ── INVARIANT 3: before startTime, unlocked == 0 ──
        if (currentTime <= startTime) {
            assertEq(unlocked, 0, "nothing unlocked before start");
        }

        // ── INVARIANT 4: truncation favors sender (no money creation) ──
        // unlocked should be <= proportional amount (deposit * elapsed / duration)
        // This holds because rate = deposit/duration (floor div), so rate*delta <= deposit
        assertLe(unlocked, deposit, "no money creation");
    }

    /// @notice Fuzz: sender + recipient balances should never exceed remaining balance.
    function testFuzz_BalanceSumInvariant(
        uint256 deposit,
        uint256 duration,
        uint256 elapsedTime,
        uint256 withdrawnPortion
    ) public pure {
        duration = bound(duration, 1, 100 * 365 days);
        deposit = bound(deposit, duration, type(uint128).max);
        deposit = (deposit / duration) * duration;
        vm.assume(deposit > 0);

        uint256 rate = StreamMath.ratePerSecond(deposit, duration);

        elapsedTime = bound(elapsedTime, 0, duration);

        uint256 startTime = 1000;
        uint256 stopTime = startTime + duration;
        uint256 currentTime = startTime + elapsedTime;

        // Simulate a partial withdrawal (0% to 100% of earned so far)
        uint256 earned = StreamMath.streamedAmount(
            deposit,
            currentTime,
            startTime,
            stopTime,
            rate
        );
        withdrawnPortion = bound(withdrawnPortion, 0, earned);
        uint256 remainingBalance = deposit - withdrawnPortion;

        uint256 recipBal = StreamMath.recipientBalance(
            deposit,
            remainingBalance,
            currentTime,
            startTime,
            stopTime,
            rate
        );
        uint256 sendBal = StreamMath.senderBalance(
            deposit,
            remainingBalance,
            currentTime,
            startTime,
            stopTime,
            rate
        );

        // ── INVARIANT: recipBal + sendBal == remainingBalance ──
        assertEq(
            recipBal + sendBal,
            remainingBalance,
            "sender + recipient must equal remaining"
        );
    }

    /// @notice Fuzz: ratePerSecond * duration must always equal deposit.
    function testFuzz_RatePrecision(
        uint256 deposit,
        uint256 duration
    ) public pure {
        duration = bound(duration, 1, 100 * 365 days);
        deposit = bound(deposit, duration, type(uint128).max);
        deposit = (deposit / duration) * duration;
        vm.assume(deposit > 0);

        uint256 rate = StreamMath.ratePerSecond(deposit, duration);

        assertEq(
            rate * duration,
            deposit,
            "rate * duration must exactly equal deposit"
        );
        assertGt(rate, 0, "rate must be positive");
    }

    /// @notice Fuzz: deltaOf should always be clamped to [0, duration].
    function testFuzz_DeltaClamped(
        uint256 startTime,
        uint256 duration,
        uint256 currentTime
    ) public pure {
        startTime = bound(startTime, 1, type(uint128).max);
        duration = bound(duration, 1, type(uint64).max);
        uint256 stopTime = startTime + duration;
        currentTime = bound(currentTime, 0, type(uint128).max);

        uint256 delta = StreamMath.deltaOf(currentTime, startTime, stopTime);

        assertLe(delta, duration, "delta must never exceed duration");
    }
}
