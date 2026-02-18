'use client';

import { Music, Play, Pause, Square, Loader2, DollarSign, Radio } from 'lucide-react';
import { Track } from '@/data/tracks';

// Player states matching the state machine
export type PlayerState =
    | 'idle'
    | 'approving'
    | 'creating_stream'
    | 'streaming'
    | 'canceling';

interface PlayerBarProps {
    currentTrack: Track | null;
    playerState: PlayerState;
    displayCost: string;
    formattedRate: string;
    progress: number;
    onPlay: () => void;
    onPause: () => void;
}

export function PlayerBar({
    currentTrack,
    playerState,
    displayCost,
    formattedRate,
    progress,
    onPlay,
    onPause,
}: PlayerBarProps) {
    const isStreaming = playerState === 'streaming';
    const isLoading =
        playerState === 'approving' ||
        playerState === 'creating_stream' ||
        playerState === 'canceling';
    const canPlay = currentTrack && playerState === 'idle';
    const canPause = playerState === 'streaming';

    const getStatusText = () => {
        switch (playerState) {
            case 'idle':
                return currentTrack ? 'Ready to stream' : 'Select a track';
            case 'approving':
                return 'Approving WMON spend...';
            case 'creating_stream':
                return 'Opening payment stream...';
            case 'streaming':
                return 'Streaming on-chain';
            case 'canceling':
                return 'Settling payment...';
            default:
                return '';
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* Progress bar */}
            {isStreaming && (
                <div className="h-0.5 bg-[var(--bg-secondary)]">
                    <div
                        className="h-full bg-gradient-to-r from-[#836EF9] to-[#00FF88] transition-all duration-200"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            )}

            <div className="glass-strong">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-6">
                        {/* Left: Track info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {currentTrack ? (
                                <>
                                    <div
                                        className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center shadow-lg ${isStreaming ? 'animate-pulse-neon' : ''
                                            }`}
                                        style={{
                                            background: `linear-gradient(135deg, ${currentTrack.coverGradient[0]}, ${currentTrack.coverGradient[1]})`,
                                        }}
                                    >
                                        <Music className="w-5 h-5 text-white/80" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                            {currentTrack.title}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">
                                            {currentTrack.artist}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 text-[var(--text-muted)]">
                                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-card)] flex items-center justify-center">
                                        <Music className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm">Select a track to start streaming</p>
                                </div>
                            )}
                        </div>

                        {/* Center: Play/Pause control */}
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={canPause ? onPause : onPlay}
                                disabled={!canPlay && !canPause}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isStreaming
                                    ? 'bg-gradient-to-br from-[#836EF9] to-[#00FF88] glow-purple hover:scale-105 active:scale-95'
                                    : isLoading
                                        ? 'bg-[var(--bg-card)] border border-[#836EF9]/30 cursor-wait'
                                        : canPlay
                                            ? 'bg-[#836EF9] hover:bg-[#A78BFA] glow-purple hover:scale-105 active:scale-95 cursor-pointer'
                                            : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-6 h-6 text-[#836EF9] animate-spin" />
                                ) : isStreaming ? (
                                    <Pause className="w-6 h-6 text-white" fill="white" />
                                ) : (
                                    <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                                )}
                            </button>
                            <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                                {getStatusText()}
                            </span>
                        </div>

                        {/* Right: Cost display */}
                        <div className="flex-1 flex justify-end">
                            {playerState !== 'idle' ? (
                                <div className="flex flex-col items-end gap-1">
                                    {/* Main cost counter */}
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-[#00FF88]" />
                                        <span
                                            className="cost-counter text-xl font-semibold text-[#00FF88] text-glow-green"
                                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                        >
                                            {displayCost}
                                        </span>
                                        <span className="text-xs text-[var(--text-muted)]">MON</span>
                                    </div>

                                    {/* Rate indicator */}
                                    {isStreaming && (
                                        <div className="flex items-center gap-1.5">
                                            <Radio className="w-3 h-3 text-[#836EF9] animate-pulse" />
                                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                                {formattedRate} MON/sec
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <DollarSign className="w-4 h-4" />
                                    <span
                                        className="cost-counter text-xl font-semibold"
                                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                    >
                                        0.000000
                                    </span>
                                    <span className="text-xs">MON</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
