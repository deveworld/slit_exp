import React, { useRef, useEffect } from 'react';

const IntensityGraph = ({ grid, width, height, screenPos = 85 }) => {
    const canvasRef = useRef(null);
    const intensityAccum = useRef(null);
    const screenPosRef = useRef(screenPos);
    const prevScreenPosRef = useRef(screenPos);

    // Update ref when prop changes
    useEffect(() => {
        screenPosRef.current = screenPos;
        // Reset accumulator when screen position changes
        if (prevScreenPosRef.current !== screenPos && intensityAccum.current) {
            intensityAccum.current.fill(0);
        }
        prevScreenPosRef.current = screenPos;
    }, [screenPos]);

    useEffect(() => {
        if (!grid) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Initialize intensity accumulator for time-averaging
        if (!intensityAccum.current || intensityAccum.current.length !== grid.height) {
            intensityAccum.current = new Float32Array(grid.height);
        }

        const frame = () => {
            if (!ctx || !grid.u) return;

            // Get current screenPos from ref (updates dynamically)
            const screenX = Math.floor(grid.width * (screenPosRef.current / 100));

            const accum = intensityAccum.current;
            const decay = 0.92; // Slightly faster response

            // Update accumulated intensity
            for (let gridY = 0; gridY < grid.height; gridY++) {
                const idx = gridY * grid.width + screenX;
                const amp = grid.u[idx];
                const instantIntensity = amp * amp;
                accum[gridY] = accum[gridY] * decay + instantIntensity * (1 - decay);
            }

            // Find max for normalization
            let maxIntensity = 0;
            for (let i = 0; i < accum.length; i++) {
                if (accum[i] > maxIntensity) maxIntensity = accum[i];
            }
            if (maxIntensity < 0.001) maxIntensity = 0.001;

            // Clear background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            // Draw intensity bars
            for (let y = 0; y < height; y++) {
                const gridY = Math.floor((y / height) * grid.height);
                const normalizedIntensity = Math.sqrt(accum[gridY] / maxIntensity);
                const barWidth = normalizedIntensity * width * 0.95;

                if (barWidth > 0.5) {
                    const r = Math.floor(normalizedIntensity * 100);
                    const g = Math.floor(150 + normalizedIntensity * 105);
                    const b = Math.floor(normalizedIntensity * 157);
                    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    ctx.fillRect(0, y, barWidth, 1);
                }
            }

            // Draw center line for reference
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(0, height / 2, width, 1);

            requestAnimationFrame(frame);
        };

        const anim = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(anim);
    }, [grid, width, height]);

    return <canvas ref={canvasRef} width={width} height={height} style={{ borderLeft: '1px solid #333' }} />;
};

export default IntensityGraph;



