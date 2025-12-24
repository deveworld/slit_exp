import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FDTDGrid } from '../simulation/Engine';
import { Renderer } from '../simulation/Renderer';

// Fixed simulation resolution for performance
const SIM_WIDTH = 600;
const SIM_HEIGHT = 450;

const SimulationCanvas = forwardRef(({
    slitGap = 40,
    slitWidth = 6,
    frequency = 0.2,
    waveEnabled = true,
    screenPos = 85,
    onFPSUpdate,
    onGridInit
}, ref) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const simRef = useRef(null);
    const paramsRef = useRef({ frequency, waveEnabled, screenPos });
    const sourcePosRef = useRef({ x: SIM_WIDTH / 4, y: SIM_HEIGHT / 2 });

    useEffect(() => {
        paramsRef.current.frequency = frequency;
        paramsRef.current.waveEnabled = waveEnabled;
        paramsRef.current.screenPos = screenPos;
    }, [frequency, waveEnabled, screenPos]);

    // Handle click to move source
    const handleClick = (e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (SIM_WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (SIM_HEIGHT / rect.height);

        if (x >= 2 && x < SIM_WIDTH - 2 && y >= 2 && y < SIM_HEIGHT - 2) {
            sourcePosRef.current = { x, y };
        }
    };

    // Expose reset function to parent
    useImperativeHandle(ref, () => ({
        reset: () => {
            if (simRef.current) {
                const { grid } = simRef.current;
                grid.u.fill(0);
                grid.uPrev.fill(0);
                grid.time = 0;
            }
        }
    }));

    useEffect(() => {
        const grid = new FDTDGrid(SIM_WIDTH, SIM_HEIGHT);
        const renderer = new Renderer(canvasRef.current);

        simRef.current = { grid, renderer };
        window.debugSim = grid;
        if (onGridInit) onGridInit(grid);

        grid.setSlits(slitGap, slitWidth, SIM_WIDTH / 2);

        let frameCount = 0;
        let lastTime = performance.now();

        const loop = () => {
            try {
                const stepsPerFrame = 3; // Reduced for better performance
                for (let i = 0; i < stepsPerFrame; i++) {
                    // Only add source if wave is enabled
                    if (paramsRef.current.waveEnabled) {
                        const { x, y } = sourcePosRef.current;
                        grid.addSource(x, y, 2.0, paramsRef.current.frequency);
                    }
                    grid.update();
                }

                renderer.draw(grid, { x: sourcePosRef.current.x, y: sourcePosRef.current.y }, paramsRef.current.screenPos);

                frameCount++;
                const now = performance.now();
                if (now - lastTime >= 1000) {
                    if (onFPSUpdate) onFPSUpdate(frameCount);
                    frameCount = 0;
                    lastTime = now;
                }
            } catch (err) {
                console.error("Simulation Loop Error:", err);
                return;
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    useEffect(() => {
        if (simRef.current) {
            simRef.current.grid.setSlits(slitGap, slitWidth, SIM_WIDTH / 2);
        }
    }, [slitGap, slitWidth]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <canvas
                ref={canvasRef}
                width={SIM_WIDTH}
                height={SIM_HEIGHT}
                onClick={handleClick}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    const touch = e.changedTouches[0];
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = (touch.clientX - rect.left) * (SIM_WIDTH / rect.width);
                    const y = (touch.clientY - rect.top) * (SIM_HEIGHT / rect.height);
                    if (x >= 2 && x < SIM_WIDTH - 2 && y >= 2 && y < SIM_HEIGHT - 2) {
                        sourcePosRef.current = { x, y };
                    }
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    display: 'block',
                    cursor: 'crosshair',
                    background: '#000',
                    touchAction: 'none'
                }}
            />
        </div>
    );
});

export default SimulationCanvas;

