import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate the precise remaining time using server startTime and duration.
 * Syncs the countdown based on current Date to ensure correct delta regardless of when client joined.
 */
export const usePollTimer = (startTime: string | null, durationSeconds: number) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (!startTime || !durationSeconds) {
            setTimeLeft(0);
            return;
        }

        const start = new Date(startTime).getTime();
        const finish = start + (durationSeconds * 1000);

        const interval = setInterval(() => {
            const now = Date.now();
            const difference = finish - now;

            if (difference <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(Math.ceil(difference / 1000));
            }
        }, 500); // 500ms for more responsive ticking

        return () => clearInterval(interval);
    }, [startTime, durationSeconds]);

    return timeLeft;
};
