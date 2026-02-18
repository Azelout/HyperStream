'use client';

import { Music, Play, Clock, User } from 'lucide-react';
import { Track } from '@/data/tracks';

interface TrackListProps {
    tracks: Track[];
    currentTrack: Track | null;
    isStreaming: boolean;
    onSelectTrack: (track: Track) => void;
}

export function TrackList({
    tracks,
    currentTrack,
    isStreaming,
    onSelectTrack,
}: TrackListProps) {
    return (
        <div className="w-full">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#836EF9]/20 to-[#836EF9]/5 flex items-center justify-center">
                    <Music className="w-4 h-4 text-[#836EF9]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        Featured Tracks
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                        Stream music · Pay artists per second
                    </p>
                </div>
            </div>

            {/* Track list */}
            <div className="space-y-2">
                {tracks.map((track, index) => {
                    const isActive = currentTrack?.id === track.id;
                    const isCurrentlyStreaming = isActive && isStreaming;

                    return (
                        <button
                            key={track.id}
                            onClick={() => onSelectTrack(track)}
                            className={`track-row w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                ${isActive
                                    ? 'bg-[var(--bg-card-hover)] border border-[#836EF9]/30'
                                    : 'bg-transparent border border-transparent hover:border-[var(--border-subtle)]'
                                }`}
                        >
                            {/* Track number / Play indicator */}
                            <div className="w-8 h-8 flex items-center justify-center shrink-0">
                                {isCurrentlyStreaming ? (
                                    <div className="flex items-center gap-0.5">
                                        <span className="w-0.5 h-3 bg-[#00FF88] rounded-full animate-pulse" />
                                        <span className="w-0.5 h-4 bg-[#00FF88] rounded-full animate-pulse [animation-delay:150ms]" />
                                        <span className="w-0.5 h-2 bg-[#00FF88] rounded-full animate-pulse [animation-delay:300ms]" />
                                    </div>
                                ) : (
                                    <span className="text-sm text-[var(--text-muted)] group-hover:hidden">
                                        {index + 1}
                                    </span>
                                )}
                                {!isCurrentlyStreaming && (
                                    <Play className="w-4 h-4 text-[var(--text-primary)] hidden group-hover:block" />
                                )}
                            </div>

                            {/* Cover art gradient */}
                            <div
                                className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${track.coverGradient[0]}, ${track.coverGradient[1]})`,
                                }}
                            >
                                <Music className="w-5 h-5 text-white/80" />
                            </div>

                            {/* Track info */}
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm font-medium truncate ${isActive
                                            ? 'text-[#836EF9]'
                                            : 'text-[var(--text-primary)]'
                                        }`}
                                >
                                    {track.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <User className="w-3 h-3 text-[var(--text-muted)]" />
                                    <p className="text-xs text-[var(--text-secondary)] truncate">
                                        {track.artist}
                                    </p>
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                                <span className="text-xs text-[var(--text-muted)] font-mono">
                                    {track.duration}
                                </span>
                            </div>

                            {/* Streaming badge */}
                            {isCurrentlyStreaming && (
                                <div className="shrink-0 px-2 py-0.5 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20">
                                    <span className="text-[10px] font-medium text-[#00FF88] uppercase tracking-wider">
                                        Live
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
