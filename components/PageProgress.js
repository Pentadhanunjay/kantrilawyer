'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        // Start progress on route change
        setVisible(true);
        setProgress(10);

        timerRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 85) { clearInterval(timerRef.current); return 85; }
                return prev + Math.random() * 15;
            });
        }, 120);

        // Complete after a short delay
        const complete = setTimeout(() => {
            clearInterval(timerRef.current);
            setProgress(100);
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 300);
        }, 400);

        return () => {
            clearInterval(timerRef.current);
            clearTimeout(complete);
        };
    }, [pathname]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0,
            width: `${Math.min(progress, 100)}%`,
            height: '3px',
            background: 'linear-gradient(90deg, #10b981, #34d399)',
            zIndex: 99999,
            transition: progress === 100 ? 'width 0.2s ease, opacity 0.3s ease' : 'width 0.1s ease',
            opacity: visible ? 1 : 0,
            boxShadow: '0 0 10px rgba(16,185,129,0.6)',
            borderRadius: '0 2px 2px 0',
        }} />
    );
}
