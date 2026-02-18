export interface Track {
    id: number;
    title: string;
    artist: string;
    duration: string;
    durationSeconds: number;
    audioUrl: string;
    coverGradient: [string, string]; // Two colors for gradient cover
    artistAddress: `0x${string}`;    // Recipient address for the stream
}

export const TRACKS: Track[] = [
    {
        id: 1,
        title: 'Neon Drift',
        artist: 'Synthwave Collective',
        duration: '3:42',
        durationSeconds: 222,
        audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverGradient: ['#836EF9', '#4F46E5'],
        artistAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    },
    {
        id: 2,
        title: 'Midnight Protocol',
        artist: 'Digital Nomads',
        duration: '4:15',
        durationSeconds: 255,
        audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverGradient: ['#00FF88', '#059669'],
        artistAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    },
    {
        id: 3,
        title: 'Chain Reaction',
        artist: 'Block Beats',
        duration: '3:58',
        durationSeconds: 238,
        audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
        coverGradient: ['#F43F5E', '#EC4899'],
        artistAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    },
];
