'use client';
import { useState, useRef, useEffect } from 'react';
import { Lock, ShoppingCart, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const PREVIEW_SECONDS = 30;

// ── URL helpers ──────────────────────────────────────────────────────────────

const getYouTubeId = (url) => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
};

const getVimeoId = (url) => {
    if (!url) return '';
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : '';
};

const isYouTubeUrl = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
const isVimeoUrl = (url) => url && url.includes('vimeo.com');

// Build safe embed URL
const getEmbedUrl = (url, isPurchased) => {
    if (isYouTubeUrl(url)) {
        const id = getYouTubeId(url);
        if (!id) return null;
        // For purchased users: full playback, no time limit
        // For free preview: we use the IFrame API to limit to 30s
        return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0&modestbranding=1&autoplay=0`;
    }
    if (isVimeoUrl(url)) {
        const id = getVimeoId(url);
        if (!id) return null;
        return `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0`;
    }
    return null; // direct mp4 / other
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideoPlayer({ videoUrl, isPurchased, courseId }) {
    const [isLocked, setIsLocked] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(PREVIEW_SECONDS);
    const videoRef = useRef(null);
    const playerRef = useRef(null);   // YT.Player instance
    const timerRef = useRef(null);
    const ytId = `yt-player-${courseId}-${Date.now()}`;
    const ytIdRef = useRef(ytId);

    const isYT = isYouTubeUrl(videoUrl);
    const isVimeo = isVimeoUrl(videoUrl);
    const isEmbed = isYT || isVimeo;
    const embedUrl = getEmbedUrl(videoUrl, isPurchased);

    // ── YouTube IFrame API (only for non-purchased — to enforce 30s limit) ────
    useEffect(() => {
        // For purchased users we just show the plain iframe — no limit needed
        if (!isYT || isPurchased) return;

        const videoId = getYouTubeId(videoUrl);
        if (!videoId) return;

        const containerId = ytIdRef.current;

        const initPlayer = () => {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player(containerId, {
                videoId,
                playerVars: { autoplay: 0, controls: 1, rel: 0, modestbranding: 1 },
                events: {
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) startCountdown();
                        if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) clearCountdown();
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            if (!document.getElementById('yt-api-script')) {
                const script = document.createElement('script');
                script.id = 'yt-api-script';
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                document.head.appendChild(script);
            }
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            clearCountdown();
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isYT, isPurchased, videoUrl]);

    // ── Countdown helpers ────────────────────────────────────────────────────
    const startCountdown = () => {
        if (timerRef.current) return;
        timerRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) { lockVideo(); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    const clearCountdown = () => {
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };

    const lockVideo = () => {
        clearCountdown();
        setIsLocked(true);
        if (playerRef.current?.stopVideo) playerRef.current.stopVideo();
        if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = PREVIEW_SECONDS; }
    };

    // ── Native video time handler ────────────────────────────────────────────
    const handleTimeUpdate = () => {
        if (isPurchased || !videoRef.current) return;
        const curr = videoRef.current.currentTime;
        setSecondsLeft(Math.max(0, PREVIEW_SECONDS - Math.floor(curr)));
        if (curr >= PREVIEW_SECONDS) lockVideo();
    };

    // ── No URL state ─────────────────────────────────────────────────────────
    if (!videoUrl) {
        return (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#111827', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <PlayCircle size={56} style={{ color: '#374151', opacity: 0.5 }} />
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No video URL provided for this lecture.</p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>

            {/* ── YouTube (non-purchased = IFrame API div; purchased = plain iframe) ── */}
            {isYT && (
                isPurchased ? (
                    // Full, unlimited playback for purchased users via plain iframe
                    <iframe
                        key={videoUrl}
                        src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?rel=0&modestbranding=1`}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Course video"
                    />
                ) : (
                    // Preview-limited via YT API
                    <div id={ytIdRef.current} style={{ width: '100%', height: '100%' }} />
                )
            )}

            {/* ── Vimeo embed ── */}
            {isVimeo && (
                <iframe
                    key={videoUrl}
                    src={embedUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="Course video"
                />
            )}

            {/* ── Native .mp4 / direct link ── */}
            {!isEmbed && (
                <video
                    ref={videoRef}
                    key={videoUrl}
                    src={videoUrl}
                    style={{ width: '100%', height: '100%' }}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                />
            )}

            {/* ── Preview countdown badge (not purchased, not locked) ── */}
            {!isPurchased && !isLocked && (
                <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                    color: secondsLeft <= 10 ? '#ef4444' : '#fff',
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700,
                    border: `1px solid ${secondsLeft <= 10 ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                    zIndex: 5, transition: 'color 0.3s, border-color 0.3s'
                }}>
                    🔓 Preview: {secondsLeft}s left
                </div>
            )}

            {/* ── Lock overlay after 30s preview ── */}
            <AnimatePresence>
                {isLocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(10px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', padding: '2rem', textAlign: 'center', zIndex: 10
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                width: '80px', height: '80px',
                                background: 'linear-gradient(135deg, #059669, #047857)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(5,150,105,0.4)'
                            }}
                        >
                            <Lock size={36} color="#fff" />
                        </motion.div>
                        <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.8rem', fontWeight: 800 }}>
                            Your 30-Second Preview Has Ended
                        </h3>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '360px', fontSize: '0.95rem', lineHeight: 1.6 }}>
                            Purchase this course to unlock full access to all lessons.
                        </p>
                        <Link
                            href={`/checkout?type=courses&id=${courseId}`}
                            className="btn-primary"
                            style={{ padding: '1rem 2.5rem', fontSize: '1.05rem', borderRadius: '14px', gap: '10px' }}
                        >
                            <ShoppingCart size={20} /> Buy Full Course
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
