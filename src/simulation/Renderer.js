export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimize for speed
        this.width = canvas.width;
        this.height = canvas.height;
        this.imageData = this.ctx.createImageData(this.width, this.height);
        this.buf = new ArrayBuffer(this.imageData.data.length);
        this.buf8 = new Uint8ClampedArray(this.buf);
    }

    resize(width, height) {
        if (this.width !== width || this.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.width = width;
            this.height = height;
            this.imageData = this.ctx.createImageData(width, height);
            this.buf = new ArrayBuffer(this.imageData.data.length);
            this.buf8 = new Uint8ClampedArray(this.buf);
        }
    }

    draw(grid, sourcePos, screenPos = null) {
        const u = grid.u;
        const walls = grid.walls;
        const width = this.width;
        const height = this.height;

        // Safety check
        if (grid.width !== width || grid.height !== height) return;

        const data = this.buf8;
        const size = width * height;
        let idx = 0;

        for (let i = 0; i < size; i++) {
            let val = u[i];
            const isWall = walls[i] === 0.0;

            if (isWall) {
                // Wall: Red for visibility
                data[idx] = 255;
                data[idx + 1] = 50;
                data[idx + 2] = 50;
                data[idx + 3] = 255;
            } else {
                // Guard against NaN/Infinity
                if (!Number.isFinite(val)) {
                    val = 0;
                }

                // Visualization Gain - much higher to see weak waves after slits
                const gain = 25.0;
                let amplitude = val * gain;

                // Soft clipping to -1...1
                const sat = Math.tanh(amplitude);

                if (Math.abs(sat) < 0.005) {
                    // Near zero - black background
                    data[idx] = 0;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 255;
                } else if (sat > 0) {
                    // Positive (Crest) -> Cyan with gamma boost
                    const gamma = Math.pow(sat, 0.6); // Boost mid-tones
                    const v = Math.floor(gamma * 255);
                    data[idx] = 0;
                    data[idx + 1] = v;
                    data[idx + 2] = v;
                    data[idx + 3] = 255;
                } else {
                    // Negative (Trough) -> Red with gamma boost
                    const gamma = Math.pow(-sat, 0.6); // Boost mid-tones
                    const v = Math.floor(gamma * 255);
                    data[idx] = v;
                    data[idx + 1] = 0;
                    data[idx + 2] = 0;
                    data[idx + 3] = 255;
                }
            }
            idx += 4;
        }

        // Draw Screen Position indicator (green dotted line)
        if (screenPos !== null) {
            const screenX = Math.floor(width * (screenPos / 100));
            for (let y = 0; y < height; y++) {
                // Dotted line: draw every 4 pixels
                if (y % 4 < 2) {
                    const ptr = (y * width + screenX) * 4;
                    data[ptr] = 0;       // R
                    data[ptr + 1] = 255; // G
                    data[ptr + 2] = 100; // B
                    data[ptr + 3] = 255; // A
                }
            }
        }

        // Draw Source Marker (White Box)
        if (sourcePos) {
            const sx = Math.floor(sourcePos.x);
            const sy = Math.floor(sourcePos.y);
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const px = sx + dx;
                    const py = sy + dy;
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const ptr = (py * width + px) * 4;
                        data[ptr] = 255;   // R
                        data[ptr + 1] = 255; // G
                        data[ptr + 2] = 255; // B
                        data[ptr + 3] = 255; // A
                    }
                }
            }
        }

        this.imageData.data.set(this.buf8);
        this.ctx.putImageData(this.imageData, 0, 0);
    }
}

