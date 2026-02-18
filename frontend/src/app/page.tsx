'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { Shield, Radio, Waves } from 'lucide-react';

import { Header } from '@/components/Header';
import { TrackList } from '@/components/TrackList';
import { PlayerBar, PlayerState } from '@/components/PlayerBar';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { useStreamManager } from '@/hooks/useStreamManager';
import { useStreamCostTracker } from '@/hooks/useStreamCostTracker';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { TRACKS, Track } from '@/data/tracks';
import { DEFAULT_DEPOSIT } from '@/config/contracts';

export default function Home() {
  const { isConnected } = useAccount();

  // ── Local state ───────────────────────────────────────────
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [activeStreamId, setActiveStreamId] = useState<bigint | null>(null);
  const [streamStartTimestamp, setStreamStartTimestamp] = useState<number | null>(null);
  const [streamRatePerSecond, setStreamRatePerSecond] = useState<bigint | null>(null);

  // ── Hooks ─────────────────────────────────────────────────
  const tokenApproval = useTokenApproval(DEFAULT_DEPOSIT);
  const streamManager = useStreamManager();
  const audioPlayer = useAudioPlayer();
  const costTracker = useStreamCostTracker({
    ratePerSecond: streamRatePerSecond,
    startTimestamp: streamStartTimestamp,
    isActive: playerState === 'streaming',
  });

  // ── Select track ──────────────────────────────────────────
  const handleSelectTrack = useCallback(
    (track: Track) => {
      // If currently streaming, don't allow track change
      if (playerState === 'streaming' || playerState !== 'idle') {
        toast.error('Stop the current stream before switching tracks');
        return;
      }
      setCurrentTrack(track);
      audioPlayer.loadTrack(track.audioUrl);
    },
    [playerState, audioPlayer]
  );

  // ── Play flow: idle → approve → createStream → streaming ─
  const handlePlay = useCallback(() => {
    if (!isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!currentTrack) {
      toast.error('Select a track first');
      return;
    }

    // Step 0: Check WMON balance
    const wmonBalance = tokenApproval.balance || BigInt(0);
    if (wmonBalance < DEFAULT_DEPOSIT) {
      toast.error(
        `Insufficient WMON balance. You have ${wmonBalance.toString()} but need ${DEFAULT_DEPOSIT.toString()} (0.01 WMON). Please wrap some MON first.`,
        { duration: 6000 }
      );
      return;
    }

    // Step 1: Check approval
    if (!tokenApproval.isApproved) {
      setPlayerState('approving');
      toast('Requesting WMON approval...', { icon: '🔐' });
      tokenApproval.approve();
      return;
    }

    // Step 2: Create stream (if already approved)
    setPlayerState('creating_stream');
    toast('Creating payment stream...', { icon: '⚡' });
    streamManager.createStream(currentTrack.artistAddress);
  }, [isConnected, currentTrack, tokenApproval, streamManager]);

  // ── Pause flow: streaming → cancelStream → idle ───────────
  const handlePause = useCallback(() => {
    if (!activeStreamId) return;

    setPlayerState('canceling');
    toast('Settling payment...', { icon: '💰' });
    streamManager.cancelStream(activeStreamId);
    audioPlayer.pause();
  }, [activeStreamId, streamManager, audioPlayer]);

  // ── Effect: Handle approval success → auto-create stream ──
  useEffect(() => {
    if (
      playerState === 'approving' &&
      tokenApproval.isApproveSuccess &&
      currentTrack
    ) {
      toast.success('WMON approved!');
      tokenApproval.refetchAllowance();

      // Auto-proceed to create stream
      setPlayerState('creating_stream');
      toast('Creating payment stream...', { icon: '⚡' });
      streamManager.createStream(currentTrack.artistAddress);
    }
  }, [tokenApproval.isApproveSuccess, playerState, currentTrack, streamManager, tokenApproval]);

  // ── Effect: Handle stream creation success ────────────────
  useEffect(() => {
    if (playerState === 'creating_stream' && streamManager.isCreateSuccess) {
      const streamId = streamManager.getStreamIdFromReceipt();
      if (streamId) {
        setActiveStreamId(streamId);

        // Calculate rate: deposit / duration (in token smallest unit per second)
        const duration = DEFAULT_DEPOSIT / BigInt(3600);
        setStreamRatePerSecond(duration);
        setStreamStartTimestamp(Math.floor(Date.now() / 1000));

        setPlayerState('streaming');
        audioPlayer.play();
        toast.success('🎵 Streaming started! Pay-per-second active.');
      }
    }
  }, [streamManager.isCreateSuccess, playerState, streamManager, audioPlayer]);

  // ── Effect: Handle stream cancellation success ────────────
  useEffect(() => {
    if (playerState === 'canceling' && streamManager.isCancelSuccess) {
      const finalCost = costTracker.displayCost;
      toast.success(`Stream settled! Total: ${finalCost} MON`);

      // Reset state
      setPlayerState('idle');
      setActiveStreamId(null);
      setStreamStartTimestamp(null);
      setStreamRatePerSecond(null);
      costTracker.reset();
      streamManager.resetCreate();
      streamManager.resetCancel();
      tokenApproval.resetApprove();
    }
  }, [streamManager.isCancelSuccess, playerState, costTracker, streamManager, tokenApproval]);

  return (
    <div className="min-h-screen pb-32">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero section */}
        <div className="mb-12 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-[#836EF9]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#836EF9] font-medium">
              On Monad Testnet
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-3">
            Music that{' '}
            <span className="bg-gradient-to-r from-[#836EF9] to-[#00FF88] bg-clip-text text-transparent">
              pays artists
            </span>
            <br />
            every second.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl">
            No subscriptions. No middlemen. Just continuous on-chain payments
            streamed directly to creators while you listen.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="glass rounded-xl px-5 py-4 animate-slide-up [animation-delay:100ms]">
            <Shield className="w-5 h-5 text-[#836EF9] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Deposit & Stream
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Lock 0.01 MON. Unlocks linearly as you listen.
            </p>
          </div>
          <div className="glass rounded-xl px-5 py-4 animate-slide-up [animation-delay:200ms]">
            <Waves className="w-5 h-5 text-[#00FF88] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Pay Per Second
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              ~0.000003 MON/sec flows to the artist.
            </p>
          </div>
          <div className="glass rounded-xl px-5 py-4 animate-slide-up [animation-delay:300ms]">
            <Radio className="w-5 h-5 text-[#F43F5E] mb-2" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Instant Settlement
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Pause anytime. Unspent funds returned instantly.
            </p>
          </div>
        </div>

        {/* Wallet connection prompt */}
        {!isConnected && (
          <div className="glass rounded-xl p-8 text-center mb-10 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#836EF9]/20 to-[#00FF88]/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#836EF9]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Connect a wallet with Monad Testnet MON and WMON to start
              streaming music on-chain.
            </p>
          </div>
        )}

        {/* Track list */}
        <div className="animate-slide-up [animation-delay:400ms]">
          <TrackList
            tracks={TRACKS}
            currentTrack={currentTrack}
            isStreaming={playerState === 'streaming'}
            onSelectTrack={handleSelectTrack}
          />
        </div>
      </main>

      {/* Sticky player bar */}
      <PlayerBar
        currentTrack={currentTrack}
        playerState={playerState}
        displayCost={costTracker.displayCost}
        formattedRate={costTracker.formattedRate}
        progress={audioPlayer.progress}
        onPlay={handlePlay}
        onPause={handlePause}
      />
    </div>
  );
}
