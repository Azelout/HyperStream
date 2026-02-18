'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Create audio element on mount
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            setIsLoaded(true);
        });

        audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
        });

        audio.addEventListener('ended', () => {
            setIsPlaying(false);
        });

        audio.addEventListener('error', () => {
            setIsLoaded(false);
        });

        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, []);

    const loadTrack = useCallback((url: string) => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        audioRef.current.src = url;
        audioRef.current.load();
        setIsPlaying(false);
        setCurrentTime(0);
        setIsLoaded(false);
    }, []);

    const play = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(console.error);
    }, []);

    const pause = useCallback(() => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        setIsPlaying(false);
    }, []);

    const toggle = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    // Progress as a percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return {
        isPlaying,
        currentTime,
        duration,
        progress,
        isLoaded,
        loadTrack,
        play,
        pause,
        toggle,
    };
}
